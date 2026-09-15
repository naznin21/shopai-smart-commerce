import api from './api';
import {
  AiChatRequest,
  AiChatResponse,
  AiSearchRequest,
  AiSearchResponse,
  AiRecommendationResponse,
  AiDescriptionRequest,
  AiDescriptionResponse,
} from '../types';

export const aiService = {
  async chat(payload: AiChatRequest): Promise<AiChatResponse> {
    const res = await api.post<AiChatResponse>('/ai/chat', payload);
    return res.data;
  },

  async search(query: string): Promise<AiSearchResponse> {
    const res = await api.post<AiSearchResponse>('/ai/search', { query } as AiSearchRequest);
    return res.data;
  },

  async getRecommendations(params?: { productId?: string; categoryId?: string }): Promise<AiRecommendationResponse> {
    const res = await api.post<AiRecommendationResponse>('/ai/recommendations', null, { params });
    return res.data;
  },

  async generateProductDescription(payload: AiDescriptionRequest): Promise<AiDescriptionResponse> {
    const res = await api.post<AiDescriptionResponse>('/ai/generate-description', payload);
    return res.data;
  }
};
