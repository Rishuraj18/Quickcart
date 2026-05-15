import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api, { IMG_BASE } from '../../api/axios';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', description: '', price: '', discount: '0', stock: '0', brand: '', rating: '0', categoryId: '', isFeatured: false });
  const [files, setFiles] = useState(null);

  const load = async () => {
    try {
      const [p, c] = await Promise.all([api.get('/products?limit=100'), api.get('/categories')]);
      setProducts(p.data.products);
      setCategories(c.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: '', slug: '', description: '', price: '', discount: '0', stock: '0', brand: '', rating: '0', categoryId: '', isFeatured: false });
    setFiles(null);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({ title: p.title, slug: p.slug, description: p.description, price: String(p.price), discount: String(p.discount), stock: String(p.stock), brand: p.brand || '', rating: String(p.rating), categoryId: String(p.categoryId), isFeatured: p.isFeatured });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (files) Array.from(files).forEach(f => fd.append('images', f));

    try {
      if (editing) await api.put(`/products/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      resetForm();
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); load(); } catch {}
  };

  const autoSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Products ({products.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <button onClick={resetForm}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })} placeholder="Title" required className="h-9 px-3 border border-gray-200 rounded-lg text-sm" />
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug" required className="h-9 px-3 border border-gray-200 rounded-lg text-sm" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="md:col-span-2 p-3 border border-gray-200 rounded-lg text-sm" />
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Price" required className="h-9 px-3 border border-gray-200 rounded-lg text-sm" />
            <input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} placeholder="Discount %" className="h-9 px-3 border border-gray-200 rounded-lg text-sm" />
            <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="h-9 px-3 border border-gray-200 rounded-lg text-sm" />
            <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Brand" className="h-9 px-3 border border-gray-200 rounded-lg text-sm" />
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required className="h-9 px-3 border border-gray-200 rounded-lg text-sm">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
              <input type="number" step="0.1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} placeholder="Rating" className="h-9 px-3 border border-gray-200 rounded-lg text-sm w-24" />
            </div>
            <input type="file" accept="image/*" multiple onChange={e => setFiles(e.target.files)} className="md:col-span-2 text-sm" />
            <button type="submit" className="md:col-span-2 h-9 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{editing ? 'Update' : 'Create'} Product</button>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">
            <th className="px-3 py-2 font-medium text-gray-500">Image</th>
            <th className="px-3 py-2 font-medium text-gray-500">Title</th>
            <th className="px-3 py-2 font-medium text-gray-500 hidden md:table-cell">Category</th>
            <th className="px-3 py-2 font-medium text-gray-500">Price</th>
            <th className="px-3 py-2 font-medium text-gray-500 hidden md:table-cell">Stock</th>
            <th className="px-3 py-2 font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-gray-50">
                <td className="px-3 py-2">
                  <img src={p.images?.[0]?.url ? `${IMG_BASE}${p.images[0].url}` : 'https://placehold.co/40x40/f3f4f6/9ca3af?text=-'} alt="" className="w-10 h-10 rounded object-cover" />
                </td>
                <td className="px-3 py-2 text-gray-900 max-w-[200px] truncate">{p.title}{p.isFeatured && <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Featured</span>}</td>
                <td className="px-3 py-2 text-gray-500 hidden md:table-cell">{p.category?.name}</td>
                <td className="px-3 py-2 text-gray-900 font-medium">₹{p.price}{p.discount > 0 && <span className="text-xs text-red-500 ml-1">-{p.discount}%</span>}</td>
                <td className="px-3 py-2 hidden md:table-cell">{p.stock}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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
