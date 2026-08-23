import React from 'react';
import { Product } from '../types';
import { StockBadge } from './StockBadge';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoading } = useCart();
  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product.id, 1);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Discount Badge */}
      {product.discountPercentage && product.discountPercentage > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
          {product.discountPercentage}% OFF
        </div>
      )}

      {/* Image container */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <StockBadge status={product.stockStatus} quantity={product.stockQuantity} />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
            {product.category?.name}
          </span>
          <Link
            to={`/products/${product.id}`}
            className="font-bold text-slate-800 hover:text-emerald-600 transition-colors line-clamp-1 text-base"
          >
            {product.name}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{product.unit}</p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-extrabold text-slate-900">
                ₹{product.effectivePrice}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>
            {product.discountPrice && (
              <span className="text-[10px] text-emerald-600 font-semibold">
                Save ₹{product.price - product.effectivePrice}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || isLoading}
            className={`flex items-center justify-center p-2.5 rounded-xl font-semibold transition-all duration-200 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white active:scale-95 shadow-sm'
            }`}
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
