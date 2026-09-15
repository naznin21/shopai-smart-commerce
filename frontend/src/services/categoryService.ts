import api from './api';
import { Category } from '../types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },

  async getActive(): Promise<Category[]> {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },

  async create(data: { name: string; description?: string; imageUrl?: string }): Promise<Category> {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  },

  async update(id: string, data: { name: string; description?: string; imageUrl?: string; active?: boolean }): Promise<Category> {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};
