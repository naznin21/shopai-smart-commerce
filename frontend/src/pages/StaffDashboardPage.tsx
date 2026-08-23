import React, { useEffect, useState } from 'react';
import { StaffDashboard, Order, ReturnExchangeRequest, OrderStatus, ReturnStatus } from '../types';
import { dashboardService } from '../services/dashboardService';
import { orderService } from '../services/orderService';
import { returnService } from '../services/returnService';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import {
  ClipboardList,
  Truck,
  RotateCcw,
  AlertTriangle,
  Clock,
  Store,
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<StaffDashboard | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnExchangeRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'urgent' | 'orders' | 'returns' | 'stock'>('urgent');
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  // Status update modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('CONFIRMED');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Return process modal
  const [selectedReturn, setSelectedReturn] = useState<ReturnExchangeRequest | null>(null);
  const [returnDecision, setReturnDecision] = useState<ReturnStatus>('APPROVED');
  const [staffNote, setStaffNote] = useState('');
  const [processingReturn, setProcessingReturn] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dash, ordList, retList] = await Promise.all([
        dashboardService.getStaffDashboard(),
        orderService.getAllStaffOrders(),
        returnService.getAllStaffRequests(),
      ]);
      setDashboard(dash);
      setOrders(ordList);
      setReturns(retList);
    } catch (err) {
      console.error('Failed loading staff dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdatingStatus(true);
      await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      showToast(`Order ${selectedOrder.orderNumber} status updated to ${newStatus}`, 'success');
      setSelectedOrder(null);
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update order status';
      showToast(msg, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    try {
      setProcessingReturn(true);
      await returnService.processRequest(selectedReturn.id, {
        status: returnDecision,
        adminNotes: staffNote.trim() || undefined,
      });
      showToast(`Return request ${selectedReturn.requestNumber} processed as ${returnDecision}`, 'success');
      setSelectedReturn(null);
      setStaffNote('');
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to process return';
      showToast(msg, 'error');
    } finally {
      setProcessingReturn(false);
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-blue-500/30 text-blue-200 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-blue-400/30">
            Fulfillment Operations Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Store Staff Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Pack orders, fulfill store express pickups, dispatch deliveries, and process grocery returns.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">New Orders</span>
            <span className="text-xl font-black text-amber-400">{dashboard.newOrdersCount}</span>
          </div>
          <div className="text-center border-x border-white/10 px-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Packing</span>
            <span className="text-xl font-black text-blue-400">{dashboard.preparingCount}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Returns</span>
            <span className="text-xl font-black text-rose-400">{dashboard.pendingReturnsCount}</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Ready Pickup</span>
            <Store className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{dashboard.readyForPickupCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Out Delivery</span>
            <Truck className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{dashboard.outForDeliveryCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Low Stock</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{dashboard.lowStockCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Out of Stock</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">{dashboard.outOfStockCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-extrabold uppercase">
        <button
          onClick={() => setActiveTab('urgent')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'urgent'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Urgent Orders Queue ({dashboard.urgentOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>All Fulfillment Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'returns'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Pending Returns ({returns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'stock'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock Alerts ({dashboard.lowStockProducts.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'urgent' && (
        <div className="space-y-4">
          {dashboard.urgentOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-400 text-xs border border-slate-200">
              No urgent unfulfilled orders in queue. All clear! 🎉
            </div>
          ) : (
            dashboard.urgentOrders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 text-sm">{o.orderNumber}</span>
                    <OrderStatusBadge status={o.status} />
                    <span className="text-xs font-bold text-slate-400">({o.orderType})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Customer: <strong className="text-slate-700">{o.userName}</strong> ({o.contactPhone}) • {o.items.length} item(s)
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {o.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-extrabold text-slate-900 text-sm">₹{o.totalAmount.toFixed(2)}</span>
                  <button
                    onClick={() => {
                      setSelectedOrder(o);
                      setNewStatus(o.orderType === 'STORE_PICKUP' ? 'READY_FOR_PICKUP' : 'PREPARING');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-200"
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 text-sm">{o.orderNumber}</span>
                  <OrderStatusBadge status={o.status} />
                  <span className="text-xs font-bold text-slate-400">({o.orderType})</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Customer: <strong>{o.userName}</strong> • Placed on {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-extrabold text-slate-900 text-sm">₹{o.totalAmount.toFixed(2)}</span>
                <button
                  onClick={() => {
                    setSelectedOrder(o);
                    setNewStatus(o.status);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Change Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="space-y-4">
          {returns.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-400 text-xs border border-slate-200">
              No return requests pending staff inspection.
            </div>
          ) : (
            returns.map((ret) => (
              <div
                key={ret.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 text-sm">{ret.requestNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                      {ret.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Order: {ret.orderNumber}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Item</span>
                    <p className="font-bold text-slate-800">{ret.productName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Reason</span>
                    <p className="font-semibold text-slate-700 capitalize">{ret.reason.replace(/_/g, ' ').toLowerCase()}</p>
                    {ret.reasonDetails && <p className="text-slate-500 italic mt-0.5">"{ret.reasonDetails}"</p>}
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Customer</span>
                    <p className="font-semibold text-slate-700">{ret.userName} ({ret.userEmail})</p>
                  </div>
                </div>

                {ret.status === 'REQUESTED' && (
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedReturn(ret);
                        setReturnDecision('APPROVED');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Inspect & Process
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboard.lowStockProducts.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{p.name}</h4>
                  <p className="text-[11px] text-slate-400">{p.category?.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="font-bold text-amber-700">Stock: {p.stockQuantity}</span>
                <span className="text-[10px] text-slate-400">Min Alert: {p.lowStockThreshold}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Status Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order: ${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select Fulfillment Stage
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="PLACED">PLACED (Order Received)</option>
              <option value="CONFIRMED">CONFIRMED (Inventory Verified)</option>
              <option value="PREPARING">PREPARING (Staff Packing Items)</option>
              <option value="READY_FOR_PICKUP">READY_FOR_PICKUP (Available at Store Counter)</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (With Delivery Partner)</option>
              <option value="PICKED_UP">PICKED_UP (Customer Collected)</option>
              <option value="DELIVERED">DELIVERED (Doorstep Handover)</option>
              <option value="COMPLETED">COMPLETED (Lifecycle Closed)</option>
              <option value="CANCELLED">CANCELLED (Halt Order)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingStatus}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
            >
              {updatingStatus ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Process Modal */}
      <Modal
        isOpen={!!selectedReturn}
        onClose={() => setSelectedReturn(null)}
        title={`Process Return: ${selectedReturn?.requestNumber}`}
      >
        <form onSubmit={handleProcessReturn} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Decision
            </label>
            <select
              value={returnDecision}
              onChange={(e) => setReturnDecision(e.target.value as ReturnStatus)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
            >
              <option value="APPROVED">APPROVE (Accept return & credit refund)</option>
              <option value="REJECTED">REJECT (Item does not qualify)</option>
              <option value="COMPLETED">COMPLETED (Refund / Exchange Fulfilled)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Staff Verification Notes
            </label>
            <textarea
              rows={3}
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
              placeholder="e.g. Inspected apple bruising. Replacement issued."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedReturn(null)}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processingReturn}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
            >
              {processingReturn ? 'Processing...' : 'Confirm Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
