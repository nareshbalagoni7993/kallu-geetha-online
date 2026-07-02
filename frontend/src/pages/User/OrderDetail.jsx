import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { useLang } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STEP_ICONS  = { pending: '⏳', confirmed: '✅', preparing: '🍺', out_for_delivery: '🛵', delivered: '🎉' };
const STEP_LABELS_EN = { pending: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'On the Way', delivered: 'Delivered' };

const calcDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lat2 || !lng1 || !lng2) return null;
  if (lat2 === 0 && lng2 === 0) return null; // shop has no coordinates set
  const R = 6371, dL = ((lat2 - lat1) * Math.PI) / 180, dG = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dL / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dG / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

const paymentIcon  = (m) => ({ cod: '💵', online: '💳', phonepe: '📱' }[m] || '💳');
const paymentLabel = (m) => ({ cod: 'Cash on Delivery', online: 'Razorpay', phonepe: 'PhonePe' }[m] || m);

export default function OrderDetail() {
  const { t }         = useLang();
  const { orderId }   = useParams();
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  const [order, setOrder]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [verifying, setVerifying]   = useState(false);

  useEffect(() => {
    fetchOrder();
    navigator.geolocation?.getCurrentPosition(({ coords: c }) =>
      setUserCoords({ lat: c.latitude, lng: c.longitude })
    );
  }, [orderId]);

  // Handle PhonePe return
  useEffect(() => {
    const payment = searchParams.get('payment');
    const txnId   = searchParams.get('txn');
    if (payment !== 'phonepe' || !txnId) return;
    setVerifying(true);
    API.get(`/payment/phonepe/status/${txnId}`)
      .then(({ data }) => {
        if (data.paid) toast.success('PhonePe payment confirmed! 🎉');
        else           toast('Payment status: pending. Refresh in a moment.', { icon: 'ℹ️' });
        fetchOrder();
      })
      .catch(() => toast.error('Could not verify PhonePe payment'))
      .finally(() => setVerifying(false));
  }, []);

  const fetchOrder = () => {
    setLoading(true);
    API.get(`/user/order/${orderId}`).then((r) => setOrder(r.data)).finally(() => setLoading(false));
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await API.patch(`/user/order/${orderId}/cancel`);
      toast.success('Order cancelled');
      setShowCancel(false);
      fetchOrder();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    finally { setCancelling(false); }
  };

  if (loading || verifying) return <Spinner size="lg" text={verifying ? 'Verifying payment...' : ''} />;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  const isCancelled = order.status === 'cancelled';
  const isActive    = !isCancelled && order.status !== 'delivered';
  const stepIndex   = STEPS.indexOf(order.status);

  const shopLat  = order.shop?.address?.lat;
  const shopLng  = order.shop?.address?.lng;
  const distance = calcDistance(userCoords?.lat, userCoords?.lng, shopLat, shopLng);
  const mapsUrl  = shopLat && shopLng && shopLat !== 0 && shopLng !== 0
    ? `https://www.google.com/maps/dir/?api=1&destination=${shopLat},${shopLng}`
    : null;

  const delivMapUrl = order.deliveryAddress?.lat && order.deliveryAddress?.lng
    ? `https://www.google.com/maps?q=${order.deliveryAddress.lat},${order.deliveryAddress.lng}`
    : null;

  const statusMsg = {
    out_for_delivery: t('msg_out_for_delivery'),
    preparing:        t('msg_preparing'),
    confirmed:        t('msg_confirmed'),
    pending:          t('msg_pending'),
  }[order.status] || '';

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <button onClick={() => navigate('/my-orders')}
        className="text-primary text-sm hover:underline flex items-center gap-1">
        {t('backToOrders')}
      </button>

      {/* ── Order Number & Status ── */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-lg font-bold text-gray-800">{t('orderDetails')}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-gray-400 font-mono mb-1">{order.orderNumber}</p>
        <p className="text-xs text-gray-400 mb-5">{new Date(order.createdAt).toLocaleString()}</p>

        {isCancelled ? (
          <div className="text-center py-4 bg-red-50 rounded-xl">
            <div className="text-4xl mb-2">❌</div>
            <p className="font-semibold text-red-600">{t('orderCancelled')}</p>
          </div>
        ) : (
          <div className="flex items-start justify-between relative mb-2">
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0 mx-4">
              <div className="h-full bg-primary transition-all duration-700"
                style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }} />
            </div>
            {STEPS.map((step, i) => {
              const done = i <= stepIndex;
              const stepLabel = step === 'pending' ? t('placed') : step === 'out_for_delivery' ? t('onTheWay') : t(`status_${step}`);
              return (
                <div key={step} className="flex flex-col items-center z-10 flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all ${done ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-300 text-gray-400'}`}>
                    {STEP_ICONS[step]}
                  </div>
                  <p className={`text-xs mt-1.5 font-medium text-center leading-tight ${done ? 'text-primary' : 'text-gray-400'}`}>
                    {stepLabel || STEP_LABELS_EN[step]}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Live Shop Location + Distance (all active orders) ── */}
      {isActive && (
        <div className="card p-5 border-2 border-green-200 bg-green-50">
          {statusMsg && <p className="font-semibold text-green-800 mb-3 text-sm">{statusMsg}</p>}

          {/* Shop info row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-xl flex-shrink-0">🏪</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{order.shop?.name}</p>
              <p className="text-gray-500 text-xs">📍 {order.shop?.address?.city || 'N/A'}</p>
            </div>
            {order.shop?.phone && (
              <a href={`tel:${order.shop.phone}`}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-green-700 border border-green-400 bg-white px-2.5 py-1.5 rounded-lg hover:bg-green-100">
                📞 Call
              </a>
            )}
          </div>

          {/* Distance card */}
          {distance ? (
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-200 mb-3">
              <span className="text-2xl">📍</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{distance} {t('kmFromYou')}</p>
                <p className="text-xs text-gray-500">
                  {order.status === 'out_for_delivery'
                    ? `${t('estimatedArrival')}: ~${Math.ceil(Number(distance) * 4)} min`
                    : `${t('shopIs')} ${distance} ${t('kmFromLocation')}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-green-200 mb-3 text-xs text-gray-500">
              <span>📍</span>
              <span>{t('allowLocation')}</span>
            </div>
          )}

          {/* Map embed when shop has GPS */}
          {shopLat && shopLng && shopLat !== 0 && shopLng !== 0 ? (
            <div className="rounded-xl overflow-hidden border border-green-200 mb-3">
              <iframe
                title="shop-location"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${shopLng - 0.01},${shopLat - 0.01},${shopLng + 0.01},${shopLat + 0.01}&layer=mapnik&marker=${shopLat},${shopLng}`}
                className="w-full h-44 border-0"
                loading="lazy"
              />
            </div>
          ) : null}

          {/* Directions button */}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors w-full">
              {t('getDirections')}
            </a>
          )}
        </div>
      )}

      {/* ── Shop Info ── */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">🏪 {order.shop?.name}</h2>
            <p className="text-sm text-gray-500">📍 {order.shop?.address?.city}</p>
            {order.shop?.phone && (
              <a href={`tel:${order.shop.phone}`} className="text-sm text-primary hover:underline mt-1 block">
                {t('callShop')} {order.shop?.phone}
              </a>
            )}
          </div>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors">
              🗺️ Maps
            </a>
          )}
        </div>
      </div>

      {/* ── Items ── */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-3">{t('orderItems')}</h2>
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 overflow-hidden flex items-center justify-center text-sm flex-shrink-0">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : '🍺'}
              </div>
              <span className="text-gray-700">{item.name} × {item.quantity}</span>
            </div>
            <span className="font-medium">₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="pt-3 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between"><span>{t('subtotal')}</span><span>₹{order.totalAmount}</span></div>
          <div className="flex justify-between"><span>{t('deliveryCharge')}</span>
            <span>{order.deliveryCharge === 0 ? <span className="text-green-600">{t('free')}</span> : `₹${order.deliveryCharge}`}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-1">
            <span>{t('grandTotal')}</span><span>₹{order.grandTotal}</span>
          </div>
        </div>
      </div>

      {/* ── Payment Details ── */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-3">{t('paymentDetails')}</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">{paymentIcon(order.paymentMethod)}</span>
              <div>
                <p className="font-medium text-sm text-gray-800">{paymentLabel(order.paymentMethod)}</p>
                <p className="text-xs text-gray-500">Amount: ₹{order.grandTotal}</p>
                {order.razorpayPaymentId && (
                  <p className="text-xs text-gray-400 font-mono">Txn: {order.razorpayPaymentId}</p>
                )}
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              order.paymentStatus === 'paid'   ? 'bg-green-100 text-green-700' :
              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {order.paymentStatus === 'paid'    ? t('paid')
               : order.paymentStatus === 'failed' ? t('failed')
               : order.paymentMethod === 'cod'    ? t('payOnDelivery')
               : t('pending')}
            </span>
          </div>
          {order.paymentMethod === 'cod' && !['delivered', 'cancelled'].includes(order.status) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              💡 Keep ₹{order.grandTotal} ready to pay when the delivery arrives.
            </div>
          )}
          {order.paymentMethod !== 'cod' && order.paymentStatus === 'pending' && order.status !== 'cancelled' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
              ⏳ Payment is pending. If you already paid, wait a moment and refresh.
            </div>
          )}
        </div>
      </div>

      {/* ── Delivery Address ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-800">{t('deliveryAddressLabel')}</h2>
          {delivMapUrl && (
            <a href={delivMapUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 font-semibold hover:underline">🗺️ View on Map</a>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {[order.deliveryAddress?.street, order.deliveryAddress?.city].filter(Boolean).join(', ')}
        </p>
        {order.deliveryAddress?.lat && order.deliveryAddress?.lng && (
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <iframe
              title="delivery-address"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.deliveryAddress.lng - 0.008},${order.deliveryAddress.lat - 0.008},${order.deliveryAddress.lng + 0.008},${order.deliveryAddress.lat + 0.008}&layer=mapnik&marker=${order.deliveryAddress.lat},${order.deliveryAddress.lng}`}
              className="w-full h-36 border-0"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* ── Cancel Button ── */}
      {['pending', 'confirmed'].includes(order.status) && (
        <button onClick={() => setShowCancel(true)}
          className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors">
          ✕ {t('cancelOrder')}
        </button>
      )}

      {showCancel && (
        <ConfirmModal
          title={t('cancelOrderQ')}
          message={t('cancelConfirmMsg')}
          confirmLabel={t('yesCancel')}
          confirmColor="red"
          loading={cancelling}
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
        />
      )}
    </div>
  );
}
