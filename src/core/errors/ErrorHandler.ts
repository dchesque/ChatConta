import { AppError, ErrorCode } from './AppError';
import { getErrorMessage, shouldShowToUser, getErrorIcon } from './errorMessages';
import { logService } from '../../services/logService';

/**
 * Interface para resultado do tratamento de erro
 */
export interface ErrorHandlingResult {
  appError: AppError;
  shouldShowToast: boolean;
  userMessage: string;
  icon: string;
}

/**
 * Mapeamento de erros do Supabase para códigos de erro internos
 */
const SUPABASE_ERROR_MAPPING: Record<string, ErrorCode> = {
  // Autenticação e autorização
  'invalid_credentials': ErrorCode.INVALID_CREDENTIALS,
  'email_not_confirmed': ErrorCode.UNAUTHORIZED,
  'signup_disabled': ErrorCode.OPERATION_NOT_ALLOWED,
  'email_address_not_authorized': ErrorCode.UNAUTHORIZED,
  'invalid_jwt': ErrorCode.TOKEN_EXPIRED,
  'jwt_expired': ErrorCode.TOKEN_EXPIRED,
  'refresh_token_not_found': ErrorCode.TOKEN_EXPIRED,
  'user_not_found': ErrorCode.NOT_FOUND,
  'weak_password': ErrorCode.VALIDATION_ERROR,
  'email_already_confirmed': ErrorCode.BUSINESS_RULE_VIOLATION,
  'email_change_token_already_used': ErrorCode.TOKEN_EXPIRED,
  'confirmation_token_expired': ErrorCode.TOKEN_EXPIRED,
  'recovery_token_expired': ErrorCode.TOKEN_EXPIRED,
  'invite_token_expired': ErrorCode.TOKEN_EXPIRED,
  
  // Rate limiting
  'email_rate_limit_exceeded': ErrorCode.RATE_LIMIT_EXCEEDED,
  'sms_rate_limit_exceeded': ErrorCode.RATE_LIMIT_EXCEEDED,
  'over_email_send_rate_limit': ErrorCode.RATE_LIMIT_EXCEEDED,
  'captcha_failed': ErrorCode.RATE_LIMIT_EXCEEDED,
  
  // Database errors
  'duplicate_key': ErrorCode.DUPLICATE_RESOURCE,
  'foreign_key_violation': ErrorCode.CONSTRAINT_VIOLATION,
  'check_constraint_violation': ErrorCode.CONSTRAINT_VIOLATION,
  'not_null_violation': ErrorCode.REQUIRED_FIELD,
  'unique_violation': ErrorCode.DUPLICATE_RESOURCE,
  'serialization_failure': ErrorCode.TRANSACTION_ERROR,
  'deadlock_detected': ErrorCode.TRANSACTION_ERROR,
  
  // Postgres-specific errors
  '23505': ErrorCode.DUPLICATE_RESOURCE, // unique_violation
  '23503': ErrorCode.CONSTRAINT_VIOLATION, // foreign_key_violation
  '23502': ErrorCode.REQUIRED_FIELD, // not_null_violation
  '23514': ErrorCode.CONSTRAINT_VIOLATION, // check_violation
  '40001': ErrorCode.TRANSACTION_ERROR, // serialization_failure
  '40P01': ErrorCode.TRANSACTION_ERROR, // deadlock_detected
  
  // Network e conexão
  'network_error': ErrorCode.NETWORK_ERROR,
  'timeout': ErrorCode.TIMEOUT_ERROR,
  'connection_error': ErrorCode.CONNECTION_ERROR,
  'service_unavailable': ErrorCode.SERVICE_UNAVAILABLE,
  
  // Permissões e políticas RLS
  'insufficient_privileges': ErrorCode.FORBIDDEN,
  'row_level_security_violation': ErrorCode.FORBIDDEN,
  'policy_violation': ErrorCode.FORBIDDEN,
  
  // Validação
  'invalid_format': ErrorCode.VALIDATION_ERROR,
  'invalid_input': ErrorCode.INVALID_INPUT,
  'missing_required_field': ErrorCode.REQUIRED_FIELD,
  'value_too_long': ErrorCode.VALIDATION_ERROR,
  'value_out_of_range': ErrorCode.VALIDATION_ERROR,
  
  // Storage
  'file_size_exceeded': ErrorCode.QUOTA_EXCEEDED,
  'storage_quota_exceeded': ErrorCode.QUOTA_EXCEEDED,
  'invalid_file_type': ErrorCode.VALIDATION_ERROR,
  'file_not_found': ErrorCode.NOT_FOUND,
  
  // Função/RPC errors
  'function_not_found': ErrorCode.NOT_FOUND,
  'invalid_function_arguments': ErrorCode.INVALID_INPUT,
  'function_execution_error': ErrorCode.INTERNAL_ERROR,
};

