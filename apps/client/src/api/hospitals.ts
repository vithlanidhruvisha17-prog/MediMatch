import { apiClient } from './client';
import { Hospital } from '@medimatch/shared';

export const hospitalsApi = {
  getAll: async (filters?: { city?: string; search?: string; accreditation?: string }): Promise<Hospital[]> => {
    const res = await apiClient.get<Hospital[]>('/hospitals', { params: filters });
    return res.data;
  },

  getById: async (id: string): Promise<Hospital> => {
    const res = await apiClient.get<Hospital>(`/hospitals/${id}`);
    return res.data;
  },

  create: async (data: Omit<Hospital, 'id'>): Promise<Hospital> => {
    const res = await apiClient.post<Hospital>('/hospitals', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Hospital>): Promise<Hospital> => {
    const res = await apiClient.put<Hospital>(`/hospitals/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/hospitals/${id}`);
  }
};

