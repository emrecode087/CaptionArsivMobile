import { apiClient } from '@/core/network/apiClient';
import { ApiError, ApiResult } from '@/core/types/api';
import type { Category, CategoryListParams } from '../domain/types';

const endpoint = '/categories';

export const fetchCategories = async (params?: CategoryListParams) => {
  const response = await apiClient.get<ApiResult<Category[]>>(endpoint, { params });
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Kategori listesi alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};
