import { appConfig } from '@/core/config/appConfig';

/**
 * Ensures media URLs are absolute by prefixing API host for relative paths.
 */
export const resolveMediaUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;

  const base = appConfig.api.baseUrl ?? '';
  // Drop trailing slashes and optional /api segment so media served from root still works
  const normalizedBase = base.replace(/\/+$/, '').replace(/\/api$/, '');
  if (!normalizedBase) return url;

  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${normalizedBase}${normalizedPath}`;
};
