import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const { totalItems }   = useCart();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <NavLink to="/home" className="flex items-center gap-2">
            <span className="text-2xl">🌴</span>
            <span className="font-bold text-primary text-lg">Geetha Online</span>
          </NavLink>
          <div className="flex items-center gap-4">
            <NavLink to="/home" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
              Home
            </NavLink>
            <NavLink to="/my-orders" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
              My Orders
            </NavLink>
            <NavLink to="/cart" className="relative">
              <span className="text-2xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </NavLink>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden md:block">👤 {user?.name}</span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
