import { supabase } from '@/integrations/supabase/client';
import { logService } from './logService';
import { SystemConfigService } from './systemConfigService';

export interface UserSubscription {
  id: string;
  user_id: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trial_ends_at?: string;
  subscription_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export class SubscriptionService {
  
  /**
   * Busca configurações de planos do system_config
   */
  static async getPlansConfiguration() {
    try {
      return await SystemConfigService.getPlansConfig();
    } catch (error) {
      logService.logError(error, 'SubscriptionService.getPlansConfiguration');
      return null;
    }
  }
  
  /**
   * Busca a assinatura do usuário atual
   */
  static async getCurrentSubscription(): Promise<UserSubscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return this.getByUserId(user.id);
    } catch (error) {
      logService.logError(error, 'SubscriptionService.getCurrentSubscription');
      return null;
    }
  }

  /**
   * Busca assinatura por user_id
   */
  static async getByUserId(userId: string): Promise<UserSubscription | null> {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logService.logError(error, 'SubscriptionService.getByUserId');
        return null;
      }

      return subscription;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.getByUserId');
      return null;
    }
  }

  /**
   * Cria trial automático para novo usuário
   */
  static async createTrial(userId: string): Promise<UserSubscription | null> {
    try {
      // Usar função RPC para criar trial de forma segura
      const { data: subscription, error } = await supabase
        .rpc('create_trial_subscription', {
          p_user_id: userId
        });

      if (error) {
        logService.logError(error, 'SubscriptionService.createTrial');
        return null;
      }

      // Logar criação do trial
      logService.logInfo(`Trial criado para usuário ${userId}`, { 
        subscription_id: subscription?.id,
        trial_ends_at: subscription?.trial_ends_at
      });
      
      return subscription;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.createTrial');
      return null;
    }
  }

  /**
   * Ativa assinatura premium
   */
  static async activateSubscription(userId: string, months: number = 1): Promise<UserSubscription | null> {
    try {
      const subscriptionEndsAt = new Date();
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + months);

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          subscription_ends_at: subscriptionEndsAt.toISOString().split('T')[0], // YYYY-MM-DD
          trial_ends_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logService.logError(error, 'SubscriptionService.activateSubscription');
        return null;
      }

      // Logar ativação
      logService.logInfo(`Assinatura ativada para usuário ${userId}`, { 
        subscription_id: subscription.id,
        months,
        subscription_ends_at: subscription.subscription_ends_at 
      });

      return subscription;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.activateSubscription');
      return null;
    }
  }

  /**
   * Cancela assinatura
   */
  static async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        logService.logError(error, 'SubscriptionService.cancelSubscription');
        return false;
      }

      // Logar cancelamento
      logService.logInfo(`Assinatura cancelada para usuário ${userId}`);
      
      return true;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.cancelSubscription');
      return false;
    }
  }

  /**
   * Marca assinatura como expirada
   */
  static async expireSubscription(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        logService.logError(error, 'SubscriptionService.expireSubscription');
        return false;
      }

      // Logar expiração
      logService.logInfo(`Assinatura expirada para usuário ${userId}`);
      
      return true;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.expireSubscription');
      return false;
    }
  }

  /**
   * Normaliza status da assinatura (expira se necessário)
   */
  static async normalizeStatus(userId: string): Promise<UserSubscription | null> {
    try {
      // Usar função RPC para normalizar status
      const { data: subscription, error } = await supabase
        .rpc('normalize_subscription_status', {
          p_user_id: userId
        });

      if (error) {
        logService.logError(error, 'SubscriptionService.normalizeStatus');
        return null;
      }

      return subscription;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.normalizeStatus');
      return null;
    }
  }

  /**
   * Calcula dias restantes do trial
   */
  static calculateRemainingTrialDays(trialEndsAt: string): number {
    try {
      const trialEnd = new Date(trialEndsAt);
      const today = new Date();
      const diffTime = trialEnd.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (error) {
      logService.logError(error, 'SubscriptionService.calculateRemainingTrialDays');
      return 0;
    }
  }

  /**
   * Calcula dias restantes da assinatura ativa
   */
  static calculateRemainingSubscriptionDays(subscriptionEndsAt: string): number {
    try {
      const subscriptionEnd = new Date(subscriptionEndsAt);
      const today = new Date();
      const diffTime = subscriptionEnd.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (error) {
      logService.logError(error, 'SubscriptionService.calculateRemainingSubscriptionDays');
      return 0;
    }
  }

  /**
   * Verifica se a assinatura está ativa
   */
  static isActiveSubscription(subscription: UserSubscription | null): boolean {
    if (!subscription) return false;

    const today = new Date();
    
    // Trial ativo
    if (subscription.status === 'trial' && subscription.trial_ends_at) {
      const trialEnd = new Date(subscription.trial_ends_at);
      return trialEnd >= today;
    }
    
    // Assinatura ativa
    if (subscription.status === 'active' && subscription.subscription_ends_at) {
      const subscriptionEnd = new Date(subscription.subscription_ends_at);
      return subscriptionEnd >= today;
    }

    return false;
  }

  /**
   * Busca todas as assinaturas (apenas para admins)
   */
  static async getAllSubscriptions(): Promise<UserSubscription[]> {
    try {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        logService.logError(error, 'SubscriptionService.getAllSubscriptions');
        return [];
      }

      return subscriptions || [];
    } catch (error) {
      logService.logError(error, 'SubscriptionService.getAllSubscriptions');
      return [];
    }
  }

  /**
   * Sincroniza planos com configurações do Stripe
   */
  static async syncPlansWithStripe(): Promise<boolean> {
    try {
      // Buscar configurações de planos
      const plansConfig = await this.getPlansConfiguration();
      if (!plansConfig) return false;

      // Buscar configuração do Stripe
      const stripeConfig = await SystemConfigService.getStripeConfig();
      if (!stripeConfig || !stripeConfig.enabled) return false;

      // Aqui seria implementada a lógica de sincronização com a API do Stripe
      // Por enquanto, apenas atualizamos o status de sincronização
      
      const updatedStripeConfig = {
        ...stripeConfig,
        last_sync: new Date().toISOString(),
        products_synced: true
      };

      const success = await SystemConfigService.updateStripeConfig(updatedStripeConfig);
      
      if (success) {
        logService.logInfo('Planos sincronizados com Stripe', { 
          plansCount: Object.keys(plansConfig).length,
          syncTime: new Date().toISOString()
        });
      }

      return success;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.syncPlansWithStripe');
      return false;
    }
  }

  /**
   * Verifica se o Stripe está configurado e habilitado
   */
  static async isStripeEnabled(): Promise<boolean> {
    try {
      const stripeConfig = await SystemConfigService.getStripeConfig();
      return stripeConfig?.enabled === true;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.isStripeEnabled');
      return false;
    }
  }

  /**
   * Busca configuração de um plano específico
   */
  static async getPlanConfig(planId: 'free' | 'trial' | 'premium') {
    try {
      const plansConfig = await this.getPlansConfiguration();
      return plansConfig?.[planId] || null;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.getPlanConfig');
      return null;
    }
  }

  /**
   * Busca todos os planos disponíveis (alias para getPlansConfiguration)
   */
  static async getAvailablePlans() {
    return this.getPlansConfiguration();
  }

  /**
   * Busca plano por ID (alias para getPlanConfig)
   */
  static async getPlanById(planId: 'free' | 'trial' | 'premium') {
    return this.getPlanConfig(planId);
  }

  /**
   * Verifica se usuário pode fazer upgrade para um plano específico
   */
  static async canUpgradeToPlan(userId: string, planId: 'free' | 'trial' | 'premium'): Promise<boolean> {
    try {
      const currentSubscription = await this.getByUserId(userId);
      
      // Se não tem subscription, pode criar trial ou premium
      if (!currentSubscription) {
        return planId === 'trial' || planId === 'premium';
      }

      // Usuários com trial expirado podem ir para premium
      if (currentSubscription.status === 'expired' && planId === 'premium') {
        return true;
      }

      // Usuários com trial ativo podem ir para premium
      if (currentSubscription.status === 'trial' && planId === 'premium') {
        return true;
      }

      // Se já tem premium ativo, não pode fazer upgrade
      if (currentSubscription.status === 'active') {
        return false;
      }

      // Trial apenas para novos usuários (sem subscription anterior)
      if (planId === 'trial') {
        return currentSubscription.status !== 'trial' && currentSubscription.status !== 'active';
      }

      return false;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.canUpgradeToPlan');
      return false;
    }
  }

  /**
   * Cria sessão de checkout do Stripe
   */
  static async createCheckoutSession(planId: 'premium', userId: string): Promise<{ url?: string; error?: string }> {
    try {
      // Verificar se Stripe está habilitado
      const isEnabled = await this.isStripeEnabled();
      if (!isEnabled) {
        return { error: 'Sistema de pagamentos não configurado. Entre em contato pelo WhatsApp.' };
      }

      // Verificar se o plano existe
      const plan = await this.getPlanConfig(planId);
      if (!plan) {
        return { error: 'Plano não encontrado' };
      }

      // Verificar se usuário pode fazer upgrade
      const canUpgrade = await this.canUpgradeToPlan(userId, planId);
      if (!canUpgrade) {
        return { error: 'Upgrade não permitido para este plano' };
      }

      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { error: 'Usuário não autenticado' };
      }

      // Chamar Edge Function para criar checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId: planId
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        logService.logError(error, 'SubscriptionService.createCheckoutSession.edgeFunction');
        return { error: 'Erro ao criar sessão de checkout. Tente novamente.' };
      }

      if (data?.url) {
        return { url: data.url };
      }

      return { error: data?.message || 'Erro desconhecido ao criar checkout' };

    } catch (error) {
      logService.logError(error, 'SubscriptionService.createCheckoutSession');
      return { error: 'Erro interno. Tente novamente.' };
    }
  }

  /**
   * Verifica elegibilidade para trial gratuito
   */
  static async isEligibleForTrial(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getByUserId(userId);
      
      // Se nunca teve subscription, é elegível
      if (!subscription) {
        return true;
      }

      // Se já usou trial ou tem premium, não é elegível
      if (subscription.status === 'trial' || subscription.status === 'active') {
        return false;
      }

      return true;
    } catch (error) {
      logService.logError(error, 'SubscriptionService.isEligibleForTrial');
      return false;
    }
  }

  /**
   * Determina o plano atual baseado na subscription
   */
  static getCurrentPlanId(subscription: UserSubscription | null): 'free' | 'trial' | 'premium' {
    if (!subscription) return 'free';

    const today = new Date();
    
    // Trial ativo
    if (subscription.status === 'trial' && subscription.trial_ends_at) {
      const trialEnd = new Date(subscription.trial_ends_at);
      if (trialEnd >= today) {
        return 'trial';
      }
    }
    
    // Premium ativo
    if (subscription.status === 'active' && subscription.subscription_ends_at) {
      const subscriptionEnd = new Date(subscription.subscription_ends_at);
      if (subscriptionEnd >= today) {
        return 'premium';
      }
    }

    // Default para free
    return 'free';
  }

  /**
   * Verifica limites de uso baseado no plano atual
   */
  static async checkUsageLimits(userId: string, feature: 'contas_pagar' | 'fornecedores' | 'categorias', currentCount: number): Promise<{ allowed: boolean; limit: number }> {
    try {
      const subscription = await this.getByUserId(userId);
      const currentPlanId = this.getCurrentPlanId(subscription);
      const plan = await this.getPlanConfig(currentPlanId);
      
      if (!plan) {
        // Se não conseguir buscar plano, usar limites do free
        const limit = feature === 'contas_pagar' ? 10 : feature === 'fornecedores' ? 5 : 3;
        return { allowed: currentCount < limit, limit };
      }

      const limit = plan.features[feature] as number;
      
      // -1 significa ilimitado
      if (limit === -1) {
        return { allowed: true, limit: -1 };
      }

      return { allowed: currentCount < limit, limit };
    } catch (error) {
      logService.logError(error, 'SubscriptionService.checkUsageLimits');
      // Em caso de erro, permitir (fail-safe)
      return { allowed: true, limit: -1 };
    }
  }

  /**
   * Busca estatísticas de uso por plano (apenas para admins)
   */
  static async getPlanUsageStats(): Promise<{ planId: string; userCount: number }[]> {
    try {
      const allSubscriptions = await this.getAllSubscriptions();
      
      const stats = {
        free: 0,
        trial: 0,
        premium: 0
      };

      allSubscriptions.forEach(subscription => {
        const planId = this.getCurrentPlanId(subscription);
        stats[planId]++;
      });

      return [
        { planId: 'free', userCount: stats.free },
        { planId: 'trial', userCount: stats.trial },
        { planId: 'premium', userCount: stats.premium }
      ];
    } catch (error) {
      logService.logError(error, 'SubscriptionService.getPlanUsageStats');
      return [];
    }
  }
}