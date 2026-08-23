import React from 'react';
import { StockStatus } from '../types';

interface StockBadgeProps {
  status: StockStatus;
  quantity?: number;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ status, quantity }) => {
  if (status === 'OUT_OF_STOCK') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
        Out of Stock
      </span>
    );
  }

  if (status === 'LOW_STOCK') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        Only {quantity} Left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
      In Stock
    </span>
  );
};
