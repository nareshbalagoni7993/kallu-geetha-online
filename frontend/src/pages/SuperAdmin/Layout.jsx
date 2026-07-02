import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import useAdminSocket from '../../hooks/useAdminSocket';

const navItems = [
  { to: '/superadmin',            label: 'Dashboard',  icon: '📊', end: true },
  { to: '/superadmin/admins',     label: 'Admins',     icon: '👨‍💼' },
  { to: '/superadmin/shops',      label: 'Shops',      icon: '🏪' },
  { to: '/superadmin/orders',     label: 'Orders',     icon: '📦' },
  { to: '/superadmin/users',      label: 'Users',      icon: '👥' },
  { to: '/superadmin/categories', label: 'Categories', icon: '🏷️' },
];

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationPanel({ notifications, unreadCount, onMarkRead, onClear, onNavigate, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-3 w-[22rem] sm:w-[26rem] rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden bg-white">

      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">🔔</div>
          <div>
            <p className="font-bold text-white text-sm">Notifications</p>
            <p className="text-green-200 text-[10px]">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={onMarkRead}
              className="text-[10px] font-semibold bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full">
              Mark read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={onClear}
              className="text-[10px] font-semibold bg-red-500/70 hover:bg-red-500 text-white px-2 py-0.5 rounded-full">
              Clear
            </button>
          )}
          <button onClick={onClose} className="text-green-200 hover:text-white text-lg leading-none ml-1">✕</button>
        </div>
      </div>

      <div className="max-h-[28rem] overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-sm font-medium text-gray-500">No notifications yet</p>
            <p className="text-xs mt-1">New orders from all shops appear here</p>
          </div>
        ) : notifications.map((n, i) => {
          const isPayment = n.type === 'payment_confirmed';
          return (
            <div key={n._id || n.id || i}
              onClick={() => { onMarkRead(); onNavigate('/superadmin/orders'); onClose(); }}
              className={`flex gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-green-50 border-l-2 border-green-500' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm ${isPayment ? 'bg-green-100' : 'bg-blue-100'}`}>
                {isPayment ? '✅' : '🆕'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 leading-tight">
                  {isPayment ? 'Payment Confirmed' : 'New Order!'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  <span className="font-semibold">{n.customer}</span>
                  <span className="mx-1">·</span>
                  <span className="font-bold text-green-700">₹{n.amount}</span>
                  {n.shopName && <span className="ml-1 text-gray-400 text-[10px]">via {n.shopName}</span>}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{n.orderNumber} · {timeAgo(n.createdAt || n.time)}</p>
              </div>
              {!n.read && <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[10px] text-gray-400">{notifications.length} notifications (live only)</p>
        <button onClick={() => { onNavigate('/superadmin/orders'); onClose(); }}
          className="text-xs text-green-800 font-bold hover:text-green-900">View all orders →</button>
      </div>
    </div>
  );
}

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [showNotif, setShowNotif]       = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const { notifications, unreadCount, markAllRead, clearAll, requestPermission } =
    useAdminSocket(user?._id, user?.role);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'SA';
  const pageTitle = navItems.find((n) => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to))?.label || 'Super Admin';

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { if (Notification.permission === 'default') requestPermission(); }, []);

  const prevCount = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevCount.current) {
      const latest = notifications[0];
      if (latest) {
        toast.custom((t) => (
          <div onClick={() => { navigate('/superadmin/orders'); toast.dismiss(t.id); }}
            className={`cursor-pointer flex items-center gap-3 bg-white shadow-2xl rounded-2xl px-4 py-3.5 w-72 border-l-4 border-green-500 transition-all ${t.visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-2xl">🆕</div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">New Order!</p>
              <p className="text-xs text-gray-500 mt-0.5">{latest.customer} · <span className="font-bold text-green-700">₹{latest.amount}</span></p>
              {latest.shopName && <p className="text-[10px] text-gray-400">{latest.shopName}</p>}
            </div>
            <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-1 rounded-lg">Tap →</span>
          </div>
        ), { duration: 7000, position: 'top-right' });
      }
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <div className="flex min-h-screen" style={{ background: '#f0fdf4' }}>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `} style={{ background: 'linear-gradient(180deg,#052e16 0%,#14532d 40%,#166534 100%)' }}>

        {/* Brand */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-green-400/50 shadow-lg flex-shrink-0">
              <img src="https://www.telugu360.com/wp-content/uploads/2015/08/xxx.jpg" alt="" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white leading-tight">Geetha Online</h1>
              <p className="text-green-300/80 text-[10px] font-medium uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white text-xl">✕</button>
        </div>

        {/* Admin info */}
        <div className="mx-3 mt-3 mb-2 rounded-xl p-3 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md font-black text-white text-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-green-300/70 text-[10px] truncate">{user?.email}</p>
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
                    ? 'bg-white text-green-900 shadow-md font-bold'
                    : 'text-green-100/80 hover:bg-white/10 hover:text-white'
                }`}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.to === '/superadmin/orders' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-xl transition-all"
            style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 px-4 py-0"
          style={{ background: 'linear-gradient(135deg,#052e16 0%,#166534 100%)' }}>
          <div className="flex items-center gap-3 py-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span className="text-white text-lg">☰</span>
            </button>

            <div className="flex-1">
              <h2 className="text-white font-bold text-base leading-tight">{pageTitle}</h2>
              <p className="text-green-300/60 text-[10px]">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif((v) => !v)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{ background: showNotif ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)' }}>
                <span className={`text-xl ${unreadCount > 0 ? 'animate-bounce' : ''}`}>🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-green-900 animate-pulse">
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
                />
              )}
            </div>

            {/* Avatar + Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile((v) => !v)}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-black text-xs shadow-md hover:scale-105 transition-transform">
                {initials}
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden bg-white">
                  {/* User info */}
                  <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg,#052e16 0%,#166534 100%)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                        <p className="text-green-300 text-[10px] truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  {/* Role badge */}
                  <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-2">
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">🌴 Super Admin</span>
                  </div>
                  {/* Logout */}
                  <div className="p-2">
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

        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-5 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
