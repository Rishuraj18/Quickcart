/* eslint-disable no-empty */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Minus, Plus, ChevronRight } from 'lucide-react';
import api, { IMG_BASE } from '../api/axios';
import ProductCard from '../components/ProductCard';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import Skeleton from '../components/Skeleton';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        setRelated(data.related);
        setSelectedImage(0);
        setQuantity(1);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) return;
    await addItem(product.id, quantity);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.post('/reviews', { productId: product.id, rating: reviewRating, comment: reviewText });
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data.product);
      setReviewText('');
    } catch {}
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-6"><Skeleton className="h-96 w-full" /></div>;
  if (!product) return <div className="text-center py-16 text-gray-500">Product not found.</div>;

  const discountedPrice = product.price * (1 - product.discount / 100);
  // const images = product.images?.length > 0
  //   ? product.images.map(img => `${IMG_BASE}${img.url}`)
  //   : ['https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image'];


  const images = (() => {
  const raw =
    product.images ||
    product.ProductImage ||
    [];

  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map(img => {
      const url = img.url || img;

      return url.startsWith('http')
        ? url
        : `${IMG_BASE}${url}`;
    });
  }

  if (typeof product.image === 'string') {
    return product.image.startsWith('http')
      ? [product.image]
      : [`${IMG_BASE}${product.image}`];
  }

  return ['https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image'];
})();

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
        <Link to="/" className="hover:text-gray-700">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-gray-700">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 truncate max-w-50">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2">
            <img src={images[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-blue-600' : 'border-gray-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-blue-600 mb-1">{product.category?.name}</p>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{product.title}</h1>
          {product.brand && <p className="text-sm text-gray-500 mb-2">Brand: {product.brand}</p>}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= product.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviews?.length || 0} reviews)</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">₹{Math.round(discountedPrice).toLocaleString()}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="text-sm text-green-600 font-medium">{product.discount}% off</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>
          <p className={`text-sm mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </p>

          {user && product.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2"><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 h-10 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          )}
          {!user && <Link to="/login" className="block text-center h-10 leading-10 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">Login to Purchase</Link>}
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Reviews ({product.reviews?.length || 0})</h2>
        {user && (
          <form onSubmit={handleReview} className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Rating:</span>
              {[1,2,3,4,5].map(s => (
                <button type="button" key={s} onClick={() => setReviewRating(s)}>
                  <Star className={`w-4 h-4 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write a review..." rows={2}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-2" required />
            <button type="submit" className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm">Submit</button>
          </form>
        )}
        <div className="space-y-3">
          {product.reviews?.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{review.user?.name}</span>
                <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}</div>
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
     {/* Related */}
{related.length > 0 && (
  <section>
    <h2 className="text-lg font-semibold text-gray-900 mb-3">
      Related Products
    </h2>

    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 min-w-max">
        {related.map((p) => (
          <div
            key={p.id}
            className="w-42.5 sm:w-55 shrink-0"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  </section>
)}
<style>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>
    </div>
  );
}


