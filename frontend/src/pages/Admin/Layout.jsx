import { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-amber-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Brand */}
        <div className="p-5 border-b border-amber-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 flex-shrink-0 shadow">
              <img src="https://www.telugu360.com/wp-content/uploads/2015/08/xxx.jpg" alt="Geetha Online" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Geetha Online</h1>
              <p className="text-amber-300 text-xs">Shop Admin Panel</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-amber-300 hover:text-white text-2xl leading-none">✕</button>
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
              onClick={() => setSidebarOpen(false)}
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

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-amber-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-md">
          <button onClick={() => setSidebarOpen(true)}
            className="text-amber-200 hover:text-white text-2xl leading-none">☰</button>
          <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400 flex-shrink-0">
            <img src="https://www.telugu360.com/wp-content/uploads/2015/08/xxx.jpg" alt="" className="w-full h-full object-cover object-top" />
          </div>
          <span className="font-bold text-base flex-1">Admin Panel</span>
          <span className="text-amber-300 text-sm">{user?.name?.split(' ')[0]}</span>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
