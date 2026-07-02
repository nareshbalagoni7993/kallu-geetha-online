import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const NEXT_STATUS = {
  pending:          'confirmed',
  confirmed:        'preparing',
  preparing:        'out_for_delivery',
  out_for_delivery: 'delivered',
};
const STATUS_LABELS = {
  confirmed:        '✓ Confirm',
  preparing:        '🍺 Start Preparing',
  out_for_delivery: '🛵 Out for Delivery',
  delivered:        '✅ Mark Delivered',
};
const STATUS_COLORS = {
  pending: 'bg-yellow-50 border-yellow-200',
  confirmed: 'bg-blue-50 border-blue-200',
  preparing: 'bg-purple-50 border-purple-200',
  out_for_delivery: 'bg-orange-50 border-orange-200',
  delivered: 'bg-green-50 border-green-200',
  cancelled: 'bg-gray-50 border-gray-200',
};

const haversine = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lat2 || lat2 === 0 || lng2 === 0) return null;
  const R = 6371, dL = ((lat2-lat1)*Math.PI)/180, dG = ((lng2-lng1)*Math.PI)/180;
  const a = Math.sin(dL/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dG/2)**2;
  return (R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
};

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60)    return `${Math.floor(s)}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

const FILTERS = ['all','pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
const FILTER_LABELS = {
  all: 'All', pending: '⏳ Pending', confirmed: '✅ Confirmed',
  preparing: '🍺 Preparing', out_for_delivery: '🛵 On the Way',
  delivered: '🎉 Delivered', cancelled: '❌ Cancelled',
};

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelling, setCancelling]   = useState(false);
  const [shopCoords, setShopCoords]   = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    const url = filter === 'all' ? '/admin/orders' : `/admin/orders?status=${filter}`;
    API.get(url).then((r) => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  // Fetch shop coords for distance calc
  useEffect(() => {
    API.get('/admin/shop').then((r) => {
      if (r.data?.address?.lat) setShopCoords({ lat: r.data.address.lat, lng: r.data.address.lng });
    }).catch(() => {});
  }, []);

  const handleStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`/admin/order/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus.replace(/_/g,' ')}!`);
      fetchOrders();
    } catch { toast.error('Update failed'); }
  };

  const confirmCancel = async () => {
    if (!cancelOrder) return;
    setCancelling(true);
    try {
      await API.patch(`/admin/order/${cancelOrder}/status`, { status: 'cancelled' });
      toast.success('Order cancelled');
      fetchOrders();
      setCancelOrder(null);
    } catch { toast.error('Failed to cancel'); }
    finally { setCancelling(false); }
  };

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? orders.length : orders.filter((o) => o.status === f).length;
    return acc;
  }, {});

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shop Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders}
          className="text-sm px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 font-medium transition-colors">
          ↻ Refresh
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === s
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-white text-gray-500 border hover:border-amber-300 hover:text-amber-700'
            }`}>
            {FILTER_LABELS[s]}
            {counts[s] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === s ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="card p-16 text-center text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm mt-1">Orders will appear here when customers place them</p>
          </div>
        ) : orders.map((o) => {
          const delivLat = o.deliveryAddress?.lat;
          const delivLng = o.deliveryAddress?.lng;
          const dist = shopCoords && delivLat && delivLng
            ? haversine(shopCoords.lat, shopCoords.lng, delivLat, delivLng)
            : null;
          const elapsed = timeAgo(o.createdAt);

          return (
            <div key={o._id} className={`card border-l-4 overflow-hidden ${
              o.status === 'pending' ? 'border-l-yellow-400' :
              o.status === 'confirmed' ? 'border-l-blue-400' :
              o.status === 'preparing' ? 'border-l-purple-400' :
              o.status === 'out_for_delivery' ? 'border-l-orange-400' :
              o.status === 'delivered' ? 'border-l-green-500' :
              'border-l-gray-300'}`}>

              {/* Top bar */}
              <div className={`px-5 py-2.5 flex items-center justify-between text-xs ${STATUS_COLORS[o.status] || 'bg-gray-50'}`}>
                <span className="font-mono text-gray-500">#{o.orderNumber}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">🕐 {elapsed}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start gap-4 mb-4">
                  {/* Customer info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                      {o.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{o.user?.name}</p>
                      {o.user?.phone && (
                        <a href={`tel:${o.user.phone}`} className="text-xs text-amber-700 hover:underline">📞 {o.user.phone}</a>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        📍 {[o.deliveryAddress?.street, o.deliveryAddress?.city].filter(Boolean).join(', ') || 'No address'}
                      </p>
                    </div>
                  </div>

                  {/* Amount + payment */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-black text-gray-800">₹{o.grandTotal}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      o.paymentMethod === 'cod' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {o.paymentMethod === 'cod' ? '💵 COD' : o.paymentMethod === 'online' ? '💳 Razorpay' : '📱 PhonePe'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="space-y-1">
                    {o.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                        <span className="font-medium text-gray-800">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-xs text-gray-400">
                    <span>Delivery charge</span><span>₹{o.deliveryCharge}</span>
                  </div>
                </div>

                {/* Distance to delivery (shown when out_for_delivery) */}
                {o.status === 'out_for_delivery' && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-orange-200">
                    <div className="flex items-center gap-3 px-3 py-2 bg-orange-50">
                      <span className="text-lg">🛵</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-orange-700">Delivery in Progress</p>
                        {dist
                          ? <p className="text-xs text-orange-600">📍 {dist} km to customer · ~{Math.ceil(Number(dist)*4)} min ETA</p>
                          : <p className="text-xs text-orange-500">Distance unavailable (no GPS coordinates)</p>}
                      </div>
                    </div>
                    {delivLat && delivLng && (
                      <iframe
                        title={`map-${o._id}`}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${delivLng-0.012},${delivLat-0.012},${delivLng+0.012},${delivLat+0.012}&layer=mapnik&marker=${delivLat},${delivLng}`}
                        className="w-full h-36 border-0"
                        loading="lazy"
                      />
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {NEXT_STATUS[o.status] && (
                    <button onClick={() => handleStatus(o._id, NEXT_STATUS[o.status])}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                      {STATUS_LABELS[NEXT_STATUS[o.status]]}
                    </button>
                  )}
                  {['pending','confirmed'].includes(o.status) && (
                    <button onClick={() => setCancelOrder(o._id)}
                      className="text-sm px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-medium transition-colors">
                      ✕ Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Confirm Modal */}
      {cancelOrder && (
        <ConfirmModal
          title="Cancel Order?"
          message="This will cancel the order. The customer will be notified. This action cannot be undone."
          confirmLabel="Yes, Cancel Order"
          confirmColor="red"
          loading={cancelling}
          onConfirm={confirmCancel}
          onCancel={() => setCancelOrder(null)}
        />
      )}
    </div>
  );
}
