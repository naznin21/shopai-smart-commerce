import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Store,
  ShieldCheck,
  ClipboardList,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isCustomer, isStaff, isManager, isAdmin } = useAuth();
  const { itemCount, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const roleBadge = () => {
    if (isAdmin) return <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200 uppercase">Admin</span>;
    if (isManager) return <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-purple-200 uppercase">Manager</span>;
    if (isStaff) return <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 uppercase">Staff</span>;
    return null;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>⚡ Superfast Store Pickup in 1 Hour & FREE Home Delivery on orders above ₹500!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Store className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                Mini <span className="text-emerald-600">D-Mart</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                Fresh & Daily Groceries
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link
              to="/shop"
              className={`hover:text-emerald-600 transition ${location.pathname === '/shop' ? 'text-emerald-600 font-bold' : ''}`}
            >
              Shop All
            </Link>

            {isAuthenticated && isCustomer && (
              <>
                <Link
                  to="/dashboard"
                  className={`hover:text-emerald-600 transition ${location.pathname === '/dashboard' ? 'text-emerald-600 font-bold' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/orders"
                  className={`hover:text-emerald-600 transition ${location.pathname === '/orders' ? 'text-emerald-600 font-bold' : ''}`}
                >
                  My Orders
                </Link>
              </>
            )}

            {isAuthenticated && isStaff && (
              <Link
                to="/staff/dashboard"
                className="inline-flex items-center space-x-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl font-semibold hover:bg-blue-100 transition"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Staff Fulfillment</span>
              </Link>
            )}

            {isAuthenticated && (isManager || isAdmin) && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl font-semibold hover:bg-emerald-100 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Operations Hub</span>
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xs mx-6 relative">
            <input
              type="text"
              placeholder="Search vegetables, milk, tea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </span>
                    {roleBadge()}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1">{roleBadge()}</div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    {isCustomer && (
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span>Order History</span>
                      </Link>
                    )}

                    {isStaff && (
                      <Link
                        to="/staff/dashboard"
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-blue-700 hover:bg-blue-50"
                      >
                        <ClipboardList className="w-4 h-4 text-blue-500" />
                        <span>Staff Dashboard</span>
                      </Link>
                    )}

                    {(isManager || isAdmin) && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-emerald-800 hover:bg-emerald-50 font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 rounded-xl hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-200 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 focus:bg-white focus:border-emerald-500 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex flex-col space-y-2 pt-2 text-sm font-semibold text-slate-700">
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:bg-slate-100 rounded-lg">
                Shop Groceries
              </Link>
              {isAuthenticated && isCustomer && (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:bg-slate-100 rounded-lg">
                    Customer Dashboard
                  </Link>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:bg-slate-100 rounded-lg">
                    My Orders & Returns
                  </Link>
                </>
              )}
              {isAuthenticated && isStaff && (
                <Link to="/staff/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 text-blue-700 bg-blue-50 rounded-lg">
                  Staff Fulfillment Center
                </Link>
              )}
              {isAuthenticated && (isManager || isAdmin) && (
                <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 text-emerald-800 bg-emerald-50 rounded-lg">
                  Manager / Admin Operations
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
