import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Leaf } from 'lucide-react';
import api, { BASE_URL } from '../services/api';
import { useBranch } from '../context/BranchContext';

export default function Home() {
  const navigate = useNavigate();
  const { selectedBranch } = useBranch();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, [selectedBranch]);

  const loadFeaturedProducts = async () => {
    setLoading(true);
    try {
      let response;
      // If branch is selected, use branch-specific endpoint
      // Otherwise, fallback to general juices endpoint
      if (selectedBranch) {
        response = await api.get(`/products/branches/${selectedBranch.id}/products/`);
      } else {
        response = await api.get(`/products/juices/`);
      }
      
      // Handle paginated response
      const productsData = response.data.results || [];
      setProducts(productsData.slice(0, 12));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    // Add to cart logic
    console.log('Add to cart:', product);
  };

  // Scroll-based zoom animation (same as Menu page)
  useEffect(() => {
    const scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scale-100', 'opacity-100');
            entry.target.classList.remove('scale-90', 'opacity-0');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all product cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card) => scrollObserver.observe(card));

    return () => scrollObserver.disconnect();
  }, [products]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-semibold text-gray-800 mb-3">
          Fresh Pressed Wellness
        </h1>
        <p className="text-gray-600 mb-8">
          Crafted with love, delivered with care
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for your favorite juice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-200 transition text-gray-900 shadow-sm"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/juice/${product.id}`)}
                className="product-card bg-white rounded-2xl shadow-sm overflow-hidden hover:-translate-y-2 hover:shadow-lg transition-all duration-500 cursor-pointer scale-90 opacity-0"
              >
                {/* Product Image - Same as Menu */}
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={product.image ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`) : '/carrot-juice.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/carrot-juice.png';
                    }}
                  />
                </div>

                {/* Product Info - Same as Menu */}
                <div className="p-5">
                  <div className="text-xs text-gray-500 mb-1">{product.category?.name || 'Juice'}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description || 'Fresh and delicious juice made with premium ingredients.'}
                  </p>

                  {/* Price and Add Button - Same as Menu */}
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-semibold text-gray-800">
                      ₹{product.price}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm flex items-center gap-2"
                    >
                      <span>+</span>
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explore Menu Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/menu')}
            className="px-12 py-4 bg-[#8BA888] text-white rounded-full hover:bg-[#7a9677] transition font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Explore Full Menu →
          </button>
        </div>
      </div>
    </div>
  );
}
