import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import TestPaymentModal from '../../components/TestPaymentModal';
import { useLang } from '../../context/LanguageContext';

const PAYMENT_OPTIONS = [
  { value: 'cod',     label: 'Cash on Delivery', desc: 'Pay when order arrives',                     icon: '💵', color: 'amber' },
  { value: 'online',  label: 'Razorpay',          desc: 'Credit / Debit Card · UPI · Net Banking',   icon: '💳', color: 'blue',   badge: 'TEST' },
  { value: 'phonepe', label: 'PhonePe',            desc: 'PhonePe UPI · QR Code',                    icon: '📱', color: 'purple', badge: 'TEST' },
];

const ACCENT = {
  amber:  { border: 'border-amber-400',  bg: 'bg-amber-50',  dot: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700' },
  blue:   { border: 'border-blue-400',   bg: 'bg-blue-50',   dot: 'bg-blue-600',   badge: 'bg-blue-100 text-blue-700' },
  purple: { border: 'border-purple-400', bg: 'bg-purple-50', dot: 'bg-purple-600', badge: 'bg-purple-100 text-purple-700' },
};

export default function Cart() {
  const { t }      = useLang();
  const { cart, shopInfo, totalAmount, addToCart, removeFromCart, deleteFromCart, clearCart } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [address, setAddress]           = useState({ street: user?.address?.street || '', city: user?.address?.city || '', lat: null, lng: null });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing]           = useState(false);
  const [payModal, setPayModal]         = useState(null);
  const [locLoading, setLocLoading]     = useState(false);

  const deliveryCharge = shopInfo?.deliveryCharge || 0;
  const grandTotal     = totalAmount + deliveryCharge;

  /* ── Detect GPS location + reverse geocode ── */
  const detectLocation = async () => {
    if (!navigator.geolocation) { toast.error('Location not supported by browser'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: c }) => {
        const lat = c.latitude, lng = c.longitude;
        // Nominatim reverse geocode (free, no API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const geo = await res.json();
          const addr = geo.address || {};
          const street = [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', ') || '';
          const city   = addr.city || addr.town || addr.village || addr.county || '';
          setAddress({ street, city, lat, lng });
          toast.success('Location detected!');
        } catch {
          setAddress((a) => ({ ...a, lat, lng }));
          toast.success('Location detected (enter address manually)');
        }
        setLocLoading(false);
      },
      () => { toast.error('Could not get location. Please allow access.'); setLocLoading(false); }
    );
  };

  /* ── Place order ── */
  const handlePlaceOrder = async () => {
    if (!address.city.trim()) { toast.error('Please enter your delivery city'); return; }
    if (cart.length === 0)    { toast.error('Cart is empty'); return; }
    setPlacing(true);

    try {
      const items = cart.map((i) => ({
        product: i._id, name: i.name, price: i.price, quantity: i.qty, image: i.image,
      }));
      const { data: order } = await API.post('/user/order', {
        shopId: shopInfo._id, items, deliveryAddress: address, paymentMethod,
      });

      if (paymentMethod === 'cod') {
        clearCart();
        toast.success('Order placed! 🎉');
        navigate(`/order/${order._id}`);
        return;
      }
      setPayModal({ orderId: order._id, amount: order.grandTotal, method: paymentMethod });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  const handlePaySuccess = (orderId) => {
    setPayModal(null);
    clearCart();
    toast.success('Payment confirmed! Order is being prepared 🎉');
    navigate(`/order/${orderId}`);
  };

  const handlePayCancel = (orderId) => {
    setPayModal(null);
    clearCart();
    toast('Payment cancelled. Your order is saved as pending.', { icon: 'ℹ️' });
    navigate(`/order/${orderId}`);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-600 mb-3">{t('cartEmpty')}</h2>
        <p className="text-gray-400 mb-6">{t('cartEmptyMsg')}</p>
        <button onClick={() => navigate('/home')} className="btn-primary px-8 py-3 text-base">{t('browseShops')}</button>
      </div>
    );
  }

  const mapsUrl = address.lat && address.lng
    ? `https://www.google.com/maps?q=${address.lat},${address.lng}`
    : null;

  return (
    <>
      {payModal && (
        <TestPaymentModal
          method={payModal.method}
          amount={payModal.amount}
          orderId={payModal.orderId}
          onSuccess={() => handlePaySuccess(payModal.orderId)}
          onCancel={() => handlePayCancel(payModal.orderId)}
        />
      )}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{t('myCart')}</h1>
        {shopInfo && <p className="text-gray-500 text-sm mb-5">🏪 {shopInfo.name}</p>}

        {/* ── Items ── */}
        <div className="card p-5 mb-4">
          {cart.map((item) => (
            <div key={item._id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                <p className="text-primary font-semibold text-sm">₹{item.price} × {item.qty} = <strong>₹{item.price * item.qty}</strong></p>
              </div>
              <div className="flex items-center gap-1 border-2 border-primary rounded-lg overflow-hidden flex-shrink-0">
                <button onClick={() => removeFromCart(item._id)} className="px-3 py-1.5 text-primary font-bold hover:bg-primary hover:text-white transition-colors">−</button>
                <span className="px-2 font-bold text-primary min-w-[1.5rem] text-center">{item.qty}</span>
                <button onClick={() => addToCart(item, shopInfo)} className="px-3 py-1.5 text-primary font-bold hover:bg-primary hover:text-white transition-colors">+</button>
              </div>
              <button onClick={() => deleteFromCart(item._id)} className="text-red-400 hover:text-red-600 text-lg flex-shrink-0">✕</button>
            </div>
          ))}
        </div>

        {/* ── Bill ── */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3">{t('subtotal')}</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>{t('subtotal')}</span><span>₹{totalAmount}</span></div>
            <div className="flex justify-between">
              <span>{t('deliveryCharge')}</span>
              <span>{deliveryCharge === 0 ? <span className="text-green-600 font-medium">{t('free')}</span> : `₹${deliveryCharge}`}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-gray-800 text-base">
              <span>{t('grandTotal')}</span><span className="text-primary">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* ── Delivery Address ── */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">{t('deliveryAddressLabel')}</h2>
            <button
              onClick={detectLocation}
              disabled={locLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors">
              {locLoading
                ? <><span className="animate-spin">⏳</span> {t('detecting')}</>
                : <>{t('useMyLocation')}</>}
            </button>
          </div>

          <div className="space-y-3">
            <input className="input-field" placeholder={t('streetHouseNo')}
              value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
            <input className="input-field" placeholder={t('cityTown')}
              value={address.city}   onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
          </div>

          {/* Map preview when GPS detected */}
          {address.lat && address.lng && (
            <div className="mt-3 rounded-xl overflow-hidden border border-green-200">
              <div className="bg-green-50 px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                  📍 Delivery location detected
                </span>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
                  🗺️ Open in Maps
                </a>
              </div>
              <iframe
                title="delivery-location"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${address.lng - 0.008},${address.lat - 0.008},${address.lng + 0.008},${address.lat + 0.008}&layer=mapnik&marker=${address.lat},${address.lng}`}
                className="w-full h-40 border-0"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* ── Payment Method ── */}
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">{t('paymentMethod')}</h2>
          <div className="space-y-3">
            {PAYMENT_OPTIONS.map((p) => {
              const ac  = ACCENT[p.color];
              const sel = paymentMethod === p.value;
              return (
                <label key={p.value}
                  className={`flex items-center gap-4 cursor-pointer rounded-2xl px-4 py-3.5 border-2 transition-all ${sel ? `${ac.border} ${ac.bg}` : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? ac.border : 'border-gray-300'}`}>
                    {sel && <div className={`w-2.5 h-2.5 rounded-full ${ac.dot}`} />}
                  </div>
                  <input type="radio" name="payment" value={p.value} checked={sel}
                    onChange={() => setPaymentMethod(p.value)} className="hidden" />
                  <span className="text-2xl flex-shrink-0">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{p.label}</p>
                      {p.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ac.badge}`}>{p.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {paymentMethod === 'online' && (
            <div className="mt-4 flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">💳</span>
              <div className="text-xs text-blue-700 space-y-0.5">
                <p className="font-semibold">Razorpay Test Mode</p>
                <p>Test card pre-filled · Any UPI · Net Banking supported</p>
                <p className="text-blue-400">Payments are simulated — no real money charged</p>
              </div>
            </div>
          )}
          {paymentMethod === 'phonepe' && (
            <div className="mt-4 flex items-start gap-3 p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-purple-500 mt-0.5 flex-shrink-0">📱</span>
              <div className="text-xs text-purple-700 space-y-0.5">
                <p className="font-semibold">PhonePe Test Mode</p>
                <p>UPI ID and QR code simulated for testing</p>
                <p className="text-purple-400">Payments are simulated — no real money charged</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Place Order button ── */}
        <button onClick={handlePlaceOrder} disabled={placing}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all disabled:opacity-60 active:scale-95 shadow-lg"
          style={{ background: placing ? '#6b7280' : 'linear-gradient(135deg, #15803d, #166534)' }}>
          {placing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" className="opacity-25" />
                <path fill="white" className="opacity-75" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {t('placing')}
            </span>
          ) : (
            `${t('placeOrder')} · ₹${grandTotal}`
          )}
        </button>
      </div>
    </>
  );
}
