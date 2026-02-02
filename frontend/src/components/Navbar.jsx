import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu as MenuIcon, MapPin, Package, LogOut, ChevronDown, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import BranchSelector from './BranchSelector';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-[#F0F0F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-3xl font-black tracking-tighter uppercase text-[#4A1E6D]">Peel</span>
                <div className="relative">
                  <span className="text-3xl font-black tracking-tighter uppercase text-[#FF6B35]">'O'</span>
                  {/* Caption starts from O and fits to end of Juice */}
                  <span className="absolute left-0 top-full text-[9px] font-black uppercase tracking-tight whitespace-nowrap">
                    <span className="text-[#6B9E3E]">Sip Fresh....</span>
                    <span className="text-[#4A1E6D]"> Feel Refresh.</span>
                  </span>
                </div>
                <span className="text-3xl font-black tracking-tighter uppercase text-[#6B9E3E]">Juice</span>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-[10px] font-[800] text-gray-400 hover:text-[#FF6B35] uppercase tracking-[0.2em] transition-colors">Home</Link>
            <Link to="/menu" className="text-[10px] font-[800] text-gray-400 hover:text-[#FF6B35] uppercase tracking-[0.2em] transition-colors">Menu</Link>
            
            <Link to="/cart" className="relative group">
              <div className="flex items-center gap-2 text-[10px] font-[800] text-gray-400 group-hover:text-[#FF6B35] uppercase tracking-[0.2em] transition-colors">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Cart
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-[#FF6B35] text-white text-[9px] font-[900] rounded-lg w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            
            <div className="h-6 w-px bg-gray-100"></div>

            {/* Branch Selector */}
            <BranchSelector />
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 bg-[#F9F9F9] px-4 py-2.5 rounded-2xl border border-[#F0F0F0] hover:bg-white transition-colors group"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#FF6B35] shadow-sm border border-[#F0F0F0]">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">Account</span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#F0F0F0] py-3 z-20 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="px-6 py-4 border-b border-[#F0F0F0] mb-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-sm font-black text-[#1A1A1A] truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/my-profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9F9F9] transition text-[#1A1A1A]"
                      >
                        <User className="w-5 h-5 text-gray-300" />
                        <span className="text-xs font-black uppercase tracking-widest">My Profile</span>
                      </Link>
                      
                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9F9F9] transition text-[#1A1A1A]"
                      >
                        <Package className="w-5 h-5 text-gray-300" />
                        <span className="text-xs font-black uppercase tracking-widest">My Orders</span>
                      </Link>
                      
                      <Link
                        to="/my-addresses"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9F9F9] transition text-[#1A1A1A]"
                      >
                        <MapPin className="w-5 h-5 text-gray-300" />
                        <span className="text-xs font-black uppercase tracking-widest">Addresses</span>
                      </Link>

                      <div className="mt-2 pt-2 border-t border-[#F0F0F0]">
                        <button
                          onClick={() => { logout(); setProfileDropdownOpen(false); }}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition text-red-400 hover:text-red-500 w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-[#1A1A1A] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden w-12 h-12 flex items-center justify-center bg-[#F9F9F9] rounded-2xl border border-[#F0F0F0]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon className="w-6 h-6 text-[#1A1A1A]" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#F0F0F0] animate-in slide-in-from-top duration-300">
          <div className="px-6 py-8 space-y-6">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Home</Link>
            <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Menu</Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-black text-[#1A1A1A] uppercase tracking-[0.2em]">
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-black text-[#1A1A1A] uppercase tracking-[0.2em]">My Orders</Link>
                <Link to="/my-addresses" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-black text-[#1A1A1A] uppercase tracking-[0.2em]">My Addresses</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block text-xs font-black text-red-500 uppercase tracking-[0.2em] text-left">Sign Out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-black text-[#FF6B35] uppercase tracking-[0.2em]">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
