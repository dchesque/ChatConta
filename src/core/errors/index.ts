/**
 * Sistema Unificado de Tratamento de Erros
 * 
 * Este módulo exporta um sistema completo de tratamento de erros
 * para a aplicação, incluindo:
 * 
 * - AppError: Classe base para erros da aplicação
 * - ErrorHandler: Tratamento centralizado de erros
 * - Mensagens em português para o usuário
 * - Integração com logging e toast
 * 
 * Uso básico:
 * ```typescript
 * import { handleError, AppError, ErrorCode } from '@/core/errors';
 * 
 * try {
 *   // operação que pode falhar
 * } catch (error) {
 *   const result = handleError(error, 'auth');
 *   if (result.shouldShowToast) {
 *     toast.error(result.userMessage);
 *   }
 * }
 * ```
 */

// Exportar classe principal de erro
export { AppError, ErrorCode } from './AppError';
export type { ErrorContext } from './AppError';

// Exportar handler de erros
export { 
  ErrorHandler, 
  errorHandler, 
  handleError, 
  handleAsyncError 
} from './ErrorHandler';
export type { ErrorHandlingResult } from './ErrorHandler';

// Exportar mensagens e utilitários
export {
  ERROR_MESSAGES,
  CONTEXTUAL_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_TIPS,
  getErrorMessage,
  getErrorTips,
  shouldShowToUser,
  getErrorIcon
} from './errorMessages';


/**
 * Utilitários de conveniência para uso comum
 */

/**
 * Cria e lança um erro de validação
 */
export function throwValidationError(message: string, context?: string): never {
  throw AppError.validation(message, { context });
}

/**
 * Cria e lança um erro de não encontrado
 */
export function throwNotFoundError(resource: string = 'Recurso', context?: string): never {
  throw AppError.notFound(resource, { context });
}

/**
 * Cria e lança um erro de não autorizado
 */
export function throwUnauthorizedError(message: string = 'Não autorizado', context?: string): never {
  throw AppError.unauthorized(message, { context });
}

/**
 * Cria e lança um erro de acesso negado
 */
export function throwForbiddenError(message: string = 'Acesso negado', context?: string): never {
  throw AppError.forbidden(message, { context });
}

/**
 * Wrapper para operações que podem falhar
 * Converte automaticamente exceções em AppError
 */
export async function safeOperation<T>(
  operation: () => Promise<T>,
  context?: string,
  fallbackValue?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const result = handleError(error, context);
    
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    
    // Re-lança o AppError tratado
    throw result.appError;
  }
}

/**
 * Wrapper síncrono para operações que podem falhar
 */
export function safeOperationSync<T>(
  operation: () => T,
  context?: string,
  fallbackValue?: T
): T {
  try {
    return operation();
  } catch (error) {
    const result = handleError(error, context);
    
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    
    // Re-lança o AppError tratado
    throw result.appError;
  }
}

/**
 * Hook para integração com React/componentes
 * Retorna função para tratar erros de forma consistente
 */
export function useErrorHandler(defaultContext?: string) {
  return {
    /**
     * Trata erro e retorna resultado para uso em componentes
     */
    handle: (error: unknown, context?: string) => 
      handleError(error, context || defaultContext),
    
    /**
     * Trata erro async com callback de sucesso/erro
     */
    handleAsync: async <T>(
      promise: Promise<T>,
      onSuccess?: (data: T) => void,
      onError?: (result: ErrorHandlingResult) => void,
      context?: string
    ) => {
      const result = await handleAsyncError(promise, context || defaultContext);
      
      if (result.data) {
        onSuccess?.(result.data);
        return result.data;
      } else if (result.error) {
        onError?.(result.error);
        return null;
      }
    }
  };
}

/**
 * Constantes úteis
 */
export const ERROR_CONTEXTS = {
  AUTH: 'auth',
  PAYABLES: 'payables',
  RECEIVABLES: 'receivables',
  CONTACTS: 'contacts',
  CUSTOMERS: 'customers',
  CATEGORIES: 'categories',
  BANKS: 'banks',
  BANK_ACCOUNTS: 'bankAccounts',
  TRANSACTIONS: 'transactions',
  REPORTS: 'reports',
  SYSTEM: 'system'
} as const;

export type ErrorContextType = typeof ERROR_CONTEXTS[keyof typeof ERROR_CONTEXTS];

/**
 * Tipos auxiliares para TypeScript
 */
export type SafeOperationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ErrorHandlingResult;
};

/**
 * Executa operação retornando resultado com flag de sucesso
 */
export async function trySafeOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<SafeOperationResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorResult = handleError(error, context);
    return { success: false, error: errorResult };
  }
}

/**
 * Versão síncrona do trySafeOperation
 */
export function trySafeOperationSync<T>(
  operation: () => T,
  context?: string
): SafeOperationResult<T> {
  try {
    const data = operation();
    return { success: true, data };
  } catch (error) {
    const errorResult = handleError(error, context);
    return { success: false, error: errorResult };
  }
}