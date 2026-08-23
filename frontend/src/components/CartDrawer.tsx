import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  Truck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, closeCart, updateQuantity, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const savings = cart?.totalSavings || 0;
  const freeThreshold = cart?.freeDeliveryThreshold || 500;
  const neededForFree = cart?.amountNeededForFreeDelivery || 0;
  const freeUnlocked = cart?.freeDeliveryUnlocked || false;
  const deliveryFee = cart?.deliveryFee || 0;
  const finalTotal = cart?.finalTotal || 0;

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Shopping Cart</h3>
              <p className="text-[11px] text-slate-400 font-medium">{items.length} items added</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Meter Banner */}
        {items.length > 0 && (
          <div className="bg-emerald-50/80 p-3.5 border-b border-emerald-100/60 text-xs">
            <div className="flex items-center justify-between font-bold mb-1.5">
              <span className="flex items-center text-emerald-800">
                <Truck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {freeUnlocked ? 'Free Home Delivery Unlocked! 🎉' : `Add ₹${neededForFree.toFixed(0)} more for FREE Delivery`}
              </span>
              <span className="text-[10px] text-emerald-600">{subtotal.toFixed(0)} / ₹{freeThreshold}</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Your cart is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Explore fresh fruits, daily dairy, crisp snacks and essentials to start saving!
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                Shop Now
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex space-x-3.5 items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-xs truncate">{item.productName}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{item.productUnit}</p>

                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-extrabold text-slate-900 text-xs">₹{item.unitPrice}</span>
                    {item.originalPrice > item.unitPrice && (
                      <span className="text-[10px] text-slate-400 line-through">₹{item.originalPrice}</span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    disabled={isLoading}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-white text-slate-600 transition disabled:opacity-50"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-xs font-bold text-slate-800 w-5 text-center">{item.quantity}</span>

                  <button
                    disabled={isLoading || item.quantity >= item.availableStock}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-lg hover:bg-white text-slate-600 transition disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span className="flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Special Savings
                  </span>
                  <span>-₹{savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Delivery Fee</span>
                <span>
                  {freeUnlocked ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    `₹${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-emerald-700 text-base">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition duration-200 text-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
