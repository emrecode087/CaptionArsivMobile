import { apiClient } from '@/core/network/apiClient';
import { ApiError, ApiResult } from '@/core/types/api';

import type { Post, PostsListParams } from '../domain/types';

const endpoint = '/posts';

export const fetchPosts = async (params?: PostsListParams) => {
  const response = await apiClient.get<ApiResult<Post[]>>(endpoint, { params });
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Post listesi alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};
