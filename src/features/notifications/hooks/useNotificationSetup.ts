import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { notificationService } from '../services/notificationService';
import { navigate } from '@/navigation/navigationRef';

export const useNotificationSetup = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.registerDevice();
      
      const unsubscribeForeground = notificationService.setupForegroundHandler((notification) => {
        console.log('Foreground notification received:', notification);
      });

      const unsubscribeResponse = notificationService.setupResponseHandler((response) => {
        const data = notificationService.getNotificationData(response);
        
        if (data) {
          const { referenceId, type } = data;
          
          // Handle both string and numeric types if necessary, or just numeric
          if (type === 'PostLike' || type === 'PostComment' || type === 0 || type === 1) {
            if (referenceId) {
              navigate('PostDetail', { id: referenceId });
            }
          }
        }
      });

      return () => {
        unsubscribeForeground();
        unsubscribeResponse();
      };
    }
  }, [isAuthenticated]);
};
