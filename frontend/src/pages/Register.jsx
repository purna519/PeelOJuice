import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Zap, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      // Phone is auto-verified, only need email verification
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[540px]">
        {/* Logo Section */}
        <div className="text-center mb-12">
           <div className="inline-flex items-center mb-6 group cursor-pointer" onClick={() => navigate('/')}>
             <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-4xl font-black tracking-tighter uppercase text-[#4A1E6D]">Peel</span>
                  <div className="relative">
                    <span className="text-4xl font-black tracking-tighter uppercase text-[#FF6B35]">'O'</span>
                    {/* Caption starts from O */}
                    <span className="absolute left-0 top-full text-[11px] font-black uppercase tracking-tight whitespace-nowrap mt-0.5">
                      <span className="text-[#6B9E3E]">Sip Fresh....</span>
                      <span className="text-[#4A1E6D]"> Feel Refresh.</span>
                    </span>
                  </div>
                  <span className="text-4xl font-black tracking-tighter uppercase text-[#6B9E3E]">Juice</span>
                </div>
             </div>
           </div>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-[40px] border border-[#F0F0F0] p-12 shadow-[0_30px_70px_rgba(0,0,0,0.05)]">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase mb-2">Create Identity</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Join the fresh revolution today</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 px-6 py-4 rounded-2xl mb-8 text-sm font-semibold text-center animate-in fade-in slide-in-from-top-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-[#F9F9F9] border-2 border-[#F0F0F0] rounded-[24px] text-sm font-black text-[#1A1A1A] focus:bg-white focus:border-[#FF6B35] focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-[#F9F9F9] border-2 border-[#F0F0F0] rounded-[24px] text-sm font-black text-[#1A1A1A] focus:bg-white focus:border-[#FF6B35] focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Email Connection</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#FF6B35] transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@energy.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-16 pr-6 py-5 bg-[#F9F9F9] border-2 border-[#F0F0F0] rounded-[24px] text-sm font-black text-[#1A1A1A] focus:bg-white focus:border-[#FF6B35] focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Contact Number</label>
              <div className="relative group">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#FF6B35] transition-colors" />
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="+91 ••••• •••••"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full pl-16 pr-6 py-5 bg-[#F9F9F9] border-2 border-[#F0F0F0] rounded-[24px] text-sm font-black text-[#1A1A1A] focus:bg-white focus:border-[#FF6B35] focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-[#F9F9F9] border-2 border-[#F0F0F0] rounded-[24px] text-sm font-black text-[#1A1A1A] focus:bg-white focus:border-[#FF6B35] focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Confirm</label>
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-[#F9F9F9] border-2 border-[#F0F0F0] rounded-[24px] text-sm font-black text-[#1A1A1A] focus:bg-white focus:border-[#FF6B35] focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Join Revolution <ChevronRight className="w-4 h-4 text-[#FF6B35]" /></>
              )}
            </button>

            <div className="text-center pt-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Returning warrior?</span>
              <Link to="/login" className="ml-2 text-[10px] font-black text-[#FF6B35] uppercase tracking-widest hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
