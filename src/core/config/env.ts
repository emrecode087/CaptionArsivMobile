import { API_BASE_URL, API_BASE_URL_HTTPS } from '@env';

const sanitizeBaseUrl = (value?: string) => value?.replace(/\/+$/, '') ?? '';

const httpsBaseUrl = sanitizeBaseUrl(API_BASE_URL_HTTPS);
const httpBaseUrl = sanitizeBaseUrl(API_BASE_URL);

const primaryBaseUrl = httpsBaseUrl || httpBaseUrl;
const fallbackBaseUrl = httpsBaseUrl && httpBaseUrl && httpsBaseUrl !== httpBaseUrl ? httpBaseUrl : '';

if (!primaryBaseUrl) {
  // Warn once in development to help catch misconfigured environments early.
  console.warn('API_BASE_URL is not set. Update your .env file to point at the backend.');
}

export const env = {
  apiBaseUrl: primaryBaseUrl,
  apiFallbackBaseUrl: fallbackBaseUrl,
  requestTimeoutMs: 15000,
};
