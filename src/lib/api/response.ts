export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function successResponse<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiError {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}
