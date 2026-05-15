import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full max-w-7xl mx-auto bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?featured=true" className="hover:text-white transition-colors">Featured</Link></li>
              <li><Link to="/shop?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Orders</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default">Help Center</span></li>
              <li><span className="cursor-default">Shipping Info</span></li>
              <li><span className="cursor-default">Returns</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">About</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default">Our Story</span></li>
              <li><span className="cursor-default">Careers</span></li>
              <li><span className="cursor-default">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">&copy; 2026 Store. All rights reserved.</p>
          <p className="text-xs">Built with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
