// エラー型定義
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface AuthError extends AppError {
  code: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'EMAIL_ALREADY_EXISTS' | 'WEAK_PASSWORD' | 'NETWORK_ERROR' | 'UNKNOWN_AUTH_ERROR';
}

export interface DatabaseError extends AppError {
  code: 'CONNECTION_ERROR' | 'QUERY_ERROR' | 'PERMISSION_DENIED' | 'NOT_FOUND' | 'UNKNOWN_DATABASE_ERROR';
  table?: string;
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface ValidationError extends AppError {
  code: 'INVALID_INPUT' | 'REQUIRED_FIELD' | 'FORMAT_ERROR' | 'OUT_OF_RANGE';
  field?: string;
}

export interface NetworkError extends AppError {
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'NOT_FOUND' | 'SERVER_ERROR';
  status?: number;
}

// エラーガード関数
export function isAuthError(error: unknown): error is AuthError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function isValidationError(error: unknown): error is ValidationError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

// 汎用エラー変換関数
export function toAppError(error: unknown): AppError {
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error instanceof Error) {
    return { message: error.message, details: error };
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return error as AppError;
  }
  
  return { message: 'Unknown error occurred', details: error };
}
