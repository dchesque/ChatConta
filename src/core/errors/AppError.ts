/**
 * Sistema unificado de tratamento de erros
 * 
 * Classe base AppError que padroniza todos os erros da aplicação.
 * Inclui códigos de erro padronizados, status HTTP e identificação
 * de erros operacionais vs. bugs do sistema.
 */

/**
 * Códigos de erro padronizados da aplicação
 */
export enum ErrorCode {
  // Erros de validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  
  // Erros de autenticação e autorização
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Erros de recursos
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  
  // Erros de negócio
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Erros de banco de dados
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  
  // Erros de rede
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Erros do sistema
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Erros específicos do domínio financeiro
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_DATE = 'INVALID_DATE',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  BANK_ERROR = 'BANK_ERROR',
  
  // Erros de rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
}

/**
 * Mapeamento de códigos de erro para status HTTP
 */
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // 400 - Bad Request
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_AMOUNT]: 400,
  [ErrorCode.INVALID_DATE]: 400,
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 400,
  [ErrorCode.CONSTRAINT_VIOLATION]: 400,
  
  // 401 - Unauthorized
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  
  // 403 - Forbidden
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.OPERATION_NOT_ALLOWED]: 403,
  
  // 404 - Not Found
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.ACCOUNT_NOT_FOUND]: 404,
  
  // 409 - Conflict
  [ErrorCode.DUPLICATE_RESOURCE]: 409,
  
  // 429 - Too Many Requests
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  [ErrorCode.QUOTA_EXCEEDED]: 429,
  
  // 500 - Internal Server Error
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.CONFIGURATION_ERROR]: 500,
  [ErrorCode.TRANSACTION_ERROR]: 500,
  
  // 502 - Bad Gateway
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.BANK_ERROR]: 502,
  [ErrorCode.PAYMENT_ERROR]: 502,
  
  // 503 - Service Unavailable
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.CONNECTION_ERROR]: 503,
  
  // 504 - Gateway Timeout
  [ErrorCode.TIMEOUT_ERROR]: 504,
  [ErrorCode.NETWORK_ERROR]: 504,
};

/**
 * Interface para contexto adicional do erro
 */
export interface ErrorContext {
  userId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
  timestamp?: string;
}

/**
 * Classe base para todos os erros da aplicação
 * 
 * Características:
 * - Estende Error nativo do JavaScript
 * - Inclui código de erro padronizado
 * - Status HTTP apropriado
 * - Identificação de erros operacionais
 * - Contexto adicional para debugging
 * - Suporte a stack trace
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    
    // Manter o nome da classe para stack traces
    this.name = this.constructor.name;
    
    // Propriedades do erro
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code] || 500;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Contexto adicional
    this.context = context ? {
      ...context,
      timestamp: this.timestamp,
      stack: this.stack
    } : {
      timestamp: this.timestamp,
      stack: this.stack
    };

    // Capturar stack trace (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converte o erro para objeto JSON serializable
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Cria uma representação string do erro
   */
  toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }

  /**
   * Factory methods para erros comuns
   */
  
  static validation(message: string, context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.VALIDATION_ERROR, true, context);
  }

  static notFound(resource: string = 'Recurso', context?: ErrorContext): AppError {
    return new AppError(
      `${resource} não encontrado`, 
      ErrorCode.NOT_FOUND, 
      true, 
      { ...context, resource }
    );
  }

  static unauthorized(message: string = 'Não autorizado', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.UNAUTHORIZED, true, context);
  }

  static forbidden(message: string = 'Acesso negado', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.FORBIDDEN, true, context);
  }

  static duplicate(resource: string = 'Recurso', context?: ErrorContext): AppError {
    return new AppError(
      `${resource} já existe`, 
      ErrorCode.DUPLICATE_RESOURCE, 
      true, 
      { ...context, resource }
    );
  }

  static businessRule(message: string, context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.BUSINESS_RULE_VIOLATION, true, context);
  }

  static database(message: string = 'Erro no banco de dados', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.DATABASE_ERROR, true, context);
  }

  static network(message: string = 'Erro de conexão', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.NETWORK_ERROR, true, context);
  }

  static timeout(message: string = 'Tempo limite excedido', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.TIMEOUT_ERROR, true, context);
  }

  static rateLimit(message: string = 'Muitas tentativas. Tente novamente mais tarde.', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.RATE_LIMIT_EXCEEDED, true, context);
  }

  static internal(message: string = 'Erro interno do sistema', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.INTERNAL_ERROR, false, context);
  }

  static external(service: string, message?: string, context?: ErrorContext): AppError {
    return new AppError(
      message || `Erro no serviço externo: ${service}`, 
      ErrorCode.EXTERNAL_SERVICE_ERROR, 
      true, 
      { ...context, service }
    );
  }

  /**
   * Factory methods específicos do domínio financeiro
   */
  
  static invalidAmount(message: string = 'Valor inválido', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.INVALID_AMOUNT, true, context);
  }

  static invalidDate(message: string = 'Data inválida', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.INVALID_DATE, true, context);
  }

  static accountNotFound(accountType: string = 'Conta', context?: ErrorContext): AppError {
    return new AppError(
      `${accountType} não encontrada`, 
      ErrorCode.ACCOUNT_NOT_FOUND, 
      true, 
      { ...context, accountType }
    );
  }

  static paymentError(message: string = 'Erro no processamento do pagamento', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.PAYMENT_ERROR, true, context);
  }

  static bankError(message: string = 'Erro bancário', context?: ErrorContext): AppError {
    return new AppError(message, ErrorCode.BANK_ERROR, true, context);
  }

  /**
   * Verifica se o erro é operacional (esperado) ou um bug do sistema
   */
  static isOperationalError(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Extrai informações de erro de forma segura
   */
  static extractErrorInfo(error: unknown): {
    message: string;
    code?: ErrorCode;
    statusCode?: number;
    stack?: string;
  } {
    if (error instanceof AppError) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack
      };
    }

    return {
      message: String(error) || 'Erro desconhecido'
    };
  }
}