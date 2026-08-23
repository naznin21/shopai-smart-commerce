import api from './api';
import { CustomerDashboard, ManagerAdminDashboard, StaffDashboard } from '../types';

export const dashboardService = {
  async getCustomerDashboard(): Promise<CustomerDashboard> {
    const res = await api.get<CustomerDashboard>('/dashboard/customer');
    return res.data;
  },

  async getStaffDashboard(): Promise<StaffDashboard> {
    const res = await api.get<StaffDashboard>('/dashboard/staff');
    return res.data;
  },

  async getManagerAdminDashboard(): Promise<ManagerAdminDashboard> {
    const res = await api.get<ManagerAdminDashboard>('/dashboard/admin');
    return res.data;
  }
};
