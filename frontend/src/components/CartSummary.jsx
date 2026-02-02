import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, ChevronRight } from 'lucide-react';

export default function CartSummary({ cart, hasAddresses = true }) {
  const navigate = useNavigate();

  // Calculate values safely
  const foodSubtotal = Number(cart.total_amount) || 0;
  const couponDiscount = Number(cart.coupon_discount) || 0;
  const foodGST = Number(cart.food_gst) || 0;
  const deliveryFee = Number(cart.delivery_fee_base) || 0;
  const deliveryGST = Number(cart.delivery_gst) || 0;
  const platformFee = Number(cart.platform_fee) || 0;
  const grandTotal = Number(cart.grand_total) || 0;

  return (
    <div className="bg-white rounded-[32px] border border-[#F0F0F0] shadow-[0_15px_30px_rgba(0,0,0,0.05)] p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-[#FF6B35] rounded-full"></div>
        <h2 className="text-xl font-black text-[#1A1A1A] tracking-tighter uppercase">Bill Summary</h2>
      </div>
      
      {/* Free Delivery Progress */}
      {!cart.free_delivery && foodSubtotal < 99 && (
        <div className="mb-8 p-5 bg-[#FFF9F0] rounded-2xl border border-[#FEEBC8] relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-[#FF6B35] uppercase tracking-widest flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Unlock Free Shipping
            </span>
            <span className="text-xs font-black text-[#FF6B35]">₹{(99 - foodSubtotal).toFixed(0)} away</span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-1.5">
            <div 
              className="bg-[#FF6B35] h-1.5 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,107,53,0.5)]"
              style={{ width: `${Math.min((foodSubtotal / 99) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Free delivery badge */}
      {cart.free_delivery && (
        <div className="bg-[#F4FFF0] border border-[#D1F0C4] rounded-2xl p-4 flex items-center gap-3 mb-8 shadow-sm">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-green-500 shadow-sm border border-[#D1F0C4]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-green-700 text-[10px] font-black uppercase tracking-widest leading-none">
            Free Delivery Unlocked!
          </span>
        </div>
      )}

      <div className="space-y-4 mb-8 text-sm">
        <div className="flex justify-between items-start gap-4">
          <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px] flex-shrink-0 pt-0.5">Item Total</span>
          <span className="font-black text-[#1A1A1A] flex-shrink-0 text-right">₹{foodSubtotal.toFixed(0)}</span>
        </div>
        
        {couponDiscount > 0 && (
          <div className="flex justify-between items-start gap-4 text-green-600">
            <span className="font-bold uppercase tracking-widest text-[10px] flex-shrink-0 pt-0.5">Offer Applied</span>
            <span className="font-black flex-shrink-0 text-right">-₹{couponDiscount.toFixed(0)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-start gap-4">
          <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px] flex-shrink-0 pt-0.5">Handling Fee</span>
          <span className="font-black text-[#1A1A1A] flex-shrink-0 text-right">₹{(foodGST + platformFee).toFixed(0)}</span>
        </div>
        
        <div className="flex justify-between items-start gap-4">
          <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px] flex-shrink-0 pt-0.5 leading-tight">Delivery Partner Fee</span>
          <div className="flex items-center gap-2 flex-shrink-0 justify-end">
            {cart.free_delivery ? (
              <>
                <span className="line-through text-gray-300 font-bold text-xs">₹{cart.original_delivery_fee}</span>
                <span className="font-black text-green-600 text-xs">FREE</span>
              </>
            ) : (
              <span className="font-black text-[#1A1A1A]">₹{(deliveryFee + deliveryGST).toFixed(0)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#F0F0F0] pt-6 pb-6">
        <div className="flex justify-between items-end mb-6">
          <div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payable</p>
             <p className="text-3xl font-black text-[#1A1A1A] tracking-tighter leading-none">₹{grandTotal.toFixed(0)}</p>
          </div>
          {!hasAddresses && (
            <span className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1 animate-pulse">Address Required</span>
          )}
        </div>

        <button
          onClick={() => hasAddresses && navigate('/checkout')}
          disabled={!hasAddresses}
          className={`group w-full py-5 rounded-[20px] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
            hasAddresses
              ? 'bg-[#1A1A1A] text-white hover:bg-black'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-[#F0F0F0] shadow-none'
          }`}
        >
          {hasAddresses ? 'Checkout Now' : 'Add Address'}
          {hasAddresses && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
}


