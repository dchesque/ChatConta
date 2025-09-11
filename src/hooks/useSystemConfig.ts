import { useState, useEffect, useCallback } from 'react';
import { 
  SystemConfigService, 
  PlansConfig, 
  StripeConfig, 
  SystemSettings,
  SystemConfigItem,
  PlanConfig
} from '@/services/systemConfigService';
import { useAuth } from './useAuth';
import { logService } from '@/services/logService';
import { toast } from 'sonner';

export function useSystemConfig() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para as diferentes configurações
  const [plansConfig, setPlansConfig] = useState<PlansConfig | null>(null);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [allConfigs, setAllConfigs] = useState<SystemConfigItem[]>([]);
  const [changesLog, setChangesLog] = useState<any[]>([]);

  // Cache local para performance
  const [lastFetch, setLastFetch] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Carrega todas as configurações
   */
  const loadAllConfigs = useCallback(async (forceRefresh = false) => {
    // Verificar cache
    const now = Date.now();
    if (!forceRefresh && (now - lastFetch) < CACHE_DURATION) {
      return;
    }

    try {
      setRefreshing(true);

      // Carregar configurações em paralelo
      const [plans, stripe, system, all, logs] = await Promise.all([
        SystemConfigService.getPlansConfig(),
        SystemConfigService.getStripeConfig(),
        SystemConfigService.getSystemSettings(),
        isAdmin ? SystemConfigService.getAllConfigs() : Promise.resolve([]),
        isAdmin ? SystemConfigService.getConfigChangesLog(20) : Promise.resolve([])
      ]);

      setPlansConfig(plans);
      setStripeConfig(stripe);
      setSystemSettings(system);
      setAllConfigs(all);
      setChangesLog(logs);
      setLastFetch(now);

    } catch (error) {
      logService.logError(error, 'useSystemConfig.loadAllConfigs');
      toast.error('Erro ao carregar configurações do sistema');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [isAdmin, lastFetch]);

  /**
   * Carrega apenas configurações de planos
   */
  const loadPlansConfig = useCallback(async () => {
    try {
      const plans = await SystemConfigService.getPlansConfig();
      setPlansConfig(plans);
      return plans;
    } catch (error) {
      logService.logError(error, 'useSystemConfig.loadPlansConfig');
      return null;
    }
  }, []);

  /**
   * Atualiza configuração de planos
   */
  const updatePlansConfig = useCallback(async (newPlansConfig: PlansConfig): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem alterar configurações');
      return false;
    }

    try {
      setSaving(true);

      // Validar configurações antes de salvar
      const validationErrors: string[] = [];
      
      Object.entries(newPlansConfig).forEach(([planId, plan]) => {
        const validation = SystemConfigService.validatePlanConfig(plan);
        if (!validation.valid) {
          validationErrors.push(`Plano ${planId}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        toast.error(`Erros de validação:\n${validationErrors.join('\n')}`);
        return false;
      }

      const success = await SystemConfigService.updatePlansConfig(newPlansConfig);
      
      if (success) {
        setPlansConfig(newPlansConfig);
        toast.success('Configuração de planos atualizada com sucesso!');
        
        // Recarregar log de mudanças
        if (isAdmin) {
          const logs = await SystemConfigService.getConfigChangesLog(20);
          setChangesLog(logs);
        }
        
        return true;
      } else {
        toast.error('Erro ao salvar configuração de planos');
        return false;
      }
    } catch (error) {
      logService.logError(error, 'useSystemConfig.updatePlansConfig');
      toast.error('Erro ao atualizar configuração de planos');
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin]);

  /**
   * Atualiza configuração do Stripe
   */
  const updateStripeConfig = useCallback(async (newStripeConfig: StripeConfig): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem alterar configurações');
      return false;
    }

    try {
      setSaving(true);
      
      const success = await SystemConfigService.updateStripeConfig(newStripeConfig);
      
      if (success) {
        setStripeConfig(newStripeConfig);
        toast.success('Configuração do Stripe atualizada!');
        return true;
      } else {
        toast.error('Erro ao salvar configuração do Stripe');
        return false;
      }
    } catch (error) {
      logService.logError(error, 'useSystemConfig.updateStripeConfig');
      toast.error('Erro ao atualizar configuração do Stripe');
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin]);

  /**
   * Atualiza configurações gerais do sistema
   */
  const updateSystemSettings = useCallback(async (newSettings: SystemSettings): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem alterar configurações');
      return false;
    }

    try {
      setSaving(true);
      
      const success = await SystemConfigService.updateSystemSettings(newSettings);
      
      if (success) {
        setSystemSettings(newSettings);
        toast.success('Configurações do sistema atualizadas!');
        return true;
      } else {
        toast.error('Erro ao salvar configurações do sistema');
        return false;
      }
    } catch (error) {
      logService.logError(error, 'useSystemConfig.updateSystemSettings');
      toast.error('Erro ao atualizar configurações do sistema');
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin]);

  /**
   * Sincroniza planos com Stripe
   */
  const syncWithStripe = useCallback(async (): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem sincronizar com Stripe');
      return false;
    }

    try {
      setSaving(true);
      toast.info('Sincronizando com Stripe...');
      
      const success = await SystemConfigService.syncPlansWithStripe();
      
      if (success) {
        // Recarregar configuração do Stripe
        const updatedStripeConfig = await SystemConfigService.getStripeConfig();
        setStripeConfig(updatedStripeConfig);
        
        toast.success('Sincronização com Stripe concluída!');
        return true;
      } else {
        toast.error('Erro na sincronização com Stripe');
        return false;
      }
    } catch (error) {
      logService.logError(error, 'useSystemConfig.syncWithStripe');
      toast.error('Erro ao sincronizar com Stripe');
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAdmin]);

  /**
   * Recarrega configurações
   */
  const refreshConfigs = useCallback(async () => {
    await loadAllConfigs(true);
    toast.success('Configurações atualizadas!');
  }, [loadAllConfigs]);

  /**
   * Busca um plano específico
   */
  const getPlan = useCallback((planId: 'free' | 'trial' | 'premium'): PlanConfig | null => {
    return plansConfig?.[planId] || null;
  }, [plansConfig]);

  /**
   * Verifica se Stripe está configurado
   */
  const isStripeConfigured = useCallback((): boolean => {
    return stripeConfig?.enabled === true && stripeConfig?.products_synced === true;
  }, [stripeConfig]);

  /**
   * Busca status do sistema
   */
  const getSystemStatus = useCallback(() => {
    return {
      maintenance: systemSettings?.maintenance_mode || false,
      registrationEnabled: systemSettings?.registration_enabled || true,
      trialAutoCreation: systemSettings?.trial_auto_creation || true,
      stripeEnabled: stripeConfig?.enabled || false,
      stripeConfigured: isStripeConfigured()
    };
  }, [systemSettings, stripeConfig, isStripeConfigured]);

  // Carregar configurações ao montar o componente
  useEffect(() => {
    if (isAdmin !== undefined) { // Aguarda carregamento da auth
      loadAllConfigs();
    }
  }, [isAdmin, loadAllConfigs]);

  return {
    // Estados
    loading,
    saving,
    refreshing,
    plansConfig,
    stripeConfig,
    systemSettings,
    allConfigs,
    changesLog,
    
    // Computed
    isStripeConfigured: isStripeConfigured(),
    systemStatus: getSystemStatus(),
    
    // Ações
    loadAllConfigs,
    loadPlansConfig,
    updatePlansConfig,
    updateStripeConfig,
    updateSystemSettings,
    syncWithStripe,
    refreshConfigs,
    
    // Helpers
    getPlan,
    
    // Permissões
    canEdit: isAdmin
  };
}