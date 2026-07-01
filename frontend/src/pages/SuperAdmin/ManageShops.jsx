import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

const CATEGORY_LABELS = {
  toddy_shop: '🍺 Toddy Shop', palm_products: '🌴 Palm Products',
  fruit_shop: '🍎 Fruit Shop', ice_shop: '🧊 Ice Shop', other: '🏪 Other',
};
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700', out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600',
};

function ShopDrawer({ shopId, onClose }) {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/superadmin/shop/${shopId}/details`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [shopId]);

  const codData    = data?.paymentBreakdown?.find((p) => p._id === 'cod');
  const onlineData = data?.paymentBreakdown?.find((p) => p._id === 'online');

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer — full-width on mobile, max-xl on desktop */}
      <div className="fixed right-0 top-0 h-full w-full sm:max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-amber-700 p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
              {data?.shop?.image
                ? <img src={data.shop.image} alt="" className="w-full h-full object-cover" />
                : <span className="text-2xl">🌴</span>}
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{data?.shop?.name || 'Loading...'}</h2>
              <p className="text-white/70 text-xs">
                {data?.shop?.address?.mandal && `${data.shop.address.mandal}, `}
                {data?.shop?.address?.district || data?.shop?.address?.city}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <Spinner size="lg" text="Loading shop details..." />
          ) : (
            <>
              {/* Owner Info */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">👤 Owner Details</h3>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-lg">
                    {data.shop.owner?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{data.shop.owner?.name}</p>
                    <p className="text-xs text-gray-500">{data.shop.owner?.email}</p>
                    <p className="text-xs text-gray-500">📞 {data.shop.owner?.phone || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Shop Address */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">📍 Shop Address</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: 'State',    val: data.shop.address?.state || 'Telangana' },
                    { label: 'District', val: data.shop.address?.district || '—' },
                    { label: 'Mandal',   val: data.shop.address?.mandal  || '—' },
                    { label: 'Village',  val: data.shop.address?.village  || '—' },
                    { label: 'Pincode',  val: data.shop.address?.pincode  || '—' },
                    { label: 'City',     val: data.shop.address?.city     || '—' },
                  ].map((r) => (
                    <div key={r.label} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">{r.label}</p>
                      <p className="font-medium text-gray-700 text-sm">{r.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order + Revenue Stats */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">📦 Orders & Revenue</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{data.totalOrders}</p>
                    <p className="text-xs text-blue-500">Total Orders</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">₹{(data.totalRevenue||0).toLocaleString()}</p>
                    <p className="text-xs text-green-500">Revenue</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-700">{data.pendingOrders}</p>
                    <p className="text-xs text-yellow-600">Pending</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{data.deliveredOrders}</p>
                    <p className="text-xs text-emerald-500">Delivered</p>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">💳 Payment Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2.5 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">💵 Cash on Delivery</span>
                    <div className="text-right">
                      <p className="font-bold text-green-700">₹{(codData?.total||0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{codData?.count||0} orders</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">📱 Online Payment</span>
                    <div className="text-right">
                      <p className="font-bold text-blue-700">₹{(onlineData?.total||0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{onlineData?.count||0} orders</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Summary */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">📦 Stock Summary</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-gray-800">{data.products?.length || 0}</p>
                    <p className="text-xs text-gray-400">Products</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-amber-700">{data.totalStockQty}</p>
                    <p className="text-xs text-amber-500">Total Units</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-red-600">{data.outOfStock}</p>
                    <p className="text-xs text-red-400">Out of Stock</p>
                  </div>
                </div>
                {data.products?.length > 0 && (
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="text-gray-400 border-b">
                        <th className="text-left pb-1.5">Product</th>
                        <th className="text-right pb-1.5">Price</th>
                        <th className="text-right pb-1.5">Qty</th>
                        <th className="text-right pb-1.5">Value</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.products.map((p) => (
                          <tr key={p._id} className={p.stockQty === 0 ? 'opacity-50' : ''}>
                            <td className="py-1.5 font-medium max-w-24 truncate">{p.name}</td>
                            <td className="py-1.5 text-right">₹{p.price}</td>
                            <td className={`py-1.5 text-right font-bold ${p.stockQty <= 5 && p.stockQty > 0 ? 'text-orange-500' : p.stockQty === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                              {p.stockQty || 0}
                            </td>
                            <td className="py-1.5 text-right text-gray-600">₹{((p.stockQty||0)*p.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex justify-between mt-2 pt-2 border-t text-sm font-bold">
                  <span>Stock Value</span>
                  <span className="text-green-700">₹{(data.totalStockValue||0).toLocaleString()}</span>
                </div>
              </div>

              {/* Recent Orders */}
              {data.recentOrders?.length > 0 && (
                <div className="card p-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🕒 Recent Orders</h3>
                  <div className="space-y-2">
                    {data.recentOrders.map((o) => (
                      <div key={o._id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{o.user?.name}</p>
                          <p className="text-xs text-gray-400">📞 {o.user?.phone || '—'} · {o.items?.length} item(s)</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">₹{o.grandTotal}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                            {o.status?.replace(/_/g,' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shop Meta */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">ℹ️ Shop Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: 'Category',     val: CATEGORY_LABELS[data.shop.category] || data.shop.category },
                    { label: 'Rating',       val: `⭐ ${data.shop.rating?.toFixed(1)}` },
                    { label: 'Delivery Time',val: `${data.shop.deliveryTime} min` },
                    { label: 'Delivery Fee', val: data.shop.deliveryCharge === 0 ? '🚚 Free' : `₹${data.shop.deliveryCharge}` },
                    { label: 'Min Order',    val: data.shop.minOrder > 0 ? `₹${data.shop.minOrder}` : 'No min' },
                    { label: 'Status',       val: data.shop.isActive ? '✅ Active' : '❌ Inactive' },
                    { label: 'Shop Open',    val: data.shop.isOpen   ? '🟢 Open'  : '🔴 Closed' },
                    { label: 'Phone',        val: data.shop.phone || '—' },
                  ].map((r) => (
                    <div key={r.label} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">{r.label}</p>
                      <p className="font-medium text-gray-700 text-sm">{r.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.28s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </>
  );
}

export default function SAManageShops() {
  const [shops, setShops]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [drawerShopId, setDrawerShopId] = useState(null);

  const fetchShops = () => {
    setLoading(true);
    API.get('/superadmin/shops').then((r) => setShops(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchShops(); }, []);

  const handleToggle = async (id, e) => {
    e.stopPropagation();
    try {
      const r = await API.patch(`/superadmin/shop/${id}/toggle`);
      toast.success(r.data.message);
      fetchShops();
    } catch { toast.error('Action failed'); }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Shops ({shops.length})</h1>
      <p className="text-sm text-gray-400 mb-5">Click any shop name to view full details, orders, stock & revenue</p>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Shop</th>
              <th className="text-left p-4 font-medium text-gray-600">Owner</th>
              <th className="text-left p-4 font-medium text-gray-600">Category</th>
              <th className="text-left p-4 font-medium text-gray-600">Location</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shops.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No shops yet</td></tr>
            ) : shops.map((s) => (
              <tr key={s._id} className="hover:bg-green-50 cursor-pointer transition-colors"
                onClick={() => setDrawerShopId(s._id)}>
                <td className="p-4">
                  <div className="font-semibold text-primary hover:underline">{s.name}</div>
                  {s.phone && <div className="text-xs text-gray-400">📞 {s.phone}</div>}
                </td>
                <td className="p-4 text-gray-600">{s.owner?.name}</td>
                <td className="p-4">{CATEGORY_LABELS[s.category] || s.category}</td>
                <td className="p-4 text-gray-500 text-xs">
                  {s.address?.mandal && <span>{s.address.mandal}, </span>}
                  {s.address?.district || s.address?.city || '—'}
                  {s.address?.pincode && <span className="ml-1 text-gray-400">- {s.address.pincode}</span>}
                </td>
                <td className="p-4">
                  <div className="flex gap-1.5 flex-col">
                    <span className={s.isActive ? 'badge-green' : 'badge-red'}>{s.isActive ? 'Active' : 'Inactive'}</span>
                    <span className={`text-xs font-medium ${s.isOpen ? 'text-green-600' : 'text-gray-400'}`}>
                      {s.isOpen ? '🟢 Open' : '🔴 Closed'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <button onClick={(e) => handleToggle(s._id, e)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${s.isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                    {s.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {drawerShopId && (
        <ShopDrawer shopId={drawerShopId} onClose={() => setDrawerShopId(null)} />
      )}
    </div>
  );
}
