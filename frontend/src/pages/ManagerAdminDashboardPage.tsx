import React, { useEffect, useState } from 'react';
import { ManagerAdminDashboard, User, Category, Product, Role } from '../types';
import { dashboardService } from '../services/dashboardService';
import { userService } from '../services/userService';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { Modal } from '../components/Modal';
import {
  ShieldCheck,
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Plus,
} from 'lucide-react';

export const ManagerAdminDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<ManagerAdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'users' | 'audit'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Product Modal
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscPrice, setProdDiscPrice] = useState('');
  const [prodCatId, setProdCatId] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState('50');
  const [prodThreshold, setProdThreshold] = useState('10');
  const [prodUnit, setProdUnit] = useState('1 kg');

  const loadData = async () => {
    try {
      setLoading(true);
      const [dash, uList, cList, pList] = await Promise.all([
        dashboardService.getManagerAdminDashboard(),
        userService.getAllUsers(),
        categoryService.getAll(),
        productService.search({ size: 50 }).then((r) => r.content),
      ]);
      setDashboard(dash);
      setUsers(uList);
      setCategories(cList);
      setProducts(pList);
    } catch (err) {
      console.error('Failed loading manager/admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: number, role: Role) => {
    try {
      await userService.updateUserRole(userId, role);
      showToast(`Role updated to ${role}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleToggleUser = async (userId: number) => {
    try {
      await userService.toggleStatus(userId);
      showToast('User account status updated', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to toggle status', 'error');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryService.create({
        name: catName.trim(),
        description: catDesc.trim() || undefined,
        imageUrl: catImage.trim() || undefined,
      });
      showToast('Category created successfully!', 'success');
      setIsCatModalOpen(false);
      setCatName('');
      setCatDesc('');
      setCatImage('');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create category', 'error');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productService.create({
        name: prodName.trim(),
        description: prodDesc.trim() || undefined,
        price: Number(prodPrice),
        discountPrice: prodDiscPrice ? Number(prodDiscPrice) : undefined,
        categoryId: Number(prodCatId),
        imageUrl: prodImage.trim() || undefined,
        stockQuantity: Number(prodStock),
        lowStockThreshold: Number(prodThreshold),
        unit: prodUnit.trim(),
        active: true,
      });
      showToast('Product added to catalog!', 'success');
      setIsProdModalOpen(false);
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdDiscPrice('');
      setProdImage('');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create product', 'error');
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-emerald-500/30 text-emerald-200 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-emerald-400/30">
            {isAdmin ? 'Super Admin Operations' : 'Manager Operations Center'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Executive Store Governance</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Catalog management, live financial revenue meters, security audit log inspection, and RBAC user provisioning.
          </p>
        </div>

        {/* Total Financials */}
        <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[240px]">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Revenue</span>
            <span className="text-xl font-black text-amber-300">₹{dashboard.totalRevenue?.toFixed(0) || 0}</span>
          </div>
          <div className="text-center border-l border-white/10 pl-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Today's Sales</span>
            <span className="text-xl font-black text-emerald-300">₹{dashboard.todayRevenue?.toFixed(0) || 0}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Orders</span>
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{dashboard.totalOrdersCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Catalog Items</span>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{dashboard.totalProductsCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Registered Users</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{dashboard.totalUsersCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Returns</span>
            <RotateCcw className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600">{dashboard.pendingReturnsCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-extrabold uppercase overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Live Operations Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Grocery Aisles ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User RBAC Provisioning ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">Recent Store Transactions</h3>
              <div className="divide-y divide-slate-100">
                {dashboard.recentOrders.map((o) => (
                  <div key={o.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{o.orderNumber}</span>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {o.userName} • {o.orderType} • {new Date(o.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="font-extrabold text-slate-900 text-xs">₹{o.totalAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Pending Grocery Returns</h3>
              {dashboard.pendingReturns.length === 0 ? (
                <p className="text-xs text-slate-400">No returns pending review.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {dashboard.pendingReturns.map((r) => (
                    <div key={r.id} className="py-3 text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{r.productName}</span>
                        <span className="text-amber-600">{r.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{r.reason} • By {r.userName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsProdModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Grocery Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Discount</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900 flex items-center space-x-3">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <span>{p.name}</span>
                    </td>
                    <td className="p-4 text-slate-600">{p.category?.name}</td>
                    <td className="p-4 font-bold text-slate-900">
                      ₹{p.effectivePrice} {p.discountPrice && <span className="text-slate-400 line-through text-[11px]">₹{p.price}</span>}
                    </td>
                    <td className="p-4 font-bold">
                      <span className={p.stockQuantity <= p.lowStockThreshold ? 'text-amber-600' : 'text-emerald-700'}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{p.unit}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Grocery Aisle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <img
                  src={c.imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300'}
                  alt={c.name}
                  className="w-full h-32 rounded-xl object-cover"
                />
                <h4 className="font-extrabold text-slate-900 text-sm">{c.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                {isAdmin && <th className="p-4 text-right">RBAC Governance</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-900">
                    <p>{u.name}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                      u.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' :
                      u.role === 'MANAGER' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'STAFF' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{u.phone || '—'}</td>
                  <td className="p-4 font-bold">
                    <span className={u.active ? 'text-emerald-700' : 'text-rose-600'}>
                      {u.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-right space-x-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="bg-slate-100 font-bold rounded-lg p-1 text-[11px] border border-slate-200 outline-none"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="STAFF">STAFF</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          u.active ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Immutable Security Audit Logs</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto divide-y divide-slate-100">
            {dashboard.recentAuditLogs.map((log) => (
              <div key={log.id} className="pt-2 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">[{log.action}]</span>
                  <span className="text-slate-600 ml-2">{log.description}</span>
                  <span className="text-slate-400 block text-[10px]">Actor: {log.userEmail} • IP: {log.ipAddress}</span>
                </div>
                <span className="text-slate-400 text-[10px] whitespace-nowrap ml-4">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title="Create New Grocery Aisle">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Aisle Name</label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Organic Staples"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Description</label>
            <textarea
              rows={2}
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Image URL</label>
            <input
              type="url"
              value={catImage}
              onChange={(e) => setCatImage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
              Create Aisle
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Product Modal */}
      <Modal isOpen={isProdModalOpen} onClose={() => setIsProdModalOpen(false)} title="Add Product to Catalog">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Product Title</label>
            <input
              type="text"
              required
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="e.g. Fresh Brown Eggs"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">MRP Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Discount Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={prodDiscPrice}
                onChange={(e) => setProdDiscPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Category</label>
              <select
                required
                value={prodCatId}
                onChange={(e) => setProdCatId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Pack / Unit</label>
              <input
                type="text"
                required
                value={prodUnit}
                onChange={(e) => setProdUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Initial Stock</label>
              <input
                type="number"
                required
                value={prodStock}
                onChange={(e) => setProdStock(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Low Stock Threshold</label>
              <input
                type="number"
                required
                value={prodThreshold}
                onChange={(e) => setProdThreshold(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Image URL</label>
            <input
              type="url"
              value={prodImage}
              onChange={(e) => setProdImage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsProdModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
