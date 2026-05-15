import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get(`/orders/all${params}`);
      setOrders(data.orders);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try { await api.put(`/orders/${id}/status`, { status }); load(); } catch {}
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="h-9 px-3 border border-gray-200 rounded-lg text-sm">
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">
            <th className="px-3 py-2 font-medium text-gray-500">ID</th>
            <th className="px-3 py-2 font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2 font-medium text-gray-500 hidden md:table-cell">Items</th>
            <th className="px-3 py-2 font-medium text-gray-500">Amount</th>
            <th className="px-3 py-2 font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 font-medium text-gray-500">Action</th>
          </tr></thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t border-gray-50">
                <td className="px-3 py-2 text-gray-900">#{order.id}</td>
                <td className="px-3 py-2"><p className="text-gray-900">{order.user?.name}</p><p className="text-xs text-gray-500">{order.user?.email}</p></td>
                <td className="px-3 py-2 text-gray-500 hidden md:table-cell">{order.items?.length} items</td>
                <td className="px-3 py-2 font-medium text-gray-900">₹{Math.round(order.totalAmount).toLocaleString()}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{order.status}</span></td>
                <td className="px-3 py-2">
                  <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} className="h-7 px-2 border border-gray-200 rounded text-xs">
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">No orders found.</p>}
      </div>
    </div>
  );
}
