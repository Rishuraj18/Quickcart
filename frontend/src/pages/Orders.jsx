import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import api, { IMG_BASE } from '../api/axios';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h2>
        <p className="text-sm text-gray-500 mb-4">Start shopping to see your orders here.</p>
        <Link to="/shop" className="inline-block px-5 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">My Orders</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{order.status}</span>
            </div>
            <div className="space-y-2">
              {order.items.map(item => {
                const imgUrl = item.product.images?.[0]?.url ? `${IMG_BASE}${item.product.images[0].url}` : null;
                return (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    {imgUrl && <img src={imgUrl} alt="" className="w-10 h-10 object-cover rounded" />}
                    <span className="flex-1 text-gray-700 truncate">{item.product.title}</span>
                    <span className="text-gray-500">×{item.quantity}</span>
                    <span className="font-medium">₹{Math.round(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
              <span className="text-xs text-gray-500">Payment: {order.paymentStatus}</span>
              <span className="text-sm font-semibold text-gray-900">Total: ₹{Math.round(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
