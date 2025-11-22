import { apiClient } from '@/core/network/apiClient';
import { ApiError, ApiResult } from '@/core/types/api';
import type { Category, CategoryListParams, CreateCategoryRequest, UpdateCategoryRequest } from '../domain/types';

const endpoint = '/Categories';

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

export const getCategoryById = async (id: string) => {
  const response = await apiClient.get<ApiResult<Category>>(`${endpoint}/${id}`);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Kategori detayları alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const createCategory = async (data: CreateCategoryRequest) => {
  const response = await apiClient.post<ApiResult<string>>(endpoint, data);
  const payload = response.data;

  if (!payload.isSuccess) {
    throw new ApiError(payload.message ?? 'Kategori oluşturulamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data ?? '';
};

export const updateCategory = async (id: string, data: UpdateCategoryRequest) => {
  const response = await apiClient.put<ApiResult<string>>(`${endpoint}`, { ...data, id });
  const payload = response.data;

  if (!payload.isSuccess) {
    throw new ApiError(payload.message ?? 'Kategori güncellenemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data ?? '';
};

export const deleteCategory = async (id: string) => {
  const response = await apiClient.delete<ApiResult<string>>(`${endpoint}/${id}`);
  const payload = response.data;

  if (!payload.isSuccess) {
    throw new ApiError(payload.message ?? 'Kategori silinemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data ?? '';
};
