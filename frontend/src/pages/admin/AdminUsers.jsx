import { useEffect, useState } from 'react';
import { Trash2, Shield, ShieldOff, Ban } from 'lucide-react';
import api from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await api.get('/users'); setUsers(data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try { await api.put(`/users/${user.id}/role`, { role: newRole }); load(); } catch {}
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try { await api.put(`/users/${user.id}/status`, { status: newStatus }); load(); } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); load(); } catch {}
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Users ({users.length})</h1>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">
            <th className="px-3 py-2 font-medium text-gray-500">Name</th>
            <th className="px-3 py-2 font-medium text-gray-500">Email</th>
            <th className="px-3 py-2 font-medium text-gray-500">Role</th>
            <th className="px-3 py-2 font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 font-medium text-gray-500 hidden md:table-cell">Orders</th>
            <th className="px-3 py-2 font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-50">
                <td className="px-3 py-2 text-gray-900 font-medium">{u.name}</td>
                <td className="px-3 py-2 text-gray-500">{u.email}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                <td className="px-3 py-2 hidden md:table-cell">{u._count?.orders || 0}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => toggleRole(u)} className="p-1.5 hover:bg-gray-100 rounded" title={u.role === 'ADMIN' ? 'Remove admin' : 'Make admin'}>
                      {u.role === 'ADMIN' ? <ShieldOff className="w-3.5 h-3.5 text-purple-500" /> : <Shield className="w-3.5 h-3.5 text-gray-500" />}
                    </button>
                    <button onClick={() => toggleStatus(u)} className="p-1.5 hover:bg-gray-100 rounded" title={u.status === 'ACTIVE' ? 'Block' : 'Unblock'}>
                      <Ban className={`w-3.5 h-3.5 ${u.status === 'BLOCKED' ? 'text-red-500' : 'text-gray-400'}`} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
