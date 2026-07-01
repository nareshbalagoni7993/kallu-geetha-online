import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin',          label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/shop',     label: 'My Shop',   icon: '🏪' },
  { to: '/admin/products', label: 'Products',  icon: '🍺' },
  { to: '/admin/orders',   label: 'Orders',    icon: '📦' },
  { to: '/admin/profile',  label: 'Profile',   icon: '👤' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-amber-900 text-white flex flex-col">
        {/* Brand */}
        <div className="p-5 border-b border-amber-700">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-3xl">🌴</span>
            <div>
              <h1 className="text-base font-bold leading-tight">Geetha Online</h1>
              <p className="text-amber-300 text-xs">Shop Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Admin Avatar & Name */}
        <div className="px-5 py-4 border-b border-amber-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow">
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-base font-bold text-white">{initials}</span>}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
              <p className="text-amber-300 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white shadow-sm' : 'text-amber-200 hover:bg-amber-800 hover:text-white'}`
              }>
              <span className="text-base">{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-amber-700">
          <button onClick={handleLogout}
            className="w-full text-sm bg-red-600/80 hover:bg-red-600 text-white py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><div className="p-6 max-w-7xl mx-auto"><Outlet /></div></main>
    </div>
  );
}
