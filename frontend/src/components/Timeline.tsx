import React from 'react';
import { OrderStatus, OrderType } from '../types';
import { Check, Clock, PackageCheck, Truck, Store, X } from 'lucide-react';

interface TimelineProps {
  status: OrderStatus;
  orderType: OrderType;
  createdAt: string;
  deliveredAt?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  status,
  orderType,
}) => {
  const isCancelled = status === 'CANCELLED';

  const pickupSteps = [
    { key: 'PLACED', label: 'Order Placed', icon: Clock },
    { key: 'PREPARING', label: 'Packing Items', icon: PackageCheck },
    { key: 'READY_FOR_PICKUP', label: 'Ready at Store Counter', icon: Store },
    { key: 'PICKED_UP', label: 'Order Collected', icon: Check },
  ];

  const deliverySteps = [
    { key: 'PLACED', label: 'Order Placed', icon: Clock },
    { key: 'PREPARING', label: 'Packing Items', icon: PackageCheck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered to Doorstep', icon: Check },
  ];

  const steps = orderType === 'STORE_PICKUP' ? pickupSteps : deliverySteps;

  const getStepStatus = (stepKey: string) => {
    if (isCancelled) return 'cancelled';

    const orderStatusHierarchy: Record<string, number> = {
      PLACED: 1,
      CONFIRMED: 1,
      PREPARING: 2,
      READY_FOR_PICKUP: 3,
      OUT_FOR_DELIVERY: 3,
      DELIVERED: 4,
      PICKED_UP: 4,
      COMPLETED: 4,
    };

    const currentLevel = orderStatusHierarchy[status] || 1;
    const stepLevel = orderStatusHierarchy[stepKey] || 1;

    if (currentLevel > stepLevel) return 'completed';
    if (currentLevel === stepLevel) return 'current';
    return 'upcoming';
  };

  if (isCancelled) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800">
        <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center font-bold">
          <X className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs">Order Cancelled</h4>
          <p className="text-[11px] text-rose-600">This order has been cancelled and refunded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const stepState = getStepStatus(step.key);
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  stepState === 'completed'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : stepState === 'current'
                    ? 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Step {idx + 1}</span>
                <h5
                  className={`text-xs font-bold ${
                    stepState === 'current'
                      ? 'text-emerald-700'
                      : stepState === 'completed'
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </h5>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
