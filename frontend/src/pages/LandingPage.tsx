import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowRight,
  Sparkles,
  Clock,
  Truck,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          productService.getFeatured(),
          categoryService.getActive(),
        ]);
        setFeaturedProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error('Error loading landing page data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Smart Grocery Retail Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Fresh Groceries. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Easy Shopping. Your Way.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Order fresh daily essentials, milk, fruits, snacks, and household cleaning staples. Choose between <strong>1-hour express store pickup</strong> or <strong>scheduled home delivery</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl shadow-xl shadow-emerald-950/40 transition duration-200 text-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Shop Groceries Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/orders"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold rounded-2xl transition duration-200 text-sm"
              >
                Track Live Order
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-700/50 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-emerald-200">Fresh & Organic</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-300">1 Hour</p>
                <p className="text-xs text-emerald-200">Store Pickup</p>
              </div>
              <div>
                <p className="text-2xl font-black text-teal-300">7 Days</p>
                <p className="text-xs text-emerald-200">Easy Returns</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-800/40 backdrop-blur-md p-3 group">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                alt="Fresh produce and groceries"
                className="w-full h-80 object-cover rounded-2xl group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent rounded-2xl flex items-end p-6">
                <div>
                  <span className="bg-emerald-500 text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Daily Deal
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">Farm Fresh Shimla Apples</h3>
                  <p className="text-xs text-emerald-200">Handpicked crisp apples with instant 17% savings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Smart Store Pickup</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Reserve guaranteed pickup time slots with real-time capacity management. Walk in and collect in seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Scheduled Home Delivery</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Choose your preferred date and time. Enjoy 100% free delivery on all orders over ₹500.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">7-Day Easy Returns</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Damaged, expired, or wrong product? Request instant returns or exchanges directly from your order dashboard.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Verified Quality</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Every grocery item passes our strict 4-step hygiene, packaging, and freshness inspection before packing.
            </p>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Aisle Navigation</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Explore by Category</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
            <span>View All Aisles</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="group bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col items-center text-center space-y-3"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                <img
                  src={category.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300'}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
                  {category.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Customer Favorites</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Daily Essentials</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
            <span>Explore Full Catalog</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Smart Savings Promotion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="bg-amber-400 text-slate-950 text-xs font-black uppercase px-2.5 py-1 rounded-full">
              Smart Savings Meter
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Unlock FREE Home Delivery on orders above ₹500!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Our automated pricing engine calculates your instant discounts and dynamic free delivery eligibility in real-time as you add items to cart.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center px-8 py-4 bg-white text-emerald-700 hover:bg-slate-100 font-extrabold rounded-2xl shadow-lg transition duration-200 text-sm whitespace-nowrap"
          >
            <span>Start Saving Today</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};
