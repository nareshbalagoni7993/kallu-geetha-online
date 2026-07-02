import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import API from '../api/axios';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function useAdminSocket(userId, role) {
  const [notifications, setNotifications] = useState([]);
  const socketRef  = useRef(null);
  const loadedRef  = useRef(false);

  // Fetch persisted notifications from DB
  const loadFromDB = useCallback(async () => {
    if (!userId || role === 'superadmin') return;
    try {
      const { data } = await API.get('/admin/notifications');
      setNotifications(data);
    } catch (e) {
      console.error('[Notif] DB fetch failed:', e.message);
    }
  }, [userId, role]);

  // Load on mount
  useEffect(() => {
    if (!loadedRef.current && userId) {
      loadedRef.current = true;
      loadFromDB();
    }
  }, [userId, loadFromDB]);

  // Socket for live notifications
  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 30,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    const joinRoom = () => {
      if (role === 'superadmin') socket.emit('join_superadmin');
      else socket.emit('join_admin', userId);
    };

    if (socket.connected) joinRoom();
    socket.on('connect', () => { joinRoom(); });

    socket.on('notification', (data) => {
      // Add live notification (avoid duplicate if already in DB list)
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id && n._id === data._id);
        if (exists) return prev;
        return [{ ...data, read: false }, ...prev].slice(0, 50);
      });

      // Browser push notification
      if (Notification.permission === 'granted') {
        new Notification('Geetha Online 🌴', {
          body: data.type === 'payment_confirmed'
            ? `✅ Payment confirmed — ${data.customer} paid ₹${data.amount}`
            : `🆕 New order from ${data.customer} · ₹${data.amount}`,
          icon: '/palm-tree.jpg',
        });
      }
    });

    socket.on('connect_error', (err) => console.error('[Socket] error:', err.message));

    return () => socket.disconnect();
  }, [userId, role]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try { await API.patch('/admin/notifications/read'); } catch { /* silent */ }
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestPermission = () => Notification.requestPermission();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAllRead, clearAll, requestPermission, reload: loadFromDB };
}
