import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Truck,
  ArrowLeft,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const savings = cart?.totalSavings || 0;
  const freeThreshold = cart?.freeDeliveryThreshold || 500;
  const neededForFree = cart?.amountNeededForFreeDelivery || 0;
  const freeUnlocked = cart?.freeDeliveryUnlocked || false;
  const deliveryFee = cart?.deliveryFee || 0;
  const finalTotal = cart?.finalTotal || 0;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You haven't added any fresh groceries to your cart yet. Explore our pantry aisles for daily staples!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-200 transition"
        >
          <span>Explore Groceries</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link to="/shop" className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Shopping Cart ({items.length} items)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Delivery Meter */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-xs">
            <div className="flex items-center justify-between font-bold mb-2">
              <span className="flex items-center text-emerald-800">
                <Truck className="w-4 h-4 mr-1.5 text-emerald-600" />
                {freeUnlocked ? 'Free Home Delivery Unlocked! 🎉' : `Add ₹${neededForFree.toFixed(0)} more for FREE Delivery`}
              </span>
              <span className="text-emerald-700">₹{subtotal.toFixed(0)} / ₹{freeThreshold}</span>
            </div>
            <div className="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                    <img
                      src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{item.productName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{item.productUnit}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-extrabold text-slate-900 text-sm">₹{item.unitPrice}</span>
                      {item.originalPrice > item.unitPrice && (
                        <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                  {/* Quantity */}
                  <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      disabled={isLoading}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-xl hover:bg-white text-slate-600 transition"
                    >
                      {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-rose-500" /> : <Minus className="w-4 h-4" />}
                    </button>
                    <span className="text-xs font-bold text-slate-900 w-6 text-center">{item.quantity}</span>
                    <button
                      disabled={isLoading || item.quantity >= item.availableStock}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-xl hover:bg-white text-slate-600 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-black text-slate-900 text-base min-w-[70px] text-right">
                    ₹{item.itemTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span className="flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Discount Savings
                  </span>
                  <span>-₹{savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {freeUnlocked ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    `₹${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Estimated Total</span>
                <span className="text-emerald-700 text-xl">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center space-x-2 py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition duration-200 text-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
