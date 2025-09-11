export type AppError = {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  context?: string;
};

export type AppErrorType =
  | 'network'
  | 'validation'
  | 'permission'
  | 'timeout'
  | 'canceled'
  | 'unknown';

export const createAppError = (
  code: string,
  message: string,
  details?: any,
  context?: string
): AppError => ({
  code,
  message,
  details,
  context,
  timestamp: new Date().toISOString(),
});
