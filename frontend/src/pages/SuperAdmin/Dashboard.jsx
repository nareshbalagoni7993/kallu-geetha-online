import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import StatCard from '../../components/StatCard';
import OrderStatusBadge from '../../components/OrderStatusBadge';

export default function SADashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/superadmin/dashboard')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Super Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Admins"   value={data.totalAdmins}   icon="👨‍💼" color="green" />
        <StatCard title="Total Users"    value={data.totalUsers}    icon="👥"   color="blue" />
        <StatCard title="Total Shops"    value={data.totalShops}    icon="🏪"   color="yellow" />
        <StatCard title="Total Orders"   value={data.totalOrders}   icon="📦"   color="brown" />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        {data.recentOrders?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Shop</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentOrders?.map((o) => (
                  <tr key={o._id} className="py-2">
                    <td className="py-3 font-mono text-xs text-gray-500">{o.orderNumber}</td>
                    <td className="py-3">{o.user?.name}</td>
                    <td className="py-3">{o.shop?.name}</td>
                    <td className="py-3 font-semibold">₹{o.grandTotal}</td>
                    <td className="py-3"><OrderStatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
