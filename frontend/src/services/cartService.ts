import api from './api';
import { Cart } from '../types';

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await api.get<Cart>('/cart');
    return res.data;
  },

  async addToCart(productId: number, quantity: number = 1): Promise<Cart> {
    const res = await api.post<Cart>('/cart/items', { productId, quantity });
    return res.data;
  },

  async updateItemQuantity(itemId: number, quantity: number): Promise<Cart> {
    const res = await api.put<Cart>(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  async removeItem(itemId: number): Promise<Cart> {
    const res = await api.delete<Cart>(`/cart/items/${itemId}`);
    return res.data;
  }
};
