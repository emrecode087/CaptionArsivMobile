import { useMutation } from '@tanstack/react-query';
import { profileApi } from './profileApi';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

export const useUpdateUserMutation = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: { userId: string; payload: Record<string, unknown> }) =>
      profileApi.updateUser(data.userId, data.payload),
    onSuccess: (result) => {
      if (result?.data) {
        setUser(result.data);
      }
    },
  });
};
