import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string; address?: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>('/users/me');
    return res.data;
  },

  async updateMe(data: { name: string; phone?: string; address?: string; currentPassword?: string; newPassword?: string }): Promise<User> {
    const res = await api.put<User>('/users/me', data);
    return res.data;
  }
};
