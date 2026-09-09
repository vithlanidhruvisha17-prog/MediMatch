import { apiClient } from './client';

export const seedApi = {
  getStats: async () => {
    const res = await apiClient.get('/seed/stats');
    return res.data;
  },

  triggerSeed: async (): Promise<{ success: boolean; counts: any; logs: string[] }> => {
    const res = await apiClient.post('/seed/trigger');
    return res.data;
  }
};

