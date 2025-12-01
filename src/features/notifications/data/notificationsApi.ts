import { apiClient } from '@/core/network/apiClient';
import { DeviceRegistrationRequest, NotificationListResponse, ApiResponse } from '../domain/types';

export const notificationsApi = {
  registerDevice: async (data: DeviceRegistrationRequest) => {
    return apiClient.post('/notifications/device', data);
  },

  getUnreadCount: async () => {
    const response = await apiClient.get<{ isSuccess?: boolean; data?: number; message?: string }>('/notifications/unread-count');
    const payload = response.data;

    if (payload && typeof payload.data === 'number') {
      return payload.data;
    }

    if (payload && payload.isSuccess === false) {
      throw new Error(payload.message || 'Unread count alınamadı');
    }

    return 0;
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
