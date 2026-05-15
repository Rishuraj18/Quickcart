import { useEffect, useState } from 'react';
import { Trash2, Star } from 'lucide-react';
import api from '../../api/axios';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await api.get('/reviews/all'); setReviews(data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try { await api.delete(`/reviews/${id}`); load(); } catch {}
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Reviews ({reviews.length})</h1>
      {reviews.length === 0 ? (
        <p className="text-center py-8 text-gray-400">No reviews yet.</p>
      ) : (
        <div className="space-y-2">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{r.user?.name}</span>
                  <span className="text-xs text-gray-400">on</span>
                  <span className="text-sm text-blue-600 truncate">{r.product?.title}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
