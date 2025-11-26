import { apiClient } from '@/core/network/apiClient';
import { DeviceRegistrationRequest, NotificationListResponse, ApiResponse } from '../domain/types';

export const notificationsApi = {
  registerDevice: async (data: DeviceRegistrationRequest) => {
    return apiClient.post('/notifications/device', data);
  },

  getNotifications: async (pageNumber: number = 1, pageSize: number = 20) => {
    return apiClient.get<ApiResponse<NotificationListResponse>>('/notifications', {
      params: { pageNumber, pageSize },
    });
  },

  markAsRead: async (id: string) => {
    return apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return apiClient.put('/notifications/read-all');
  },
};
