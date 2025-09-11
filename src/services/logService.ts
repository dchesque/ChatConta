import { generateSecureId } from '@/utils/cryptoUtils';

/* Serviço de logs estruturados da aplicação (frontend)
 * - Mantém os últimos 50 logs no sessionStorage
 * - Suporta exportação para debugging
 * - Pronto para enviar para provedor externo em produção
 */

export type LogSeverity = 'info' | 'warn' | 'error';

interface AppLog {
  id: string;
  timestamp: string;
  severity: LogSeverity;
  message: string;
  context?: string;
  data?: any;
}

const STORAGE_KEY = 'app_logs';
const MAX_LOGS = 50;

function readLogs(): AppLog[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppLog[]) : [];
  } catch {
    return [];
  }
}

function writeLogs(logs: AppLog[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-MAX_LOGS)));
  } catch {
    // Ignorar falhas de armazenamento
  }
}

function addLog(entry: Omit<AppLog, 'id' | 'timestamp'>) {
  const logs = readLogs();
  const newEntry: AppLog = {
    id: generateSecureId(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  logs.push(newEntry);
  writeLogs(logs);

  // Em produção poderíamos enviar para um serviço externo
  if (import.meta.env.PROD) {
    // TODO: Enviar para Sentry/DataDog/Logtail etc.
  }
}

export const logService = {
  logError(error: any, context?: string, severity: LogSeverity = 'error') {
    const message = error?.message || String(error);
    addLog({ severity, message, context, data: error });
    // Error logged to internal system only (no console.log in production)
  },

  logWarn(message: string, data?: any, context?: string) {
    addLog({ severity: 'warn', message, context, data });
    // Warning logged to internal system only
  },

  logInfo(message: string, data?: any, context?: string) {
    addLog({ severity: 'info', message, context, data });
  },

  getLogs(): AppLog[] {
    return readLogs();
  },

  clear() {
    writeLogs([]);
  },

  export(): string {
    const logs = readLogs();
    return JSON.stringify({ exportedAt: new Date().toISOString(), logs }, null, 2);
  },
};
