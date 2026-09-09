import { apiClient } from './client';
import { Doctor } from '@medimatch/shared';

export const doctorsApi = {
  getAll: async (filters?: { specialty?: string; search?: string }): Promise<Doctor[]> => {
    const res = await apiClient.get<Doctor[]>('/doctors', { params: filters });
    return res.data;
  },

  getById: async (id: string): Promise<Doctor> => {
    const res = await apiClient.get<Doctor>(`/doctors/${id}`);
    return res.data;
  },

  create: async (data: Omit<Doctor, 'id'>): Promise<Doctor> => {
    const res = await apiClient.post<Doctor>('/doctors', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Doctor>): Promise<Doctor> => {
    const res = await apiClient.put<Doctor>(`/doctors/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/doctors/${id}`);
  }
};

