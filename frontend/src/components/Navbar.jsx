/* eslint-disable react-hooks/static-components */
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Geolocation } from '@capacitor/geolocation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
  MapPin,
  ChevronDown
} from 'lucide-react';

import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(
    'Use Current Location'
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());

  const navigate = useNavigate();
  const location = useLocation();

  const isHomepage = location.pathname === '/';

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () =>
      window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll
  useEffect(() => {
    if (!isHomepage || !isMobile) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll);

    return () =>
      window.removeEventListener('scroll', handleScroll);
  }, [isHomepage, isMobile]);

  // FIXED OUTSIDE CLICK
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener(
        'mousedown',
        handleOutside
      );
    }

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutside
      );
    };
  }, [profileOpen]);

  // Get Location
  const handleLocation = async () => {
    try {
      // Check and request permissions natively first
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') {
          setSelectedLocation('Location denied');
          return;
        }
      }

      // Show loading state
      setSelectedLocation('Locating...');

      // Get current position using Capacitor plugin
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const { latitude, longitude } = position.coords;

      // Reverse Geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();

      const city = data?.address?.city || data?.address?.state || data?.address?.town || data?.address?.village;
      const locality = data?.address?.suburb || data?.address?.neighbourhood || data?.address?.county;

      let locationString = 'Current Location';
      if (city && locality) {
        locationString = `${city}, ${locality}`;
      } else if (city || locality) {
        locationString = city || locality;
      }

      setSelectedLocation(locationString);
    } catch (error) {
      console.error("Location error:", error);
      setSelectedLocation('Current Location');
    }
  };

  // Search
  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    navigate(
      `/shop?search=${encodeURIComponent(
        searchQuery.trim()
      )}&location=${encodeURIComponent(selectedLocation)}`
    );

    setSearchQuery('');
    setMenuOpen(false);
  };

  // Logout
  const handleLogout = () => {
    logout();

    setProfileOpen(false);
    setMenuOpen(false);

    navigate('/');
  };

  // PROFILE DROPDOWN — called as function, not component
  const ProfileDropdown = ({ dark = false }) => (
    <div
      ref={profileRef}
      className="relative"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setProfileOpen((prev) => !prev);
        }}
        className={`flex items-center p-2 transition-colors ${
          dark
            ? 'text-white hover:text-white/80'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <User className="w-5 h-5" />
      </button>

      {profileOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[99999]"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name}
            </p>

            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>

          <Link
            to="/profile"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>

          <Link
            to="/orders"
            onClick={() => setProfileOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Package className="w-4 h-4" />
            My Orders
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );

  // MOBILE MENU — called as function, not component
  const MobileMenu = () => (
    <>
      <div
        onClick={() => setMenuOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
      />
      <div className="fixed top-0 left-0 w-full bg-white z-[10000] animate-slideDown">
        {/* Top */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="text-xl font-bold text-gray-900"
          >
            FlickCart
          </Link>

          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <form
            onSubmit={handleSearch}
            className="mb-5"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search Products..."
                className="w-full h-12 pl-11 pr-4 bg-gray-100 rounded-2xl text-sm focus:outline-none"
              />

              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          <button
            onClick={handleLocation}
            className="flex items-center gap-2 mb-5 text-sm text-gray-700"
          >
            <MapPin className="w-4 h-4" />
            {selectedLocation}
            <ChevronDown className="w-4 h-4" />
          </button>

          <div className="space-y-2">
            <Link
              to="/shop"
              onClick={() => setMenuOpen(false)}
              className="flex items-center px-4 py-4 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Shop
            </Link>

            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-4 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({itemCount})
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-4 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-4 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <Package className="w-4 h-4" />
                  My Orders
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-4 rounded-2xl text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-4 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-4 rounded-2xl bg-gray-900 text-white text-sm font-medium"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-4 rounded-2xl border border-gray-200 text-gray-700 text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // SIMPLE HEADER — called as function, not component
  const SimpleHeader = () => (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 tracking-tight"
            >
              FlickCart
            </Link>

            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-xl mx-6"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search products..."
                  className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                />

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>

            {/* Right */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleLocation}
                className="hidden md:flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <MapPin className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{selectedLocation}</span>
              </button>

              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="w-5 h-5" />

                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                ProfileDropdown({})
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Hamburger Menu Button - Mobile only */}
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Only on mobile */}
          <div className="md:hidden py-2 pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && MobileMenu()}
    </>
  );

  // Mobile Homepage Curved Header — called as function, not component
  const CurvedHeader = () => (
    <div className="mobile-curved-header">
      <div className="px-4 pt-4 pb-8">
        {/* Top */}
        <div className="flex items-center justify-between mb-5">
          <Link
            to="/"
            className="text-xl font-bold text-white"
          >
            FlickCart
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative p-1 text-white"
            >
              <ShoppingCart className="w-5 h-5" />

              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              ProfileDropdown({ dark: true })
            ) : (
              <Link
                to="/login"
                className="p-1 text-white"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-1 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome to FlickCart
          </h1>

          <p className="text-sm text-white/80">
            Discover amazing products near you
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mb-4"
        >
          <div className="relative mx-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search Products..."
              className="w-full h-12 pl-11 pr-24 rounded-2xl bg-white text-gray-900 text-sm focus:outline-none"
            />

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-900 text-white text-xs rounded-xl"
            >
              Search
            </button>
          </div>
        </form>

        {/* Location */}
        <div className="flex justify-center">
          <button
            onClick={handleLocation}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white text-sm"
          >
            <MapPin className="w-4 h-4" />
            <span className="max-w-[150px] truncate">{selectedLocation}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // RENDER LOGIC
  // Desktop view
  if (!isMobile) {
    return SimpleHeader();
  }

  // Mobile view - Non homepage
  if (!isHomepage) {
    return SimpleHeader();
  }

  // Mobile view - Homepage with curved header
  return (
    <>
      {/* Sticky Header (shows on scroll) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {SimpleHeader()}
      </div>

      {/* Curved Header (KEEP MOUNTED) */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? 'opacity-0 pointer-events-none h-0 overflow-hidden'
            : 'opacity-100'
        }`}
      >
        {CurvedHeader()}
      </div>

      {/* Mobile Menu */}
      {menuOpen && MobileMenu()}

      <style>{`
        .mobile-curved-header {
          background: #0A2A23;
          clip-path: ellipse(140% 100% at 50% 0%);
          position: relative;
          overflow: hidden;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.25s ease;
        }
      `}</style>
    </>
  );
}