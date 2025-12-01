import { apiClient } from '@/core/network/apiClient';
import { ApiError, ApiResult } from '@/core/types/api';

import type { Post, PostsListParams, CreatePostRequest, Comment } from '../domain/types';

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

  if (__DEV__) {
    console.log('[Posts API] Sample post isLiked:', payload.data[0]?.isLikedByCurrentUser, 'for post:', payload.data[0]?.id);
  }

  return payload.data;
};

export const getPostById = async (id: string) => {
  const response = await apiClient.get<ApiResult<Post>>(`${endpoint}/${id}`);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Post detayı alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const createPost = async (data: CreatePostRequest) => {
  const response = await apiClient.post<ApiResult<Post>>(endpoint, data);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Post oluşturulamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const likePost = async (id: string) => {
  const response = await apiClient.post<ApiResult<{ postId: string; isLiked: boolean; totalLikes: number }>>(`${endpoint}/${id}/likes`);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Beğeni işlemi başarısız', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  if (__DEV__) {
    console.log('[Posts API] Like response:', payload.data);
  }

  return payload.data;
};

export const unlikePost = async (id: string) => {
  const response = await apiClient.delete<ApiResult<{ postId: string; isLiked: boolean; totalLikes: number }>>(`${endpoint}/${id}/likes`);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Beğeni kaldırma işlemi başarısız', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const fetchComments = async (postId: string) => {
  const response = await apiClient.get<ApiResult<Comment[]>>(`${endpoint}/${postId}/comments`);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Yorumlar alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const createComment = async ({ postId, content }: { postId: string; content: string }) => {
  const response = await apiClient.post<ApiResult<Comment>>(`${endpoint}/${postId}/comments`, { content });
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Yorum eklenemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const deleteComment = async ({ postId, commentId }: { postId: string; commentId: string }) => {
  const response = await apiClient.delete<ApiResult<string>>(`${endpoint}/${postId}/comments/${commentId}`);
  const payload = response.data;

  if (!payload.isSuccess) {
    throw new ApiError(payload.message ?? 'Yorum silinemedi', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data ?? '';
};

export const fetchFollowedCategoryPosts = async () => {
  if (__DEV__) {
    console.log('[Posts API] Fetching followed category posts...');
  }
  const response = await apiClient.get<ApiResult<Post[]>>(`${endpoint}/feed/categories`);
  const payload = response.data;

  if (__DEV__) {
    console.log('[Posts API] Followed posts response success:', payload.isSuccess, 'Count:', payload.data?.length);
  }

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Takip edilen kategori gönderileri alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const fetchLikedPosts = async () => {
  const response = await apiClient.get<ApiResult<Post[]>>(`${endpoint}/liked`);
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? 'Beğendiğiniz gönderiler alınamadı', {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};
