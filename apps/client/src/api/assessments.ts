import { apiClient } from './client';
import { CreateAssessmentPayload, AssessmentResponse, Assessment } from '@medimatch/shared';

export const assessmentsApi = {
  create: async (payload: CreateAssessmentPayload): Promise<AssessmentResponse> => {
    const res = await apiClient.post<AssessmentResponse>('/assessments', payload);
    return res.data;
  },

  getAll: async (): Promise<Assessment[]> => {
    const res = await apiClient.get<Assessment[]>('/assessments');
    return res.data;
  },

  getById: async (id: string): Promise<Assessment> => {
    const res = await apiClient.get<Assessment>(`/assessments/${id}`);
    return res.data;
  }
};

