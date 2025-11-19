import { env } from './env';

export const appConfig = {
  api: {
    baseUrl: env.apiBaseUrl,
    fallbackBaseUrl: env.apiFallbackBaseUrl || null,
    timeoutMs: env.requestTimeoutMs,
  },
};
