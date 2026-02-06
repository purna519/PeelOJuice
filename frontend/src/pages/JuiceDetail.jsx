import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Droplets, Leaf, ShieldCheck, Tag, ShoppingCart, Star } from 'lucide-react';
import api, { BASE_URL } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductInfoTabs from '../components/ProductInfoTabs';

export default function JuiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [juice, setJuice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchJuiceDetail();
  }, [id]);

  const fetchJuiceDetail = async () => {
    try {
      const response = await api.get(`/products/juices/${id}/`);
      setJuice(response.data);
    } catch (error) {
      console.error('Error fetching juice:', error);
      showToast('Failed to load juice details', 'error');
      navigate('/menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      showToast('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }

    setAdding(true);
    const result = await addToCart(juice.id, quantity);
    if (result.success) {
      showToast(`Added ${quantity} ${juice.name} to cart!`, 'success');
      // setQuantity(1); // Keep quantity chosen during session
    } else {
      showToast('Failed to add to cart', 'error');
    }
    setAdding(false);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white gap-4">
        <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-lg font-black text-[#1A1A1A] tracking-tighter uppercase">Loading Details...</div>
      </div>
    );
  }

  if (!juice) return null;

  const pricePerMl = (juice.price / (juice.net_quantity_ml || 300)).toFixed(2);
  const imageUrl = juice.image ? (juice.image.startsWith('http') ? juice.image : `${BASE_URL}${juice.image}`) : null;

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center gap-2 text-gray-400 font-extrabold text-xs uppercase tracking-widest hover:text-[#FF6B35] transition-colors mb-10 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Menu
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Product Image Card */}
          <div className="relative">
            <div className="aspect-[4/5] md:aspect-square bg-white rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#F0F0F0] relative group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={juice.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  onError={(e) => { e.target.src = '/placeholder-juice.jpg'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-gray-50">🧃</div>
              )}
              
              {/* Floating Category Badge */}
                <div className="absolute top-8 right-8 flex items-center gap-2 bg-white px-5 py-2 rounded-2xl shadow-xl border border-[#F0F0F0]">
                  <Leaf className="w-4 h-4 text-[#6B9E3E]" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{juice.category.name}</span>
                </div>
            </div>
            
            {/* Feature Badges - Desktop */}
            <div className="hidden lg:flex flex-wrap gap-3 mt-8">
              {juice.features?.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#F4FFF0] px-4 py-2 rounded-xl border border-[#D1F0C4]">
                  <ShieldCheck className="w-4 h-4 text-[#166534]" />
                  <span className="text-xs font-bold text-[#166534] uppercase tracking-tighter">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="flex flex-col">
            <h1 className="text-5xl font-[800] text-[#1A1A1A] tracking-tighter mb-6 leading-[0.9] uppercase">
              {juice.name}
            </h1>

            {/* Description */}
            {(juice.long_description || juice.description) && (
              <p className="text-gray-500 font-medium leading-relaxed text-lg mb-8 max-w-xl">
                {juice.long_description || juice.description}
              </p>
            )}

            {/* Info Cards Row */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#F9F9F9] p-5 rounded-[24px] border border-[#F0F0F0] flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Droplets className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Quantity</p>
                  <p className="text-lg font-black text-[#1A1A1A] tracking-tight">{juice.net_quantity_ml || 300} ml</p>
                </div>
              </div>
              <div className="bg-[#F9F9F9] p-5 rounded-[24px] border border-[#F0F0F0] flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Tag className="w-6 h-6 text-[#FF6B35]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price Unit</p>
                  <p className="text-lg font-black text-[#1A1A1A] tracking-tight">₹{pricePerMl}/ml</p>
                </div>
              </div>
            </div>

            {/* Premium Price Card */}
            <div className="bg-white p-8 rounded-[32px] border-l-[6px] border-[#FF6B35] shadow-[0_15px_30px_rgba(255,107,53,0.08)] mb-8 border border-[#F0F0F0]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Total Amount</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-[900] text-[#FF6B35]">₹</span>
                    <span className="text-6xl font-[900] text-[#FF6B35] ml-1 tracking-tighter">
                      {(juice.price * quantity).toFixed(0)}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-300 mt-2 tracking-tight uppercase">Inclusive of all local taxes</p>
                </div>
                <div className="flex items-center gap-2 bg-[#FFF9F0] px-4 py-2 rounded-xl border border-[#FF6B35]/10">
                  <Star className="w-4 h-4 text-[#FF6B35]" fill="#FF6B35" />
                  <span className="text-[10px] font-black text-[#FF6B35] uppercase tracking-tighter">Premium Selection</span>
                </div>
              </div>
            </div>

            {/* Premium Quantity Card */}
            <div className="bg-[#F9F9F9] p-8 rounded-[32px] border border-[#F0F0F0] mb-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Select Bottles</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity === 1}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-md transition-all ${
                    quantity === 1 
                    ? 'border-gray-200 bg-gray-50 text-gray-300' 
                    : 'border-[#FF6B35] bg-white text-[#FF6B35] hover:scale-110 active:scale-90'
                  }`}
                >
                  <Minus className="w-6 h-6" />
                </button>
                <div className="text-center">
                  <span className="text-4xl font-black text-[#1A1A1A] tracking-tight">{quantity}</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Units Selected</p>
                </div>
                <button
                  onClick={increaseQuantity}
                  className="w-14 h-14 rounded-full border-2 border-[#FF6B35] bg-white text-[#FF6B35] flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all font-bold"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!juice.is_available || adding}
                className="flex-1 bg-[#1A1A1A] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {adding ? 'Securing Item...' : 'Add to Wallet'}
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                disabled={!juice.is_available || adding}
                className="flex-1 bg-[#FF6B35] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#e85a24] transition-all shadow-xl active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
              >
                Instant Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        {juice.benefits && juice.benefits.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-[#FF6B35] rounded-full"></div>
              <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase">Health Benefits</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {juice.benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-[28px] border border-[#F0F0F0] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-[#FFF9F0] rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight mb-2 uppercase">{benefit.title}</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Info Tabs */}
        <div className="mt-20">
          <ProductInfoTabs
            nutrition={{
              calories: juice.nutrition_calories,
              total_fat: juice.nutrition_total_fat,
              carbohydrate: juice.nutrition_carbohydrate,
              dietary_fiber: juice.nutrition_dietary_fiber,
              total_sugars: juice.nutrition_total_sugars,
              protein: juice.nutrition_protein
            }}
            ingredients={juice.ingredients}
            allergenInfo={juice.allergen_info}
          />
        </div>
      </div>
      
      {/* Sticky Bottom Bar for Mobile/Tablet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] p-4 flex items-center gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="flex-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
          <p className="text-xl font-black text-[#FF6B35]">₹{(juice.price * quantity).toFixed(0)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!juice.is_available || adding}
          className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg active:scale-95 disabled:bg-gray-200"
        >
          <ShoppingCart className="w-4 h-4" />
          {adding ? '...' : 'Add'}
        </button>
      </div>
    </div>
  );
}
