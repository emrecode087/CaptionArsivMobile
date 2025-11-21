export interface ApiErrorDetail {
  code?: string;
  message: string;
  field?: string;
}

export interface ApiResult<TData> {
  isSuccess: boolean;
  message?: string | null;
  data?: TData | null;
  errors?: (ApiErrorDetail | string)[] | null;
}

export class ApiError extends Error {
  readonly status?: number;

  readonly errors?: (ApiErrorDetail | string)[] | null;

  constructor(message: string, options?: { status?: number; errors?: (ApiErrorDetail | string)[] | null; cause?: unknown }) {
    super(message, options);
    this.name = 'ApiError';
    this.status = options?.status;
    this.errors = options?.errors;
  }
}
