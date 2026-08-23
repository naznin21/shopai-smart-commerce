import api from './api';
import { PickupSlot } from '../types';

export const pickupSlotService = {
  async getSlotsForDate(date: string): Promise<PickupSlot[]> {
    const res = await api.get<PickupSlot[]>(`/pickup-slots/date/${date}`);
    return res.data;
  },

  async getUpcomingDays(days: number = 5): Promise<Record<string, PickupSlot[]>> {
    const res = await api.get<Record<string, PickupSlot[]>>(`/pickup-slots/upcoming`, {
      params: { days }
    });
    return res.data;
  }
};
