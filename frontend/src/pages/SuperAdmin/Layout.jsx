import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/superadmin',         label: 'Dashboard', icon: '📊', end: true },
  { to: '/superadmin/admins',  label: 'Admins',    icon: '👨‍💼' },
  { to: '/superadmin/shops',   label: 'Shops',     icon: '🏪' },
  { to: '/superadmin/orders',  label: 'Orders',    icon: '📦' },
  { to: '/superadmin/users',   label: 'Users',     icon: '👥' },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

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
        w-64 bg-green-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-5 border-b border-green-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-green-400 flex-shrink-0 shadow">
              <img src="https://www.telugu360.com/wp-content/uploads/2015/08/xxx.jpg" alt="Geetha Online" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Geetha Online</h1>
              <p className="text-green-300 text-xs mt-0.5">Super Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-green-300 hover:text-white text-2xl leading-none self-start">✕</button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-800'
                }`
              }>
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-green-700">
          <div className="text-sm text-green-300 mb-3 truncate">👤 {user?.name}</div>
          <button onClick={handleLogout}
            className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-green-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-md">
          <button onClick={() => setSidebarOpen(true)}
            className="text-green-200 hover:text-white text-2xl leading-none">☰</button>
          <div className="w-7 h-7 rounded-full overflow-hidden border border-green-400 flex-shrink-0">
            <img src="https://www.telugu360.com/wp-content/uploads/2015/08/xxx.jpg" alt="" className="w-full h-full object-cover object-top" />
          </div>
          <span className="font-bold text-base flex-1">Super Admin</span>
          <span className="text-green-300 text-sm">{user?.name?.split(' ')[0]}</span>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
