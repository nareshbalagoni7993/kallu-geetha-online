import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, shopInfo, totalItems, totalAmount, addToCart, removeFromCart, deleteFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city:   user?.address?.city   || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing]             = useState(false);

  const deliveryCharge = shopInfo?.deliveryCharge || 0;
  const grandTotal     = totalAmount + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (!address.city.trim()) { toast.error('Please enter delivery city'); return; }
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const items = cart.map((i) => ({ product: i._id, name: i.name, price: i.price, quantity: i.qty, image: i.image }));
      const r = await API.post('/user/order', { shopId: shopInfo._id, items, deliveryAddress: address, paymentMethod });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order/${r.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-600 mb-3">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Browse shops and add toddy products to your cart</p>
        <button onClick={() => navigate('/home')} className="btn-primary px-8 py-3 text-base">Browse Shops</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart</h1>
      {shopInfo && <p className="text-gray-500 text-sm mb-6">🏪 {shopInfo.name}</p>}

      {/* Items */}
      <div className="card p-5 mb-5">
        {cart.map((item) => (
          <div key={item._id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{item.name}</h3>
              <p className="text-primary font-semibold">₹{item.price} × {item.qty} = ₹{item.price * item.qty}</p>
            </div>
            <div className="flex items-center gap-2 border-2 border-primary rounded-lg overflow-hidden">
              <button onClick={() => removeFromCart(item._id)} className="px-3 py-1.5 text-primary font-bold hover:bg-primary hover:text-white transition-colors">−</button>
              <span className="px-2 font-bold text-primary">{item.qty}</span>
              <button onClick={() => addToCart(item, shopInfo)} className="px-3 py-1.5 text-primary font-bold hover:bg-primary hover:text-white transition-colors">+</button>
            </div>
            <button onClick={() => deleteFromCart(item._id)} className="text-red-400 hover:text-red-600 text-lg">✕</button>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3">Bill Summary</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between"><span>Item total</span><span>₹{totalAmount}</span></div>
          <div className="flex justify-between"><span>Delivery charge</span><span>{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCharge}`}</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-gray-800 text-base">
            <span>Grand Total</span><span>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-3">📍 Delivery Address</h2>
        <div className="space-y-3">
          <input className="input-field" placeholder="Street / Area" value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })} />
          <input className="input-field" placeholder="City *" value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
        </div>
      </div>

      {/* Payment */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">💳 Payment Method</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {[{ value: 'cod', label: '💵 Cash on Delivery' }, { value: 'online', label: '📱 Online Payment' }].map((p) => (
            <label key={p.value} className={`flex items-center gap-2 cursor-pointer border-2 rounded-lg px-4 py-3 flex-1 transition-colors ${paymentMethod === p.value ? 'border-primary bg-green-50' : 'border-gray-200'}`}>
              <input type="radio" name="payment" value={p.value} checked={paymentMethod === p.value}
                onChange={() => setPaymentMethod(p.value)} className="accent-green-600" />
              <span className="text-sm font-medium">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={handlePlaceOrder} disabled={placing}
        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-60">
        {placing ? 'Placing Order...' : `Place Order · ₹${grandTotal}`}
      </button>
    </div>
  );
}
