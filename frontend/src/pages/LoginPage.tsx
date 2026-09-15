import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Store,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(email.trim(), password);
      showToast(`Welcome back, ${res.name}!`, 'success');

      // Smart redirect based on role
      if (res.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else if (res.role === 'MANAGER' || res.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        // Customer Role: If redirected from a specific protected page (like /checkout), go there. Otherwise go to /dashboard.
        if (from && from !== '/' && from !== '/login') {
          navigate(from);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-200">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to ShopAI
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to manage your grocery cart, track orders, or access operations
          </p>
        </div>

        {/* Demo Quick-Fill Roles Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>One-Click Demo Credentials:</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('customer@minidmart.com', 'Customer@123')}
              className="p-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-left transition flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                C
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 leading-tight">Customer</p>
                <p className="text-[10px] text-slate-400">Shopping & Dashboard</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('staff@minidmart.com', 'Staff@123')}
              className="p-2 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-left transition flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                <ClipboardList className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 leading-tight">Staff</p>
                <p className="text-[10px] text-slate-400">Fulfillment</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('manager@minidmart.com', 'Manager@123')}
              className="p-2 bg-white hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl text-left transition flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                M
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 leading-tight">Manager</p>
                <p className="text-[10px] text-slate-400">Store Ops</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@minidmart.com', 'Admin@123')}
              className="p-2 bg-white hover:bg-rose-50 hover:border-rose-300 border border-slate-200 rounded-xl text-left transition flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 leading-tight">Admin</p>
                <p className="text-[10px] text-slate-400">Security & RBAC</p>
              </div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition duration-200 text-sm disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
};
