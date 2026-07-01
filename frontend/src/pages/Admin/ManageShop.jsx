import { useEffect, useRef, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'toddy_shop',    label: '🍺 Toddy Shop' },
  { value: 'palm_products', label: '🌴 Palm Products' },
  { value: 'fruit_shop',    label: '🍎 Fruit Shop' },
  { value: 'ice_shop',      label: '🧊 Ice Shop' },
  { value: 'other',         label: '🏪 Other' },
];

const empty = {
  name: '', description: '', category: 'toddy_shop', phone: '',
  deliveryTime: 30, deliveryCharge: 0, minOrder: 0,
  'address.street': '', 'address.city': '', 'address.lat': '', 'address.lng': '',
};

export default function ManageShop() {
  const [shop, setShop]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);
  const [toggling, setToggling] = useState(false);
  const [bannerFile, setBannerFile]     = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const fileRef = useRef();

  const fetchShop = () => {
    setLoading(true);
    API.get('/admin/shop')
      .then((r) => {
        setShop(r.data);
        setBannerPreview(r.data.image || '');
        setForm({
          name: r.data.name || '', description: r.data.description || '',
          category: r.data.category || 'toddy_shop', phone: r.data.phone || '',
          deliveryTime: r.data.deliveryTime || 30,
          deliveryCharge: r.data.deliveryCharge || 0, minOrder: r.data.minOrder || 0,
          'address.street': r.data.address?.street || '',
          'address.city': r.data.address?.city || '',
          'address.lat': r.data.address?.lat || '',
          'address.lng': r.data.address?.lng || '',
        });
      })
      .catch(() => setShop(null))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchShop(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',           form.name);
      fd.append('description',    form.description);
      fd.append('category',       form.category);
      fd.append('phone',          form.phone);
      fd.append('deliveryTime',   form.deliveryTime);
      fd.append('deliveryCharge', form.deliveryCharge);
      fd.append('minOrder',       form.minOrder);
      // nested address — backend should handle flat or nested; send as JSON string fallback
      fd.append('address', JSON.stringify({
        street: form['address.street'],
        city:   form['address.city'],
        lat:    parseFloat(form['address.lat']) || 0,
        lng:    parseFloat(form['address.lng']) || 0,
      }));
      if (bannerFile) fd.append('image', bannerFile);

      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (shop) { await API.put('/admin/shop', fd, cfg); toast.success('Shop updated!'); }
      else       { await API.post('/admin/shop', fd, cfg); toast.success('Shop created!'); }
      setBannerFile(null);
      fetchShop();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shop');
    } finally {
      setSaving(false);
    }
  };

  const toggleOpen = async () => {
    setToggling(true);
    try {
      const r = await API.patch('/admin/shop/toggle-open');
      toast.success(r.data.message);
      fetchShop();
    } catch { toast.error('Failed'); }
    finally { setToggling(false); }
  };

  if (loading) return <Spinner size="lg" text="Loading shop..." />;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{shop ? 'Update My Shop' : 'Create My Shop'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {shop ? 'Edit shop details, upload banner & location' : 'Set up your shop to start receiving orders'}
          </p>
        </div>
        {shop && (
          <button onClick={toggleOpen} disabled={toggling}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${shop.isOpen ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'}`}>
            {toggling ? '...' : shop.isOpen ? '🔴 Close Shop' : '🟢 Open Shop'}
          </button>
        )}
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── SHOP BANNER UPLOAD ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">🖼️ Shop Banner / Cover Image</h3>
            <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-green-700 to-amber-700 border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors group"
              onClick={() => fileRef.current.click()}>
              {bannerPreview ? (
                <>
                  <img src={bannerPreview} alt="Shop banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl">
                      📷 Change Banner
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2">
                  <span className="text-5xl">🌴</span>
                  <p className="text-sm font-medium opacity-80">Click to upload shop banner</p>
                  <p className="text-xs opacity-60">This image appears on your shop page for customers</p>
                  <div className="mt-2 bg-white/20 hover:bg-white/30 text-white text-xs px-4 py-1.5 rounded-full border border-white/40">
                    📷 Upload Image
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
            {bannerFile && (
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                  ✓ {bannerFile.name.slice(0, 30)} — ready to upload
                </span>
                <button type="button" onClick={() => { setBannerFile(null); setBannerPreview(shop?.image || ''); }}
                  className="text-xs text-red-500 hover:underline">Remove</button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WebP up to 5MB — recommended 1200×400px</p>
          </div>

          <hr className="border-gray-100" />

          {/* ── BASIC INFO ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">📋 Shop Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                <input name="name" className="input-field" placeholder="e.g. Geetha Toddy Shop"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" className="input-field" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Phone</label>
                <input name="phone" className="input-field" placeholder="Contact number for customers"
                  value={form.phone} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={2} className="input-field resize-none"
                  placeholder="Describe your shop, specialty products, etc." value={form.description} onChange={handleChange} />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* ── LOCATION ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">📍 Location</h3>
            <p className="text-xs text-gray-400 mb-3">
              Latitude & Longitude are used to sort shops by distance for customers.
              Find your coordinates on <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Maps</a> (right-click your location → "What's here?")
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street / Area</label>
                <input name="address.street" className="input-field" placeholder="Street / Area / Landmark"
                  value={form['address.street']} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input name="address.city" className="input-field" placeholder="City"
                  value={form['address.city']} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input name="address.lat" type="number" step="any" className="input-field"
                    placeholder="e.g. 17.3850" value={form['address.lat']} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input name="address.lng" type="number" step="any" className="input-field"
                    placeholder="e.g. 78.4867" value={form['address.lng']} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* ── DELIVERY ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">🚚 Delivery Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (min)</label>
                <input name="deliveryTime" type="number" min="5" className="input-field"
                  value={form.deliveryTime} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (₹)</label>
                <input name="deliveryCharge" type="number" min="0" className="input-field"
                  value={form.deliveryCharge} onChange={handleChange} />
                <p className="text-xs text-gray-400 mt-1">Set 0 for free delivery</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (₹)</label>
                <input name="minOrder" type="number" min="0" className="input-field"
                  value={form.minOrder} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-4">
            <button type="submit" disabled={saving}
              className="btn-primary px-10 py-3 text-base disabled:opacity-60">
              {saving ? '⏳ Saving...' : shop ? '✓ Update Shop' : '✓ Create Shop'}
            </button>
            {bannerFile && (
              <span className="text-sm text-amber-600 font-medium">
                📷 New banner will be uploaded
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Preview */}
      {shop && (
        <div className="mt-6 card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">👁 How customers see your shop</h3>
          <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border">
            <div className="w-28 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-green-700 to-amber-700 flex items-center justify-center flex-shrink-0">
              {shop.image
                ? <img src={shop.image} alt="preview" className="w-full h-full object-cover" />
                : <span className="text-3xl">🌴</span>}
            </div>
            <div>
              <p className="font-bold text-gray-800">{shop.name}</p>
              <p className="text-sm text-gray-500">📍 {shop.address?.city}</p>
              <div className="flex gap-3 mt-1 text-sm text-gray-600">
                <span>⭐ {shop.rating?.toFixed(1)}</span>
                <span>🕒 {shop.deliveryTime} min</span>
                <span className={shop.deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                  {shop.deliveryCharge === 0 ? '🚚 Free delivery' : `🚚 ₹${shop.deliveryCharge}`}
                </span>
              </div>
              <span className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {shop.isOpen ? '● Open' : '● Closed'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
