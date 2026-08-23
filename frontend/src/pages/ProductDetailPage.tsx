import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { StockBadge } from '../components/StockBadge';
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  Store,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToCart, isLoading: cartLoading } = useCart();

  useEffect(() => {
    if (id) {
      setLoading(true);
      productService
        .getById(Number(id))
        .then(setProduct)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500">The grocery product you are looking for does not exist or was removed.</p>
        <Link to="/shop" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/shop"
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Grocery Catalog</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Product Image */}
        <div className="md:col-span-6 relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.discountPercentage && product.discountPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-md">
              {product.discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                {product.category?.name}
              </span>
              <StockBadge status={product.stockStatus} quantity={product.stockQuantity} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <p className="text-xs font-semibold text-slate-400">Unit: {product.unit}</p>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline space-x-3">
              <span className="text-3xl font-black text-slate-900">₹{product.effectivePrice}</span>
              {product.discountPrice && product.discountPrice < product.price && (
                <>
                  <span className="text-sm font-semibold text-slate-400 line-through">₹{product.price}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Save ₹{product.price - product.effectivePrice}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {product.description}
            </p>
          </div>

          {/* Add to Cart Controls */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= product.stockQuantity}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock || cartLoading}
                onClick={() => addToCart(product.id, quantity)}
                className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition duration-200 text-xs disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Cart • ₹${product.effectivePrice * quantity}`}</span>
              </button>
            </div>

            {/* Delivery / Store Pickup assurances */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Store Pickup in 1 Hr</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Doorstep Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>7-Day Easy Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Freshness Assured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
