import { apiClient } from '@/core/network/apiClient';
import { ApiError, ApiResult } from '@/core/types/api';
import type {
  Category,
  CategoryListParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryFollowStatus,
} from '../domain/types';
import { sortCategories } from '../domain/sortCategories';

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

  return sortCategories(payload.data);
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
  const response = await apiClient.post<ApiResult<Category>>(endpoint, data);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Kategori oluşturulamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryRequest) => {
  const response = await apiClient.put<ApiResult<Category>>(`${endpoint}/${id}`, data);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Kategori güncellenemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const uploadCategoryIcon = async (categoryId: string, file: { uri: string; name?: string; type?: string }) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name ?? 'category-icon.jpg',
    type: file.type ?? 'image/jpeg',
  } as any);

  const request = async (path: string, method: 'post' | 'put') => {
    const response =
      method === 'post'
        ? await apiClient.post<ApiResult<Category>>(path, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : await apiClient.put<ApiResult<Category>>(path, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

    const payload = response.data;
    if (!payload.isSuccess || !payload.data) {
      throw new ApiError(payload.message ?? 'Kategori ikonu yüklenemedi', {
        status: response.status,
        errors: payload.errors ?? null,
      });
    }
    return payload.data;
  };

  try {
    // Primary route (doc): /media/categories/{id}/icon
    return await request(`/Media/categories/${categoryId}/icon`, 'post');
  } catch (error: any) {
    const status = error?.response?.status;
    const shouldFallback = status === 404 || status === 405;
    if (!shouldFallback) {
      throw error;
    }
  }

  // Alias route: /categories/{id}/icon
  return request(`/Categories/${categoryId}/icon`, 'put');
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

export const followCategory = async (id: string) => {
  const response = await apiClient.post<ApiResult<CategoryFollowStatus>>(`${endpoint}/${id}/follow`);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Kategori takip edilemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const unfollowCategory = async (id: string) => {
  const response = await apiClient.delete<ApiResult<CategoryFollowStatus>>(`${endpoint}/${id}/follow`);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Kategori takibi bırakılamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const reorderCategories = async (categoryIds: string[]) => {
  const response = await apiClient.post<ApiResult<Category[]>>(`${endpoint}/reorder`, { categoryIds });
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Kategori sıralaması güncellenemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return sortCategories(payload.data);
};
