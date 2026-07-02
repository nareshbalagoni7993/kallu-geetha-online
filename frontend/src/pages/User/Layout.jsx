import { useState } from 'react';
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
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary shadow-sm flex-shrink-0">
              <img src="/toddy-tapper.jpg" alt="Geetha Online" className="w-full h-full object-cover object-top" />
            </div>
            <span className="font-bold text-primary text-lg">Geetha Online</span>
          </NavLink>
          <div className="flex items-center gap-3">
            {/* Hidden on mobile — shown in bottom nav */}
            <NavLink to="/home"
              className={({ isActive }) => `hidden sm:block text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
              Home
            </NavLink>
            <NavLink to="/my-orders"
              className={({ isActive }) => `hidden sm:block text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
              My Orders
            </NavLink>
            {/* Cart icon — always visible */}
            <NavLink to="/cart" className="relative">
              <span className="text-2xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </NavLink>
            <span className="hidden sm:block text-sm text-gray-600">👤 {user?.name?.split(' ')[0]}</span>
            <button onClick={handleLogout} className="hidden sm:block text-sm text-red-500 hover:text-red-700 font-medium">Logout</button>
          </div>
        </div>
      </nav>

      {/* Page content — add bottom padding on mobile for bottom nav */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-6">
        <Outlet />
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex">
        <NavLink to="/home" end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-500'}`}>
          <span className="text-xl">🏠</span>
          Home
        </NavLink>
        <NavLink to="/my-orders"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-500'}`}>
          <span className="text-xl">📦</span>
          Orders
        </NavLink>
        <NavLink to="/cart" className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium text-gray-500 relative">
          {({ isActive }) => (
            <>
              <span className="text-xl relative">
                🛒
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </span>
              <span className={isActive ? 'text-primary' : ''}>Cart</span>
            </>
          )}
        </NavLink>
        <button onClick={handleLogout}
          className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium text-red-500">
          <span className="text-xl">🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
}
