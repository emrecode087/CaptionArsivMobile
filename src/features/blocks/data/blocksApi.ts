import { apiClient } from '@/core/network/apiClient';
import type { ApiResult } from '@/core/types/api';

export const blocksApi = {
  getBlocks: async () => {
    const response = await apiClient.get<ApiResult<{
      users: { id: string; userName: string; profileImageUrl?: string | null }[];
      categories: { id: string; name: string }[];
      tags: string[];
    }>>('/Blocks');
    return response.data;
  },
  blockUser: async (targetId: string) => {
    const response = await apiClient.post<ApiResult<string>>(`/Blocks/users/${targetId}`);
    return response.data;
  },
  unblockUser: async (targetId: string) => {
    const response = await apiClient.delete<ApiResult<string>>(`/Blocks/users/${targetId}`);
    return response.data;
  },
  blockTag: async (tag: string) => {
    const response = await apiClient.post<ApiResult<string>>('/Blocks/tags', tag, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
  unblockTag: async (tag: string) => {
    const response = await apiClient.delete<ApiResult<string>>('/Blocks/tags', {
      params: { tag },
    });
    return response.data;
  },
  blockCategory: async (categoryId: string) => {
    const response = await apiClient.post<ApiResult<string>>(`/Blocks/categories/${categoryId}`);
    return response.data;
  },
  unblockCategory: async (categoryId: string) => {
    const response = await apiClient.delete<ApiResult<string>>(`/Blocks/categories/${categoryId}`);
    return response.data;
  },
};
