import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { notificationsApi } from '../data/notificationsApi';

// Configure how notifications should be handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as any),
});

class NotificationService {
  private responseListener?: Notifications.Subscription;
  private notificationListener?: Notifications.Subscription;

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Get the token that uniquely identifies this device
      // For FCM (Android) this returns the FCM registration token
      // For APNs (iOS) this returns the APNs token
      try {
        const tokenData = await Notifications.getDevicePushTokenAsync();
        token = tokenData.data;
        console.log('Device Push Token:', token);
      } catch (e) {
        console.error('Error getting device push token:', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  async registerDevice() {
    try {
      const token = await this.registerForPushNotificationsAsync();
      
      if (!token) {
        console.log('No token received, skipping registration');
        return;
      }

      await notificationsApi.registerDevice({
        fcmToken: token,
        deviceType: Platform.OS === 'ios' ? 'iOS' : 'Android',
      });

      console.log('Device registered for notifications successfully');
    } catch (error) {
      console.error('Error registering device for notifications:', error);
    }
  }

  setupForegroundHandler(onNotificationReceived?: (notification: Notifications.Notification) => void) {
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    return () => {
      if (this.notificationListener) {
        this.notificationListener.remove();
      }
    };
  }

  setupResponseHandler(onNotificationResponse: (response: Notifications.NotificationResponse) => void) {
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      onNotificationResponse(response);
    });

    return () => {
      if (this.responseListener) {
        this.responseListener.remove();
      }
    };
  }
  
  // Helper to extract data from notification for navigation
  getNotificationData(response: Notifications.NotificationResponse) {
    return response.notification.request.content.data;
  }
}

export const notificationService = new NotificationService();
