import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]         = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome to Geetha Online 🎉');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel — Brand Hero ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 35%, #854d0e 100%)' }}>

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #bbf7d0, transparent)' }} />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fde68a, transparent)' }} />

        <div className="relative z-10 text-center px-12 max-w-lg">
          {/* Photo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl ring-8 ring-white/10">
                <img src="https://www.telugu360.com/wp-content/uploads/2015/08/xxx.jpg"
                  alt="Toddy Tapper" className="w-full h-full object-cover object-top" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                Join us
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Geetha Online</h1>
          <p className="text-green-200 text-lg mb-10 font-medium">
            Join thousands of happy customers<br />across Telangana
          </p>

          <div className="space-y-4 text-left">
            {[
              { icon: '✅', title: 'Free Registration',  desc: 'No charges to create an account' },
              { icon: '📦', title: 'Track Your Orders',   desc: 'Real-time order tracking & status' },
              { icon: '🎉', title: 'Exclusive Deals',     desc: 'Special offers for registered users' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/10">
                <span className="text-2xl w-10 text-center">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-green-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-4">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-green-600 shadow-xl">
                <img src="https://www.telugu360.com/wp-content/uploads/2015/08/xxx.jpg"
                  alt="Geetha Online" className="w-full h-full object-cover object-top" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-green-800">Geetha Online</h1>
            <p className="text-gray-500 text-sm">Premium Toddy Delivery</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 text-sm mt-1">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">👤</span>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-800 text-sm transition-colors bg-gray-50 focus:bg-white"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">✉️</span>
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-800 text-sm transition-colors bg-gray-50 focus:bg-white"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">📞</span>
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-800 text-sm transition-colors bg-gray-50 focus:bg-white"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">🔑</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-800 text-sm transition-colors bg-gray-50 focus:bg-white"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-1.5 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length > i * 2 + 1
                          ? form.password.length < 6 ? 'bg-red-400' : form.password.length < 10 ? 'bg-amber-400' : 'bg-green-500'
                          : 'bg-gray-200'
                      }`} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-green-200 hover:shadow-green-300 active:scale-95"
                style={{ background: loading ? '#6b7280' : 'linear-gradient(135deg, #15803d, #166534)' }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" className="opacity-25" />
                      <path fill="white" className="opacity-75" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account →'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-green-700 font-semibold hover:text-green-800 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2025 Geetha Online · Premium Toddy Delivery
          </p>
        </div>
      </div>
    </div>
  );
}
