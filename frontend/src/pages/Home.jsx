import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, ArrowRight, Zap, Shield, Heart, Leaf } from 'lucide-react';
import api from '../services/api';
import { useBranch } from '../context/BranchContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import JuiceCard from '../components/JuiceCard';

export default function Home() {
  const navigate = useNavigate();
  const { selectedBranch } = useBranch();
  const { addToCart } = useCart();
  const { showToast } = useToast();
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
      if (selectedBranch) {
        response = await api.get(`/products/branches/${selectedBranch.id}/products/`);
      } else {
        response = await api.get(`/products/juices/`);
      }
      
      const productsData = response.data.results || [];
      // Show only top 8 as "Featured"
      setProducts(productsData.slice(0, 8));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      showToast('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }

    const result = await addToCart(product.id, 1);
    if (result.success) {
      showToast(`${product.name} added to cart!`, 'success');
    } else {
      showToast('Failed to add to cart', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#FFF9F0] px-4 py-2 rounded-2xl mb-6 border border-[#FF6B35]/10">
              <span className="text-[10px] font-black text-[#FF6B35] uppercase tracking-[0.2em]">Premium Quality Guaranteed</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
              <span className="text-[#4A1E6D]">Fresh</span> <span className="text-[#FF6B35]">Pressed</span> <br />
              <span className="text-[#6B9E3E]">Wellness.</span>
            </h1>
            
            <p className="font-bold text-lg md:text-xl uppercase tracking-[0.2em] mb-12 max-w-2xl mx-auto">
              <span className="text-[#6B9E3E]">Sip Fresh...</span>
              <span className="text-[#4A1E6D]"> Feel Refresh...</span>
            </p>

            {/* Premium Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-300 group-focus-within:text-[#FF6B35] transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-16 pr-6 py-6 bg-[#F9F9F9] border-2 border-[#F0F0F0] rounded-[32px] text-gray-800 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-[#FF6B35]/10 focus:border-[#FF6B35] transition-all placeholder:text-gray-300 placeholder:font-medium shadow-sm"
                placeholder="Find your perfect juice match..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/menu?search=${searchQuery}`)}
              />
              <button 
                onClick={() => navigate(`/menu?search=${searchQuery}`)}
                className="absolute right-3 top-3 bottom-3 bg-[#1A1A1A] text-white px-8 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-black transition-all active:scale-95"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-[#F0F0F0] rounded-2xl flex items-center justify-center shadow-sm">
              <Zap className="w-6 h-6 text-[#FF6B35]" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-3xl font-[800] text-[#1A1A1A] tracking-tighter uppercase">Top Picks</h2>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-0.5">Customer Favorites</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/menu')}
            className="group flex items-center gap-2 text-[#FF6B35] font-black uppercase tracking-widest text-[10px]"
          >
            View Full Menu
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 aspect-square rounded-[28px] mb-4"></div>
                <div className="h-6 bg-gray-100 rounded-lg mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {products.map((product, index) => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{animationDelay: `${index * 100}ms`}}>
                <JuiceCard 
                  juice={product} 
                  onAddToCart={handleAddToCart} 
                />
              </div>
            ))}
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          <div className="bg-[#F4FFF0] p-10 rounded-[40px] border border-[#D1F0C4] group hover:scale-[1.02] transition-transform duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-8">
              <Leaf className="w-7 h-7 text-[#6B9E3E]" />
            </div>
            <h3 className="text-2xl font-[800] text-[#1A1A1A] tracking-tighter uppercase mb-4">100% Pure</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] leading-relaxed">
              Never processed. Never pasteurized. Straight from nature to your bottle.
            </p>
          </div>
          <div className="bg-[#F5F3FF] p-10 rounded-[40px] border border-[#DDD6FE] group hover:scale-[1.02] transition-transform duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-8">
              <Shield className="w-7 h-7 text-[#4A1E6D]" />
            </div>
            <h3 className="text-2xl font-[800] text-[#1A1A1A] tracking-tighter uppercase mb-4">Pure Quality</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] leading-relaxed">
              No added sugars, preservatives, or artificial flavors. Just pure juice.
            </p>
          </div>
          <div className="bg-[#FFF9F0] p-10 rounded-[40px] border border-[#FED7E2] group hover:scale-[1.02] transition-transform duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md mb-8">
              <Heart className="w-7 h-7 text-[#FF6B35]" />
            </div>
            <h3 className="text-2xl font-[800] text-[#1A1A1A] tracking-tighter uppercase mb-4">Made with Love</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] leading-relaxed">
              Hand-crafted daily to ensure you get the maximum nutrients and taste.
            </p>
          </div>
        </div>

        {/* Big CTA */}
        <div className="mt-32 bg-[#1A1A1A] rounded-[50px] p-16 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35] opacity-10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000"></div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9] uppercase relative z-10">
            Want to see<br />more?
          </h2>
          <button 
            onClick={() => navigate('/menu')}
            className="bg-[#FF6B35] text-white px-16 py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-all shadow-2xl relative z-10 active:scale-95"
          >
            Explore Full Menu
          </button>
        </div>
      </div>
    </div>
  );
}
