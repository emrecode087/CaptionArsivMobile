import { apiClient } from '@/core/network/apiClient';
import type { ApiResult } from '@/core/types/api';

export const blocksApi = {
  blockUser: async (targetId: string) => {
    const response = await apiClient.post<ApiResult<string>>(`/blocks/users/${targetId}`);
    return response.data;
  },
  unblockUser: async (targetId: string) => {
    const response = await apiClient.delete<ApiResult<string>>(`/blocks/users/${targetId}`);
    return response.data;
  },
  blockTag: async (tag: string) => {
    const response = await apiClient.post<ApiResult<string>>('/blocks/tags', tag, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
  unblockTag: async (tag: string) => {
    const response = await apiClient.delete<ApiResult<string>>('/blocks/tags', {
      params: { tag },
    });
    return response.data;
  },
  blockCategory: async (categoryId: string) => {
    const response = await apiClient.post<ApiResult<string>>(`/blocks/categories/${categoryId}`);
    return response.data;
  },
  unblockCategory: async (categoryId: string) => {
    const response = await apiClient.delete<ApiResult<string>>(`/blocks/categories/${categoryId}`);
    return response.data;
  },
};
