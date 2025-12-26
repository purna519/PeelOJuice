from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.views import LoginView, LogoutView
from django.shortcuts import redirect
from django.views import View
from .utils import generate_email_otp, generate_phone_otp, generate_password_reset_otp
from rest_framework_simplejwt.tokens import RefreshToken
from .views_verify import is_otp_expired

from .serializers import RegisterSerializer, UserSerializer

from rest_framework.permissions import IsAuthenticated

class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():

            user = serializer.save()

            email_otp = generate_email_otp(user)
            phone_otp = generate_phone_otp(user)

            return Response(
                {
                    "message": "User registered successfully. Please check your email for OTP.",
                    "email_otp": email_otp,  # TEMP - For testing while Gmail SMTP is being fixed
                    "phone_otp": phone_otp  # DEV ONLY - Remove in production
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "message" : "Error in Registering User",
                "errors" : serializer.errors
            },
            
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginAPIView(APIView):
    def post(self, request):
        email_or_phone = request.data.get('email_or_phone')
        password = request.data.get('password')

        if not email_or_phone or not password:
            return Response(
                {"message" : "Email/phone or password is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=email_or_phone, password=password)
        if not user:
            return Response(
                {"message" : "Invalid Email/phone or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if not user.is_active:
            return Response(
                {"message" : "User is not active"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not user.is_email_verified:
            return Response(
                {"message": "Please verify your email before login"},
                status=status.HTTP_403_FORBIDDEN
            )

        if not user.is_phone_verified:
            return Response(
                {"message": "Please verify your phone before login"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "is_superuser": user.is_superuser,
                "user": {
                    "email": user.email,
                    "full_name": user.full_name,
                    "phone_number": user.phone_number
                }
            },
            status=status.HTTP_200_OK
        )

class ResendEmailOTPAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {
                    "message" : "Email is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "message" : "User Not Found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        if user.is_email_verified:
            return Response(
                {
                    "message" : "Email is already verified"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not is_otp_expired(user):
            return Response(
                {"message": "OTP already sent. Please wait before resending."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        generate_email_otp(user)

        return Response(
            {"message": "OTP sent to your email"},
            status=status.HTTP_200_OK
        )

class ResendPhoneOTPAPIView(APIView):
    def post(self, request):
        phone_number = request.data.get('phone_number')

        if not phone_number:
            return Response(
                {
                    "message" : "Phone number is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response(
                {
                    "message" : "User Not Found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        if user.is_phone_verified:
            return Response(
                {
                    "message" : "Phone number is already verified"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not is_otp_expired(user, otp_type='phone'):
            return Response(
                {"message": "OTP already sent. Please wait before resending."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        phone_otp = generate_phone_otp(user)

        return Response(
            {
                "message": "OTP sent to your phone",
                "phone_otp": phone_otp  # DEV ONLY - Remove in production
            },
            status=status.HTTP_200_OK
        )

class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(
                    {"message": "Refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            
            token_user_id = token.payload.get('user_id')
            if token_user_id != request.user.id:
                return Response(
                    {"message": "Token does not belong to the authenticated user"},
                    status=status.HTTP_403_FORBIDDEN
                )

            token.blacklist()
            
            return Response(
                {"message": "Logout successful"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"message": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )

class RequestPasswordResetOTPAPIView(APIView):
    
    def post(self, request):
        email_or_phone = request.data.get('email_or_phone')
        
        if not email_or_phone:
            return Response(
                {"message": "Email or phone number is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            try:
                user = User.objects.get(email=email_or_phone)
            except User.DoesNotExist:
                user = User.objects.get(phone_number=email_or_phone)
        except User.DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        generate_password_reset_otp(user)
        
        return Response(
            {"message": "OTP sent to your email"},
            status=status.HTTP_200_OK
        )

class ConfirmPasswordResetAPIView(APIView):
    
    def post(self, request):
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
        
        email_or_phone = request.data.get('email_or_phone')
        new_password = request.data.get('new_password')
        
        if not email_or_phone or not new_password:
            return Response(
                {"message": "Email/phone and new password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        

        if len(new_password) < 8:
            return Response(
                {"message": "Password must be at least 8 characters"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            try:
                user = User.objects.get(email=email_or_phone)
            except User.DoesNotExist:
                user = User.objects.get(phone_number=email_or_phone)
        except User.DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not user.password_reset_otp_verified:
            return Response(
                {"message": "OTP not verified. Please verify OTP first"},
                status=status.HTTP_403_FORBIDDEN
            )

        user.set_password(new_password)
        
        user.password_reset_otp = None
        user.password_reset_otp_created_at = None
        user.password_reset_otp_verified = False
        
        user.save()
        
        
        OutstandingToken.objects.filter(user=user).delete()
        
        return Response(
            {"message": "Password reset successful. Please login with new password"},
            status=status.HTTP_200_OK
        )


# Traditional Django Login View for Server-side Authentication
class CustomLoginView(LoginView):
    """
    Custom login view that handles authentication and redirects:
    - Superusers -> /dashboard/
    - Regular users -> / (React frontend)
    """
    template_name = 'users/login.html'
    redirect_authenticated_user = True
    
    def get_success_url(self):
        """Redirect based on user role"""
        if self.request.user.is_superuser:
            return '/dashboard/'
        else:
            return '/'  # React frontend homepage
    
    def form_valid(self, form):
        """Customize login success message"""
        user = form.get_user()
        login(self.request, user)
        
        if user.is_superuser:
            return redirect('/dashboard/')
        else:
            return redirect('/')
