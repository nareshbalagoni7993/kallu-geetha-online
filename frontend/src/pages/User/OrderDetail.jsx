import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';

const STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STEP_ICONS = { pending: '⏳', confirmed: '✅', preparing: '🍺', out_for_delivery: '🛵', delivered: '🎉' };
const STEP_LABELS = { pending: 'Order Placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'On the Way', delivered: 'Delivered' };

const calcDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lat2) return null;
  const R = 6371, dL = ((lat2 - lat1) * Math.PI) / 180, dG = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dL / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dG / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    fetchOrder();
    navigator.geolocation?.getCurrentPosition(({ coords: c }) => setUserCoords({ lat: c.latitude, lng: c.longitude }));
  }, [orderId]);

  const fetchOrder = () => {
    setLoading(true);
    API.get(`/user/order/${orderId}`).then((r) => setOrder(r.data)).finally(() => setLoading(false));
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await API.patch(`/user/order/${orderId}/cancel`);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    finally { setCancelling(false); }
  };

  if (loading) return <Spinner size="lg" />;
  if (!order)  return <div className="text-center py-20 text-gray-400">Order not found</div>;

  const isCancelled  = order.status === 'cancelled';
  const stepIndex    = STEPS.indexOf(order.status);
  const isPreparingOrOut = ['preparing', 'out_for_delivery'].includes(order.status);
  const shopLat      = order.shop?.address?.lat;
  const shopLng      = order.shop?.address?.lng;
  const distance     = calcDistance(userCoords?.lat, userCoords?.lng, shopLat, shopLng);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <button onClick={() => navigate('/my-orders')} className="text-primary text-sm hover:underline flex items-center gap-1">
        ← Back to Orders
      </button>

      {/* Order Number & Status */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-lg font-bold text-gray-800">Order Details</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-gray-400 font-mono mb-5">{order.orderNumber}</p>
        <p className="text-xs text-gray-400 mb-4">{new Date(order.createdAt).toLocaleString()}</p>

        {isCancelled ? (
          <div className="text-center py-4 bg-red-50 rounded-xl">
            <div className="text-4xl mb-2">❌</div>
            <p className="font-semibold text-red-600">Order Cancelled</p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="flex items-start justify-between relative mb-2">
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0 mx-4">
                <div className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }} />
              </div>
              {STEPS.map((step, i) => {
                const done = i <= stepIndex;
                return (
                  <div key={step} className="flex flex-col items-center z-10 flex-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all ${done ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-300 text-gray-400'}`}>
                      {STEP_ICONS[step]}
                    </div>
                    <p className={`text-xs mt-1.5 font-medium text-center leading-tight ${done ? 'text-primary' : 'text-gray-400'}`}>
                      {STEP_LABELS[step]}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Location / Distance Card — shown when preparing or out for delivery */}
      {isPreparingOrOut && (
        <div className="card p-5 border-2 border-green-200 bg-green-50">
          <h2 className="font-semibold text-green-800 mb-3">
            {order.status === 'out_for_delivery' ? '🛵 Delivery Partner is on the way!' : '🍺 Your order is being prepared!'}
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-xl">🏪</div>
            <div>
              <p className="font-medium text-gray-800 text-sm">{order.shop?.name}</p>
              <p className="text-gray-500 text-xs">📍 {order.shop?.address?.city}</p>
            </div>
          </div>
          {distance && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-200">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold text-gray-800">{distance} km from you</p>
                <p className="text-xs text-gray-500">
                  {order.status === 'out_for_delivery'
                    ? `Estimated arrival: ~${Math.ceil(distance * 4)} min`
                    : `Shop is ${distance} km away`}
                </p>
              </div>
            </div>
          )}
          {order.shop?.phone && (
            <a href={`tel:${order.shop.phone}`}
              className="mt-3 flex items-center gap-2 text-green-700 text-sm font-medium hover:underline">
              📞 Call Shop: {order.shop.phone}
            </a>
          )}
        </div>
      )}

      {/* Shop Info */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-1">🏪 {order.shop?.name}</h2>
        <p className="text-sm text-gray-500">📍 {order.shop?.address?.city}</p>
        {order.shop?.phone && (
          <a href={`tel:${order.shop.phone}`} className="text-sm text-primary hover:underline mt-1 block">📞 {order.shop?.phone}</a>
        )}
      </div>

      {/* Items */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-3">🍺 Order Items</h2>
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 overflow-hidden flex items-center justify-center text-sm">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : '🍺'}
              </div>
              <span className="text-gray-700">{item.name} × {item.quantity}</span>
            </div>
            <span className="font-medium">₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="pt-3 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{order.totalAmount}</span></div>
          <div className="flex justify-between"><span>Delivery charge</span>
            <span>{order.deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${order.deliveryCharge}`}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-1">
            <span>Grand Total</span><span>₹{order.grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-3">💳 Payment Details</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">{order.paymentMethod === 'cod' ? '💵' : '📱'}</span>
              <div>
                <p className="font-medium text-sm text-gray-800">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
                <p className="text-xs text-gray-500">Amount: ₹{order.grandTotal}</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {order.paymentStatus === 'paid' ? '✓ Paid'
               : order.paymentStatus === 'failed' ? '✗ Failed'
               : order.paymentMethod === 'cod' ? '💵 Pay on Delivery'
               : '⏳ Pending'}
            </span>
          </div>

          {order.paymentMethod === 'cod' && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              💡 Keep ₹{order.grandTotal} ready to pay when the delivery arrives.
            </div>
          )}

          {order.paymentMethod === 'cod' && order.status === 'delivered' && order.paymentStatus !== 'paid' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
              ✓ Order delivered. Cash payment of ₹{order.grandTotal} collected.
            </div>
          )}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-2">📍 Delivery Address</h2>
        <p className="text-sm text-gray-600">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
      </div>

      {/* Cancel Button */}
      {['pending', 'confirmed'].includes(order.status) && (
        <button onClick={handleCancel} disabled={cancelling}
          className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors disabled:opacity-60">
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}
