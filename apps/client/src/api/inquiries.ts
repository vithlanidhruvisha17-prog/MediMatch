import { apiClient } from './client';
import { Inquiry } from '@medimatch/shared';

export const inquiriesApi = {
  getAll: async (): Promise<Inquiry[]> => {
    const res = await apiClient.get<Inquiry[]>('/inquiries');
    return res.data;
  },

  create: async (data: { patientId?: string; patientName?: string; patientPhone?: string; hospitalId?: string; hospitalName?: string; doctorId?: string; doctorName?: string; procedure: string; notes?: string; notifyVia?: string[] }): Promise<Inquiry> => {
    const res = await apiClient.post<Inquiry>('/inquiries', data);
    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<Inquiry> => {
    const res = await apiClient.patch<Inquiry>(`/inquiries/${id}/status`, { status });
    return res.data;
  }
};

