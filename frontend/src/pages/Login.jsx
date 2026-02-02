import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Zap, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email_or_phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email_or_phone, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[480px]">
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

        {/* Login Card */}
        <div className="bg-white rounded-[40px] border border-[#F0F0F0] p-10 shadow-[0_30px_70px_rgba(0,0,0,0.05)]">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase mb-2">Welcome Back</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Login to your wellness portal</p>
          </div>

          {error && (
            <div className="bg-[#FFF5F8] border border-[#FED7E2] text-red-500 px-6 py-4 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Email / Account</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#FF6B35] transition-colors" />
                <input
                  type="email"
                  name="email_or_phone"
                  placeholder="name@energy.com"
                  value={formData.email_or_phone}
                  onChange={handleChange}
                  className="w-full pl-16 pr-6 py-5 bg-[#F9F9F9] border-2 border-[#F0F0F0] rounded-[24px] text-sm font-black text-[#1A1A1A] focus:bg-white focus:border-[#FF6B35] focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#FF6B35] transition-colors" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-16 pr-6 py-5 bg-[#F9F9F9] border-2 border-[#F0F0F0] rounded-[24px] text-sm font-black text-[#1A1A1A] focus:bg-white focus:border-[#FF6B35] focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold"
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
                <>Enter Portal <Zap className="w-4 h-4 text-[#FF6B35]" fill="currentColor" /></>
              )}
            </button>

            <div className="text-center pt-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New to the journey?</span>
              <Link to="/register" className="ml-2 text-[10px] font-black text-[#FF6B35] uppercase tracking-widest hover:underline">
                Create Account
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em]">Licensed & Protected Energy</p>
        </div>
      </div>
    </div>
  );
}
