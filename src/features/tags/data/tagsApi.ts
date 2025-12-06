import { apiClient } from '@/core/network/apiClient';
import { ApiError, ApiResult } from '@/core/types/api';
import type { Tag, CreateTagDto, UpdateTagDto } from '../domain/types';

export const fetchTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<ApiResult<Tag[]>>('/Tags');
  const payload = response.data;

  if (__DEV__) {
    console.log('[Tags API] Response:', JSON.stringify(payload, null, 2));
  }

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Taglar alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const fetchRelatedTags = async (tagName: string): Promise<Tag[]> => {
  const response = await apiClient.get<ApiResult<Tag[]>>(`/Tags/${tagName}/related`);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'İlgili taglar alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const createTag = async (data: CreateTagDto): Promise<Tag> => {
  const response = await apiClient.post<ApiResult<Tag>>('/Tags', data);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Tag oluşturulamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const followTag = async (id: string): Promise<void> => {
  const response = await apiClient.post<ApiResult<string>>(`/Tags/${id}/follow`);
  const payload = response.data;

  if (!payload.isSuccess) {
    throw new ApiError(payload.message ?? 'Tag takip edilemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }
};

export const unfollowTag = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResult<string>>(`/Tags/${id}/follow`);
  const payload = response.data;

  if (!payload.isSuccess) {
    throw new ApiError(payload.message ?? 'Tag takibi bırakılamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }
};

export const fetchFollowedTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<ApiResult<Tag[]>>('/Tags/following');
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Takip edilen taglar alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const updateTag = async (id: string, data: UpdateTagDto): Promise<Tag> => {
  // API expects id in body as well
  const body = { id, ...data };
  const response = await apiClient.put<ApiResult<Tag>>(`/Tags/${id}`, body);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Tag güncellenemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  const response = await apiClient.delete<ApiResult<void>>(`/Tags/${id}`);
  const payload = response.data;

  if (!payload.isSuccess) {
    throw new ApiError(payload.message ?? 'Tag silinemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }
};
