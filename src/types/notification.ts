export type NotificationType = 
  | 'bill_due_soon' 
  | 'bill_overdue' 
  | 'trial_expiring' 
  | 'payment_failed' 
  | 'subscription_expired' 
  | 'info'
  | 'system';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export type NotificationStatus = 'pending' | 'sent' | 'read' | 'dismissed' | 'error';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  data: Record<string, any>;
  channel: string;
  status: NotificationStatus;
  scheduled_for?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  scheduled_for?: string;
  severity?: NotificationSeverity;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  severity?: NotificationSeverity;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  pending: number;
  byType: Record<NotificationType, number>;
  bySeverity: Record<NotificationSeverity, number>;
}

// Configurações para diferentes tipos de notificação
export const NOTIFICATION_CONFIGS = {
  bill_due_soon: {
    icon: '💰',
    severity: 'warning' as NotificationSeverity,
    title: 'Conta vencendo',
    defaultMessage: 'Você tem uma conta a pagar vencendo em breve'
  },
  bill_overdue: {
    icon: '🔴',
    severity: 'error' as NotificationSeverity,
    title: 'Conta vencida',
    defaultMessage: 'Você tem uma conta em atraso'
  },
  trial_expiring: {
    icon: '⏰',
    severity: 'warning' as NotificationSeverity,
    title: 'Trial expirando',
    defaultMessage: 'Seu período de teste está expirando'
  },
  payment_failed: {
    icon: '❌',
    severity: 'error' as NotificationSeverity,
    title: 'Falha no pagamento',
    defaultMessage: 'Houve um problema com seu pagamento'
  },
  subscription_expired: {
    icon: '🚫',
    severity: 'error' as NotificationSeverity,
    title: 'Assinatura expirada',
    defaultMessage: 'Sua assinatura expirou'
  },
  info: {
    icon: 'ℹ️',
    severity: 'info' as NotificationSeverity,
    title: 'Informação',
    defaultMessage: 'Nova informação disponível'
  },
  system: {
    icon: '⚙️',
    severity: 'info' as NotificationSeverity,
    title: 'Sistema',
    defaultMessage: 'Atualização do sistema'
  }
};