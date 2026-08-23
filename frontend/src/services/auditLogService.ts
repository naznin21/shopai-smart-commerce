import api from './api';
import { AuditLog } from '../types';

export const auditLogService = {
  async getRecent(limit: number = 20): Promise<AuditLog[]> {
    const res = await api.get<AuditLog[]>('/admin/audit-logs', { params: { limit } });
    return res.data;
  }
};
