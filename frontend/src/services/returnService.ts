import api from './api';
import { ReturnExchangeRequest, ReturnReason, ReturnStatus } from '../types';

export const returnService = {
  async createRequest(data: { orderId: number; orderItemId: number; reason: ReturnReason; reasonDetails?: string }): Promise<ReturnExchangeRequest> {
    const res = await api.post<ReturnExchangeRequest>('/returns', data);
    return res.data;
  },

  async getMyRequests(): Promise<ReturnExchangeRequest[]> {
    const res = await api.get<ReturnExchangeRequest[]>('/returns');
    return res.data;
  },

  async getAllStaffRequests(status?: ReturnStatus): Promise<ReturnExchangeRequest[]> {
    const res = await api.get<ReturnExchangeRequest[]>('/staff/returns', { params: { status } });
    return res.data;
  },

  async processRequest(id: number, data: { status: ReturnStatus; adminNotes?: string }): Promise<ReturnExchangeRequest> {
    const res = await api.patch<ReturnExchangeRequest>(`/staff/returns/${id}/process`, data);
    return res.data;
  }
};
