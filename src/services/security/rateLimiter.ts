import { logService } from '../logService';

/**
 * Tipos de ações que podem ser limitadas pelo rate limiter
 */
export type RateLimitAction = 'login' | 'signup' | 'password_reset' | 'api_call' | 'critical_operation';

/**
 * Interface para configuração de rate limiting por ação
 */
interface RateLimitConfig {
  /** Número máximo de tentativas permitidas */
  maxAttempts: number;
  /** Janela de tempo em minutos para o limite */
  windowMinutes: number;
}

/**
 * Interface para armazenar dados de tentativas no localStorage
 */
interface AttemptRecord {
  /** Timestamps das tentativas realizadas */
  attempts: number[];
  /** Quando o próximo reset pode ocorrer */
  nextReset: number;
}

/**
 * Configurações padrão para diferentes tipos de ação
 */
const DEFAULT_CONFIGS: Record<RateLimitAction, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMinutes: 15,
  },
  signup: {
    maxAttempts: 3,
    windowMinutes: 60,
  },
  password_reset: {
    maxAttempts: 3,
    windowMinutes: 30,
  },
  api_call: {
    maxAttempts: 100,
    windowMinutes: 1,
  },
  critical_operation: {
    maxAttempts: 10,
    windowMinutes: 1,
  },
};

/**
 * Serviço de Rate Limiting para controlar tentativas por ação/usuário
 * 
 * Funcionalidades:
 * - Armazena tentativas por endpoint/ação usando localStorage
 * - Limita requisições por IP/usuário
 * - Remove dados expirados automaticamente
 * - Integra com sistema de logs existente
 */
export class RateLimiter {
  private readonly storageKey: string = 'rate_limiter_data';
  private readonly configs: Record<string, RateLimitConfig>;

  constructor(customConfigs?: Partial<Record<RateLimitAction, RateLimitConfig>>) {
    this.configs = { ...DEFAULT_CONFIGS, ...customConfigs };
  }

  /**
   * Verifica se o limite foi excedido para uma ação/identificador
   * @param action - Tipo de ação sendo verificada
   * @param identifier - Identificador único (IP, userId, etc.)
   * @returns true se ainda está dentro do limite, false se excedeu
   */
  checkLimit(action: string, identifier: string): boolean {
    const key = this.generateKey(action, identifier);
    const config = this.getConfig(action);
    const record = this.getRecord(key);
    
    // Remove tentativas expiradas
    this.cleanExpiredAttempts(record, config.windowMinutes);
    
    const isWithinLimit = record.attempts.length < config.maxAttempts;
    
    if (!isWithinLimit) {
      logService.logWarn(
        `Rate limit exceeded for action: ${action}`,
        {
          action,
          identifier: this.hashIdentifier(identifier),
          attempts: record.attempts.length,
          maxAttempts: config.maxAttempts,
          windowMinutes: config.windowMinutes,
        },
        'RateLimiter'
      );
    }
    
    return isWithinLimit;
  }

  /**
   * Registra uma nova tentativa para uma ação/identificador
   * @param action - Tipo de ação sendo registrada
   * @param identifier - Identificador único
   */
  recordAttempt(action: string, identifier: string): void {
    const key = this.generateKey(action, identifier);
    const config = this.getConfig(action);
    const record = this.getRecord(key);
    
    // Remove tentativas expiradas
    this.cleanExpiredAttempts(record, config.windowMinutes);
    
    // Adiciona nova tentativa
    const now = Date.now();
    record.attempts.push(now);
    record.nextReset = now + (config.windowMinutes * 60 * 1000);
    
    // Salva no localStorage
    this.saveRecord(key, record);
    
    logService.logInfo(
      `Rate limit attempt recorded for action: ${action}`,
      {
        action,
        identifier: this.hashIdentifier(identifier),
        attempts: record.attempts.length,
        maxAttempts: config.maxAttempts,
      },
      'RateLimiter'
    );
  }

  /**
   * Retorna o número de tentativas restantes para uma ação/identificador
   * @param action - Tipo de ação
   * @param identifier - Identificador único
   * @returns Número de tentativas restantes
   */
  getRemainingAttempts(action: string, identifier: string): number {
    const key = this.generateKey(action, identifier);
    const config = this.getConfig(action);
    const record = this.getRecord(key);
    
    // Remove tentativas expiradas
    this.cleanExpiredAttempts(record, config.windowMinutes);
    
    return Math.max(0, config.maxAttempts - record.attempts.length);
  }

  /**
   * Reseta o limite para uma ação/identificador específico
   * @param action - Tipo de ação
   * @param identifier - Identificador único
   */
  resetLimit(action: string, identifier: string): void {
    const key = this.generateKey(action, identifier);
    const data = this.getAllData();
    delete data[key];
    this.saveAllData(data);
    
    logService.logInfo(
      `Rate limit reset for action: ${action}`,
      {
        action,
        identifier: this.hashIdentifier(identifier),
      },
      'RateLimiter'
    );
  }

  /**
   * Limpa todos os dados expirados do localStorage
   */
  cleanupExpiredData(): void {
    const data = this.getAllData();
    const now = Date.now();
    let cleanedCount = 0;
    
    Object.keys(data).forEach(key => {
      const record = data[key];
      if (record.nextReset && record.nextReset < now) {
        delete data[key];
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      this.saveAllData(data);
      logService.logInfo(
        `Rate limiter cleanup completed`,
        { cleanedRecords: cleanedCount },
        'RateLimiter'
      );
    }
  }

  /**
   * Gera uma chave única para armazenamento
   */
  private generateKey(action: string, identifier: string): string {
    return `${action}:${this.hashIdentifier(identifier)}`;
  }

  /**
   * Cria um hash simples do identificador para privacidade
   */
  private hashIdentifier(identifier: string): string {
    // Hash simples para não armazenar identificadores em texto plano
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Obtém a configuração para uma ação específica
   */
  private getConfig(action: string): RateLimitConfig {
    return this.configs[action] || this.configs.api_call;
  }

  /**
   * Recupera o registro de tentativas do localStorage
   */
  private getRecord(key: string): AttemptRecord {
    const data = this.getAllData();
    return data[key] || { attempts: [], nextReset: 0 };
  }

  /**
   * Salva um registro específico
   */
  private saveRecord(key: string, record: AttemptRecord): void {
    const data = this.getAllData();
    data[key] = record;
    this.saveAllData(data);
  }

  /**
   * Recupera todos os dados do localStorage
   */
  private getAllData(): Record<string, AttemptRecord> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logService.logError(
        error,
        'RateLimiter - Failed to read from localStorage'
      );
      return {};
    }
  }

  /**
   * Salva todos os dados no localStorage
   */
  private saveAllData(data: Record<string, AttemptRecord>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      logService.logError(
        error,
        'RateLimiter - Failed to save to localStorage'
      );
    }
  }

  /**
   * Remove tentativas expiradas de um registro
   */
  private cleanExpiredAttempts(record: AttemptRecord, windowMinutes: number): void {
    const cutoffTime = Date.now() - (windowMinutes * 60 * 1000);
    record.attempts = record.attempts.filter(timestamp => timestamp > cutoffTime);
  }
}

// Instância singleton para uso global
export const rateLimiter = new RateLimiter();

// Executar limpeza automática a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanupExpiredData();
  }, 5 * 60 * 1000);
}