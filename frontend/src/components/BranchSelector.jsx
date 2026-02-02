import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Lock } from 'lucide-react';
import { useBranch } from '../context/BranchContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function BranchSelector() {
  const { selectedBranch, selectBranch, branches, setBranches } = useBranch();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if cart has items to lock branch selection
  const hasCartItems = cart?.items?.length > 0;
  const canSwitchBranch = !hasCartItems;

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/branches/');
      setBranches(response.data);
      
      // Auto-select first branch if none selected
      if (!selectedBranch && response.data.length > 0) {
        selectBranch(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (branch) => {
    if (!canSwitchBranch) {
      return; // Don't allow switching when cart has items
    }
    selectBranch(branch);
    setIsOpen(false);
  };

  if (loading) {
    return <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Loading...</div>;
  }

  return (
    <div className="relative group">
      <button
        onClick={() => canSwitchBranch && setIsOpen(!isOpen)}
        disabled={!canSwitchBranch}
        className={`flex items-center gap-2 transition px-5 py-1.5 rounded-2xl border border-[#F0F0F0] bg-[#F9F9F9] hover:bg-white transition-all ${
          canSwitchBranch 
            ? 'cursor-pointer' 
            : 'opacity-50 cursor-not-allowed'
        }`}
      >
        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shadow-sm ${hasCartItems ? 'text-gray-400' : 'text-[#FF6B35]'} bg-white border border-[#F0F0F0]`}>
          {hasCartItems ? (
            <Lock className="w-3 h-3" />
          ) : (
            <MapPin className="w-3 h-3" />
          )}
        </div>
        <div className="text-left hidden lg:block">
           <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Store Branch</p>
           <span className="text-[9px] font-black text-[#1A1A1A] uppercase tracking-tight">{selectedBranch ? selectedBranch.name : 'Select Branch'}</span>
        </div>
        {canSwitchBranch && (
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Tooltip when locked */}
      {!canSwitchBranch && (
        <div className="absolute left-0 top-full mt-3 w-64 bg-[#1A1A1A] text-white p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 translate-y-2 group-hover:translate-y-0">
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#FF6B35]">Branch locked</p>
          <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-tight">Empty your cart to switch locations. We deliver fresh from the selected branch only.</p>
        </div>
      )}

      {isOpen && canSwitchBranch && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-72 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#F0F0F0] py-4 z-20 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-6 py-4 border-b border-[#F0F0F0] mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Outlets</p>
              <p className="text-sm font-black text-[#1A1A1A] uppercase tracking-tighter">Choose Pickup Point</p>
            </div>
            
            <div className="max-h-64 overflow-y-auto px-2">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className={`w-full text-left flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                    selectedBranch?.id === branch.id
                      ? 'bg-[#FFF9F0] text-[#FF6B35]'
                      : 'hover:bg-[#F9F9F9] text-gray-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${
                    selectedBranch?.id === branch.id ? 'bg-white border-[#FFE082]' : 'bg-white border-[#F0F0F0]'
                  }`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-black uppercase tracking-tight block">{branch.name}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{branch.city}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
