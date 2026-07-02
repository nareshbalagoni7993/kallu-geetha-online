import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700', out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600',
};

function ShopDrawer({ shopId, onClose, catMap, onShopUpdated, onShopDeleted }) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editName, setEditName] = useState('');
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get(`/superadmin/shop/${shopId}/details`)
      .then((r) => { setData(r.data); setEditName(r.data.shop?.name || ''); })
      .finally(() => setLoading(false));
  }, [shopId]);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await API.patch(`/superadmin/shop/${shopId}/name`, { name: editName.trim() });
      toast.success('Shop name updated');
      setEditing(false);
      onShopUpdated();
      setData((d) => d ? { ...d, shop: { ...d.shop, name: editName.trim() } } : d);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/superadmin/shop/${shopId}`);
      toast.success('Shop deleted');
      setConfirmDelete(false);
      onShopDeleted();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDeleting(false); }
  };

  const codData    = data?.paymentBreakdown?.find((p) => p._id === 'cod');
  const onlineData = data?.paymentBreakdown?.find((p) => p._id === 'online');

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full sm:max-w-xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-emerald-700 p-5 text-white flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {data?.shop?.image
                  ? <img src={data.shop.image} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl">🌴</span>}
              </div>
              <div className="min-w-0">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="bg-white/20 text-white placeholder-white/60 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50 w-40"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditing(false); }}
                    />
                    <button onClick={handleSaveName} disabled={saving}
                      className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg font-semibold transition-colors">
                      {saving ? '...' : '✓ Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="text-white/60 hover:text-white text-sm">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base leading-tight truncate">{data?.shop?.name || 'Loading...'}</h2>
                    {!loading && (
                      <button onClick={() => setEditing(true)}
                        className="text-white/60 hover:text-white text-xs bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                )}
                <p className="text-white/70 text-xs mt-0.5">
                  {data?.shop?.address?.mandal && `${data.shop.address.mandal}, `}
                  {data?.shop?.address?.district || data?.shop?.address?.city}
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold flex-shrink-0 ml-2">
              ✕
            </button>
          </div>

          {/* Status badges */}
          {data && (
            <div className="flex gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${data.shop?.isActive ? 'bg-green-500/30 text-green-100' : 'bg-red-500/30 text-red-100'}`}>
                {data.shop?.isActive ? '✅ Active' : '❌ Inactive'}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${data.shop?.isOpen ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}>
                {data.shop?.isOpen ? '🟢 Open' : '🔴 Closed'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? <Spinner size="lg" text="Loading shop details..." /> : (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Orders',   val: data.totalOrders,                            bg: 'bg-blue-50',    text: 'text-blue-700' },
                  { label: 'Revenue',  val: `₹${(data.totalRevenue||0).toLocaleString()}`,bg: 'bg-green-50',   text: 'text-green-700' },
                  { label: 'Pending',  val: data.pendingOrders,                           bg: 'bg-yellow-50',  text: 'text-yellow-700' },
                  { label: 'Done',     val: data.deliveredOrders,                         bg: 'bg-emerald-50', text: 'text-emerald-700' },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center`}>
                    <p className={`text-lg font-black ${s.text}`}>{s.val}</p>
                    <p className={`text-[10px] ${s.text} opacity-70`}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Owner */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">👤 Owner Details</h3>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-lg flex-shrink-0">
                    {data.shop.owner?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{data.shop.owner?.name}</p>
                    <p className="text-xs text-gray-500">{data.shop.owner?.email}</p>
                    {data.shop.owner?.phone && (
                      <a href={`tel:${data.shop.owner.phone}`} className="text-xs text-green-700 hover:underline">
                        📞 {data.shop.owner.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">📍 Shop Address</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'State',    val: data.shop.address?.state || 'Telangana' },
                    { label: 'District', val: data.shop.address?.district || '—' },
                    { label: 'Mandal',   val: data.shop.address?.mandal  || '—' },
                    { label: 'Village',  val: data.shop.address?.village  || data.shop.address?.city || '—' },
                    { label: 'Pincode',  val: data.shop.address?.pincode  || '—' },
                    { label: 'Phone',    val: data.shop.phone || '—' },
                  ].map((r) => (
                    <div key={r.label} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{r.label}</p>
                      <p className="font-medium text-gray-700 text-sm">{r.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">💳 Payment Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2.5 bg-amber-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">💵 Cash on Delivery</span>
                    <div className="text-right">
                      <p className="font-bold text-amber-700">₹{(codData?.total||0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{codData?.count||0} orders</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">💳 Online Payment</span>
                    <div className="text-right">
                      <p className="font-bold text-blue-700">₹{(onlineData?.total||0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{onlineData?.count||0} orders</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="card p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">📦 Stock Summary</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-gray-800">{data.products?.length||0}</p>
                    <p className="text-[10px] text-gray-400">Products</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-amber-700">{data.totalStockQty}</p>
                    <p className="text-[10px] text-amber-500">Units</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-red-600">{data.outOfStock}</p>
                    <p className="text-[10px] text-red-400">Out of Stock</p>
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
                          <tr key={p._id} className={p.stockQty === 0 ? 'opacity-40' : ''}>
                            <td className="py-1.5 font-medium truncate max-w-24">{p.name}</td>
                            <td className="py-1.5 text-right">₹{p.price}</td>
                            <td className={`py-1.5 text-right font-bold ${p.stockQty <= 5 && p.stockQty > 0 ? 'text-orange-500' : p.stockQty === 0 ? 'text-red-500' : ''}`}>
                              {p.stockQty||0}
                            </td>
                            <td className="py-1.5 text-right text-gray-600">₹{((p.stockQty||0)*p.price).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between mt-2 pt-2 border-t text-xs font-bold">
                      <span className="text-gray-600">Total Stock Value</span>
                      <span className="text-green-700">₹{(data.totalStockValue||0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              {data.recentOrders?.length > 0 && (
                <div className="card p-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">🕒 Recent Orders</h3>
                  <div className="space-y-2">
                    {data.recentOrders.map((o) => (
                      <div key={o._id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{o.user?.name}</p>
                          <p className="text-xs text-gray-400">{o.items?.length} item(s)</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">₹{o.grandTotal}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]||'bg-gray-100'}`}>
                            {o.status?.replace(/_/g,' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Danger Zone */}
              <div className="card p-4 border border-red-100">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wide mb-3">⚠️ Danger Zone</h3>
                <button onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
                  🗑️ Delete This Shop
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2">This will permanently remove the shop. Orders are NOT deleted.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete Shop?"
          message={`Permanently delete "${data?.shop?.name}"? All shop data will be removed. This cannot be undone.`}
          confirmLabel="Yes, Delete Shop"
          confirmColor="red"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.28s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </>
  );
}

export default function SAManageShops() {
  const [shops, setShops]         = useState([]);
  const [catMap, setCatMap]       = useState({});
  const [loading, setLoading]     = useState(true);
  const [drawerShopId, setDrawerShopId] = useState(null);
  const [search, setSearch]       = useState('');

  const fetchShops = () => {
    setLoading(true);
    Promise.all([
      API.get('/superadmin/shops'),
      API.get('/superadmin/categories'),
    ]).then(([s, c]) => {
      setShops(s.data);
      const map = {};
      c.data.forEach((cat) => { map[cat.value] = `${cat.icon} ${cat.label}`; });
      setCatMap(map);
    }).finally(() => setLoading(false));
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

  const filtered = shops.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q)
      || s.owner?.name?.toLowerCase().includes(q)
      || s.address?.district?.toLowerCase().includes(q)
      || s.address?.mandal?.toLowerCase().includes(q)
      || s.address?.city?.toLowerCase().includes(q);
  });

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Shops</h1>
          <p className="text-sm text-gray-400 mt-0.5">Click any shop to view details, edit name, or delete</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
            {shops.length} shops
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by shop name, owner, location..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">
            ✕
          </button>
        )}
      </div>

      {search && (
        <p className="text-sm text-gray-500 mb-3">
          Showing {filtered.length} of {shops.length} shops
          {filtered.length === 0 && <span className="text-red-500"> — no results</span>}
        </p>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }} className="border-b">
                <th className="text-left p-4 font-semibold text-gray-600">Shop</th>
                <th className="text-left p-4 font-semibold text-gray-600">Owner</th>
                <th className="text-left p-4 font-semibold text-gray-600">Category</th>
                <th className="text-left p-4 font-semibold text-gray-600">Location</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  {search ? `No shops matching "${search}"` : 'No shops yet'}
                </td></tr>
              ) : filtered.map((s) => {
                const loc = [s.address?.mandal, s.address?.district || s.address?.city].filter(Boolean).join(', ') || '—';
                return (
                  <tr key={s._id} className="hover:bg-green-50 cursor-pointer transition-colors"
                    onClick={() => setDrawerShopId(s._id)}>
                    <td className="p-4">
                      <div className="font-semibold text-green-700 hover:underline">{s.name}</div>
                      {s.phone && <div className="text-xs text-gray-400 mt-0.5">📞 {s.phone}</div>}
                    </td>
                    <td className="p-4 text-gray-600">{s.owner?.name || '—'}</td>
                    <td className="p-4 text-gray-500 text-xs">{catMap[s.category] || s.category}</td>
                    <td className="p-4 text-gray-500 text-xs">
                      {loc}
                      {s.address?.pincode && <span className="text-gray-400"> · {s.address.pincode}</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {s.isActive ? '● Active' : '● Inactive'}
                        </span>
                        <span className={`text-[10px] font-medium ${s.isOpen ? 'text-green-500' : 'text-gray-400'}`}>
                          {s.isOpen ? '🟢 Open' : '🔴 Closed'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => handleToggle(s._id, e)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${s.isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {drawerShopId && (
        <ShopDrawer
          shopId={drawerShopId}
          onClose={() => setDrawerShopId(null)}
          catMap={catMap}
          onShopUpdated={fetchShops}
          onShopDeleted={() => { setDrawerShopId(null); fetchShops(); }}
        />
      )}
    </div>
  );
}
