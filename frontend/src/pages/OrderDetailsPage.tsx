import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order, ReturnReason } from '../types';
import { orderService } from '../services/orderService';
import { returnService } from '../services/returnService';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { Timeline } from '../components/Timeline';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Store,
  Truck,
  RotateCcw,
  Ban,
} from 'lucide-react';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);

  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [returnReason, setReturnReason] = useState<ReturnReason>('QUALITY_ISSUE');
  const [returnDetails, setReturnDetails] = useState<string>('');
  const [submittingReturn, setSubmittingReturn] = useState<boolean>(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await orderService.getById(Number(id));
      setOrder(data);
    } catch (err) {
      console.error('Error loading order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !cancelReason.trim()) return;

    try {
      setCancelling(true);
      const updated = await orderService.cancelOrder(order.id, cancelReason.trim());
      setOrder(updated);
      setIsCancelModalOpen(false);
      showToast('Order cancelled successfully', 'info');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel order';
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReturnModal = (itemId: number) => {
    setSelectedItemId(itemId);
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !selectedItemId) return;

    try {
      setSubmittingReturn(true);
      await returnService.createRequest({
        orderId: order.id,
        orderItemId: selectedItemId,
        reason: returnReason,
        reasonDetails: returnDetails.trim() || undefined,
      });

      showToast('Return request submitted successfully!', 'success');
      setIsReturnModalOpen(false);
      setReturnDetails('');
      fetchOrder();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit return request';
      showToast(msg, 'error');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/orders" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Header */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{order.orderNumber}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {order.canCancel && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition self-start"
            >
              <Ban className="w-4 h-4" />
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Fulfillment Journey</h3>
        <Timeline
          status={order.status}
          orderType={order.orderType}
          createdAt={order.createdAt}
          deliveredAt={order.deliveredAt}
        />
      </div>

      {/* Grid: Items Table & Fulfillment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Ordered Groceries ({order.items.length})</span>
              {order.returnEligible && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                  {order.returnEligibilityDaysLeft} days left for return/exchange
                </span>
              )}
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                      <img
                        src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{item.productName}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{item.productUnit}</p>
                      <p className="text-xs font-semibold text-slate-600 mt-1">
                        Qty: {item.quantity} × ₹{item.unitPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4">
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{item.totalPrice.toFixed(2)}
                    </span>

                    {order.returnEligible && (
                      <button
                        onClick={() => handleOpenReturnModal(item.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return / Exchange</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fulfillment Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Fulfillment Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Mode</span>
                <p className="font-bold text-slate-800 flex items-center mt-0.5">
                  {order.orderType === 'STORE_PICKUP' ? (
                    <>
                      <Store className="w-4 h-4 mr-1 text-emerald-600" />
                      Express Store Pickup
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 mr-1 text-teal-600" />
                      Home Delivery
                    </>
                  )}
                </p>
              </div>

              {order.orderType === 'STORE_PICKUP' ? (
                <div>
                  <span className="text-slate-400 font-semibold block">Scheduled Window</span>
                  <p className="font-bold text-slate-800 mt-0.5">{order.scheduledTimeSlot}</p>
                  <p className="text-slate-500 text-[11px]">{order.scheduledDate}</p>
                </div>
              ) : (
                <div>
                  <span className="text-slate-400 font-semibold block">Delivery Address</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{order.deliveryAddress}</p>
                  <p className="text-slate-500 text-[11px]">Phone: {order.contactPhone}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-semibold block">Payment</span>
                <p className="font-bold text-slate-800 capitalize mt-0.5">
                  {order.paymentMethod.replace(/_/g, ' ').toLowerCase()} ({order.paymentStatus})
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Price Breakdown
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Special Discount</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Bill</span>
                <span className="text-emerald-700">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order"
      >
        <form onSubmit={handleCancelOrder} className="space-y-4">
          <p className="text-xs text-slate-500">
            Please provide a brief reason for cancelling your order. Reserved items and stock will be immediately restored.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Cancellation Reason
            </label>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind, Ordered duplicate items by mistake..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={cancelling}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Request Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Create Return / Exchange Request"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Mini D-Mart offers 7-day hassle-free returns for damaged, expired, or wrong grocery items.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Reason for Return
            </label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="QUALITY_ISSUE">Quality / Freshness Issue</option>
              <option value="DAMAGED_PRODUCT">Damaged / Leaking Packaging</option>
              <option value="EXPIRED_PRODUCT">Near / Past Expiry Date</option>
              <option value="WRONG_ITEM_DELIVERED">Wrong Item Received</option>
              <option value="MISSING_ITEM">Missing Item in Bag</option>
              <option value="OTHER">Other Reason</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={returnDetails}
              onChange={(e) => setReturnDetails(e.target.value)}
              placeholder="Describe the issue so our staff can verify and resolve quickly..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReturn}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50"
            >
              {submittingReturn ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
