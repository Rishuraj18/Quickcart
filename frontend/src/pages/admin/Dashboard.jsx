import { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  const cards = [
    { label: 'Total Sales', value: `₹${Math.round(stats?.totalSales || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-amber-50 text-amber-600' },
  ];

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-gray-900 mb-2">Recent Orders</h2>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">
            <th className="px-3 py-2 font-medium text-gray-500">ID</th>
            <th className="px-3 py-2 font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2 font-medium text-gray-500">Amount</th>
            <th className="px-3 py-2 font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 font-medium text-gray-500">Date</th>
          </tr></thead>
          <tbody>
            {stats?.recentOrders?.map(order => (
              <tr key={order.id} className="border-t border-gray-50">
                <td className="px-3 py-2 text-gray-900">#{order.id}</td>
                <td className="px-3 py-2 text-gray-600">{order.user?.name}</td>
                <td className="px-3 py-2 text-gray-900 font-medium">₹{Math.round(order.totalAmount).toLocaleString()}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{order.status}</span></td>
                <td className="px-3 py-2 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
          <p className="text-center py-6 text-gray-400 text-sm">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
