import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CustomerDashboard } from '../types';
import { dashboardService } from '../services/dashboardService';
import { useCart } from '../context/CartContext';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { ProductCard } from '../components/ProductCard';
import {
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Store,
  Truck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const [data, setData] = useState<CustomerDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { openCart } = useCart();

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getCustomerDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Customer dashboard error:', err);
      setError(err?.response?.data?.message || 'Could not load your dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Loading your personalized grocery dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to display customer metrics at this moment.'}</p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={loadDashboard}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const recentOrders = data.recentOrders || [];
  const buyAgainProducts = data.buyAgainProducts || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Greeting & Metrics Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-emerald-500/30 text-emerald-200 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-400/30">
            Customer Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold">
            {data.greeting || 'Welcome'}, <span className="text-amber-300">{data.customerName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            Welcome back to your personalized grocery dashboard.
          </p>
        </div>

        {/* Financial Snapshot Badges */}
        <div className="grid grid-cols-3 gap-3 bg-emerald-950/40 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="text-center">
            <span className="text-[10px] text-emerald-200 font-bold uppercase block">Total Orders</span>
            <span className="text-xl font-black text-white">{data.totalOrdersCount || 0}</span>
          </div>
          <div className="text-center border-x border-white/10 px-3">
            <span className="text-[10px] text-emerald-200 font-bold uppercase block">Total Spent</span>
            <span className="text-xl font-black text-amber-300">₹{Number(data.totalSpent || 0).toFixed(0)}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-emerald-200 font-bold uppercase block">You Saved</span>
            <span className="text-xl font-black text-teal-300">₹{Number(data.totalSavings || 0).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Active In-Flight Order Live Tracker (if exists) */}
      {data.activeOrder && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-lg space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  Active Live Order
                </span>
                <h3 className="text-lg font-black text-slate-900">{data.activeOrder.orderNumber}</h3>
              </div>
            </div>
            <OrderStatusBadge status={data.activeOrder.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <strong className="text-slate-700">Fulfillment Mode:</strong>
              <p className="text-slate-600 font-medium flex items-center">
                {data.activeOrder.orderType === 'STORE_PICKUP' ? (
                  <>
                    <Store className="w-4 h-4 mr-1 text-emerald-600" />
                    Express Pickup ({data.activeOrder.scheduledTimeSlot})
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 mr-1 text-teal-600" />
                    Home Delivery
                  </>
                )}
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-slate-700">Total Bill Amount:</strong>
              <p className="text-emerald-700 font-extrabold text-sm">₹{data.activeOrder.totalAmount.toFixed(2)}</p>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to={`/orders/${data.activeOrder.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition"
              >
                <span>Track Progress Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/shop"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-500 transition group flex flex-col items-center text-center space-y-2"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs">Shop Groceries</span>
        </Link>

        <Link
          to="/orders"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-500 transition group flex flex-col items-center text-center space-y-2"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
            <Clock className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs">Order History</span>
        </Link>

        <button
          onClick={openCart}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-500 transition group flex flex-col items-center text-center space-y-2"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs">My Cart</span>
        </button>

        <Link
          to="/orders"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-500 transition group flex flex-col items-center text-center space-y-2"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
            <RotateCcw className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800 text-xs">Returns & Support</span>
        </Link>
      </div>

      {/* "Buy Again" Creative Feature */}
      {buyAgainProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fast Re-Order</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Buy Again — Frequently Purchased</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {buyAgainProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Orders List */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900">Recent Receipts</h2>
          <Link to="/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
            <span>View All</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No recent orders found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {order.items?.length || 0} items • {order.orderType === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'} • Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-extrabold text-slate-900 text-sm">₹{order.totalAmount.toFixed(2)}</span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
