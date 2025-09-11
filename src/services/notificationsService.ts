import { supabase } from '@/integrations/supabase/client';
import { 
  Notification, 
  CreateNotificationData, 
  NotificationFilters, 
  NotificationStats,
  NotificationType 
} from '@/types/notification';

class NotificationsService {
  static async list(filters: NotificationFilters = {}): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.from) {
        query = query.gte('created_at', filters.from);
      }

      if (filters.to) {
        query = query.lte('created_at', filters.to);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 25) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .in('status', ['sent', 'pending']);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }
  }

  static async getStats(): Promise<NotificationStats> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('status, type, severity');

      if (error) throw error;

      const stats: NotificationStats = {
        total: data?.length || 0,
        unread: 0,
        pending: 0,
        byType: {} as Record<NotificationType, number>,
        bySeverity: {} as any
      };

      data?.forEach(notification => {
        if (['sent', 'pending'].includes(notification.status)) {
          stats.unread++;
        }
        if (notification.status === 'pending') {
          stats.pending++;
        }

        // Contar por tipo
        stats.byType[notification.type as NotificationType] = 
          (stats.byType[notification.type as NotificationType] || 0) + 1;

        // Contar por severidade
        stats.bySeverity[notification.severity] = 
          (stats.bySeverity[notification.severity] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  static async create(data: CreateNotificationData): Promise<Notification> {
    try {
      const { data: notification, error } = await supabase.rpc('create_notification', {
        p_user_id: data.user_id,
        p_type: data.type,
        p_title: data.title,
        p_message: data.message,
        p_data: data.data || {},
        p_scheduled_for: data.scheduled_for || null,
        p_severity: data.severity || 'info'
      });

      if (error) throw error;
      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  static async markAsRead(id: string): Promise<Notification> {
    try {
      const { data, error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      throw error;
    }
  }

  static async markAllAsRead(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_read');

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      throw error;
    }
  }

  static async dismiss(id: string): Promise<Notification> {
    try {
      const { data, error } = await supabase.rpc('dismiss_notification', {
        p_notification_id: id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao dispensar notificação:', error);
      throw error;
    }
  }

  // Funções auxiliares para criar notificações específicas
  static async createBillDueSoon(userId: string, accountId: string, dueDate: string, amount: number): Promise<Notification> {
    return this.create({
      user_id: userId,
      type: 'bill_due_soon',
      severity: 'warning',
      title: 'Conta vencendo em breve',
      message: `Conta de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vence em ${new Date(dueDate).toLocaleDateString('pt-BR')}`,
      data: {
        accounts_payable_id: accountId,
        due_date: dueDate,
        amount,
        route: `/contas-pagar?highlight=${accountId}`
      }
    });
  }

  static async createBillOverdue(userId: string, accountId: string, dueDate: string, amount: number): Promise<Notification> {
    return this.create({
      user_id: userId,
      type: 'bill_overdue',
      severity: 'error',
      title: 'Conta em atraso',
      message: `Conta de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} está vencida desde ${new Date(dueDate).toLocaleDateString('pt-BR')}`,
      data: {
        accounts_payable_id: accountId,
        due_date: dueDate,
        amount,
        route: `/contas-pagar?highlight=${accountId}`
      }
    });
  }

  static async createTrialExpiring(userId: string, daysLeft: number): Promise<Notification> {
    return this.create({
      user_id: userId,
      type: 'trial_expiring',
      severity: 'warning',
      title: 'Trial expirando',
      message: `Seu período de teste expira em ${daysLeft} dias`,
      data: {
        days_left: daysLeft,
        route: '/assinatura'
      }
    });
  }
}

export { NotificationsService };