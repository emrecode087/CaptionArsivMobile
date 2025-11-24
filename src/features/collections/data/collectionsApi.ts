import { apiClient } from '../../../core/network/apiClient';
import { ApiResult } from '../../../core/types/api';
import {
  Collection,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  AddPostToCollectionRequest,
} from '../domain/types';

const BASE_URL = '/Collections';

export const collectionsApi = {
  getPublicCollections: async (params?: {
    search?: string;
    ownerId?: string;
    includePosts?: boolean;
  }): Promise<ApiResult<Collection[]>> => {
    const response = await apiClient.get(`${BASE_URL}/public`, { params });
    return response.data;
  },

  getUserCollections: async (
    userId: string,
    params?: {
      includePrivate?: boolean;
      includePosts?: boolean;
    }
  ): Promise<ApiResult<Collection[]>> => {
    const response = await apiClient.get(`${BASE_URL}/user/${userId}`, { params });
    return response.data;
  },

  getMyCollections: async (params?: {
    includePosts?: boolean;
  }): Promise<ApiResult<Collection[]>> => {
    const response = await apiClient.get(BASE_URL, { params });
    return response.data;
  },

  createCollection: async (
    data: CreateCollectionRequest
  ): Promise<ApiResult<Collection>> => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  getCollectionById: async (
    id: string,
    params?: { includePosts?: boolean }
  ): Promise<ApiResult<Collection>> => {
    const response = await apiClient.get(`${BASE_URL}/${id}`, { params });
    return response.data;
  },

  updateCollection: async (
    id: string,
    data: UpdateCollectionRequest
  ): Promise<ApiResult<Collection>> => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  deleteCollection: async (
    id: string,
    hardDelete: boolean = false
  ): Promise<ApiResult<string>> => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`, {
      params: { hardDelete },
    });
    return response.data;
  },

  addPostToCollection: async (
    id: string,
    data: AddPostToCollectionRequest
  ): Promise<ApiResult<Collection>> => {
    const response = await apiClient.post(`${BASE_URL}/${id}/posts`, data);
    return response.data;
  },

  removePostFromCollection: async (
    id: string,
    postId: string
  ): Promise<ApiResult<Collection>> => {
    const response = await apiClient.delete(`${BASE_URL}/${id}/posts/${postId}`);
    return response.data;
  },

  likeCollection: async (id: string): Promise<ApiResult<void>> => {
    const response = await apiClient.post(`${BASE_URL}/${id}/like`);
    return response.data;
  },

  unlikeCollection: async (id: string): Promise<ApiResult<void>> => {
    const response = await apiClient.delete(`${BASE_URL}/${id}/like`);
    return response.data;
  },
};
