/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { IMG_BASE } from '../api/axios';

export default function Cart() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => {
    const price = item.product.price * (1 - item.product.discount / 100);
    return sum + price * item.quantity;
  }, 0);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">Loading cart...</div>;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-4">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="inline-block px-5 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Shopping Cart ({items.length})</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => {
            const price = item.product.price * (1 - item.product.discount / 100);
            // const imgUrl = item.product.images?.[0]?.url
            //   ? `${IMG_BASE}${item.product.images[0].url}`
            //   : 'https://placehold.co/100x100/f3f4f6/9ca3af?text=No+Image';
            const rawImage =
  item.product.images?.[0]?.url ||
  item.product.ProductImage?.[0]?.url ||
  item.product.image ||
  '';

const imgUrl = rawImage?.startsWith('http')
  ? rawImage
  : rawImage
    ? `${IMG_BASE}${rawImage.startsWith('/') ? rawImage : '/' + rawImage}`
    : 'https://placehold.co/100x100/f3f4f6/9ca3af?text=No+Image';
            return (
              <div key={item.id} className="flex gap-3 bg-white border border-gray-100 rounded-xl p-3">
                <img src={imgUrl} alt={item.product.title} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1">{item.product.title}</Link>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">₹{Math.round(price).toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateItem(item.id, item.quantity - 1)} className="p-1.5"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} className="p-1.5"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 h-fit sticky top-16">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{Math.round(total).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="text-green-600">Free</span></div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
              <span>Total</span><span>₹{Math.round(total).toLocaleString()}</span>
            </div>
          </div>
          <Link to="/checkout" className="block text-center mt-4 h-10 leading-10 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
