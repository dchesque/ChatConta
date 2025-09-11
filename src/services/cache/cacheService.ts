import { logService } from '../logService';

/**
 * Interface para item no cache
 */
interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // TTL em minutos
  key: string;
}

/**
 * Interface para estatísticas do cache
 */
export interface CacheStats {
  totalKeys: number;
  totalSize: number; // em bytes (aproximado)
  hits: number;
  misses: number;
  hitRate: number;
  oldestItem?: {
    key: string;
    age: number; // em minutos
  };
  newestItem?: {
    key: string;
    age: number; // em minutos
  };
  expiredKeys: number;
}

/**
 * Prefixos organizacionais para o cache
 */
export const CACHE_PREFIXES = {
  DASHBOARD: 'dashboard:',
  PAYABLES: 'payables:',
  RECEIVABLES: 'receivables:',
  CATEGORIES: 'categories:',
  CONTACTS: 'contacts:',
  CUSTOMERS: 'customers:',
  BANKS: 'banks:',
  BANK_ACCOUNTS: 'bankAccounts:',
  REPORTS: 'reports:',
  USER: 'user:',
  SYSTEM: 'system:'
} as const;

/**
 * TTL padrão por tipo de dados (em minutos)
 */
export const DEFAULT_TTL = {
  DASHBOARD: 5,
  LISTS: 2,
  CATEGORIES: 10,
  STATIC_DATA: 30,
  USER_DATA: 15,
  REPORTS: 1
} as const;

/**
 * Classe para gerenciamento de cache com localStorage
 * 
 * Características:
 * - TTL configurável por chave
 * - Limpeza automática de cache expirado
 * - Invalidação seletiva por padrão
 * - Estatísticas de uso
 * - Logs de hit/miss para monitoramento
 * - Prefixos organizacionais
 */
export class CacheService {
  private static instance: CacheService;
  private readonly storageKey = 'app_cache';
  private readonly statsKey = 'cache_stats';
  private cleanupInterval: number | null = null;
  
  // Estatísticas em memória
  private stats = {
    hits: 0,
    misses: 0
  };

  private constructor() {
    this.initializeCleanup();
    this.loadStats();
  }

