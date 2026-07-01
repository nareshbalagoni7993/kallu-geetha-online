import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';

export default function SAManageUsers() {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users ({users.length})</h1>
        <input className="input-field w-64" placeholder="Search name or email..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Name</th>
              <th className="text-left p-4 font-medium text-gray-600">Email</th>
              <th className="text-left p-4 font-medium text-gray-600">Phone</th>
              <th className="text-left p-4 font-medium text-gray-600">City</th>
              <th className="text-left p-4 font-medium text-gray-600">Joined</th>
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
  );
}
