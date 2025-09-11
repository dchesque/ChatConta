/**
 * Utilitários de inicialização da aplicação
 */

import { auditService } from '@/services/auditService';
import { logService } from '@/services/logService';

/**
 * Configurações de inicialização
 */
export interface StartupConfig {
  enableAudit: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  debugMode: boolean;
  environmentChecks: boolean;
}

/**
 * Informações do sistema
 */
export interface SystemInfo {
  appVersion: string;
  buildDate: string;
  environment: string;
  userAgent: string;
  viewport: { width: number; height: number };
  localStorage: boolean;
  sessionStorage: boolean;
  webgl: boolean;
  performance: boolean;
}

/**
 * Resultado da verificação de saúde do sistema
 */
export interface HealthCheck {
  status: 'healthy' | 'warning' | 'error';
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    details?: any;
  }>;
  timestamp: string;
}

/**
 * Serviço de inicialização da aplicação
 */
class StartupService {
  private config: StartupConfig = {
    enableAudit: true,
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    debugMode: import.meta.env.DEV,
    environmentChecks: true
  };

  /**
   * Inicializa a aplicação
   */
  async initialize(config?: Partial<StartupConfig>): Promise<void> {
    this.config = { ...this.config, ...config };

    try {
      logService.logInfo('Iniciando aplicação...', { config: this.config });

      // Verificações de saúde do sistema
      if (this.config.environmentChecks) {
        await this.performHealthChecks();
      }

      // Configurar monitoramento de performance
      if (this.config.enablePerformanceMonitoring) {
        this.setupPerformanceMonitoring();
      }

      // Configurar captura de erros
      if (this.config.enableErrorTracking) {
        this.setupErrorTracking();
      }

      // Configurar auditoria
      if (this.config.enableAudit) {
        this.setupAuditLogging();
      }

      // Limpar dados antigos
      await this.cleanupOldData();

      logService.logInfo('Aplicação inicializada com sucesso');

    } catch (error) {
      logService.logError(error, 'startup');
      throw new Error('Falha na inicialização da aplicação');
    }
  }