  /**
   * Singleton instance
   */
  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Armazena dados no cache com TTL
   */
  set<T>(key: string, data: T, ttlMinutes: number = DEFAULT_TTL.LISTS): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes,
        key
      };

      const cache = this.getCache();
      cache[key] = item;
      
      this.saveCache(cache);
      
      logService.logInfo(`Cache SET: ${key}`, {
        ttlMinutes,
        dataSize: this.estimateSize(data)
      }, 'Cache');
    } catch (error) {
      logService.logError(error, 'Cache');
    }
  }

  /**
   * Recupera dados do cache se ainda válidos
   */
  get<T>(key: string): T | null {
    try {
      const cache = this.getCache();
      const item = cache[key] as CacheItem<T> | undefined;

      if (!item) {
        this.stats.misses++;
        this.saveStats();
        logService.logInfo(`Cache MISS: ${key}`, {}, 'Cache');
        return null;
      }

      const now = Date.now();
      const age = (now - item.timestamp) / (1000 * 60); // idade em minutos

      if (age > item.ttl) {
        // Item expirado, remove do cache
        delete cache[key];
        this.saveCache(cache);
        this.stats.misses++;
        this.saveStats();
        logService.logInfo(`Cache EXPIRED: ${key}`, { ageMinutes: age, ttl: item.ttl }, 'Cache');
        return null;
      }

      this.stats.hits++;
      this.saveStats();
      logService.logInfo(`Cache HIT: ${key}`, { ageMinutes: age }, 'Cache');
      return item.data;
    } catch (error) {
      logService.logError(error, 'Cache');
      this.stats.misses++;
      this.saveStats();
      return null;
    }
  }

  /**
   * Invalida chaves que correspondem ao padrão
   */
  invalidate(pattern: string): number {
    try {
      const cache = this.getCache();
      let invalidatedCount = 0;

      // Converte padrão em regex simples (suporte a wildcards *)
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);

      Object.keys(cache).forEach(key => {
        if (regex.test(key)) {
          delete cache[key];
          invalidatedCount++;
        }
      });

      if (invalidatedCount > 0) {
        this.saveCache(cache);
        logService.logInfo(`Cache INVALIDATE: ${pattern}`, { 
          keysInvalidated: invalidatedCount 
        }, 'Cache');
      }

      return invalidatedCount;
    } catch (error) {
      logService.logError(error, 'Cache');
      return 0;
    }
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
      this.stats.hits = 0;
      this.stats.misses = 0;
      this.saveStats();
      logService.logInfo('Cache CLEAR: Todo cache foi limpo', {}, 'Cache');
    } catch (error) {
      logService.logError(error, 'Cache');
    }
  }

  /**
   * Retorna estatísticas detalhadas do cache
   */
  getStats(): CacheStats {
    try {
      const cache = this.getCache();
      const keys = Object.keys(cache);
      const now = Date.now();
      
      let totalSize = 0;
      let expiredKeys = 0;
      let oldestAge = 0;
      let newestAge = Infinity;
      let oldestKey = '';
      let newestKey = '';

      keys.forEach(key => {
        const item = cache[key];
        const age = (now - item.timestamp) / (1000 * 60); // em minutos
        
        // Calcula tamanho aproximado
        totalSize += this.estimateSize(item);
        
        // Verifica se expirado
        if (age > item.ttl) {
          expiredKeys++;
        }
        
        // Tracking do mais antigo e mais novo
        if (age > oldestAge) {
          oldestAge = age;
          oldestKey = key;
        }
        if (age < newestAge) {
          newestAge = age;
          newestKey = key;
        }
      });

      const totalRequests = this.stats.hits + this.stats.misses;
      const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

      return {
        totalKeys: keys.length,
        totalSize,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: Math.round(hitRate * 100) / 100,
        expiredKeys,
        oldestItem: oldestKey ? {
          key: oldestKey,
          age: Math.round(oldestAge * 100) / 100
        } : undefined,
        newestItem: newestKey ? {
          key: newestKey,
          age: Math.round(newestAge * 100) / 100
        } : undefined
      };
    } catch (error) {
      logService.logError(error, 'Cache');
      return {
        totalKeys: 0,
        totalSize: 0,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: 0,
        expiredKeys: 0
      };
    }
  }

  /**
   * Remove itens expirados do cache
   */
  private cleanExpired(): number {
    try {
      const cache = this.getCache();
      const now = Date.now();
      let removedCount = 0;

      Object.keys(cache).forEach(key => {
        const item = cache[key];
        const age = (now - item.timestamp) / (1000 * 60);

        if (age > item.ttl) {
          delete cache[key];
          removedCount++;
        }
      });

      if (removedCount > 0) {
        this.saveCache(cache);
        logService.logInfo('Cache CLEANUP', { removedItems: removedCount }, 'Cache');
      }

      return removedCount;
    } catch (error) {
      logService.logError(error, 'Cache');
      return 0;
    }
  }

  /**
   * Recupera cache do localStorage
   */
  private getCache(): Record<string, CacheItem> {
    try {
      const cached = localStorage.getItem(this.storageKey);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      logService.logError(error, 'Cache');
      return {};
    }
  }

  /**
   * Salva cache no localStorage
   */
  private saveCache(cache: Record<string, CacheItem>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
    } catch (error) {
      // Se localStorage está cheio, tenta limpar cache expirado
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        logService.logWarn('localStorage cheio, limpando cache expirado', {}, 'Cache');
        this.cleanExpired();
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(cache));
        } catch (retryError) {
          logService.logError(retryError, 'Cache');
        }
      } else {
        logService.logError(error, 'Cache');
      }
    }
  }

  /**
   * Carrega estatísticas do localStorage
   */
  private loadStats(): void {
    try {
      const saved = localStorage.getItem(this.statsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.stats = { ...this.stats, ...parsed };
      }
    } catch (error) {
      logService.logError(error, 'Cache');
    }
  }

  /**
   * Salva estatísticas no localStorage
   */
  private saveStats(): void {
    try {
      localStorage.setItem(this.statsKey, JSON.stringify(this.stats));
    } catch (error) {
      logService.logError(error, 'Cache');
    }
  }

  /**
   * Estima tamanho de um objeto em bytes
   */
  private estimateSize(obj: unknown): number {
    try {
      return new Blob([JSON.stringify(obj)]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Inicializa limpeza automática a cada 10 minutos
   */
  private initializeCleanup(): void {
    // Limpa imediatamente ao inicializar
    this.cleanExpired();
    
    // Configura limpeza automática a cada 10 minutos
    this.cleanupInterval = window.setInterval(() => {
      this.cleanExpired();
    }, 10 * 60 * 1000);
  }

  /**
   * Destrói o serviço e limpa recursos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Métodos de conveniência para prefixos específicos
   */
  
  // Dashboard
  setDashboard(key: string, data: unknown): void {
    this.set(`${CACHE_PREFIXES.DASHBOARD}${key}`, data, DEFAULT_TTL.DASHBOARD);
  }

  getDashboard<T>(key: string): T | null {
    return this.get(`${CACHE_PREFIXES.DASHBOARD}${key}`);
  }

  invalidateDashboard(): number {
    return this.invalidate(`${CACHE_PREFIXES.DASHBOARD}*`);
  }

  // Contas a pagar
  setPayables(key: string, data: unknown): void {
    this.set(`${CACHE_PREFIXES.PAYABLES}${key}`, data, DEFAULT_TTL.LISTS);
  }

  getPayables<T>(key: string): T | null {
    return this.get(`${CACHE_PREFIXES.PAYABLES}${key}`);
  }

  invalidatePayables(): number {
    return this.invalidate(`${CACHE_PREFIXES.PAYABLES}*`);
  }

  // Contas a receber
  setReceivables(key: string, data: unknown): void {
    this.set(`${CACHE_PREFIXES.RECEIVABLES}${key}`, data, DEFAULT_TTL.LISTS);
  }

  getReceivables<T>(key: string): T | null {
    return this.get(`${CACHE_PREFIXES.RECEIVABLES}${key}`);
  }

  invalidateReceivables(): number {
    return this.invalidate(`${CACHE_PREFIXES.RECEIVABLES}*`);
  }

  // Categorias
  setCategories(key: string, data: unknown): void {
    this.set(`${CACHE_PREFIXES.CATEGORIES}${key}`, data, DEFAULT_TTL.CATEGORIES);
  }

  getCategories<T>(key: string): T | null {
    return this.get(`${CACHE_PREFIXES.CATEGORIES}${key}`);
  }

  invalidateCategories(): number {
    return this.invalidate(`${CACHE_PREFIXES.CATEGORIES}*`);
  }
}

// Instância singleton
export const cacheService = CacheService.getInstance();