/**
 * Classe centralizada para tratamento de erros
 * 
 * Responsabilidades:
 * - Mapear erros do Supabase para AppError
 * - Realizar logging automático
 * - Determinar mensagens amigáveis ao usuário
 * - Integrar com sistema de toast/notificação
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}
  
  /**
   * Singleton instance
   */
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  /**
   * Método principal para tratamento de erros
   */
  handle(error: unknown, context?: string): ErrorHandlingResult {
    const appError = this.convertToAppError(error, context);
    
    // Log do erro
    this.logError(appError, error);
    
    // Determina se deve mostrar toast ao usuário
    const shouldShowToast = shouldShowToUser(appError.code);
    
    // Obtém mensagem amigável
    const userMessage = getErrorMessage(appError.code, context);
    
    // Obtém ícone do erro
    const icon = getErrorIcon(appError.code);
    
    return {
      appError,
      shouldShowToast,
      userMessage,
      icon
    };
  }
  
  /**
   * Converte erro genérico para AppError
   */
  private convertToAppError(error: unknown, context?: string): AppError {
    // Se já é AppError, retorna como está
    if (error instanceof AppError) {
      return error;
    }
    
    // Se é erro do Supabase
    if (this.isSupabaseError(error)) {
      return this.mapSupabaseError(error, context);
    }
    
    // Se é erro nativo do JavaScript
    if (error instanceof Error) {
      return this.mapNativeError(error, context);
    }
    
    // Erro desconhecido
    return AppError.internal(
      'Erro inesperado no sistema',
      {
        originalError: String(error),
        context
      }
    );
  }
  
  /**
   * Verifica se é um erro do Supabase
   */
  private isSupabaseError(error: unknown): error is { code?: string; message?: string; details?: string; hint?: string } {
    return typeof error === 'object' && 
           error !== null && 
           ('code' in error || 'message' in error);
  }
  
  /**
   * Mapeia erro do Supabase para AppError
   */
  private mapSupabaseError(error: { code?: string; message?: string; details?: string; hint?: string }, context?: string): AppError {
    const errorCode = error.code;
    const errorMessage = error.message || 'Erro do sistema';
    
    // Tenta mapear código específico do Supabase
    if (errorCode && SUPABASE_ERROR_MAPPING[errorCode]) {
      const mappedCode = SUPABASE_ERROR_MAPPING[errorCode];
      return new AppError(errorMessage, mappedCode, true, {
        supabaseCode: errorCode,
        supabaseDetails: error.details,
        supabaseHint: error.hint,
        context
      });
    }
    
    // Mapeia baseado na mensagem se código não foi encontrado
    const messageBasedCode = this.getErrorCodeFromMessage(errorMessage);
    return new AppError(errorMessage, messageBasedCode, true, {
      supabaseCode: errorCode,
      supabaseDetails: error.details,
      supabaseHint: error.hint,
      context
    });
  }
  
  /**
   * Mapeia erro nativo JavaScript para AppError
   */
  private mapNativeError(error: Error, context?: string): AppError {
    // Mapeia tipos específicos de erro
    if (error.name === 'TypeError') {
      return AppError.validation('Tipo de dado inválido', { originalError: error.message, context });
    }
    
    if (error.name === 'ReferenceError') {
      return AppError.internal('Erro de referência', { originalError: error.message, context });
    }
    
    if (error.name === 'SyntaxError') {
      return AppError.validation('Formato inválido', { originalError: error.message, context });
    }
    
    if (error.name === 'RangeError') {
      return AppError.validation('Valor fora do limite permitido', { originalError: error.message, context });
    }
    
    // Verifica por palavras-chave na mensagem
    const messageBasedCode = this.getErrorCodeFromMessage(error.message);
    return new AppError(error.message, messageBasedCode, true, {
      originalError: error.name,
      context
    });
  }
  
  /**
   * Determina código de erro baseado na mensagem
   */
  private getErrorCodeFromMessage(message: string): ErrorCode {
    const lowerMessage = message.toLowerCase();
    
    // Network errors
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return ErrorCode.NETWORK_ERROR;
    }
    
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return ErrorCode.TIMEOUT_ERROR;
    }
    
    // Authentication errors
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication')) {
      return ErrorCode.UNAUTHORIZED;
    }
    
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
      return ErrorCode.FORBIDDEN;
    }
    
    // Validation errors
    if (lowerMessage.includes('invalid') || lowerMessage.includes('validation')) {
      return ErrorCode.VALIDATION_ERROR;
    }
    
    if (lowerMessage.includes('required') || lowerMessage.includes('missing')) {
      return ErrorCode.REQUIRED_FIELD;
    }
    
    // Not found errors
    if (lowerMessage.includes('not found') || lowerMessage.includes('does not exist')) {
      return ErrorCode.NOT_FOUND;
    }
    
    // Duplicate errors
    if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists')) {
      return ErrorCode.DUPLICATE_RESOURCE;
    }
    
    // Rate limiting
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
      return ErrorCode.RATE_LIMIT_EXCEEDED;
    }
    
    // Default to internal error
    return ErrorCode.INTERNAL_ERROR;
  }
  
  /**
   * Realiza log do erro
   */
  private logError(appError: AppError, originalError: unknown): void {
    const logData = {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      isOperational: appError.isOperational,
      context: appError.context,
      timestamp: appError.timestamp,
      originalError: originalError instanceof Error ? {
        name: originalError.name,
        message: originalError.message,
        stack: originalError.stack
      } : originalError
    };
    
    // Log baseado na severidade do erro
    if (appError.statusCode >= 500 || !appError.isOperational) {
      // Erros críticos - log como error
      logService.error('Sistema', `Erro crítico: ${appError.code}`, logData);
    } else if (appError.statusCode >= 400) {
      // Erros do cliente - log como warning
      logService.warn('Sistema', `Erro do cliente: ${appError.code}`, logData);
    } else {
      // Outros erros - log como info
      logService.info('Sistema', `Erro tratado: ${appError.code}`, logData);
    }
  }
  
  /**
   * Método de conveniência para lidar com erros async/await
   */
  async handleAsync<T>(
    promise: Promise<T>, 
    context?: string
  ): Promise<{ data?: T; error?: ErrorHandlingResult }> {
    try {
      const data = await promise;
      return { data };
    } catch (error) {
      const errorResult = this.handle(error, context);
      return { error: errorResult };
    }
  }
  
  /**
   * Método para tratar múltiplos erros (útil em operações batch)
   */
  handleMultiple(errors: unknown[], context?: string): ErrorHandlingResult[] {
    return errors.map(error => this.handle(error, context));
  }
  
  /**
   * Verifica se um erro deve disparar um retry automático
   */
  shouldRetry(error: AppError): boolean {
    const retryableErrors = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.CONNECTION_ERROR,
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.TRANSACTION_ERROR
    ];
    
    return retryableErrors.includes(error.code) && error.isOperational;
  }
  
  /**
   * Obtém configurações de retry para um erro
   */
  getRetryConfig(error: AppError): { maxRetries: number; delayMs: number } | null {
    if (!this.shouldRetry(error)) {
      return null;
    }
    
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
      case ErrorCode.CONNECTION_ERROR:
        return { maxRetries: 3, delayMs: 1000 };
      
      case ErrorCode.TIMEOUT_ERROR:
        return { maxRetries: 2, delayMs: 2000 };
      
      case ErrorCode.SERVICE_UNAVAILABLE:
        return { maxRetries: 5, delayMs: 5000 };
      
      case ErrorCode.TRANSACTION_ERROR:
        return { maxRetries: 2, delayMs: 500 };
      
      default:
        return { maxRetries: 1, delayMs: 1000 };
    }
  }
}

// Instância singleton para uso global
export const errorHandler = ErrorHandler.getInstance();

// Método de conveniência para uso direto
export function handleError(error: unknown, context?: string): ErrorHandlingResult {
  return errorHandler.handle(error, context);
}

// Método para uso com async/await
export async function handleAsyncError<T>(
  promise: Promise<T>, 
  context?: string
): Promise<{ data?: T; error?: ErrorHandlingResult }> {
  return errorHandler.handleAsync(promise, context);
}