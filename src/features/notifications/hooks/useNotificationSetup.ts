import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { notificationService } from '../services/notificationService';
import { navigate } from '@/navigation/navigationRef';
import { useQueryClient } from '@tanstack/react-query';
import { notificationsQueryKeys } from '../data/useNotificationsQuery';
import { resolveNotificationCategory } from '../domain/notificationType';

export const useNotificationSetup = () => {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user?.pushNotificationsEnabled) {
      return;
    }

    notificationService.registerDevice();
    
    const unsubscribeForeground = notificationService.setupForegroundHandler((notification) => {
      console.log('Foreground notification received:', notification);
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount });
    });

    const unsubscribeResponse = notificationService.setupResponseHandler((response) => {
      const data = notificationService.getNotificationData(response);
      
      if (data) {
        const { referenceId } = data;
        const category = resolveNotificationCategory({
          type: (data as any).type,
          title: (data as any).title,
          body: (data as any).body,
        });

        if ((category === 'postLike' || category === 'postComment') && referenceId) {
          navigate('PostDetail', { postId: referenceId });
        }
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeResponse();
    };
  }, [isAuthenticated, user?.pushNotificationsEnabled, queryClient]);
};
