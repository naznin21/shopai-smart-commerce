import api from './api';
import { Order, OrderStatus, OrderType, PaymentMethod } from '../types';

export interface CheckoutPayload {
  orderType: OrderType;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  deliveryAddress?: string;
  contactPhone?: string;
  paymentMethod: PaymentMethod;
}

export const orderService = {
  async checkout(payload: CheckoutPayload): Promise<Order> {
    const res = await api.post<Order>('/orders/checkout', payload);
    return res.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await api.get<Order[]>('/orders');
    return res.data;
  },

  async getById(id: number): Promise<Order> {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  },

  async cancelOrder(id: number, reason: string): Promise<Order> {
    const res = await api.post<Order>(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  async getAllStaffOrders(status?: OrderStatus, orderType?: OrderType): Promise<Order[]> {
    const res = await api.get<Order[]>('/staff/orders', { params: { status, orderType } });
    return res.data;
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const res = await api.patch<Order>(`/staff/orders/${id}/status`, { status });
    return res.data;
  }
};
