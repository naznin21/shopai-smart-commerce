import api from './api';
import { Product } from '../types';

export interface ProductSearchParams {
  keyword?: string;
  categoryId?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  size?: number;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const productService = {
  async search(params: ProductSearchParams): Promise<PageResult<Product>> {
    const res = await api.get<PageResult<Product>>('/products', { params });
    return res.data;
  },

  async getFeatured(): Promise<Product[]> {
    const res = await api.get<Product[]>('/products/featured');
    return res.data;
  },

  async getById(id: number): Promise<Product> {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  },

  async create(data: any): Promise<Product> {
    const res = await api.post<Product>('/products', data);
    return res.data;
  },

  async update(id: number, data: any): Promise<Product> {
    const res = await api.put<Product>(`/products/${id}`, data);
    return res.data;
  },

  async updateStock(id: number, stockQuantity: number): Promise<Product> {
    const res = await api.patch<Product>(`/products/${id}/stock`, { stockQuantity });
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};
