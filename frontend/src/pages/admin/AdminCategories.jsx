import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api, { IMG_BASE } from '../../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [file, setFile] = useState(null);

  const load = async () => {
    try { const { data } = await api.get('/categories'); setCategories(data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setName(''); setSlug(''); setFile(null); setEditing(null); setShowForm(false); };

  const handleEdit = (c) => { setEditing(c.id); setName(c.name); setSlug(c.slug); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', name);
    fd.append('slug', slug);
    if (file) fd.append('image', file);
    try {
      if (editing) await api.put(`/categories/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      resetForm(); load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/categories/${id}`); load(); } catch (err) { alert('Cannot delete: category may have products.'); }
  };

  const autoSlug = (val) => val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Categories ({categories.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"><Plus className="w-4 h-4" /> Add</button>
      </div>
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">{editing ? 'Edit' : 'Add'} Category</h2>
            <button onClick={resetForm}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input value={name} onChange={e => { setName(e.target.value); if (!editing) setSlug(autoSlug(e.target.value)); }} placeholder="Name" required className="h-9 px-3 border border-gray-200 rounded-lg text-sm flex-1" />
            <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Slug" required className="h-9 px-3 border border-gray-200 rounded-lg text-sm flex-1" />
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm" />
            <button type="submit" className="h-9 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button>
          </form>
        </div>
      )}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">
            <th className="px-3 py-2 font-medium text-gray-500">Image</th>
            <th className="px-3 py-2 font-medium text-gray-500">Name</th>
            <th className="px-3 py-2 font-medium text-gray-500">Slug</th>
            <th className="px-3 py-2 font-medium text-gray-500">Products</th>
            <th className="px-3 py-2 font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-t border-gray-50">
               <td className="px-3 py-2">
  {c.image ? (
    <img 
      src={c.image.startsWith('http') ? c.image : `${IMG_BASE}${c.image}`}
      alt="" 
      className="w-10 h-10 rounded object-cover"
    /> 
  ) : (
    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs">
      {c.name[0]}
    </div>
  )}
</td>
                <td className="px-3 py-2 text-gray-900 font-medium">{c.name}</td>
                <td className="px-3 py-2 text-gray-500">{c.slug}</td>
                <td className="px-3 py-2">{c._count?.products || 0}</td>
                <td className="px-3 py-2"><div className="flex gap-1">
                  <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
