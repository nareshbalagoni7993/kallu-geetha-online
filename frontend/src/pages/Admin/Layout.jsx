import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import useAdminSocket from '../../hooks/useAdminSocket';

const navItems = [
  { to: '/admin',          label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/shop',     label: 'My Shop',   icon: '🏪' },
  { to: '/admin/products', label: 'Products',  icon: '🍺' },
  { to: '/admin/orders',   label: 'Orders',    icon: '📦' },
  { to: '/admin/profile',  label: 'Profile',   icon: '👤' },
];

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationPanel({ notifications, unreadCount, onMarkRead, onClear, onNavigate, onClose, onReload }) {
  return (
    <div className="absolute right-0 top-full mt-3 w-[22rem] sm:w-[26rem] rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
      style={{ background: '#fff' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: 'linear-gradient(135deg,#7c2d12 0%,#b45309 100%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">🔔</div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Notifications</p>
            <p className="text-orange-200 text-[10px]">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onReload} title="Refresh"
            className="text-orange-200 hover:text-white text-base transition-colors">↻</button>
          {unreadCount > 0 && (
            <button onClick={onMarkRead}
              className="text-[10px] font-semibold bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full transition-colors">
              Mark read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={onClear}
              className="text-[10px] font-semibold bg-red-500/70 hover:bg-red-500 text-white px-2 py-0.5 rounded-full transition-colors">
              Clear
            </button>
          )}
          <button onClick={onClose} className="text-orange-200 hover:text-white text-lg leading-none ml-1">✕</button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[28rem] overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-sm font-medium text-gray-500">No notifications yet</p>
            <p className="text-xs mt-1 text-gray-400">New orders will appear here instantly</p>
          </div>
        ) : notifications.map((n, i) => {
          const isPayment = n.type === 'payment_confirmed';
          return (
            <div key={n._id || n.id || i}
              onClick={() => { onMarkRead(); onNavigate('/admin/orders'); onClose(); }}
              className={`flex gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-amber-50 border-l-2 border-amber-400' : ''}`}>
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm ${
                isPayment ? 'bg-green-100' : 'bg-blue-100'}`}>
                {isPayment ? '✅' : '🆕'}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 leading-tight">
                  {isPayment ? 'Payment Confirmed' : 'New Order Received!'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  <span className="font-semibold">{n.customer}</span>
                  <span className="mx-1">·</span>
                  <span className="font-bold text-green-700">₹{n.amount}</span>
                  {n.payMethod && n.payMethod !== 'cod' && (
                    <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                      {n.payMethod === 'online' ? '💳 Razorpay' : '📱 PhonePe'}
                    </span>
                  )}
                  {n.payMethod === 'cod' && (
                    <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">💵 COD</span>
                  )}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {n.orderNumber} · {timeAgo(n.createdAt || n.time)}
                </p>
              </div>
              {!n.read && <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 mt-1.5 shadow-sm" />}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[10px] text-gray-400">{notifications.length} total notifications</p>
        <button onClick={() => { onNavigate('/admin/orders'); onClose(); }}
          className="text-xs text-amber-800 font-bold hover:text-amber-900 flex items-center gap-1">
          View all orders <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [showNotif, setShowNotif]       = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const { notifications, unreadCount, markAllRead, clearAll, requestPermission, reload } =
    useAdminSocket(user?._id, user?.role);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'A';

  // Current page title
  const pageTitle = navItems.find((n) => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'Admin';

  // Close panels on outside click
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Request browser notification permission
  useEffect(() => { if (Notification.permission === 'default') requestPermission(); }, []);

  // Toast on new notification
  const prevCount = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevCount.current) {
      const latest = notifications[0];
      if (latest) {
        toast.custom((t) => (
          <div onClick={() => { navigate('/admin/orders'); toast.dismiss(t.id); }}
            className={`cursor-pointer flex items-center gap-3 bg-white shadow-2xl rounded-2xl px-4 py-3.5 w-72 border-l-4 border-amber-500 transition-all ${t.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <div className="text-2xl">{latest.type === 'payment_confirmed' ? '✅' : '🛒'}</div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">
                {latest.type === 'payment_confirmed' ? 'Payment Confirmed!' : '🆕 New Order!'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{latest.customer} · <span className="font-bold text-green-700">₹{latest.amount}</span></p>
            </div>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-lg">Tap →</span>
          </div>
        ), { duration: 7000, position: 'top-right' });
      }
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <div className="flex min-h-screen" style={{ background: '#f1f5f9' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `} style={{ background: 'linear-gradient(180deg,#431407 0%,#7c2d12 40%,#92400e 100%)' }}>

        {/* Brand */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-400/50 shadow-lg flex-shrink-0">
              <img src="https://www.telugu360.com/wp-content/uploads/2015/08/xxx.jpg" alt="" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white leading-tight">Geetha Online</h1>
              <p className="text-amber-300/80 text-[10px] font-medium uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white text-xl">✕</button>
        </div>

        {/* Admin info */}
        <div className="mx-3 mt-3 mb-2 rounded-xl p-3 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md font-black text-white text-sm">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-xl" />
              : initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-amber-300/70 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-amber-900 shadow-md font-bold'
                    : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                }`}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.to === '/admin/orders' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
            style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-20 px-4 py-0"
          style={{ background: 'linear-gradient(135deg,#431407 0%,#92400e 100%)' }}>
          <div className="flex items-center gap-3 py-3">
            {/* Hamburger */}
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span className="text-white text-lg">☰</span>
            </button>

            {/* Page title */}
            <div className="flex-1">
              <h2 className="text-white font-bold text-base leading-tight">{pageTitle}</h2>
              <p className="text-amber-300/60 text-[10px]">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif((v) => !v)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{ background: showNotif ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)' }}>
                <span className={`text-xl transition-transform ${unreadCount > 0 ? 'animate-bounce' : ''}`}>🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-lg border-2 border-amber-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <NotificationPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkRead={markAllRead}
                  onClear={clearAll}
                  onNavigate={navigate}
                  onClose={() => setShowNotif(false)}
                  onReload={reload}
                />
              )}
            </div>

            {/* Avatar + Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile((v) => !v)}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xs shadow-md overflow-hidden hover:scale-105 transition-transform">
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : initials}
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden bg-white">
                  {/* User info */}
                  <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg,#431407 0%,#92400e 100%)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 overflow-hidden">
                        {user?.avatar
                          ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                          : initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                        <p className="text-amber-300 text-[10px] truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  {/* Role badge */}
                  <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">🍺 Shop Admin</span>
                  </div>
                  {/* Profile link */}
                  <div className="px-2 pt-2">
                    <button
                      onClick={() => { setShowProfile(false); navigate('/admin/profile'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <span className="text-base">👤</span>
                      My Profile
                    </button>
                  </div>
                  {/* Logout */}
                  <div className="px-2 pb-2">
                    <button
                      onClick={() => { setShowProfile(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                      <span className="text-base">🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-5 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
