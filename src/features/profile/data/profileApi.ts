import { apiClient } from '@/core/network/apiClient';
import { ApiError, type ApiResult } from '@/core/types/api';
import type { UserDto } from '@/features/auth/domain/types';

const parseUserResponse = (response: { data: ApiResult<UserDto>; status: number }, fallback: string) => {
  const payload = response.data;

  if (!payload.isSuccess || !payload.data) {
    throw new ApiError(payload.message ?? fallback, {
      status: response.status,
      errors: payload.errors ?? null,
    });
  }

  return payload.data;
};

export const profileApi = {
  updateUser: async (userId: string, data: Partial<UserDto>) => {
    const response = await apiClient.put<ApiResult<UserDto>>(`/Users/${userId}`, data);
    return parseUserResponse(response, 'Profil guncellenemedi');
  },

  uploadProfilePhoto: async (file: { uri: string; name?: string; type?: string }) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name ?? 'profile.jpg',
      type: file.type ?? 'image/jpeg',
    } as any);

    const response = await apiClient.put<ApiResult<UserDto>>('/Media/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return parseUserResponse(response, 'Profil fotografi yuklenemedi');
  },

  deleteProfilePhoto: async () => {
    const response = await apiClient.delete<ApiResult<UserDto>>('/Media/profile-photo');
    return parseUserResponse(response, 'Profil fotografi silinemedi');
  },

  changePassword: async (userId: string, password: string) => {
    const response = await apiClient.put<ApiResult<UserDto>>(`/Users/${userId}`, { password });
    return parseUserResponse(response, 'Sifre guncellenemedi');
  },

  sendFeedback: async (data: { message: string; contact: string }) => {
    const response = await apiClient.post<ApiResult<string>>('/Feedback', data);
    
    if (!response.data.isSuccess) {
      throw new ApiError(response.data.message ?? 'Geri bildirim gonderilemedi', {
        status: response.status,
        errors: response.data.errors ?? null,
      });
    }
    
    return response.data.data;
  },
  
  deleteMyAccount: async () => {
    const response = await apiClient.delete<ApiResult<string>>('/Users/me');
    const payload = response.data;

    if (!payload.isSuccess) {
      throw new ApiError(payload.message ?? 'Hesap silinemedi', {
        status: response.status,
        errors: payload.errors ?? null,
      });
    }

    return payload.data ?? 'Hesabin silindi';
  },
};
