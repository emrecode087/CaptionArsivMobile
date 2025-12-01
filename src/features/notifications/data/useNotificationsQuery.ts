import { useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from './notificationsApi';
import { NotificationListResponse } from '../domain/types';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import * as Notifications from 'expo-notifications';

export const notificationsQueryKeys = {
  list: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export const useNotificationsQuery = () => {
  return useInfiniteQuery({
    queryKey: notificationsQueryKeys.list,
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
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.list });
      queryClient.setQueryData<number>(notificationsQueryKeys.unreadCount, (prev) => Math.max(0, (prev ?? 1) - 1));
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount });
    },
  });
};

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.list });
      queryClient.setQueryData<number>(notificationsQueryKeys.unreadCount, 0);
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount });
    },
  });
};

export const useRegisterDeviceMutation = () => {
  return useMutation({
    mutationFn: notificationsApi.registerDevice,
  });
};

export const useUnreadNotificationsQuery = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const query = useQuery({
    queryKey: notificationsQueryKeys.unreadCount,
    queryFn: notificationsApi.getUnreadCount,
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
    refetchInterval: isAuthenticated ? 1000 * 45 : false,
  });

  const unreadCount = query.data ?? 0;

  useEffect(() => {
    Notifications.setBadgeCountAsync(unreadCount).catch(() => {});
  }, [unreadCount]);

  return query;
};
