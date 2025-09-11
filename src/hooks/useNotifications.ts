import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationFilters, NotificationStats } from '@/types/notification';
import { showMessage } from '@/utils/messages';
import { toast } from 'sonner';

// Circuit breaker para evitar spam de requisições falhando
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private isOpen = false;
  private readonly threshold = 3;
  private readonly cooldownTime = 60000; // 1 minuto

  async execute<T>(operation: () => Promise<T>): Promise<T | null> {
    if (this.isOpen) {
      if (Date.now() - this.lastFailTime > this.cooldownTime) {
        this.isOpen = false;
        this.failures = 0;
      } else {
        console.warn('Circuit breaker está aberto, pulando operação de notificações');
        return null;
      }
    }

    try {
      const result = await operation();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailTime = Date.now();
      
      if (this.failures >= this.threshold) {
        this.isOpen = true;
        console.error('Circuit breaker aberto após muitas falhas');
      }
      
      throw error;
    }
  }
}

const circuitBreaker = new CircuitBreaker();

export function useNotifications(filters: NotificationFilters = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flag para controlar se as notificações estão habilitadas
  const NOTIFICATIONS_ENABLED = false; // TEMPORARIAMENTE DESABILITADO

  const loadNotifications = useCallback(async () => {
    if (!NOTIFICATIONS_ENABLED) {
      console.log('🔇 Notificações temporariamente desabilitadas para resolver problema de performance');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await circuitBreaker.execute(async () => {
        // Limite rigoroso para evitar sobrecarga
        const { data: notificationsList, error: listError } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10); // Máximo 10 notificações

        if (listError) throw listError;

        // Buscar apenas contagem não lida com timeout
        const { count, error: countError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .in('status', ['sent', 'pending']);

        if (countError) {
          console.warn('Erro ao buscar contagem:', countError);
        }

        return {
          notifications: notificationsList || [],
          unreadCount: count || 0,
          stats: { 
            total: notificationsList?.length || 0, 
            unread: count || 0,
            pending: 0,
            byType: {},
            bySeverity: {}
          }
        };
      });

      if (result) {
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
        setStats(null); // Temporariamente null
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar notificações';
      setError(message);
      console.error('Erro ao carregar notificações:', err);
      
      // Não mostrar erro para o usuário se for problema de conectividade
      if (message.includes('503') || message.includes('NetworkError')) {
        console.warn('Problema de conectividade com notificações - ignorando silenciosamente');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, NOTIFICATIONS_ENABLED]);

  const markAsRead = useCallback(async (id: string) => {
    if (!NOTIFICATIONS_ENABLED) return;

    try {
      await circuitBreaker.execute(async () => {
        const { error } = await supabase
          .from('notifications')
          .update({ 
            status: 'read', 
            read_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      });
      
      // Atualizar local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: 'read', read_at: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  }, [NOTIFICATIONS_ENABLED]);

  const markAllAsRead = useCallback(async () => {
    if (!NOTIFICATIONS_ENABLED) return;

    try {
      await circuitBreaker.execute(async () => {
        const { error } = await supabase
          .from('notifications')
          .update({ 
            status: 'read', 
            read_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .in('status', ['sent', 'pending']);

        if (error) throw error;
      });
      
      // Atualizar local
      const now = new Date().toISOString();
      setNotifications(prev => 
        prev.map(notification => 
          ['sent', 'pending'].includes(notification.status)
            ? { ...notification, status: 'read', read_at: now }
            : notification
        )
      );
      
      setUnreadCount(0);
      
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  }, [NOTIFICATIONS_ENABLED]);

  const dismiss = useCallback(async (id: string) => {
    if (!NOTIFICATIONS_ENABLED) return;

    try {
      await circuitBreaker.execute(async () => {
        const { error } = await supabase
          .from('notifications')
          .update({ 
            status: 'dismissed',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      });
      
      // Atualizar local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: 'dismissed' }
            : notification
        )
      );
      
      // Se era não lida, decrementar contador
      const notification = notifications.find(n => n.id === id);
      if (notification && ['sent', 'pending'].includes(notification.status)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (err) {
      console.error('Erro ao dispensar notificação:', err);
    }
  }, [notifications, NOTIFICATIONS_ENABLED]);

  const refresh = useCallback(() => {
    if (NOTIFICATIONS_ENABLED) {
      loadNotifications();
    }
  }, [loadNotifications, NOTIFICATIONS_ENABLED]);

  // Desabilitar realtime temporariamente
  useEffect(() => {
    if (!NOTIFICATIONS_ENABLED) {
      console.log('🔇 Realtime de notificações desabilitado temporariamente');
      return;
    }

    // TODO: Implementar realtime quando as notificações forem reabilitadas
  }, [NOTIFICATIONS_ENABLED]);

  // Carregar notificações apenas se habilitado
  useEffect(() => {
    if (NOTIFICATIONS_ENABLED) {
      // Delay inicial para evitar sobrecarga no carregamento da página
      const timer = setTimeout(() => {
        loadNotifications();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loadNotifications, NOTIFICATIONS_ENABLED]);

  return {
    notifications,
    unreadCount,
    stats,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    dismiss,
    refresh
  };
}