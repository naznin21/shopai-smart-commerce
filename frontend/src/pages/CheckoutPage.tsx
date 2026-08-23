import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { pickupSlotService } from '../services/pickupSlotService';
import { orderService, CheckoutPayload } from '../services/orderService';
import { OrderType, PaymentMethod, PickupSlot } from '../types';
import {
  Store,
  Truck,
  CreditCard,
  Banknote,
  Clock,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form State
  const [orderType, setOrderType] = useState<OrderType>('STORE_PICKUP');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<PickupSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(user?.address || '');
  const [contactPhone, setContactPhone] = useState<string>(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DEMO_ONLINE_PAYMENT');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);

  // Fetch Pickup Slots whenever selectedDate changes
  useEffect(() => {
    if (orderType === 'STORE_PICKUP') {
      setSlotsLoading(true);
      pickupSlotService
        .getSlotsForDate(selectedDate)
        .then((slots) => {
          setAvailableSlots(slots);
          const firstAvail = slots.find((s) => s.isAvailable ?? s.available ?? (s.bookedCount < s.maxCapacity));
          if (firstAvail) setSelectedSlot(firstAvail.timeSlot);
        })
        .catch((err) => console.error('Error fetching slots', err))
        .finally(() => setSlotsLoading(false));
    }
  }, [orderType, selectedDate]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const deliveryFee = orderType === 'STORE_PICKUP' ? 0 : cart?.deliveryFee || 0;
  const finalTotal = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
          <Link to="/shop" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
            Browse Groceries
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderType === 'STORE_PICKUP') {
      if (!selectedSlot) {
        showToast('Please select an available pickup time slot', 'warning');
        return;
      }
    } else {
      if (!deliveryAddress.trim()) {
        showToast('Please enter your complete delivery address', 'warning');
        return;
      }
      if (!contactPhone.trim()) {
        showToast('Please provide a valid contact phone number', 'warning');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload: CheckoutPayload = {
        orderType,
        scheduledDate: orderType === 'STORE_PICKUP' ? selectedDate : undefined,
        scheduledTimeSlot: orderType === 'STORE_PICKUP' ? selectedSlot : undefined,
        deliveryAddress: orderType === 'HOME_DELIVERY' ? deliveryAddress.trim() : undefined,
        contactPhone: contactPhone.trim() || user?.phone,
        paymentMethod,
      };

      const placedOrder = await orderService.checkout(payload);
      await refreshCart();
      showToast(`Order ${placedOrder.orderNumber} confirmed successfully!`, 'success');
      navigate(`/orders/confirmed/${placedOrder.id}`, { state: { order: placedOrder } });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Checkout failed. Please check stock availability.';
      showToast(msg, 'error');
      refreshCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const dateOptions = [
    { label: 'Today', value: today.toISOString().split('T')[0] },
    { label: 'Tomorrow', value: tomorrow.toISOString().split('T')[0] },
    {
      label: dayAfter.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      value: dayAfter.toISOString().split('T')[0],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Order Completion</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Secure Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Select fulfillment option, schedule pickup/delivery, and confirm order</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Fulfillment Type */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mr-2">1</span>
              Choose Fulfillment Option
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOrderType('STORE_PICKUP')}
                className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3.5 ${
                  orderType === 'STORE_PICKUP'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${orderType === 'STORE_PICKUP' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Express Store Pickup</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Ready in 1 hr with guaranteed time slot</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    FREE Pickup (No Delivery Fee)
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('HOME_DELIVERY')}
                className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3.5 ${
                  orderType === 'HOME_DELIVERY'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${orderType === 'HOME_DELIVERY' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Scheduled Home Delivery</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Delivered straight to your doorstep</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {subtotal >= 500 ? 'FREE (Above ₹500)' : 'Standard ₹40'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Scheduling & Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mr-2">2</span>
              {orderType === 'STORE_PICKUP' ? 'Select Pickup Date & Time Slot' : 'Delivery Address & Contact'}
            </h3>

            {orderType === 'STORE_PICKUP' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Pickup Date
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {dateOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedDate(opt.value)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition ${
                          selectedDate === opt.value
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Available Time Slots (Smart Capacity Engine)
                    </label>
                    <span className="text-[11px] text-slate-400 font-semibold">Max 10 orders per slot</span>
                  </div>

                  {slotsLoading ? (
                    <div className="p-8 text-center text-slate-400 text-xs">Loading available capacity...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500 text-center">
                      No slots configured for this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot === slot.timeSlot;
                        const isSlotAvailable = slot.isAvailable ?? slot.available ?? (slot.bookedCount < slot.maxCapacity);
                        const isFull = !isSlotAvailable;

                        return (
                          <button
                            key={slot.timeSlot}
                            type="button"
                            disabled={isFull}
                            onClick={() => setSelectedSlot(slot.timeSlot)}
                            className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                              isFull
                                ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 hover:border-emerald-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <Clock className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                              <div>
                                <h5 className="text-xs font-extrabold text-slate-900">{slot.timeSlot}</h5>
                                <p className={`text-[10px] font-semibold ${isFull ? 'text-rose-600' : 'text-emerald-700'}`}>
                                  {slot.statusText}
                                </p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Street Address & Apartment
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter complete building name, flat number, street and landmark..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mr-2">3</span>
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('DEMO_ONLINE_PAYMENT')}
                className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3.5 ${
                  paymentMethod === 'DEMO_ONLINE_PAYMENT'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${paymentMethod === 'DEMO_ONLINE_PAYMENT' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Demo Online Payment</h4>
                  <p className="text-xs text-slate-500 mt-0.5">UPI / Cards / Net Banking simulation</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Instant Auto-Confirmation
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-4 rounded-2xl border text-left transition flex items-start space-x-3.5 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${paymentMethod === 'CASH_ON_DELIVERY' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {orderType === 'STORE_PICKUP' ? 'Pay at Store Counter' : 'Cash on Delivery'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Pay via Cash / UPI upon receipt</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Pay When Collected
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Confirmation & Live Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">
              Order Summary ({items.length} items)
            </h3>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-50">
              {items.map((i) => (
                <div key={i.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[170px]">
                    <p className="font-bold text-slate-800 truncate">{i.productName}</p>
                    <p className="text-[10px] text-slate-400">Qty: {i.quantity} x ₹{i.unitPrice}</p>
                  </div>
                  <span className="font-extrabold text-slate-900">₹{i.itemTotal}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              {cart && cart.totalSavings > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Special Savings</span>
                  <span>-₹{cart.totalSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Fulfillment Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    `₹${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Final Total</span>
                <span className="text-emerald-700 text-xl">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-extrabold shadow-lg shadow-emerald-200 transition duration-200 text-sm disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Securing Your Order...' : `Place Order (₹${finalTotal.toFixed(2)})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
              Backend validated stock & server-side pricing
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
