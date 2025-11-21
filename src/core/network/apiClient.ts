import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { appConfig } from '../config/appConfig';
import { ApiError, ApiResult } from '../types/api';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

type TokenProvider = () => string | null | Promise<string | null>;

let accessTokenProvider: TokenProvider | null = null;

// Extend config to track retry attempts
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export const setAccessTokenProvider = (provider: TokenProvider | null) => {
  accessTokenProvider = provider;
};

const withAuthHeader = async (config: InternalAxiosRequestConfig) => {
  // Use the provider if set, otherwise try to get from store directly
  let token = accessTokenProvider ? await accessTokenProvider() : useAuthStore.getState().accessToken;

  if (token) {
    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
};


const buildRequestUrl = (config: InternalAxiosRequestConfig) => {
  const rawUrl = config.url ?? '';
  if (/^https?:/i.test(rawUrl)) {
    return rawUrl;
  }

  const base = config.baseURL ?? '';
  if (!base) {
    return rawUrl;
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = rawUrl.startsWith('/') ? rawUrl.slice(1) : rawUrl;

  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
};

const toRelativeUrl = (url?: string) => {
  if (!url) {
    return url;
  }

  if (!/^https?:/i.test(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
  } catch (parseError) {
    if (__DEV__) {
      console.warn('[API] Failed to parse absolute URL for fallback retry.', parseError);
    }
    return url;
  }
};

const logRequest = (config: InternalAxiosRequestConfig) => {
  if (!__DEV__) {
    return;
  }

  const method = config.method?.toUpperCase() ?? 'GET';
  const fallbackTag = config.metadata?.usedFallback ? ' [fallback]' : '';
  console.log(`[API] -> ${method} ${buildRequestUrl(config)}${fallbackTag}`);
};

const logResponse = (config: InternalAxiosRequestConfig, status: number) => {
  if (!__DEV__) {
    return;
  }

  const duration = Date.now() - (config.metadata?.startTime ?? Date.now());
  const method = config.method?.toUpperCase() ?? 'GET';
  const fallbackTag = config.metadata?.usedFallback ? ' [fallback]' : '';
  console.log(`[API] <- ${status} ${method} ${buildRequestUrl(config)}${fallbackTag} (${duration}ms)`);
};

const logError = (config: InternalAxiosRequestConfig | undefined, error: AxiosError, status?: number) => {
  if (!__DEV__) {
    return;
  }

  const duration = config?.metadata?.startTime ? Date.now() - config.metadata.startTime : null;
  const method = config?.method?.toUpperCase() ?? 'UNKNOWN';
  const url = config ? buildRequestUrl(config) : 'unknown';
  const statusLabel = status ?? 'NETWORK';
  const durationLabel = duration === null ? '' : ` (${duration}ms)`;
  const fallbackTag = config?.metadata?.usedFallback ? ' [fallback]' : '';

  console.warn(`[API] !! ${statusLabel} ${method} ${url}${fallbackTag} - ${error.message}${durationLabel}`);
};

const apiClient: AxiosInstance = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeoutMs,
});

apiClient.interceptors.request.use(async (config) => {
  const existingMetadata = config.metadata ?? {};
  config.metadata = { ...existingMetadata, startTime: Date.now() };
  logRequest(config);

  return withAuthHeader(config);
});

apiClient.interceptors.response.use(
  (response) => {
    logResponse(response.config, response.status);
    return response;
  },
  async (error: AxiosError<ApiResult<unknown>>) => {
    const { config, response } = error;
    
    // Handle 401 Unauthorized - Token Refresh
    // Login request should not trigger refresh logic
    const isLoginRequest = config?.url?.toLowerCase().includes('/auth/login');
    
    if (response?.status === 401 && config && !config._retry && !isLoginRequest) {
      config._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use a new axios instance to avoid interceptor loops
        const refreshResponse = await axios.post(
          `${config.baseURL}/Auth/refresh`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const { data } = refreshResponse;
        
        if (data.isSuccess && data.data) {
          const { accessToken, refreshToken: newRefreshToken } = data.data;
          
          // Update store
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);
          
          // Update header and retry original request
          if (config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return apiClient(config);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        // Logout if refresh fails
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    const fallbackBaseUrl = appConfig.api.fallbackBaseUrl ?? undefined;

    const shouldAttemptFallback =
      !error.response &&
      !!config &&
      !!fallbackBaseUrl &&
      !config.metadata?.usedFallback;

    if (shouldAttemptFallback && config) {
      if (__DEV__) {
        const method = config.method?.toUpperCase() ?? 'GET';
        console.log(
          `[API] ~~ retrying ${method} ${buildRequestUrl(config)} via fallback base URL (${fallbackBaseUrl})`,
        );
      }

      const retryConfig: InternalAxiosRequestConfig = {
        ...config,
        baseURL: fallbackBaseUrl,
        url: toRelativeUrl(config.url),
        metadata: {
          ...(config.metadata ?? {}),
          usedFallback: true,
          startTime: Date.now(),
        },
      };

      return apiClient.request(retryConfig);
    }

    logError(error.config, error, error.response?.status);

    const status = error.response?.status;
    const payload = error.response?.data;
    const message = payload?.message ?? error.message ?? 'Unknown API error';

    throw new ApiError(message, {
      status,
      errors: payload?.errors ?? null,
      cause: error,
    });
  },
);

export { apiClient };
