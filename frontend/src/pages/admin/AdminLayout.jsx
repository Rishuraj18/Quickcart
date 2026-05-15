import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderOpen, Image, ShoppingCart, Users, MessageSquare } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4 min-h-[80vh]">
      <aside className="hidden md:block w-48 shrink-0">
        <nav className="bg-white border border-gray-100 rounded-xl p-2 sticky top-16 space-y-0.5">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        {/* Mobile nav */}
        <div className="md:hidden overflow-x-auto mb-4 flex gap-1 pb-1">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border ${isActive ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-600 border-gray-200'}`}>
              {label}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
