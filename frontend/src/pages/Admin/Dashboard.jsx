import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import StatCard from '../../components/StatCard';
import OrderStatusBadge from '../../components/OrderStatusBadge';

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;

  if (!data?.hasShop) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Complete Your Shop Setup</h2>
        <p className="text-gray-500 mb-6">Add your shop address, delivery details and go live</p>
        <Link to="/admin/shop" className="btn-primary text-base px-6 py-3">Setup Shop →</Link>
      </div>
    );
  }

  const codData    = data.paymentBreakdown?.find((p) => p._id === 'cod');
  const onlineData = data.paymentBreakdown?.find((p) => p._id === 'online');

  return (
    <div className="space-y-6">
      {/* Shop Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{data.shop?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">📍 {data.shop?.address?.city}</p>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${data.shop?.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {data.shop?.isOpen ? '🟢 Open' : '🔴 Closed'}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Products"       value={data.totalProducts}      icon="🍺" color="brown" />
        <StatCard title="Total Orders"   value={data.totalOrders}        icon="📦" color="blue" />
        <StatCard title="Pending"        value={data.pendingOrders}      icon="⏳" color="yellow" />
        <StatCard title="Revenue"        value={`₹${(data.totalRevenue||0).toLocaleString()}`} icon="💰" color="green" />
      </div>

      {/* Stock + Payment row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Stock Summary */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">📦 Stock Summary</h2>
            <Link to="/admin/products" className="text-primary text-sm hover:underline">Manage →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-700">{data.totalStockQty || 0}</p>
              <p className="text-xs text-green-600">Total Units</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-amber-700">₹{(data.totalStockValue||0).toLocaleString()}</p>
              <p className="text-xs text-amber-600">Stock Value</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-600">{data.outOfStockCount || 0}</p>
              <p className="text-xs text-red-500">Out of Stock</p>
            </div>
          </div>

          {/* Stock Table */}
          {data.allProducts?.length > 0 && (
            <div className="overflow-auto max-h-52">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="text-left pb-2">Product</th>
                    <th className="text-right pb-2">Price</th>
                    <th className="text-right pb-2">Qty</th>
                    <th className="text-right pb-2">Value</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.allProducts.map((p) => (
                    <tr key={p._id} className={p.stockQty === 0 ? 'opacity-50' : ''}>
                      <td className="py-2 font-medium text-gray-800 max-w-28 truncate">{p.name}</td>
                      <td className="py-2 text-right text-gray-600">₹{p.price}</td>
                      <td className={`py-2 text-right font-bold ${p.stockQty <= 5 && p.stockQty > 0 ? 'text-orange-500' : p.stockQty === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                        {p.stockQty || 0}
                        {p.stockQty > 0 && p.stockQty <= 5 && ' ⚠'}
                      </td>
                      <td className="py-2 text-right text-gray-600">₹{((p.stockQty||0)*p.price).toLocaleString()}</td>
                      <td className="py-2 text-right">
                        <span className={p.inStock ? 'text-green-600' : 'text-red-500'}>{p.inStock ? '✓' : '✗'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.lowStockProducts?.length > 0 && (
            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs font-semibold text-orange-700 mb-1">⚠ Low Stock Alert</p>
              {data.lowStockProducts.map((p) => (
                <p key={p._id} className="text-xs text-orange-600">{p.name} — only {p.stockQty} left</p>
              ))}
            </div>
          )}
        </div>

        {/* Payment Breakdown */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 mb-4">💳 Payment Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold text-gray-800">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">{codData?.count || 0} orders</p>
                </div>
              </div>
              <p className="text-lg font-bold text-green-700">₹{(codData?.total||0).toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-semibold text-gray-800">Online Payment</p>
                  <p className="text-xs text-gray-500">{onlineData?.count || 0} orders</p>
                </div>
              </div>
              <p className="text-lg font-bold text-blue-700">₹{(onlineData?.total||0).toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 mt-2">
              <p className="font-bold text-gray-700">Total Revenue</p>
              <p className="text-xl font-bold text-primary">₹{(data.totalRevenue||0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-primary text-sm hover:underline">View all →</Link>
        </div>
        {data.recentOrders?.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {data.recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm text-gray-800">{o.user?.name}</div>
                  <div className="text-gray-400 text-xs">📞 {o.user?.phone} · {o.items?.length} item(s)</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">₹{o.grandTotal}</div>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
