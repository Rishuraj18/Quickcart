import { useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', { name });
      const updated = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updated));
      useAuthStore.setState({ user: updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Profile</h1>
      <form onSubmit={handleUpdate} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={user?.email} disabled className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input value={user?.role} disabled className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
        </div>
        <button type="submit" className="w-full h-10 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          {saved ? '✓ Saved!' : 'Update Profile'}
        </button>
      </form>
      <button onClick={logout} className="w-full mt-3 h-10 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
        Logout
      </button>
    </div>
  );
}
