import { useMutation } from '@tanstack/react-query';

import { profileApi } from './profileApi';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import type { UserDto } from '@/features/auth/domain/types';
import type { ApiError } from '@/core/types/api';

type UploadFile = {
  uri: string;
  name?: string;
  type?: string;
};

export const useUpdateUserMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<UserDto, ApiError, { userId: string; payload: Partial<UserDto> }>({
    mutationFn: (data) => profileApi.updateUser(data.userId, data.payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
  });
};

export const useChangePasswordMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<UserDto, ApiError, { userId: string; newPassword: string }>({
    mutationFn: (data) => profileApi.changePassword(data.userId, data.newPassword),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
  });
};

export const useDeleteAccountMutation = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation<string, ApiError>({
    mutationFn: () => profileApi.deleteMyAccount(),
    onSuccess: () => {
      logout();
    },
  });
};

export const useSendFeedbackMutation = () => {
  return useMutation<string | null, ApiError, { message: string; contact: string }>({
    mutationFn: async (data) => {
      const res = await profileApi.sendFeedback(data);
      return res ?? null;
    },
  });
};

export const useUploadProfilePhotoMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<UserDto, ApiError, UploadFile>({
    mutationFn: (file) => profileApi.uploadProfilePhoto(file),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
  });
};

export const useDeleteProfilePhotoMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<UserDto, ApiError>({
    mutationFn: () => profileApi.deleteProfilePhoto(),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
  });
};
