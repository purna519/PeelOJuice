from rest_framework import serializers
from .models import Category, Juice, Branch

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
            # Get the image name/path
            image_path = str(obj.image)
            # Remove 'media/' prefix if present  
            if image_path.startswith('media/'):
                image_path = image_path.replace('media/', '', 1)
            # Return proper Cloudinary URL
            return f"https://res.cloudinary.com/dxizjczfh/image/upload/{image_path}"
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