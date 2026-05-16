import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentFeatured = searchParams.get('featured') || '';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('limit', '12');
        if (currentCategory) params.set('category', currentCategory);
        if (currentSort) params.set('sort', currentSort);
        if (currentSearch) params.set('search', currentSearch);
        if (currentFeatured) params.set('featured', currentFeatured);
        const [productsRes, catsRes] = await Promise.all([
          api.get(`/products?${params.toString()}`),
          api.get('/categories'),
        ]);
        setProducts(productsRes.data.products);
        setPagination(productsRes.data.pagination);
        setCategories(catsRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [currentCategory, currentSort, currentSearch, currentPage, currentFeatured]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});
  const hasFilters = currentCategory || currentSearch || currentFeatured;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {currentSearch ? `Results for "${currentSearch}"` : 'All Products'}
          </h1>
          {pagination.total !== undefined && <p className="text-sm text-gray-500">{pagination.total} products</p>}
        </div>
        <div className="flex items-center gap-2">
          <select value={currentSort} onChange={(e) => updateFilter('sort', e.target.value)}
            className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden h-9 px-3 border border-gray-200 rounded-lg flex items-center gap-1 text-sm">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>
      {hasFilters && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              {categories.find(c => c.slug === currentCategory)?.name}
              <button onClick={() => updateFilter('category', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>
        </div>
      )}
      <div className="flex gap-6">
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-48 shrink-0`}>
          <div className="bg-white border border-gray-100 rounded-xl p-3 space-y-3 sticky top-16">
            <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => { updateFilter('category', ''); setFiltersOpen(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm ${!currentCategory ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => { updateFilter('category', cat.slug); setFiltersOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-sm ${currentCategory === cat.slug ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {cat.name} <span className="text-xs opacity-60">({cat._count?.products || 0})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3"><Skeleton className="h-64" count={6} /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-16"><p className="text-gray-500 mb-2">No products found.</p><button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear filters</button></div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
                    <button key={pg} onClick={() => updateFilter('page', pg.toString())} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pg ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{pg}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}