  /**
   * Verifica saúde do sistema
   */
  async performHealthChecks(): Promise<HealthCheck> {
    const checks: HealthCheck['checks'] = [];

    // Verificar localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      checks.push({
        name: 'localStorage',
        status: 'pass',
        message: 'LocalStorage disponível'
      });
    } catch {
      checks.push({
        name: 'localStorage',
        status: 'fail',
        message: 'LocalStorage não disponível'
      });
    }

    // Verificar sessionStorage
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      checks.push({
        name: 'sessionStorage',
        status: 'pass',
        message: 'SessionStorage disponível'
      });
    } catch {
      checks.push({
        name: 'sessionStorage',
        status: 'fail',
        message: 'SessionStorage não disponível'
      });
    }

    // Verificar conexão de rede
    if (navigator.onLine) {
      checks.push({
        name: 'network',
        status: 'pass',
        message: 'Conexão de rede ativa'
      });
    } else {
      checks.push({
        name: 'network',
        status: 'warn',
        message: 'Sem conexão de rede'
      });
    }

    // Verificar viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    if (viewport.width < 320 || viewport.height < 568) {
      checks.push({
        name: 'viewport',
        status: 'warn',
        message: 'Viewport muito pequeno',
        details: viewport
      });
    } else {
      checks.push({
        name: 'viewport',
        status: 'pass',
        message: 'Viewport adequado',
        details: viewport
      });
    }

    // Verificar suporte a WebGL (para gráficos)
    try {
      const canvas = document.createElement('canvas');
      const webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (webgl) {
        checks.push({
          name: 'webgl',
          status: 'pass',
          message: 'WebGL suportado'
        });
      } else {
        checks.push({
          name: 'webgl',
          status: 'warn',
          message: 'WebGL não suportado'
        });
      }
    } catch {
      checks.push({
        name: 'webgl',
        status: 'warn',
        message: 'Erro ao verificar WebGL'
      });
    }

    // Determinar status geral
    const hasErrors = checks.some(check => check.status === 'fail');
    const hasWarnings = checks.some(check => check.status === 'warn');

    const healthCheck: HealthCheck = {
      status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy',
      checks,
      timestamp: new Date().toISOString()
    };

    logService.logInfo('Verificação de saúde concluída', healthCheck);
    return healthCheck;
  }

  /**
   * Configura monitoramento de performance
   */
  private setupPerformanceMonitoring(): void {
    if (!window.performance) return;

    // Monitorar carregamento da página
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          logService.logInfo('Métricas de carregamento', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart
          });
        }
      }, 1000);
    });

    // Monitorar recursos
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) { // Recursos lentos (>1s)
          logService.logWarn('Recurso lento detectado', {
            name: entry.name,
            duration: entry.duration,
            type: entry.entryType
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Configura captura de erros globais
   */
  private setupErrorTracking(): void {
    // Capturar erros JavaScript
    window.addEventListener('error', (event) => {
      logService.logError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      }, 'global-error');
    });

    // Capturar promessas rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      logService.logError({
        message: 'Promise rejeitada',
        reason: event.reason
      }, 'unhandled-promise');
    });
  }

  /**
   * Configura logging de auditoria automático
   */
  private setupAuditLogging(): void {
    // Em produção, poderia configurar interceptadores automáticos
    logService.logInfo('Sistema de auditoria configurado');
  }

  /**
   * Limpa dados antigos do navegador
   */
  private async cleanupOldData(): Promise<void> {
    try {
      // Limpar logs antigos (manter apenas últimos 7 dias)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);

      // Verificar se existem dados para limpar
      const storedLogs = localStorage.getItem('app_logs');
      if (storedLogs) {
        try {
          const logs = JSON.parse(storedLogs);
          const filteredLogs = logs.filter((log: any) => 
            new Date(log.timestamp) >= cutoffDate
          );
          
          if (filteredLogs.length !== logs.length) {
            localStorage.setItem('app_logs', JSON.stringify(filteredLogs));
            logService.logInfo(`Limpeza concluída: ${logs.length - filteredLogs.length} logs antigos removidos`);
          }
        } catch {
          // Se houver erro no parse, limpar completamente
          localStorage.removeItem('app_logs');
        }
      }

      // Limpar cache antigo de dados (se existir)
      const cacheKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('cache_') || key.startsWith('temp_')
      );

      for (const key of cacheKeys) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.timestamp && new Date(data.timestamp) < cutoffDate) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Se houver erro, remover o item
          localStorage.removeItem(key);
        }
      }

    } catch (error) {
      logService.logWarn('Erro na limpeza de dados antigos', error);
    }
  }

  /**
   * Obtém informações do sistema
   */
  getSystemInfo(): SystemInfo {
    return {
      appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      buildDate: import.meta.env.VITE_BUILD_DATE || new Date().toISOString(),
      environment: import.meta.env.MODE,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      webgl: !!document.createElement('canvas').getContext('webgl'),
      performance: !!window.performance
    };
  }

  /**
   * Força verificação de saúde manual
   */
  async checkHealth(): Promise<HealthCheck> {
    return this.performHealthChecks();
  }
}

// Instância singleton
export const startupService = new StartupService();

/**
 * Hook para inicialização automática da aplicação
 */
export const initializeApp = async (config?: Partial<StartupConfig>): Promise<void> => {
  await startupService.initialize(config);
};

/**
 * Utilitário para verificar se a aplicação está rodando em produção
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

/**
 * Utilitário para verificar se a aplicação está em modo debug
 */
export const isDebugMode = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * Obtém configurações de runtime
 */
export const getRuntimeConfig = () => {
  return {
    isProduction: isProduction(),
    isDebugMode: isDebugMode(),
    systemInfo: startupService.getSystemInfo()
  };
};