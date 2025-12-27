from rest_framework import serializers
from .models import Cart, CartItem
from coupons.serializers import CouponSerializer
from decimal import Decimal

class CartItemSerializer(serializers.ModelSerializer):
    juice_name = serializers.CharField(source='juice.name', read_only=True)
    juice_image = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'juice',
            'juice_name',
            'juice_image',
            'quantity',
            'price_at_added',
            'subtotal'
        ]
    
    def get_juice_image(self, obj):
        if obj.juice and obj.juice.image:
            # Get the image name/path
            image_path = str(obj.juice.image)
            # Remove 'media/' prefix if present
            if image_path.startswith('media/'):
                image_path = image_path.replace('media/', '', 1)
            # Return proper Cloudinary URL
            return f"https://res.cloudinary.com/dxizjczfh/image/upload/{image_path}"
        return None

    def get_subtotal(self, obj):
        return obj.price_at_added * obj.quantity

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    applied_coupon = CouponSerializer(read_only=True)
    coupon_discount = serializers.SerializerMethodField()
    food_gst = serializers.SerializerMethodField()
    delivery_fee_base = serializers.SerializerMethodField()
    delivery_gst = serializers.SerializerMethodField()
    total_gst = serializers.SerializerMethodField()
    platform_fee = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()
    free_delivery = serializers.SerializerMethodField()
    original_delivery_fee = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id',
            'items',
            'total_amount',
            'applied_coupon',
            'coupon_discount',
            'food_gst',
            'delivery_fee_base',
            'delivery_gst',
            'total_gst',
            'platform_fee',
            'grand_total',
            'free_delivery',
            'original_delivery_fee'
        ]
    
    def get_coupon_discount(self, obj):
        if obj.applied_coupon:
            return float(obj.applied_coupon.calculate_discount(obj.total_amount))
        return 0.00
    
    def get_food_gst(self, obj):
        return float((Decimal(str(obj.total_amount)) * Decimal('0.05')).quantize(Decimal('0.01')))
    
    def get_delivery_fee_base(self, obj):
        if Decimal(str(obj.total_amount)) >= Decimal('99.00'):
            return 0.00
        return 20.00
    
    def get_delivery_gst(self, obj):
        delivery_base = self.get_delivery_fee_base(obj)
        return float((Decimal(str(delivery_base)) * Decimal('0.18')).quantize(Decimal('0.01')))
    
    def get_total_gst(self, obj):
        food_gst = (Decimal(str(obj.total_amount)) * Decimal('0.05')).quantize(Decimal('0.01'))
        delivery_base = Decimal(str(self.get_delivery_fee_base(obj)))
        delivery_gst = (delivery_base * Decimal('0.18')).quantize(Decimal('0.01'))
        return float(food_gst + delivery_gst)
    
    def get_platform_fee(self, obj):
        return 10.00
    
    def get_free_delivery(self, obj):
        # Return True if subtotal >= ₹99
        return Decimal(str(obj.total_amount)) >= Decimal('99.00')
    
    def get_original_delivery_fee(self, obj):
        # Show original price only when free delivery is active
        if self.get_free_delivery(obj):
            return 20.00
        return None
    
    def get_grand_total(self, obj):
        food_subtotal = Decimal(str(obj.total_amount))
        
        # Apply coupon discount to subtotal
        coupon_discount = Decimal('0.00')
        if obj.applied_coupon:
            coupon_discount = obj.applied_coupon.calculate_discount(food_subtotal)
        
        discounted_subtotal = food_subtotal - coupon_discount
        
        food_gst = (discounted_subtotal * Decimal('0.05')).quantize(Decimal('0.01'))
        delivery_base = Decimal(str(self.get_delivery_fee_base(obj)))
        delivery_gst = (delivery_base * Decimal('0.18')).quantize(Decimal('0.01'))
        platform_fee = Decimal('10.00')
        
        total = discounted_subtotal + food_gst + delivery_base + delivery_gst + platform_fee
        return float(total)
