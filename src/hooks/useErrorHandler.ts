import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { logService } from '@/services/logService';
import { createAppError, type AppError, type AppErrorType } from '@/types/appError';
import { MESSAGES } from '@/constants/messages';

interface RetryOptions {
  retries?: number;
  delayMs?: number;
}

export function useErrorHandler(defaultContext?: string) {
  const [lastError, setLastError] = useState<AppError | null>(null);
  const abortControllers = useRef<AbortController[]>([]);

  const classifyError = (error: any): AppErrorType => {
    if (error?.name === 'AbortError') return 'canceled';
    if (error?.code === 'ERR_TIMEOUT') return 'timeout';
    if (error?.status === 401 || error?.code === 'PERMISSION_DENIED') return 'permission';
    if (error?.isValidation || error?.code === 'VALIDATION_ERROR') return 'validation';
    if (!navigator.onLine || /Network|Failed to fetch|ECONN/.test(String(error?.message))) return 'network';
    return 'unknown';
  };

  const showToast = (type: AppErrorType, message?: string) => {
    const m = message ||
      (type === 'network' ? MESSAGES.NETWORK_ERROR :
       type === 'validation' ? MESSAGES.VALIDATION_ERROR :
       type === 'permission' ? MESSAGES.PERMISSION_ERROR :
       type === 'timeout' ? MESSAGES.TIMEOUT_ERROR :
       MESSAGES.UNKNOWN_ERROR);

    switch (type) {
      case 'validation':
        toast.warning(m, { description: "Corrija os campos destacados" });
        break;
      case 'permission':
        toast.error(m, { description: "Sem permissão para esta ação" });
        break;
      case 'network':
        toast.error("Erro de conexão", { description: "Verifique sua internet" });
        break;
      case 'timeout':
        toast.error(m, { description: "Operação demorou muito" });
        break;
      default:
        toast.error(m);
    }
  };

  const handleError = useCallback((error: any, context?: string) => {
    const type = classifyError(error);
    const appError = createAppError(type.toUpperCase(), error?.message || MESSAGES.UNKNOWN_ERROR, error, context || defaultContext);
    setLastError(appError);

    // Log estruturado
    logService.logError(appError, context || defaultContext);

    // Feedback ao usuário
    showToast(type, appError.message);

    return appError;
  }, [defaultContext]);

  const clearError = useCallback(() => setLastError(null), []);

  const withRetry = useCallback(async <T,>(fn: () => Promise<T>, options: RetryOptions = {}) => {
    const retries = options.retries ?? 3;
    const delayMs = options.delayMs ?? 500;
    let attempt = 0;
    let lastErr: any;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        attempt++;
        const type = classifyError(err);
        if (type === 'validation' || type === 'permission' || attempt >= retries) {
          throw err;
        }
        await new Promise(res => setTimeout(res, delayMs * attempt));
      }
    }
    throw lastErr;
  }, []);

  const withTimeout = useCallback(async <T,>(promise: Promise<T>, timeoutMs = 30000) => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => reject({ code: 'ERR_TIMEOUT', message: MESSAGES.TIMEOUT_ERROR }), timeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  }, []);

  const newAbortController = useCallback(() => {
    const ctrl = new AbortController();
    abortControllers.current.push(ctrl);
    return ctrl;
  }, []);

  const cancelAll = useCallback(() => {
    abortControllers.current.forEach(c => c.abort());
    abortControllers.current = [];
  }, []);

  return useMemo(() => ({
    handleError,
    clearError,
    lastError,
    withRetry,
    withTimeout,
    newAbortController,
    cancelAll,
  }), [handleError, clearError, lastError, withRetry, withTimeout, newAbortController, cancelAll]);
}
