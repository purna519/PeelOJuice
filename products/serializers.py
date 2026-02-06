from rest_framework import serializers
from .models import Category, Juice, Branch
from django.conf import settings

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'address', 'city', 'state', 'pincode', 
                  'phone', 'email', 'opening_time', 'closing_time', 'is_active']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class CategoryMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class JuiceSerializer(serializers.ModelSerializer):
    category = CategoryMiniSerializer(read_only=True)
    image = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        if obj.image:
            # Use Cloudinary's built-in URL property which includes version numbers
            # and correct public_id format automatically
            try:
                return obj.image.url
            except Exception:
                # Fallback: If image.url fails, try manual construction
                cloud_name = settings.CLOUDINARY_STORAGE.get('CLOUD_NAME')
                image_path = str(obj.image)
                # Remove 'media/' or 'juices/' prefix if present  
                if image_path.startswith('media/'):
                    image_path = image_path.replace('media/', '', 1)
                if image_path.startswith('juices/'):
                    image_path = image_path.replace('juices/', '', 1)
                # Return Cloudinary URL
                return f"https://res.cloudinary.com/{cloud_name}/image/upload/{image_path}"
        return None

    class Meta:
        model = Juice
        fields = [
            'id',
            'name',
            'price',
            'description',
            'long_description',
            'image',
            'is_available',
            'category',
            'net_quantity_ml',
            'features',
            'benefits',
            'nutrition_calories',
            'nutrition_total_fat',
            'nutrition_carbohydrate',
            'nutrition_dietary_fiber',
            'nutrition_total_sugars',
            'nutrition_protein',
            'ingredients',
            'allergen_info'
        ]