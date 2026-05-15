/* eslint-disable no-empty */
import { IMG_BASE } from '../api/axios';
import { Star, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const discountedPrice = product.price * (1 - product.discount / 100);
  // const imageUrl = product.images?.[0]?.url
  //   ? `${IMG_BASE}${product.images[0].url}`
  //   : 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image';

  const rawImage =
  product.images?.[0]?.url ||
  product.ProductImage?.[0]?.url ||
  product.image ||
  '';

const imageUrl = rawImage?.startsWith('http')
  ? rawImage
  : rawImage
    ? `${IMG_BASE}${rawImage.startsWith('/') ? rawImage : '/' + rawImage}`
    : 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      await addItem(product.id);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product.slug}`} className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{product.discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              Featured
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-400 mb-0.5">{product.category?.name || product.brand}</p>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1.5">{product.title}</h3>
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-600">{product.rating}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-gray-900">₹{Math.round(discountedPrice).toLocaleString()}</span>
              {product.discount > 0 && (
                <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
              )}
            </div>
            {user && (
              <button
                onClick={handleAddToCart}
                className="p-1.5 rounded-lg bg-gray-900 text-white hover:bg-blue-600 transition-colors"
                title="Add to cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
