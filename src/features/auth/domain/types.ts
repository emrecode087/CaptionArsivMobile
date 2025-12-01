// Auth API Request DTOs
export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  emailOrUserName: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// User DTO
export interface UserDto {
  id: string;
  userName: string;
  email: string;
  emailConfirmed: boolean;
  profileImageUrl: string | null;
  bio: string | null;
  lastLoginAt: string;
  status: string;
  likesArePublic: boolean;
  autoFollowOnReply?: boolean;
  profileIsPrivate?: boolean;
  pushNotificationsEnabled?: boolean;
  autoplayVideos?: boolean;
  theme?: 'light' | 'dark' | 'system' | null;
  hideFlaggedComments?: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}

// Auth API Response DTOs
export interface AuthTokenResponse {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserDto;
}

export interface RegisterResponse {
  user: UserDto;
}
