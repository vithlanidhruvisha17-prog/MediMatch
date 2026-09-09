import { apiClient } from './client';
import { AIProviderConfig } from '@medimatch/shared';

export const aiConfigApi = {
  get: async (): Promise<AIProviderConfig> => {
    const res = await apiClient.get<AIProviderConfig>('/ai-config');
    return res.data;
  },

  update: async (data: { provider?: string; apiKey?: string; modelName?: string; systemPrompt?: string }): Promise<AIProviderConfig> => {
    const res = await apiClient.put<AIProviderConfig>('/ai-config', data);
    return res.data;
  },

  executeSandbox: async (query: string): Promise<{ success: boolean; response: string; latencyMs: number; provider: string; model: string }> => {
    const res = await apiClient.post('/ai/sandbox', { query });
    return res.data;
  },

  chatAssistant: async (messages: Array<{ role: string; content: string }>, query: string): Promise<{ reply: string }> => {
    const res = await apiClient.post('/chat', { messages, query });
    return res.data;
  }
};

