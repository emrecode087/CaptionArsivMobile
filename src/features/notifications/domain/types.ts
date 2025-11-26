export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  type: number; // Changed from string union to number based on API response
  referenceId?: string;
  referenceUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string;
  errors: string[];
}

export interface DeviceRegistrationRequest {
  fcmToken: string;
  deviceType: 'Android' | 'iOS';
  deviceModel?: string;
}
