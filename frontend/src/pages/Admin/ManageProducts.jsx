import { useEffect, useRef, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['Palm Toddy', 'Sweet Toddy', 'Palm Water', 'Palm Ice', 'Apples', 'Palm Jaggery', 'Palm Sugar', 'Other'];
const emptyForm  = { name: '', description: '', price: '', originalPrice: '', category: 'Palm Toddy', quantity: '', isVeg: true, stockQty: '' };

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef();

  const fetchProducts = () => {
    setLoading(true);
    API.get('/admin/products').then((r) => setProducts(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setImageFile(null); setImagePreview(''); };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice, category: p.category, quantity: p.quantity, isVeg: p.isVeg, stockQty: p.stockQty || '' });
    setEditId(p._id);
    setImagePreview(p.image || '');
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editId) {
        await API.put(`/admin/product/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await API.post('/admin/product', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added!');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await API.delete(`/admin/product/${id}`); toast.success('Deleted'); fetchProducts(); }
    catch { toast.error('Failed'); }
  };

  const handleToggleStock = async (id) => {
    try { const r = await API.patch(`/admin/product/${id}/toggle-stock`); toast.success(r.data.message); fetchProducts(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <Spinner size="lg" />;

  const inStockCount  = products.filter((p) => p.inStock).length;
  const outStockCount = products.filter((p) => !p.inStock).length;
  const totalValue    = products.reduce((s, p) => s + (p.stockQty || 0) * p.price, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{inStockCount}</p>
          <p className="text-xs text-green-600 font-medium">In Stock</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{outStockCount}</p>
          <p className="text-xs text-red-500 font-medium">Out of Stock</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">₹{totalValue.toLocaleString()}</p>
          <p className="text-xs text-amber-600 font-medium">Stock Value</p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileRef.current.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center text-gray-400 text-xs p-2">
                      <div className="text-2xl mb-1">📷</div>
                      Click to upload
                    </div>
                  )}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current.click()}
                    className="btn-outline text-sm px-4 py-2">
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </button>
                  {imagePreview && (
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }}
                      className="ml-2 text-sm text-red-500 hover:text-red-700">Remove</button>
                  )}
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — Max 5MB</p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input className="input-field" placeholder="e.g. Fresh Palm Toddy" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 50" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) <span className="text-gray-400 text-xs">for discount</span></label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 70" value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit / Size</label>
              <input className="input-field" placeholder="e.g. 1 Litre, 500ml, 1 kg" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity <span className="text-gray-400 text-xs">(available units)</span></label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 50" value={form.stockQty}
                onChange={(e) => setForm({ ...form, stockQty: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input-field h-20 resize-none" placeholder="Product description..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isVeg" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} className="w-4 h-4 accent-green-600" />
              <label htmlFor="isVeg" className="text-sm font-medium text-gray-700">🟢 Veg / Natural Product</label>
            </div>
            <div className="flex gap-3 items-center md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary px-8 disabled:opacity-60">
                {saving ? 'Saving...' : editId ? '✓ Update Product' : '+ Add Product'}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Image</th>
              <th className="text-left p-4 font-medium text-gray-600">Product</th>
              <th className="text-left p-4 font-medium text-gray-600">Category</th>
              <th className="text-left p-4 font-medium text-gray-600">Price</th>
              <th className="text-left p-4 font-medium text-gray-600">Stock Qty</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">🍺</div>No products yet. Add your first product!
              </td></tr>
            ) : products.map((p) => (
              <tr key={p._id} className={`hover:bg-gray-50 ${!p.inStock ? 'opacity-60' : ''}`}>
                <td className="p-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-xl">🍺</span>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.quantity}</div>
                </td>
                <td className="p-4 text-gray-600">{p.category}</td>
                <td className="p-4">
                  <span className="font-bold text-gray-800">₹{p.price}</span>
                  {p.originalPrice > 0 && <span className="text-xs text-gray-400 line-through ml-1">₹{p.originalPrice}</span>}
                </td>
                <td className="p-4">
                  <span className={`font-semibold ${p.stockQty <= 5 && p.stockQty > 0 ? 'text-orange-500' : p.stockQty === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                    {p.stockQty || 0}
                  </span>
                  {p.stockQty > 0 && p.stockQty <= 5 && <span className="ml-1 text-xs text-orange-500">⚠ Low</span>}
                </td>
                <td className="p-4">
                  <button onClick={() => handleToggleStock(p._id)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${p.inStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                    {p.inStock ? '✓ In Stock' : '✗ Out'}
                  </button>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium hover:bg-blue-200">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full font-medium hover:bg-red-200">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
