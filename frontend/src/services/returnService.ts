import api from './api';
import { RequestType, ReturnExchangeRequest, ReturnReason, ReturnStatus } from '../types';

export const returnService = {
  async createRequest(data: {
    orderId: string;
    orderItemId: string;
    requestType?: RequestType;
    reason: ReturnReason;
    reasonDetails?: string;
    replacementProductId?: string;
  }): Promise<ReturnExchangeRequest> {
    const res = await api.post<ReturnExchangeRequest>('/returns', data);
    return res.data;
  },

  async getMyRequests(): Promise<ReturnExchangeRequest[]> {
    const res = await api.get<ReturnExchangeRequest[]>('/returns');
    return res.data;
  },

  async getById(id: string): Promise<ReturnExchangeRequest> {
    const res = await api.get<ReturnExchangeRequest>(`/returns/${id}`);
    return res.data;
  },

  async getAllStaffRequests(status?: ReturnStatus): Promise<ReturnExchangeRequest[]> {
    const res = await api.get<ReturnExchangeRequest[]>('/staff/returns', { params: { status } });
    return res.data;
  },

  async processRequest(id: string, data: { status: ReturnStatus; adminNotes?: string; restockInventory?: boolean }): Promise<ReturnExchangeRequest> {
    const res = await api.patch<ReturnExchangeRequest>(`/staff/returns/${id}/process`, data);
    return res.data;
  }
};
