import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { useLang } from '../../context/LanguageContext';

export default function SAManageOrders() {
  const { t }                 = useLang();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    API.get('/superadmin/orders').then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('manageOrders')} ({orders.length})</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all','pending','confirmed','preparing','out_for_delivery','delivered','cancelled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">{t('orders')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('customer')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('shop')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('items')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('amount')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('status')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('time')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No orders</td></tr>
            ) : filtered.map((o) => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs text-gray-500">{o.orderNumber}</td>
                <td className="p-4"><div className="font-medium">{o.user?.name}</div><div className="text-gray-400 text-xs">{o.user?.phone}</div></td>
                <td className="p-4">{o.shop?.name}</td>
                <td className="p-4">{o.items?.length} item(s)</td>
                <td className="p-4 font-semibold">₹{o.grandTotal}</td>
                <td className="p-4"><OrderStatusBadge status={o.status} /></td>
                <td className="p-4 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
