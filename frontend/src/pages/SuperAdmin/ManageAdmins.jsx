import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import { useLang } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { DISTRICTS } from '../../data/telangana';

const emptyForm = {
  name: '', email: '', password: '', phone: '',
  shopName: '', shopCategory: 'toddy_shop', shopPhone: '',
  shopState: 'Telangana', shopDistrict: '', shopMandal: '', shopVillage: '', shopPincode: '',
};

export default function SAManageAdmins() {
  const { t }                       = useLang();
  const [admins, setAdmins]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);

  const fetchAdmins = () => {
    setLoading(true);
    Promise.all([
      API.get('/superadmin/admins'),
      API.get('/superadmin/categories'),
    ]).then(([a, c]) => {
      setAdmins(a.data);
      setCategories(c.data);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { fetchAdmins(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/superadmin/admin', form);
      toast.success('Admin & shop created successfully!');
      setForm(emptyForm);
      setShowForm(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const r = await API.patch(`/superadmin/admin/${id}/toggle`);
      toast.success(r.data.message);
      fetchAdmins();
    } catch { toast.error('Action failed'); }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('manageAdmins')} ({admins.length})</h1>
        <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); }} className="btn-primary">
          {showForm ? t('cancel') : t('createAdmin')}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-1">Create New Admin</h2>
          <p className="text-sm text-gray-500 mb-5">Admin account + their shop are created together.</p>

          <form onSubmit={handleCreate} className="space-y-6">

            {/* ─── Admin Account ─── */}
            <div>
              <h3 className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3">👤 Admin Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input className="input-field" placeholder="Admin's full name" value={form.name}
                    onChange={(e) => set('name', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" className="input-field" placeholder="admin@email.com" value={form.email}
                    onChange={(e) => set('email', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="input-field" placeholder="Phone number" value={form.phone}
                    onChange={(e) => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" className="input-field" placeholder="Min 6 characters" value={form.password}
                    onChange={(e) => set('password', e.target.value)} required />
                </div>
              </div>
            </div>

            {/* ─── Shop Details ─── */}
            <div>
              <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">🏪 Shop Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                  <input className="input-field" placeholder="e.g. Geetha Toddy Shop" value={form.shopName}
                    onChange={(e) => set('shopName', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Category</label>
                  <select className="input-field" value={form.shopCategory} onChange={(e) => set('shopCategory', e.target.value)}>
                    {categories.length === 0
                      ? <option value="">Loading...</option>
                      : categories.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Phone</label>
                  <input className="input-field" placeholder="Shop contact number" value={form.shopPhone}
                    onChange={(e) => set('shopPhone', e.target.value)} />
                </div>
              </div>
            </div>

            {/* ─── Address (Telangana Cascading) ─── */}
            <div>
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">📍 Shop Address — Telangana</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* State — fixed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <div className="input-field bg-gray-50 text-gray-500 cursor-not-allowed select-none flex items-center">
                    🗺️ Telangana
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <select className="input-field" value={form.shopDistrict}
                    onChange={(e) => set('shopDistrict', e.target.value)} required>
                    <option value="">— Select District —</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Mandal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mandal *</label>
                  <input className="input-field" placeholder="Enter mandal name"
                    value={form.shopMandal} onChange={(e) => set('shopMandal', e.target.value)} required />
                </div>

                {/* Village */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village / Town</label>
                  <input className="input-field" placeholder="Enter village or town name"
                    value={form.shopVillage} onChange={(e) => set('shopVillage', e.target.value)} />
                </div>

                {/* Pincode — auto-filled */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input className="input-field" placeholder="Auto-filled on village select"
                    value={form.shopPincode} onChange={(e) => set('shopPincode', e.target.value)} />
                  {form.shopPincode && <p className="text-xs text-green-600 mt-1">✓ Pincode auto-filled</p>}
                </div>

              </div>

              {/* Address preview */}
              {form.shopDistrict && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                  📍 <strong>Full Address:</strong>{' '}
                  {[form.shopVillage, form.shopMandal, form.shopDistrict, 'Telangana', form.shopPincode]
                    .filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} className="btn-primary px-8 py-2.5 disabled:opacity-60">
              {saving ? 'Creating...' : '✓ Create Admin & Shop'}
            </button>
          </form>
        </div>
      )}

      {/* Admins Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">{t('name')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('email')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('phone')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('shop')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('location')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('status')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {admins.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">{t('noAdmins')}</td></tr>
            ) : admins.map((a) => (
              <tr key={a._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{a.name}</td>
                <td className="p-4 text-gray-600 text-xs">{a.email}</td>
                <td className="p-4 text-gray-600">{a.phone || '—'}</td>
                <td className="p-4">
                  {a.shop
                    ? <div><div className="font-medium text-sm">{a.shop.name}</div></div>
                    : <span className="text-gray-400 text-xs">No shop</span>}
                </td>
                <td className="p-4 text-xs text-gray-500">
                  {(() => {
                    const addr = a.shop?.address;
                    if (!addr) return '—';
                    const parts = [addr.mandal, addr.district || addr.city || addr.village].filter(Boolean);
                    return parts.length ? parts.join(', ') : '—';
                  })()}
                </td>
                <td className="p-4">
                  <span className={a.isActive ? 'badge-green' : 'badge-red'}>
                    {a.isActive ? t('active') : t('inactive')}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => handleToggle(a._id)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${a.isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                    {a.isActive ? t('deactivate') : t('activate')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
