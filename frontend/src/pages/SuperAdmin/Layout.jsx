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

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-white flex flex-col">
        <div className="p-6 border-b border-green-700">
          <div className="text-3xl mb-1">🌴</div>
          <h1 className="text-lg font-bold">Geetha Online</h1>
          <p className="text-green-300 text-xs mt-1">Super Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-green-700">
          <div className="text-sm text-green-300 mb-3 truncate">👤 {user?.name}</div>
          <button onClick={handleLogout} className="w-full text-sm bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
