import { apiClient } from '@/core/network/apiClient';
import type { ApiResult } from '@/core/types/api';
import type { UserDto } from '@/features/auth/domain/types';

export const profileApi = {
  updateUser: async (userId: string, data: Partial<UserDto>) => {
    const response = await apiClient.put<ApiResult<UserDto>>(`/users/${userId}`, data);
    return response.data;
  },
};
