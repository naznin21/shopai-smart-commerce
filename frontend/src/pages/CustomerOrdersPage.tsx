import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order, ReturnExchangeRequest } from '../types';
import { orderService } from '../services/orderService';
import { returnService } from '../services/returnService';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import {
  ShoppingBag,
  RotateCcw,
  ArrowRight,
  Store,
  Truck,
} from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnExchangeRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'returns'>('orders');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [orderList, returnList] = await Promise.all([
          orderService.getMyOrders(),
          returnService.getMyRequests(),
        ]);
        setOrders(orderList);
        setReturns(returnList);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Customer Portal</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">My Orders & Returns</h1>
        <p className="text-xs text-slate-500 mt-1">Track in-flight deliveries, view past receipts, and manage returns</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-8 text-sm font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3.5 flex items-center space-x-2 transition ${
            activeTab === 'orders'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders History ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3.5 flex items-center space-x-2 transition ${
            activeTab === 'returns'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Return & Exchange Requests ({returns.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl h-36 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : activeTab === 'orders' ? (
        orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No orders yet</h3>
            <p className="text-xs text-slate-500">You haven't placed any grocery orders with Mini D-Mart.</p>
            <Link
              to="/shop"
              className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-slate-900 text-base">{o.orderNumber}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(o.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Items Preview */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">{(o.items || []).length} Item(s):</p>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {(o.items || []).map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </p>
                  </div>

                  {/* Fulfillment mode */}
                  <div className="text-xs text-slate-600 flex items-center space-x-2">
                    {o.orderType === 'STORE_PICKUP' ? (
                      <>
                        <Store className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Pickup: {o.scheduledTimeSlot} ({o.scheduledDate})</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">Delivery: {o.deliveryAddress}</span>
                      </>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between md:justify-end space-x-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                      <span className="text-base font-extrabold text-emerald-700">₹{o.totalAmount.toFixed(2)}</span>
                    </div>

                    <Link
                      to={`/orders/${o.id}`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-xl text-xs font-bold transition"
                    >
                      <span>Track & Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Returns Tab */
        returns.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3 max-w-md mx-auto">
            <RotateCcw className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Return or Exchange Requests</h3>
            <p className="text-xs text-slate-500">
              Delivered grocery items can be requested for return or replacement within 7 days.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((ret) => (
              <div
                key={ret.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-slate-900 text-sm">{ret.requestNumber}</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        ret.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : ret.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : ret.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {ret.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Order: <Link to={`/orders/${ret.orderId}`} className="text-emerald-600 font-bold hover:underline">{ret.orderNumber}</Link>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block">Item:</span>
                    <p className="text-slate-600 font-semibold">{ret.productName}</p>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{ret.requestType}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Reason:</span>
                    <p className="text-slate-600 capitalize">{ret.reason.replace(/_/g, ' ').toLowerCase()}</p>
                    {ret.reasonDetails && <p className="text-slate-500 italic mt-0.5">"{ret.reasonDetails}"</p>}
                  </div>
                  {ret.replacementProductName && (
                    <div>
                      <span className="font-bold text-slate-700 block">Replacement Item:</span>
                      <p className="text-emerald-700 font-semibold">{ret.replacementProductName}</p>
                    </div>
                  )}
                </div>

                {ret.adminNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100">
                    <strong>Staff Note:</strong> {ret.adminNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
