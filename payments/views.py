from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from django.conf import settings

from .models import Payment
from .serializers import PaymentSerializer


class ConfirmCODPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = request.user

        if not user.is_staff:
            return Response(
                {"detail": "Only admin/staff can confirm COD payments"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.method != 'cod':
            return Response(
                {"detail": "Only COD payments can be confirmed this way"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if payment.status == 'completed':
            return Response(
                {"detail": "Payment already completed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment.status = 'completed'
        payment.paid_at = timezone.now()
        payment.save()

        return Response(
            {
                "message": "COD payment confirmed successfully",
                "payment_id": payment.id,
                "status": payment.status
            },
            status=status.HTTP_200_OK
        )


class GetPaymentDetailsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        user = request.user

        try:
            payment = Payment.objects.get(order_id=order_id)
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.order.user != user and not user.is_staff:
            return Response(
                {"detail": "Not authorized to view this payment"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = PaymentSerializer(payment)
        return Response(serializer.data)


class CreateRazorpayOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .razorpay_utils import create_razorpay_order
        from orders.models import Order
        
        order_id = request.data.get('order_id')

        if not order_id:
            return Response(
                {"detail": "Order ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(pk=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if hasattr(order, 'payment') and order.payment.status == 'completed':
            return Response(
                {"detail": "Order already paid"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            razorpay_order = create_razorpay_order(order.total_amount)
            
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={
                    'method': 'online',
                    'amount': order.total_amount,
                    'razorpay_order_id': razorpay_order['id'],
                    'status': 'pending'
                }
            )

            if not created:
                payment.razorpay_order_id = razorpay_order['id']
                payment.save()

            return Response(
                {
                    "razorpay_order_id": razorpay_order['id'],
                    "amount": razorpay_order['amount'],
                    "currency": razorpay_order['currency'],
                    "key_id": settings.RAZORPAY_KEY_ID
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"detail": f"Failed to create Razorpay order: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyRazorpayPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .razorpay_utils import verify_razorpay_signature
        from django.conf import settings
        
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {"detail": "Missing required payment parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if payment.order.user != request.user:
            return Response(
                {"detail": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        if verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
            payment.transaction_id = razorpay_payment_id
            payment.status = 'completed'
            payment.paid_at = timezone.now()
            payment.save()
            
            # Update order status to confirmed after successful payment
            payment.order.status = 'confirmed'
            payment.order.save()
            
            # Clear cart after successful online payment
            # This ensures cart is only cleared when payment actually succeeds
            from cart.models import Cart, CartItem
            try:
                cart = Cart.objects.get(user=request.user)
                CartItem.objects.filter(cart=cart).delete()
                cart.applied_coupon = None
                cart.save()
            except Cart.DoesNotExist:
                pass  # Cart already cleared or doesn't exist

            return Response(
                {
                    "message": "Payment verified successfully",
                    "payment_id": payment.id,
                    "status": payment.status
                },
                status=status.HTTP_200_OK
            )
        else:
            payment.status = 'failed'
            payment.save()

            return Response(
                {"detail": "Payment verification failed"},
                status=status.HTTP_400_BAD_REQUEST
            )


class RazorpayWebhookAPIView(APIView):
    permission_classes = []

    def post(self, request):
        from .razorpay_utils import razorpay_client
        
        webhook_secret = getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', None)
        webhook_signature = request.headers.get('X-Razorpay-Signature')
        webhook_body = request.body

        if webhook_secret:
            try:
                razorpay_client.utility.verify_webhook_signature(
                    webhook_body.decode('utf-8'),
                    webhook_signature,
                    webhook_secret
                )
            except:
                return Response(
                    {"detail": "Invalid signature"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        event = request.data
        
        if event.get('event') == 'payment.captured':
            payment_entity = event.get('payload', {}).get('payment', {}).get('entity', {})
            razorpay_order_id = payment_entity.get('order_id')
            razorpay_payment_id = payment_entity.get('id')

            try:
                payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
                payment.transaction_id = razorpay_payment_id
                payment.status = 'completed'
                payment.paid_at = timezone.now()
                payment.save()
            except Payment.DoesNotExist:
                pass

        return Response({"status": "ok"}, status=status.HTTP_200_OK)

