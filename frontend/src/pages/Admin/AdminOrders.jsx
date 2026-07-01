import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';

const NEXT_STATUS = {
  pending:          'confirmed',
  confirmed:        'preparing',
  preparing:        'out_for_delivery',
  out_for_delivery: 'delivered',
};

const STATUS_LABELS = {
  confirmed:        '✓ Confirm Order',
  preparing:        '🍺 Start Preparing',
  out_for_delivery: '🛵 Out for Delivery',
  delivered:        '✅ Mark Delivered',
};

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  const fetchOrders = () => {
    setLoading(true);
    const url = filter === 'all' ? '/admin/orders' : `/admin/orders?status=${filter}`;
    API.get(url).then((r) => setOrders(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchOrders(); }, [filter]);

  const handleStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`/admin/order/${orderId}/status`, { status: newStatus });
      toast.success(`Order ${newStatus.replace(/_/g, ' ')}!`);
      fetchOrders();
    } catch { toast.error('Update failed'); }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await API.patch(`/admin/order/${orderId}/status`, { status: 'cancelled' });
      toast.success('Order cancelled');
      fetchOrders();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shop Orders</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all','pending','confirmed','preparing','out_for_delivery','delivered','cancelled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-amber-700 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">📦</div>
            <p>No orders found</p>
          </div>
        ) : orders.map((o) => (
          <div key={o._id} className="card p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-mono text-xs text-gray-400">#{o.orderNumber}</p>
                <h3 className="font-semibold text-gray-800 mt-1">{o.user?.name}</h3>
                <p className="text-sm text-gray-500">📞 {o.user?.phone}</p>
                <p className="text-sm text-gray-500">📍 {o.deliveryAddress?.street}, {o.deliveryAddress?.city}</p>
              </div>
              <div className="text-right">
                <OrderStatusBadge status={o.status} />
                <p className="text-xl font-bold text-gray-800 mt-2">₹{o.grandTotal}</p>
                <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              {o.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between text-sm text-gray-500">
                <span>Delivery charge</span><span>₹{o.deliveryCharge}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {NEXT_STATUS[o.status] && (
                <button onClick={() => handleStatus(o._id, NEXT_STATUS[o.status])}
                  className="btn-primary text-sm">
                  {STATUS_LABELS[NEXT_STATUS[o.status]]}
                </button>
              )}
              {['pending','confirmed'].includes(o.status) && (
                <button onClick={() => handleCancel(o._id)}
                  className="text-sm px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-colors">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
