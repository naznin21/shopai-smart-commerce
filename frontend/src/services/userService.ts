import api from './api';
import { Role, User } from '../types';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const res = await api.get<User[]>('/users');
    return res.data;
  },

  async updateUserRole(id: string, role: Role): Promise<User> {
    const res = await api.patch<User>(`/users/${id}/role`, { role });
    return res.data;
  },

  async toggleStatus(id: string): Promise<User> {
    const res = await api.patch<User>(`/users/${id}/toggle-status`);
    return res.data;
  },

  async toggleUserStatus(id: string): Promise<User> {
    const res = await api.patch<User>(`/users/${id}/toggle-status`);
    return res.data;
  }
};
