import { supabase } from '@/integrations/supabase/client';
import { NotificationsService } from './notificationsService';
import { ProfileService } from './profileService';
import { addDays, isAfter, isBefore, format } from 'date-fns';

class NotificationTriggerService {
  /**
   * Verifica e cria notificações para contas a vencer em breve
   */
  static async checkBillsDueSoon(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const threeDaysFromNow = addDays(new Date(), 3);
      const today = new Date();

      // Buscar contas a pagar que vencem em 3 dias
      const { data: accountsPayable, error: payableError } = await supabase
        .from('accounts_payable')
        .select('id, description, amount, due_date')
        .eq('status', 'pending')
        .gte('due_date', format(today, 'yyyy-MM-dd'))
        .lte('due_date', format(threeDaysFromNow, 'yyyy-MM-dd'));

      if (payableError) throw payableError;

      // Buscar contas a receber que vencem em 3 dias
      const { data: accountsReceivable, error: receivableError } = await supabase
        .from('accounts_receivable')
        .select('id, description, amount, due_date')
        .eq('status', 'pending')
        .gte('due_date', format(today, 'yyyy-MM-dd'))
        .lte('due_date', format(threeDaysFromNow, 'yyyy-MM-dd'));

      if (receivableError) throw receivableError;

      // Criar notificações para contas a pagar
      for (const account of accountsPayable || []) {
        try {
          await NotificationsService.createBillDueSoon(
            user.user.id,
            account.id,
            account.due_date,
            parseFloat(account.amount)
          );
        } catch (error) {
          // Ignorar erros de duplicação
          if (!error.message.includes('duplicada')) {
            console.error('Erro ao criar notificação de conta a pagar:', error);
          }
        }
      }

      // Criar notificações para contas a receber
      for (const account of accountsReceivable || []) {
        try {
          await NotificationsService.create({
            user_id: user.user.id,
            type: 'bill_due_soon',
            severity: 'warning',
            title: 'Recebimento vencendo',
            message: `Conta a receber de R$ ${parseFloat(account.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} vence em ${new Date(account.due_date).toLocaleDateString('pt-BR')}`,
            data: {
              accounts_receivable_id: account.id,
              due_date: account.due_date,
              amount: parseFloat(account.amount),
              route: `/contas-receber?highlight=${account.id}`
            }
          });
        } catch (error) {
          // Ignorar erros de duplicação
          if (!error.message.includes('duplicada')) {
            console.error('Erro ao criar notificação de conta a receber:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar contas vencendo:', error);
    }
  }

  /**
   * Verifica e cria notificações para contas vencidas
   */
  static async checkOverdueBills(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const today = new Date();

      // Buscar contas a pagar vencidas
      const { data: accountsPayable, error: payableError } = await supabase
        .from('accounts_payable')
        .select('id, description, amount, due_date')
        .eq('status', 'pending')
        .lt('due_date', format(today, 'yyyy-MM-dd'));

      if (payableError) throw payableError;

      // Buscar contas a receber vencidas
      const { data: accountsReceivable, error: receivableError } = await supabase
        .from('accounts_receivable')
        .select('id, description, amount, due_date')
        .eq('status', 'pending')
        .lt('due_date', format(today, 'yyyy-MM-dd'));

      if (receivableError) throw receivableError;

      // Criar notificações para contas a pagar vencidas
      for (const account of accountsPayable || []) {
        try {
          await NotificationsService.createBillOverdue(
            user.user.id,
            account.id,
            account.due_date,
            parseFloat(account.amount)
          );
        } catch (error) {
          // Ignorar erros de duplicação
          if (!error.message.includes('duplicada')) {
            console.error('Erro ao criar notificação de conta vencida:', error);
          }
        }
      }

      // Criar notificações para contas a receber vencidas
      for (const account of accountsReceivable || []) {
        try {
          await NotificationsService.create({
            user_id: user.user.id,
            type: 'bill_overdue',
            severity: 'error',
            title: 'Recebimento em atraso',
            message: `Conta a receber de R$ ${parseFloat(account.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} está vencida desde ${new Date(account.due_date).toLocaleDateString('pt-BR')}`,
            data: {
              accounts_receivable_id: account.id,
              due_date: account.due_date,
              amount: parseFloat(account.amount),
              route: `/contas-receber?highlight=${account.id}`
            }
          });
        } catch (error) {
          // Ignorar erros de duplicação
          if (!error.message.includes('duplicada')) {
            console.error('Erro ao criar notificação de recebimento vencido:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar contas vencidas:', error);
    }
  }

  /**
   * Verifica se o trial está expirando
   */
  static async checkTrialExpiring(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const profile = await ProfileService.getCurrentProfile();
      if (!profile || !profile.trial_ends_at) return;

      const trialEndDate = new Date(profile.trial_ends_at);
      const today = new Date();
      const threeDaysFromNow = addDays(today, 3);

      // Se o trial expira em 3 dias ou menos
      if (isBefore(trialEndDate, threeDaysFromNow) && isAfter(trialEndDate, today)) {
        const daysLeft = Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        try {
          await NotificationsService.createTrialExpiring(user.user.id, daysLeft);
        } catch (error) {
          // Ignorar erros de duplicação
          if (!error.message.includes('duplicada')) {
            console.error('Erro ao criar notificação de trial expirando:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar trial expirando:', error);
    }
  }

  /**
   * Verifica assinatura expirada
   */
  static async checkSubscriptionExpired(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const profile = await ProfileService.getCurrentProfile();
      if (!profile) return;

      // Se o trial já expirou
      if (profile.trial_ends_at && isBefore(new Date(profile.trial_ends_at), new Date())) {
        try {
          await NotificationsService.create({
            user_id: user.user.id,
            type: 'subscription_expired',
            severity: 'error',
            title: 'Período de teste expirado',
            message: 'Seu período de teste expirou. Assine um plano para continuar usando o sistema.',
            data: {
              route: '/assinatura'
            }
          });
        } catch (error) {
          // Ignorar erros de duplicação
          if (!error.message.includes('duplicada')) {
            console.error('Erro ao criar notificação de assinatura expirada:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura expirada:', error);
    }
  }

  /**
   * Executa todas as verificações de notificações
   */
  static async runAllChecks(): Promise<void> {
    await Promise.allSettled([
      this.checkBillsDueSoon(),
      this.checkOverdueBills(),
      this.checkTrialExpiring(),
      this.checkSubscriptionExpired()
    ]);
  }

  /**
   * Cria uma notificação de boas-vindas para novos usuários
   */
  static async createWelcomeNotification(userId: string): Promise<void> {
    try {
      await NotificationsService.create({
        user_id: userId,
        type: 'info',
        severity: 'success',
        title: 'Bem-vindo ao JC Financeiro!',
        message: 'Sua conta foi criada com sucesso. Explore o sistema e configure suas preferências.',
        data: {
          route: '/configuracoes'
        }
      });
    } catch (error) {
      console.error('Erro ao criar notificação de boas-vindas:', error);
    }
  }
}

export { NotificationTriggerService };