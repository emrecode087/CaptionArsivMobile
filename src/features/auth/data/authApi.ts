import { apiClient } from '@/core/network/apiClient';
import type { ApiResult } from '@/core/types/api';
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  AuthTokenResponse,
  UserDto,
} from '../domain/types';

/**
 * Yeni kullanıcı kaydı oluşturur
 */
export async function register(data: RegisterRequest): Promise<ApiResult<UserDto>> {
  const response = await apiClient.post<ApiResult<UserDto>>('/Auth/register', data);
  return response.data;
}

/**
 * Kullanıcı girişi yapar ve JWT üretir
 */
export async function login(data: LoginRequest): Promise<ApiResult<AuthTokenResponse>> {
  const response = await apiClient.post<ApiResult<AuthTokenResponse>>('/Auth/login', data);
  return response.data;
}

/**
 * Refresh token ile yeni access token üretir
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<ApiResult<AuthTokenResponse>> {
  const response = await apiClient.post<ApiResult<AuthTokenResponse>>('/Auth/refresh', data);
  return response.data;
}

/**
 * Refresh token'ı iptal eder
 */
export async function logout(data: LogoutRequest): Promise<ApiResult<string>> {
  const response = await apiClient.post<ApiResult<string>>('/Auth/logout', data);
  return response.data;
}
