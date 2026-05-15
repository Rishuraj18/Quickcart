import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api, { IMG_BASE } from '../api/axios';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [bannersRes, catsRes, featuredRes, trendingRes] = await Promise.all([
          api.get('/banners'),
          api.get('/categories'),
          api.get('/products?featured=true&limit=8'),
          api.get('/products?sort=rating&limit=8'),
        ]);
        setBanners(bannersRes.data);
        setCategories(catsRes.data);
        setFeatured(featuredRes.data.products);
        setTrending(trendingRes.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <Skeleton className="h-48 md:h-72 w-full rounded-xl" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <Skeleton className="h-20" count={6} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-64" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 py-4 space-y-8">
      {/* Hero Banner */}
      {banners.length > 0 && (
        <div className="hidden md:block relative rounded-xl overflow-hidden bg-linear-to-r from-blue-600 to-purple-600 h-48 md:h-60">
          {banners.map((banner, idx) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: idx === currentBanner ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              {banner.imageUrl && !banner.imageUrl.includes('banner-') ? (
                <img
                  src={
                    banner.imageUrl?.startsWith('http')
                      ? banner.imageUrl
                      : `${IMG_BASE}${banner.imageUrl}`
                  }
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600">
                  <div className="text-center text-white px-6">
                    <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                    {banner.linkUrl && (
                      <Link to={banner.linkUrl} className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                        Shop Now <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                </div>
              )}
            </motion.div>
          ))}
          
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentBanner ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      {/* {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Shop by Category</h2>
            <Link to="/shop" className="text-sm text-blue-600 hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group text-center">
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-1.5 border border-gray-100 group-hover:border-blue-200 transition-colors">
                  {cat.image ? (
                    <img
                      src={
                        cat.image?.startsWith('http')
                          ? cat.image
                          : `${IMG_BASE}${cat.image}`
                      }
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )} */}


      {categories.length > 0 && (
  <section>
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-gray-900">Shop by Category</h2>
      <Link
        to="/shop"
        className="text-sm text-blue-600 hover:underline flex items-center gap-0.5"
      >
        View all <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>

    {/* Horizontal Scroll */}
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/shop?category=${cat.slug}`}
          className="flex flex-col items-center min-w-20 group"
        >
          {/* Circle Image */}
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-50 shadow-sm group-hover:shadow-md transition-all">
            {cat.image ? (
              <img
                src={
                  cat.image?.startsWith('http')
                    ? cat.image
                    : `${IMG_BASE}${cat.image}`
                }
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-gray-500">
                {cat.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Name */}
          <p className="text-[11px] text-gray-700 mt-1 text-center truncate w-20">
            {cat.name}
          </p>
        </Link>
      ))}
    </div>
  </section>
)}
   {banners.length > 0 && (
        <div className=" md:hidden relative rounded-xl overflow-hidden bg-linear-to-r from-blue-600 to-purple-600 h-36 md:h-60">
          {banners.map((banner, idx) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: idx === currentBanner ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              {banner.imageUrl && !banner.imageUrl.includes('banner-') ? (
                <img
                  src={
                    banner.imageUrl?.startsWith('http')
                      ? banner.imageUrl
                      : `${IMG_BASE}${banner.imageUrl}`
                  }
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600">
                  <div className="text-center text-white px-6">
                    <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                    {banner.linkUrl && (
                      <Link to={banner.linkUrl} className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                        Shop Now <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                </div>
              )}
            </motion.div>
          ))}
          
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentBanner ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {/* Featured Products */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Featured Products</h2>
            <Link to="/shop?featured=true" className="text-sm text-blue-600 hover:underline flex items-center gap-0.5">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Offer Banner */}
      <section className="bg-linear-to-r from-amber-50 to-orange-50 rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-amber-100">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Deals of the Day</h2>
          <p className="text-sm text-gray-600">Up to 30% off on selected items. Limited time offer.</p>
        </div>
        <Link to="/shop?sort=price_asc" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shrink-0">
          Shop Deals
        </Link>
      </section>

      {/* Trending Products */}
      {trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Trending Now</h2>
            <Link to="/shop?sort=rating" className="text-sm text-blue-600 hover:underline flex items-center gap-0.5">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
