import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logService } from '@/services/logService';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
  data?: {
    route?: string;
    [key: string]: unknown;
  };
}

/**
 * Hook que executa verificações de notificações automáticas
 * Implementa a lógica real de verificação usando RPC e polling
 * Deve ser usado uma vez no app (Dashboard ou Layout principal)
 */
export function useNotificationTriggers() {
  const { user } = useAuth();
  const dueDateCheckIntervalRef = useRef<NodeJS.Timeout>();
  const notificationPollingIntervalRef = useRef<NodeJS.Timeout>();
  const readTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  /**
   * Chama a RPC check_and_notify_due_dates para verificar vencimentos
   */
  const checkDueDates = useCallback(async () => {
    if (!user) return;

    try {
      logService.logInfo('Executando verificação de vencimentos via RPC', {}, 'NotificationTriggers');

      const { data, error } = await supabase.rpc('check_and_notify_due_dates', {
        p_user_id: user.id
      });

      if (error) {
        logService.logError(error, 'NotificationTriggers');
        return;
      }

      logService.logInfo('Verificação de vencimentos concluída', { 
        notificationsCreated: data?.notifications_created || 0 
      }, 'NotificationTriggers');

    } catch (error) {
      logService.logError(error, 'NotificationTriggers');
    }
  }, [user]);

  /**
   * Busca notificações não lidas do usuário
   */
  const fetchUnreadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        logService.logError(error, 'NotificationTriggers');
        return;
      }

      // Mostrar notificações como toast
      if (data && data.length > 0) {
        data.forEach((notification: Notification) => {
          showNotificationToast(notification);
        });

        logService.logInfo('Notificações não lidas exibidas', { 
          count: data.length 
        }, 'NotificationTriggers');
      }

    } catch (error) {
      logService.logError(error, 'NotificationTriggers');
    }
  }, [user]);

  /**
   * Mostra uma notificação usando o sistema de toast
   */
  const showNotificationToast = useCallback((notification: Notification) => {
    const { id, title, message, severity, data: notificationData } = notification;

    // Configurações do toast baseadas na severidade
    const toastConfig = {
      duration: 10000, // 10 segundos
      action: notificationData?.route ? {
        label: 'Ver',
        onClick: () => {
          // Se houver rota, pode navegar (implementar navegação se necessário)
          logService.logInfo('Navegação via notificação', { route: notificationData.route }, 'NotificationTriggers');
        }
      } : undefined,
    };

    // Mostrar toast baseado na severidade
    switch (severity) {
      case 'success':
        toast.success(title, {
          description: message,
          ...toastConfig
        });
        break;
      case 'warning':
        toast.warning(title, {
          description: message,
          ...toastConfig
        });
        break;
      case 'error':
        toast.error(title, {
          description: message,
          ...toastConfig
        });
        break;
      default:
        toast.info(title, {
          description: message,
          ...toastConfig
        });
        break;
    }

    // Marcar como lida após 10 segundos
    markAsReadAfterDelay(id);

  }, []);

  /**
   * Marca uma notificação como lida após delay
   */
  const markAsReadAfterDelay = useCallback(async (notificationId: string) => {
    // Cancelar timeout anterior se existir
    if (readTimeoutsRef.current[notificationId]) {
      clearTimeout(readTimeoutsRef.current[notificationId]);
    }

    // Criar novo timeout para marcar como lida após 10 segundos
    readTimeoutsRef.current[notificationId] = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', notificationId);

        if (error) {
          logService.logError(error, 'NotificationTriggers');
        } else {
          logService.logInfo('Notificação marcada como lida', { notificationId }, 'NotificationTriggers');
        }

        // Limpar timeout da referência
        delete readTimeoutsRef.current[notificationId];

      } catch (error) {
        logService.logError(error, 'NotificationTriggers');
      }
    }, 10000); // 10 segundos

  }, []);

  // Verificação na montagem e configuração de intervalos
  useEffect(() => {
    if (!user) return;

    // Executar verificações imediatamente na montagem
    checkDueDates();
    fetchUnreadNotifications();

    // Configurar verificação de vencimentos a cada 1 hora (60 minutos)
    dueDateCheckIntervalRef.current = setInterval(() => {
      checkDueDates();
    }, 60 * 60 * 1000); // 1 hora

    // Configurar polling de notificações não lidas a cada 5 minutos
    notificationPollingIntervalRef.current = setInterval(() => {
      fetchUnreadNotifications();
    }, 5 * 60 * 1000); // 5 minutos

    logService.logInfo('Sistema de notificações iniciado', {
      dueDateCheckInterval: '1 hora',
      notificationPolling: '5 minutos'
    }, 'NotificationTriggers');

    // Cleanup na desmontagem
    return () => {
      // Limpar intervalos
      if (dueDateCheckIntervalRef.current) {
        clearInterval(dueDateCheckIntervalRef.current);
      }
      if (notificationPollingIntervalRef.current) {
        clearInterval(notificationPollingIntervalRef.current);
      }

      // Limpar todos os timeouts de marcação como lida
      Object.values(readTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      readTimeoutsRef.current = {};

      logService.logInfo('Sistema de notificações finalizado', {}, 'NotificationTriggers');
    };
  }, [user, checkDueDates, fetchUnreadNotifications]);

  // Funções para execução manual
  const runDueDateCheck = useCallback(() => {
    checkDueDates();
  }, [checkDueDates]);

  const runNotificationCheck = useCallback(() => {
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  const runAllChecks = useCallback(() => {
    checkDueDates();
    fetchUnreadNotifications();
  }, [checkDueDates, fetchUnreadNotifications]);

  return { 
    runDueDateCheck,
    runNotificationCheck,
    runAllChecks
  };
}