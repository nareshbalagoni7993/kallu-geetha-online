import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import { useLang } from '../../context/LanguageContext';

export default function SAManageUsers() {
  const { t }                 = useLang();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    API.get('/superadmin/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner size="lg" />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('manageUsers')} ({users.length})</h1>
        <input className="input-field w-full sm:w-64" placeholder={`${t('search')}...`} value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">{t('name')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('email')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('phone')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('location')}</th>
              <th className="text-left p-4 font-medium text-gray-600">{t('time')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users</td></tr>
            ) : filtered.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-gray-600">{u.email}</td>
                <td className="p-4 text-gray-600">{u.phone || '—'}</td>
                <td className="p-4 text-gray-600">{u.address?.city || '—'}</td>
                <td className="p-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
