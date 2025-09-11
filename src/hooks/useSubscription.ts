import { useState, useEffect, useCallback } from 'react';
import { SubscriptionService, UserSubscription } from '@/services/subscriptionService';
import { useAuth } from './useAuth';
import { logService } from '@/services/logService';
import { toast } from 'sonner';
import { SystemConfigService, PlansConfig, PlanConfig, StripeConfig } from '@/services/systemConfigService';

// Definir tipos de plano e limites
export type UserPlan = 'free' | 'trial' | 'premium';

export interface PlanLimits {
  contas_pagar: number;
  fornecedores: number;
  categorias: number;
  relatorios: boolean;
  exportacao: boolean;
  backup: boolean;
}

export interface PlanConfig {
  name: string;
  price: string;
  limits: PlanLimits;
}

// Configurações padrão como fallback
const DEFAULT_PLAN_CONFIGS: Record<UserPlan, PlanConfig> = {
  free: {
    name: 'Grátis',
    price: 'R$ 0',
    limits: {
      contas_pagar: 10,
      fornecedores: 5,
      categorias: 3,
      relatorios: false,
      exportacao: false,
      backup: false
    }
  },
  trial: {
    name: 'Trial',
    price: 'Gratuito por 7 dias',
    limits: {
      contas_pagar: 50,
      fornecedores: 20,
      categorias: 10,
      relatorios: true,
      exportacao: false,
      backup: false
    }
  },
  premium: {
    name: 'Premium',
    price: 'R$ 29,90/mês',
    limits: {
      contas_pagar: -1, // -1 = ilimitado
      fornecedores: -1,
      categorias: -1,
      relatorios: true,
      exportacao: true,
      backup: true
    }
  }
};

