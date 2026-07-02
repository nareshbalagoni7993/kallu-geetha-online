import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import ConfirmModal from '../../components/ConfirmModal';
import { useLang } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const ICON_OPTIONS = ['🏪', '🍺', '🌴', '🍎', '🧊', '🥃', '🫙', '🍶', '🛒', '🌾', '🥤', '🍵'];

export default function ManageCategories() {
  const { t }                       = useLang();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [label, setLabel]           = useState('');
  const [icon, setIcon]             = useState('🏪');
  const [adding, setAdding]         = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    API.get('/superadmin/categories').then((r) => setCategories(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!label.trim()) { toast.error('Label is required'); return; }
    setAdding(true);
    try {
      await API.post('/superadmin/categories', { label: label.trim(), icon });
      toast.success('Category added!');
      setLabel('');
      setIcon('🏪');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally { setAdding(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await API.delete(`/superadmin/category/${confirmDelete.id}`);
      toast.success('Category removed');
      setConfirmDelete(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally { setDeletingId(null); }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{t('manageCategories')}</h1>
      <p className="text-gray-500 text-sm mb-6">Add or remove categories used for shops across the platform.</p>

      {/* Add Form */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Add New Category</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              className="input-field"
              placeholder="e.g. Coconut Shop"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
            {label.trim() && (
              <p className="text-xs text-gray-400 mt-1">
                Stored as: <code className="bg-gray-100 px-1 rounded">
                  {label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}
                </code>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-colors ${
                    icon === em ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={adding} className="btn-primary px-6 disabled:opacity-60">
            {adding ? 'Adding...' : `+ Add Category`}
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Current Categories ({categories.length})</h2>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No categories yet. Add one above.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-2xl w-8 text-center">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{cat.label}</p>
                  <p className="text-xs text-gray-400 font-mono">{cat.value}</p>
                </div>
                <button
                  onClick={() => setConfirmDelete({ id: cat._id, label: cat.label })}
                  disabled={deletingId === cat._id}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                >
                  {deletingId === cat._id ? '...' : t('delete')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        💡 Removing a category does not affect existing shops — they keep their current category label.
      </div>

      {confirmDelete && (
        <ConfirmModal
          title={t('deleteProduct')}
          message={`${t('delete')} "${confirmDelete.label}"?`}
          confirmLabel={t('delete')}
          confirmColor="red"
          loading={!!deletingId}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
