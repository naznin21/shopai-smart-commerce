import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { Timeline } from '../components/Timeline';
import {
  CheckCircle2,
  Store,
  Truck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);
  const [loading, setLoading] = useState<boolean>(!order);

  useEffect(() => {
    if (!order && id) {
      setLoading(true);
      orderService
        .getById(id)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500">Could not find details for this order reference.</p>
        <Link to="/dashboard" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Badge Banner */}
      <div className="bg-emerald-600 rounded-3xl p-8 sm:p-10 text-white text-center space-y-3 shadow-xl shadow-emerald-900/20">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <span className="bg-emerald-500/40 text-emerald-100 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-white/20">
          Order Successfully Placed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold">Thank you for your order!</h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 max-w-md mx-auto">
          We've received your grocery order <strong className="text-white underline">{order.orderNumber}</strong> and our team is already getting it ready.
        </p>
      </div>

      {/* Live Order Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Live Order Status</h3>
            <p className="text-xs text-slate-500">Track your order fulfillment progress</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <Timeline
          status={order.status}
          orderType={order.orderType}
          createdAt={order.createdAt}
          deliveredAt={order.deliveredAt}
        />
      </div>

      {/* Fulfillment Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">
          Fulfillment & Receipt Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400">Mode</span>
            <p className="font-extrabold text-slate-800 text-sm flex items-center">
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
            {order.orderType === 'STORE_PICKUP' ? (
              <p className="text-slate-500">Slot: {order.scheduledTimeSlot} on {order.scheduledDate}</p>
            ) : (
              <p className="text-slate-500">Address: {order.deliveryAddress}</p>
            )}
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400">Payment</span>
            <p className="font-extrabold text-slate-800 text-sm capitalize">
              {order.paymentMethod.replace(/_/g, ' ').toLowerCase()}
            </p>
            <p className="text-slate-500">Status: <strong className="text-emerald-700 uppercase">{order.paymentStatus}</strong></p>
            <p className="text-xs font-bold text-slate-900">Total Paid: ₹{order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <Link
            to="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View All My Orders</span>
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-200 transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
