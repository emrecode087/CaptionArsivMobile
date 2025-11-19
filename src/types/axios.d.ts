import 'axios';

type AxiosRequestMetadata = {
  startTime: number;
  usedFallback?: boolean;
};

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: AxiosRequestMetadata;
  }
}
