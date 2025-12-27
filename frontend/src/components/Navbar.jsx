import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu as MenuIcon, MapPin, Package, LogOut, ChevronDown, Leaf } from 'lucide-react';
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
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold">
              <span className="text-[#F5A623]">Peel</span>
              <span className="text-[#FF6B35]">O</span>
              <span className="text-gray-800">JUICE</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-[#8BA888] transition font-medium">Home</Link>
            <Link to="/menu" className="text-gray-700 hover:text-[#8BA888] transition font-medium">Menu</Link>
            
            <Link to="/cart" className="text-gray-700 hover:text-[#8BA888] transition flex items-center relative group">
              <ShoppingCart className="w-5 h-5 mr-1 group-hover:scale-110 transition" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8BA888] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {/* Branch Selector - Before Profile */}
            <BranchSelector />
            
            {user ? (
              <div className="relative">
                {/* Profile Dropdown Trigger */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#8BA888] transition font-medium"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileDropdownOpen(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/my-profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#8BA888]/10 transition text-gray-700"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                      
                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#8BA888]/10 transition text-gray-700"
                      >
                        <Package className="w-5 h-5" />
                        <span className="font-medium">My Orders</span>
                      </Link>
                      
                      <Link
                        to="/my-addresses"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#8BA888]/10 transition text-gray-700"
                      >
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium">My Addresses</span>
                      </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-gray-700 hover:text-red-600 w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-[#8BA888] text-white px-6 py-2 rounded-lg hover:bg-[#7a9677] transition font-medium">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="block text-gray-700 hover:text-[#8BA888] transition font-medium">Home</Link>
            <Link to="/menu" className="block text-gray-700 hover:text-[#8BA888] transition font-medium">Menu</Link>
            <Link to="/cart" className="block text-gray-700 hover:text-[#8BA888] transition font-medium">
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            {user ? (
              <>
                <Link to="/orders" className="block text-gray-700 hover:text-[#8BA888] transition font-medium">My Orders</Link>
                <Link to="/my-addresses" className="block text-gray-700 hover:text-[#8BA888] transition font-medium">My Addresses</Link>
                <button onClick={logout} className="block text-gray-700 hover:text-red-600 transition font-medium text-left">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block text-gray-700 hover:text-[#8BA888] transition font-medium">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