export function useSubscription() {
  const { user, profile, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dynamicPlansConfig, setDynamicPlansConfig] = useState<PlansConfig | null>(null);
  const [planConfigsLoading, setPlanConfigsLoading] = useState(true);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [stripeLoading, setStripeLoading] = useState(true);

  // Função para carregar configurações de planos
  const loadPlansConfiguration = useCallback(async () => {
    try {
      setPlanConfigsLoading(true);
      const plansConfig = await SystemConfigService.getPlansConfig();
      setDynamicPlansConfig(plansConfig);
    } catch (error) {
      logService.logError(error, 'useSubscription.loadPlansConfiguration');
      // Manter configuração padrão como fallback
    } finally {
      setPlanConfigsLoading(false);
    }
  }, []);

  // Função para carregar configurações do Stripe
  const loadStripeConfiguration = useCallback(async () => {
    try {
      setStripeLoading(true);
      const config = await SystemConfigService.getStripeConfig();
      setStripeConfig(config);
    } catch (error) {
      logService.logError(error, 'useSubscription.loadStripeConfiguration');
    } finally {
      setStripeLoading(false);
    }
  }, []);

  // Função para buscar e normalizar assinatura
  const refreshSubscription = useCallback(async (userId?: string) => {
    if (!userId && !user?.id) {
      setLoading(false);
      return null;
    }

    const targetUserId = userId || user!.id;

    try {
      setRefreshing(true);
      
      // Normalizar status primeiro (expira automaticamente se necessário)
      const normalizedSubscription = await SubscriptionService.normalizeStatus(targetUserId);
      
      if (normalizedSubscription) {
        setSubscription(normalizedSubscription);
        return normalizedSubscription;
      }

      // Se não existe assinatura, buscar novamente
      const currentSubscription = await SubscriptionService.getCurrentSubscription();
      setSubscription(currentSubscription);
      
      return currentSubscription;
    } catch (error) {
      logService.logError(error, 'useSubscription.refreshSubscription');
      return null;
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [user?.id]);

  // Função para criar trial automático
  const ensureTrialExists = useCallback(async () => {
    if (!user?.id || !isAuthenticated) return;

    try {
      // Verificar se já existe assinatura
      let currentSubscription = await SubscriptionService.getCurrentSubscription();
      
      if (!currentSubscription) {
        // Criar trial automático
        logService.logInfo('Criando trial automático para novo usuário', { userId: user.id });
        
        currentSubscription = await SubscriptionService.createTrial(user.id);
        
        if (currentSubscription) {
          setSubscription(currentSubscription);
          toast.success('Bem-vindo! Você tem 7 dias grátis para testar todas as funcionalidades.');
        }
      } else {
        // Normalizar status da assinatura existente
        await refreshSubscription(user.id);
      }
    } catch (error) {
      logService.logError(error, 'useSubscription.ensureTrialExists');
    }
  }, [user?.id, isAuthenticated, refreshSubscription]);

  // Carregar configurações de planos e Stripe
  useEffect(() => {
    loadPlansConfiguration();
    loadStripeConfiguration();
  }, [loadPlansConfiguration, loadStripeConfiguration]);

  // Carregar assinatura ao fazer login
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      ensureTrialExists();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, ensureTrialExists]);

  // Helpers computados
  const status = subscription?.status || 'expired';
  const trialEndsAt = subscription?.trial_ends_at;
  const subscriptionEndsAt = subscription?.subscription_ends_at;

  const isActive = SubscriptionService.isActiveSubscription(subscription);
  const isTrialActive = status === 'trial' && isActive;
  const isPremiumActive = status === 'active' && isActive;
  const isExpired = status === 'expired' || !isActive;

  const remainingTrialDays = trialEndsAt 
    ? SubscriptionService.calculateRemainingTrialDays(trialEndsAt)
    : 0;

  const remainingSubscriptionDays = subscriptionEndsAt 
    ? SubscriptionService.calculateRemainingSubscriptionDays(subscriptionEndsAt)
    : 0;

  // Determinar plano atual baseado no status da assinatura
  const plan: UserPlan = (() => {
    if (isTrialActive) return 'trial';
    if (isPremiumActive) return 'premium';
    return 'free';
  })();

  // Função para converter configuração dinâmica para formato legacy
  const convertDynamicToLegacy = (dynamicPlan: PlanConfig): PlanConfig => {
    const formatPrice = (price: number, currency: string = 'BRL') => {
      if (price === 0) return 'Gratuito';
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency
      }).format(price);
    };

    return {
      name: dynamicPlan.displayName,
      price: formatPrice(dynamicPlan.price, dynamicPlan.currency),
      limits: {
        contas_pagar: dynamicPlan.features.contas_pagar,
        fornecedores: dynamicPlan.features.fornecedores,
        categorias: dynamicPlan.features.categorias,
        relatorios: dynamicPlan.features.relatorios,
        exportacao: dynamicPlan.features.exportacao,
        backup: dynamicPlan.features.backup
      }
    };
  };

  // Configuração do plano atual (dinâmica ou fallback)
  const planConfig = (() => {
    if (dynamicPlansConfig) {
      const dynamicPlan = dynamicPlansConfig[plan];
      if (dynamicPlan) {
        return convertDynamicToLegacy(dynamicPlan);
      }
    }
    return DEFAULT_PLAN_CONFIGS[plan];
  })();
  
  const limits = planConfig.limits;

  // Dias restantes (trial ou premium)
  const daysRemaining = isTrialActive ? remainingTrialDays : remainingSubscriptionDays;

  // Aliases para compatibilidade
  const isPremium = isPremiumActive;
  const isTrial = isTrialActive;

  // Verificar se uma feature está bloqueada
  const isFeatureBlocked = (feature: keyof PlanLimits, currentUsage: number = 0): boolean => {
    const limit = limits[feature];
    if (typeof limit === 'boolean') return !limit;
    if (limit === -1) return false; // Ilimitado
    return currentUsage >= limit;
  };

  // Calcular porcentagem de uso
  const getUsagePercentage = (feature: keyof PlanLimits, currentUsage: number = 0): number => {
    const limit = limits[feature];
    if (typeof limit === 'boolean') return limit ? 0 : 100;
    if (limit === -1) return 0; // Ilimitado
    return Math.min((currentUsage / limit) * 100, 100);
  };

  // Obter itens restantes
  const getRemainingItems = (feature: keyof PlanLimits, currentUsage: number = 0): string => {
    const limit = limits[feature];
    if (typeof limit === 'boolean') {
      return limit ? 'Disponível' : 'Bloqueado';
    }
    if (limit === -1) return 'Ilimitado';
    const remaining = Math.max(0, limit - currentUsage);
    return `${remaining} de ${limit} restantes`;
  };

  // Verificar se pode usar uma feature
  const canUseFeature = (feature: keyof PlanLimits, currentUsage: number = 0): boolean => {
    return !isFeatureBlocked(feature, currentUsage);
  };

  // Verificar limite de uma feature
  const checkLimit = (feature: keyof PlanLimits, currentUsage: number = 0): boolean => {
    return canUseFeature(feature, currentUsage);
  };

  // Ações
  const activateSubscription = async (months: number = 1) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const activated = await SubscriptionService.activateSubscription(user.id, months);
      
      if (activated) {
        setSubscription(activated);
        toast.success(`Assinatura Premium ativada por ${months} mês(es)!`);
        return true;
      } else {
        toast.error('Erro ao ativar assinatura');
        return false;
      }
    } catch (error) {
      logService.logError(error, 'useSubscription.activateSubscription');
      toast.error('Erro ao ativar assinatura');
      return false;
    }
  };

  const cancelSubscription = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const cancelled = await SubscriptionService.cancelSubscription(user.id);
      
      if (cancelled) {
        await refreshSubscription();
        toast.success('Assinatura cancelada com sucesso');
        return true;
      } else {
        toast.error('Erro ao cancelar assinatura');
        return false;
      }
    } catch (error) {
      logService.logError(error, 'useSubscription.cancelSubscription');
      toast.error('Erro ao cancelar assinatura');
      return false;
    }
  };

  // Badge/Status para UI
  const getStatusBadge = () => {
    if (loading) return { text: 'Carregando...', variant: 'default' as const };

    if (isTrialActive) {
      return {
        text: `Trial - ${remainingTrialDays} dias restantes`,
        variant: 'default' as const
      };
    }

    if (isPremiumActive) {
      return {
        text: `Premium - ${remainingSubscriptionDays} dias restantes`,
        variant: 'default' as const
      };
    }

    return {
      text: 'Assinatura Expirada',
      variant: 'destructive' as const
    };
  };

  // Função para upgrade de plano
  const upgradePlan = async () => {
    if (plan === 'premium') {
      toast.info('Você já possui o plano Premium');
      return false;
    }
    
    try {
      const success = await activateSubscription(1);
      if (success) {
        toast.success('Plano Premium ativado com sucesso!');
      }
      return success;
    } catch (error) {
      logService.logError(error, 'useSubscription.upgradePlan');
      toast.error('Erro ao fazer upgrade do plano');
      return false;
    }
  };

  // Novos métodos para integração com planos dinâmicos
  const availablePlans = dynamicPlansConfig;
  const currentPlanId = subscription ? SubscriptionService.getCurrentPlanId(subscription) : 'free';
  const isStripeEnabled = stripeConfig?.enabled || false;

  // Verificar se pode fazer upgrade para um plano específico
  const canUpgrade = useCallback(async (planId: 'free' | 'trial' | 'premium') => {
    if (!user?.id) return false;
    return await SubscriptionService.canUpgradeToPlan(user.id, planId);
  }, [user?.id]);

  // Verificar elegibilidade para trial
  const isEligibleForTrial = useCallback(async () => {
    if (!user?.id) return false;
    return await SubscriptionService.isEligibleForTrial(user.id);
  }, [user?.id]);

  // Criar sessão de checkout
  const createCheckoutSession = useCallback(async (planId: 'premium') => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return { error: 'Usuário não autenticado' };
    }

    try {
      const result = await SubscriptionService.createCheckoutSession(planId, user.id);
      
      if (result.error) {
        toast.error(result.error);
        return result;
      }

      if (result.url) {
        // Redirecionar para checkout do Stripe
        window.location.href = result.url;
        return result;
      }

      return { error: 'URL de checkout não encontrada' };
    } catch (error) {
      logService.logError(error, 'useSubscription.createCheckoutSession');
      toast.error('Erro ao criar sessão de checkout');
      return { error: 'Erro interno' };
    }
  }, [user?.id]);

  // Função para selecionar um plano
  const selectPlan = useCallback(async (planId: 'free' | 'trial' | 'premium') => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      // Verificar se pode fazer upgrade
      const canUpgradeToThis = await canUpgrade(planId);
      if (!canUpgradeToThis) {
        toast.error('Upgrade não permitido para este plano');
        return false;
      }

      if (planId === 'trial') {
        // Criar trial
        const trialSubscription = await SubscriptionService.createTrial(user.id);
        if (trialSubscription) {
          setSubscription(trialSubscription);
          toast.success('Trial ativado com sucesso!');
          return true;
        }
        return false;
      }

      if (planId === 'premium') {
        // Verificar se Stripe está habilitado
        if (!isStripeEnabled) {
          toast.error('Sistema de pagamentos não configurado. Entre em contato pelo WhatsApp.');
          return false;
        }

        // Criar sessão de checkout
        return await createCheckoutSession(planId);
      }

      return false;
    } catch (error) {
      logService.logError(error, 'useSubscription.selectPlan');
      toast.error('Erro ao selecionar plano');
      return false;
    }
  }, [user?.id, canUpgrade, isStripeEnabled, createCheckoutSession]);

  return {
    // Estados
    subscription,
    loading: loading || planConfigsLoading,
    refreshing,
    
    // Status computados
    status,
    isActive,
    isTrialActive,
    isPremiumActive,
    isExpired,
    
    // Datas e contadores
    trialEndsAt,
    subscriptionEndsAt,
    remainingTrialDays,
    remainingSubscriptionDays,
    daysRemaining,
    
    // Plano atual
    plan,
    planConfig,
    limits,
    isPremium,
    isTrial,
    
    // Configurações dinâmicas
    dynamicPlansConfig,
    planConfigsLoading,
    loadPlansConfiguration,
    
    // Configurações do Stripe
    stripeConfig,
    stripeLoading,
    loadStripeConfiguration,
    
    // Novos campos para integração dinâmica
    availablePlans,
    currentPlanId,
    isStripeEnabled,
    
    // Verificações de limites e features
    isFeatureBlocked,
    getUsagePercentage,
    getRemainingItems,
    canUseFeature,
    checkLimit,
    
    // Ações
    refreshSubscription,
    activateSubscription,
    cancelSubscription,
    ensureTrialExists,
    upgradePlan,
    
    // Novas ações para planos dinâmicos
    canUpgrade,
    isEligibleForTrial,
    createCheckoutSession,
    selectPlan,
    
    // UI helpers
    getStatusBadge
  };
}