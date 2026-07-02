import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import LangToggle from '../../components/LangToggle';
import toast from 'react-hot-toast';

export default function Login() {
  const { t }     = useLang();
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 🎉`);
      if (user.role === 'superadmin') navigate('/superadmin');
      else if (user.role === 'admin')  navigate('/admin');
      else navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
        <div className="absolute top-1/3 right-8 w-32 h-32 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />

        <div className="relative z-10 text-center px-12 max-w-lg">
          {/* Photo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl ring-8 ring-white/10">
                <img src="https://www.telugu360.com/wp-content/uploads/2015/08/xxx.jpg"
                  alt="Toddy Tapper" className="w-full h-full object-cover object-top" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                Fresh
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Geetha Online</h1>
          <p className="text-green-200 text-lg mb-10 font-medium">
            Premium Toddy Delivery<br />Right to Your Doorstep
          </p>

          <div className="space-y-4 text-left">
            {[
              { icon: '🌴', title: 'Fresh Palm Toddy', desc: 'Sourced daily from trusted tappers' },
              { icon: '🚀', title: 'Fast Delivery',    desc: 'Delivered in under 30 minutes' },
              { icon: '🔒', title: 'Safe & Trusted',   desc: '500+ happy customers across Telangana' },
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
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 sm:p-10">
        <div className="w-full max-w-md">

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
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('appName')}</h2>
                <p className="text-gray-500 text-sm mt-1">{t('signIn')}</p>
              </div>
              <LangToggle />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('emailAddress')}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">✉️</span>
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-800 text-sm transition-colors bg-gray-50 focus:bg-white"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('password')}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">🔑</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-800 text-sm transition-colors bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
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
                    Signing in...
                  </span>
                ) : `${t('login')} →`}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                {t('noAccount')}{' '}
                <Link to="/register" className="text-green-700 font-semibold hover:text-green-800 hover:underline">
                  {t('createAccount')}
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
