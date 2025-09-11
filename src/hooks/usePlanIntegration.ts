import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { checkPlanNotifications, showUpgradePrompt, showLimitReached } from '@/services/planNotificationService';
import { auditHooks } from '@/services/auditService';

/**
 * Hook para integração completa do sistema de planos
 */
export function usePlanIntegration() {
  const { user } = useAuth();
  const subscription = useSubscription();

  // Verificar notificações de plano na inicialização
  useEffect(() => {
    if (user && subscription) {
      const userProfile = {
        id: user.id,
        email: user.email || '',
        plan: subscription.plan,
        trial_ends_at: subscription.trialEndsAt,
        subscription_status: subscription.status
      };

      // Executar verificações após um pequeno delay para não afetar o carregamento
      const timer = setTimeout(() => {
        checkPlanNotifications(userProfile as any);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, subscription]);

  /**
   * Verifica se o usuário pode usar uma funcionalidade
   */
  const checkFeatureAccess = (feature: keyof typeof subscription.limits, currentUsage: number = 0): boolean => {
    if (!subscription.canUseFeature(feature, currentUsage)) {
      showUpgradePrompt(String(feature), `O recurso ${String(feature)} não está disponível no seu plano atual.`);
      
      // Log de auditoria
      if (user) {
        auditHooks.logView('system', user.id, user.email || '', `blocked-feature-${String(feature)}`);
      }
      
      return false;
    }

    if (subscription.isFeatureBlocked(feature, currentUsage)) {
      const limit = subscription.limits[feature] as number;
      showLimitReached(String(feature), currentUsage, limit);
      
      // Log de auditoria
      if (user) {
        auditHooks.logView('system', user.id, user.email || '', `limit-reached-${String(feature)}`);
      }
      
      return false;
    }

    return true;
  };

  /**
   * Wrapper para ações que requerem verificação de plano
   */
  const withPlanCheck = <T extends any[]>(
    feature: keyof typeof subscription.limits,
    action: (...args: T) => void | Promise<void>,
    currentUsage: number = 0
  ) => {
    return async (...args: T) => {
      if (checkFeatureAccess(feature, currentUsage)) {
        return action(...args);
      }
    };
  };

  /**
   * Obter informações de uso para exibição
   */
  const getUsageInfo = (feature: keyof typeof subscription.limits, currentUsage: number) => {
    const limit = subscription.limits[feature] as number;
    const percentage = subscription.getUsagePercentage(feature, currentUsage);
    const remaining = subscription.getRemainingItems(feature, currentUsage);
    const isBlocked = subscription.isFeatureBlocked(feature, currentUsage);

    return {
      current: currentUsage,
      limit,
      percentage,
      remaining,
      isBlocked,
      isNearLimit: percentage > 80,
      isUnlimited: limit === -1
    };
  };

  return {
    ...subscription,
    checkFeatureAccess,
    withPlanCheck,
    getUsageInfo,
    showUpgradePrompt: (feature: string, description?: string) => showUpgradePrompt(feature, description),
    showLimitReached: (feature: string, current: number, limit: number) => showLimitReached(feature, current, limit)
  };
}