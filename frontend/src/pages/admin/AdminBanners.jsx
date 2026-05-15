/* eslint-disable no-empty */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import api, { IMG_BASE } from '../../api/axios';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState(null);

  const load = async () => {
    try { const { data } = await api.get('/banners/all'); setBanners(data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('linkUrl', linkUrl);
    fd.append('isActive', isActive);
    if (file) fd.append('image', file);
    try {
      await api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTitle(''); setLinkUrl(''); setFile(null); setShowForm(false); load();
    } catch {}
  };

  const toggleActive = async (banner) => {
    try { await api.put(`/banners/${banner.id}`, { isActive: !banner.isActive }); load(); } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try { await api.delete(`/banners/${id}`); load(); } catch {}
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Banners ({banners.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"><Plus className="w-4 h-4" /> Add</button>
      </div>
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Add Banner</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Banner Title" required className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm" />
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="Link URL (optional)" className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm" />
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm flex-1" required />
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Active</label>
            </div>
            <button type="submit" className="h-9 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Create Banner</button>
          </form>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {banners.map(b => (
          <div key={b.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="h-32 bg-gray-50">
  {b.imageUrl && !b.imageUrl.includes('banner-') ? (
    <img 
      src={b.imageUrl.startsWith('http') ? b.imageUrl : `${IMG_BASE}${b.imageUrl}`} 
      alt={b.title} 
      className="w-full h-full object-cover" 
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-linear-to-r from-blue-500 to-purple-500 text-white font-bold">
      {b.title}
    </div>
  )}
</div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{b.title}</p>
                <p className="text-xs text-gray-500">{b.linkUrl || 'No link'}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(b)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
