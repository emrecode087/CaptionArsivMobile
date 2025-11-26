import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from './notificationsApi';
import { NotificationListResponse } from '../domain/types';

export const useNotificationsQuery = () => {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await notificationsApi.getNotifications(pageParam);
      // The API returns a wrapped response: { isSuccess: true, data: { items: [...] } }
      // We need to return the inner data object which matches NotificationListResponse
      return response.data.data;
    },
    getNextPageParam: (lastPage: NotificationListResponse) => {
      if (!lastPage || !lastPage.items) return undefined;
      
      if (lastPage.hasNextPage) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useRegisterDeviceMutation = () => {
  return useMutation({
    mutationFn: notificationsApi.registerDevice,
  });
};
