/**
 * Serviço de auditoria para rastreamento de ações do usuário
 */
import { generateSecureId } from '@/utils/cryptoUtils';

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type AuditAction = 
  | 'create' | 'update' | 'delete' | 'view' 
  | 'login' | 'logout' | 'export' | 'import'
  | 'payment' | 'approval' | 'rejection';

export type AuditEntity = 
  | 'conta_pagar' | 'fornecedor' | 'categoria' | 'banco'
  | 'user' | 'session' | 'report' | 'system';

class AuditService {
  private logs: AuditLog[] = [];
  private readonly maxLogs = 1000;

  /**
   * Registra uma ação de auditoria
   */
  async log(
    action: AuditAction,
    entity: AuditEntity,
    userId: string,
    userEmail: string,
    details?: {
      entityId?: string;
      description?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      severity?: AuditLog['severity'];
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: generateSecureId('audit_'),
        userId,
        userEmail,
        action,
        entity,
        entityId: details?.entityId,
        details: {
          description: details?.description,
          oldValues: details?.oldValues,
          newValues: details?.newValues,
          metadata: details?.metadata,
          url: window.location.href,
          timestamp: new Date().toISOString()
        },
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: details?.severity || this.getSeverityByAction(action)
      };

      this.addLog(auditLog);
      
      // Em produção, enviar para backend
      if (import.meta.env.PROD) {
        await this.sendToBackend(auditLog);
      }

      // Log crítico - alertar administradores
      if (auditLog.severity === 'critical') {
        await this.alertAdministrators(auditLog);
      }

    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
    }
  }

  /**
   * Adiciona log na memória local
   */
  private addLog(log: AuditLog): void {
    this.logs.unshift(log);
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Salvar no localStorage para persistência temporária
    try {
      const stored = this.logs.slice(0, 100); // Apenas últimos 100
      localStorage.setItem('audit_logs', JSON.stringify(stored));
    } catch (error) {
      // Ignorar erro de armazenamento
    }
  }

  /**
   * Determina severidade baseada na ação
   */
  private getSeverityByAction(action: AuditAction): AuditLog['severity'] {
    const severityMap: Record<AuditAction, AuditLog['severity']> = {
      'create': 'low',
      'update': 'low',
      'view': 'low',
      'delete': 'medium',
      'export': 'medium',
      'import': 'medium',
      'login': 'low',
      'logout': 'low',
      'payment': 'high',
      'approval': 'medium',
      'rejection': 'medium'
    };

    return severityMap[action] || 'low';
  }

  /**
   * Obtém IP do cliente (simulado)
   */
  private async getClientIP(): Promise<string> {
    try {
      // Em produção, usar serviço real de IP
      return 'mock.ip.address';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Envia log para backend (mock)
   */
  private async sendToBackend(log: AuditLog): Promise<void> {
    // Mock - em produção implementar chamada real
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  /**
   * Alerta administradores para eventos críticos
   */
  private async alertAdministrators(log: AuditLog): Promise<void> {
    // Mock - em produção implementar alertas reais
    console.warn('AUDIT ALERT:', log);
  }

  /**
   * Busca logs com filtros
   */
  getLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    entity?: AuditEntity;
    severity?: AuditLog['severity'];
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): AuditLog[] {
    let filtered = [...this.logs];

    if (filters?.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters?.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters?.entity) {
      filtered = filtered.filter(log => log.entity === filters.entity);
    }

    if (filters?.severity) {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
    }

    const limit = filters?.limit || 50;
    return filtered.slice(0, limit);
  }

  /**
   * Exporta logs para análise
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs({ limit: 1000 });
    
    if (format === 'csv') {
      const headers = 'Timestamp,User,Action,Entity,Severity,Details\n';
      const rows = logs.map(log => 
        `${log.timestamp},${log.userEmail},${log.action},${log.entity},${log.severity},"${log.details?.description || ''}"`
      ).join('\n');
      return headers + rows;
    }

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalLogs: logs.length,
      logs
    }, null, 2);
  }

  /**
   * Limpa logs antigos
   */
  clearOldLogs(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );
  }

  /**
   * Estatísticas de auditoria
   */
  getStatistics(): {
    totalLogs: number;
    byAction: Record<string, number>;
    byEntity: Record<string, number>;
    bySeverity: Record<string, number>;
    recentActivity: AuditLog[];
  } {
    const byAction: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byEntity[log.entity] = (byEntity[log.entity] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
    });

    return {
      totalLogs: this.logs.length,
      byAction,
      byEntity,
      bySeverity,
      recentActivity: this.logs.slice(0, 10)
    };
  }
}

// Instância singleton
export const auditService = new AuditService();

// Hooks de conveniência para ações comuns
export const auditHooks = {
  logCreate: (entity: AuditEntity, userId: string, userEmail: string, entityId: string, newValues?: Record<string, any>) =>
    auditService.log('create', entity, userId, userEmail, { entityId, newValues, description: `Criou ${entity}` }),

  logUpdate: (entity: AuditEntity, userId: string, userEmail: string, entityId: string, oldValues?: Record<string, any>, newValues?: Record<string, any>) =>
    auditService.log('update', entity, userId, userEmail, { entityId, oldValues, newValues, description: `Atualizou ${entity}` }),

  logDelete: (entity: AuditEntity, userId: string, userEmail: string, entityId: string, oldValues?: Record<string, any>) =>
    auditService.log('delete', entity, userId, userEmail, { entityId, oldValues, description: `Excluiu ${entity}`, severity: 'medium' }),

  logView: (entity: AuditEntity, userId: string, userEmail: string, entityId?: string) =>
    auditService.log('view', entity, userId, userEmail, { entityId, description: `Visualizou ${entity}` }),

  logLogin: (userId: string, userEmail: string) =>
    auditService.log('login', 'session', userId, userEmail, { description: 'Login realizado' }),

  logLogout: (userId: string, userEmail: string) =>
    auditService.log('logout', 'session', userId, userEmail, { description: 'Logout realizado' }),

  logExport: (entity: AuditEntity, userId: string, userEmail: string, metadata?: Record<string, any>) =>
    auditService.log('export', entity, userId, userEmail, { metadata, description: `Exportou dados de ${entity}`, severity: 'medium' })
};