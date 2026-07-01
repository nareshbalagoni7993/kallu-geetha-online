import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';

export default function MyOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/user/orders').then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  if (orders.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-7xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-600 mb-3">No orders yet</h2>
        <p className="text-gray-400 mb-6">Your order history will appear here</p>
        <Link to="/home" className="btn-primary px-8 py-3 text-base">Order Now</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <Link to={`/order/${o._id}`} key={o._id} className="card p-5 flex justify-between items-center hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
                {o.shop?.image ? <img src={o.shop.image} alt="" className="w-full h-full object-cover" /> : '🌴'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-primary">{o.shop?.name}</h3>
                <p className="text-sm text-gray-500">{o.items?.length} item(s) · ₹{o.grandTotal}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <OrderStatusBadge status={o.status} />
              <p className="text-gray-400 text-xs mt-2">{o.orderNumber}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
