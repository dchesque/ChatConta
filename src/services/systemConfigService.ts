import { supabase } from '@/integrations/supabase/client';
import { logService } from './logService';

// Tipos para configurações do sistema
export interface PlanConfig {
  id: 'free' | 'trial' | 'premium';
  name: string;
  displayName: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  trialDays: number;
  features: {
    contas_pagar: number; // -1 para ilimitado
    fornecedores: number;
    categorias: number;
    relatorios: boolean;
    exportacao: boolean;
    backup: boolean;
    suporte_prioritario: boolean;
  };
  stripe: {
    priceId: string;
    productId: string;
  };
}

export interface PlansConfig {
  free: PlanConfig;
  trial: PlanConfig;
  premium: PlanConfig;
}

export interface StripeConfig {
  enabled: boolean;
  environment: 'test' | 'live';
  webhook_configured: boolean;
  last_sync: string | null;
  products_synced: boolean;
}

export interface SystemSettings {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  trial_auto_creation: boolean;
  default_trial_days: number;
  max_trial_extensions: number;
}

export interface SystemConfigItem {
  id: number;
  key: string;
  value: any;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export class SystemConfigService {
  
  /**
   * Busca uma configuração específica por chave
   */
  static async getConfig(key: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (error) {
        logService.logError(error, 'SystemConfigService.getConfig');
        return null;
      }

      return data?.value || null;
    } catch (error) {
      logService.logError(error, 'SystemConfigService.getConfig');
      return null;
    }
  }

  /**
   * Salva/atualiza uma configuração
   */
  static async setConfig(key: string, value: any, description?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('system_config')
        .upsert({
          key,
          value,
          description,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) {
        logService.logError(error, 'SystemConfigService.setConfig');
        return false;
      }

      // Log da alteração
      logService.logInfo(`Configuração ${key} atualizada`, { 
        key, 
        user_id: user.id,
        description 
      });

      return true;
    } catch (error) {
      logService.logError(error, 'SystemConfigService.setConfig');
      return false;
    }
  }

  /**
   * Busca todas as configurações
   */
  static async getAllConfigs(): Promise<SystemConfigItem[]> {
    try {
      // Verificar autenticação e permissão admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        throw new Error('Acesso negado - apenas administradores podem acessar configurações do sistema');
      }

      const { data: configs, error } = await supabase
        .from('system_config')
        .select('*')
        .order('category, key');

      if (error) {
        logService.logError(error, 'SystemConfigService.getAllConfigs');
        return [];
      }

      return configs || [];
    } catch (error) {
      logService.logError(error, 'SystemConfigService.getAllConfigs');
      return [];
    }
  }

  /**
   * Busca configurações por categoria
   */
  static async getConfigsByCategory(category: string): Promise<SystemConfigItem[]> {
    try {
      const { data: configs, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('category', category)
        .order('key');

      if (error) {
        logService.logError(error, 'SystemConfigService.getConfigsByCategory');
        return [];
      }

      return configs || [];
    } catch (error) {
      logService.logError(error, 'SystemConfigService.getConfigsByCategory');
      return [];
    }
  }

  /**
   * Busca configuração dos planos
   */
  static async getPlansConfig(): Promise<PlansConfig | null> {
    try {
      const plansConfig = await this.getConfig('plans_config');
      
      if (!plansConfig) {
        return null;
      }

      // Garantir que todos os planos estão presentes
      const defaultPlans: PlansConfig = {
        free: {
          id: 'free',
          name: 'free',
          displayName: 'Grátis',
          price: 0,
          currency: 'BRL',
          interval: 'month',
          trialDays: 0,
          features: {
            contas_pagar: 10,
            fornecedores: 5,
            categorias: 3,
            relatorios: false,
            exportacao: false,
            backup: false,
            suporte_prioritario: false
          },
          stripe: { priceId: '', productId: '' }
        },
        trial: {
          id: 'trial',
          name: 'trial',
          displayName: 'Trial',
          price: 0,
          currency: 'BRL',
          interval: 'month',
          trialDays: 7,
          features: {
            contas_pagar: 50,
            fornecedores: 20,
            categorias: 10,
            relatorios: true,
            exportacao: false,
            backup: false,
            suporte_prioritario: false
          },
          stripe: { priceId: '', productId: '' }
        },
        premium: {
          id: 'premium',
          name: 'premium',
          displayName: 'Premium',
          price: 29.90,
          currency: 'BRL',
          interval: 'month',
          trialDays: 0,
          features: {
            contas_pagar: -1,
            fornecedores: -1,
            categorias: -1,
            relatorios: true,
            exportacao: true,
            backup: true,
            suporte_prioritario: true
          },
          stripe: { priceId: '', productId: '' }
        }
      };

      // Merge com configuração salva
      return {
        free: { ...defaultPlans.free, ...plansConfig.free },
        trial: { ...defaultPlans.trial, ...plansConfig.trial },
        premium: { ...defaultPlans.premium, ...plansConfig.premium }
      };
    } catch (error) {
      logService.logError(error, 'SystemConfigService.getPlansConfig');
      return null;
    }
  }

  /**
   * Atualiza configuração dos planos
   */
  static async updatePlansConfig(plans: PlansConfig): Promise<boolean> {
    try {
      const success = await this.setConfig(
        'plans_config', 
        plans, 
        'Configuração dos planos de assinatura'
      );

      if (success) {
        logService.logInfo('Configuração de planos atualizada com sucesso', { plans });
      }

      return success;
    } catch (error) {
      logService.logError(error, 'SystemConfigService.updatePlansConfig');
      return false;
    }
  }

  /**
   * Busca configuração do Stripe
   */
  static async getStripeConfig(): Promise<StripeConfig | null> {
    try {
      const config = await this.getConfig('stripe_config');
      
      if (!config) {
        return {
          enabled: false,
          environment: 'test',
          webhook_configured: false,
          last_sync: null,
          products_synced: false
        };
      }

      return config;
    } catch (error) {
      logService.logError(error, 'SystemConfigService.getStripeConfig');
      return null;
    }
  }

  /**
   * Atualiza configuração do Stripe
   */
  static async updateStripeConfig(config: StripeConfig): Promise<boolean> {
    try {
      const success = await this.setConfig(
        'stripe_config',
        config,
        'Configurações de integração com Stripe'
      );

      if (success) {
        logService.logInfo('Configuração do Stripe atualizada', { config });
      }

      return success;
    } catch (error) {
      logService.logError(error, 'SystemConfigService.updateStripeConfig');
      return false;
    }
  }

  /**
   * Busca configurações gerais do sistema
   */
  static async getSystemSettings(): Promise<SystemSettings | null> {
    try {
      const settings = await this.getConfig('system_settings');
      
      if (!settings) {
        return {
          maintenance_mode: false,
          registration_enabled: true,
          trial_auto_creation: true,
          default_trial_days: 7,
          max_trial_extensions: 0
        };
      }

      return settings;
    } catch (error) {
      logService.logError(error, 'SystemConfigService.getSystemSettings');
      return null;
    }
  }

  /**
   * Atualiza configurações gerais do sistema
   */
  static async updateSystemSettings(settings: SystemSettings): Promise<boolean> {
    try {
      const success = await this.setConfig(
        'system_settings',
        settings,
        'Configurações gerais do sistema'
      );

      if (success) {
        logService.logInfo('Configurações do sistema atualizadas', { settings });
      }

      return success;
    } catch (error) {
      logService.logError(error, 'SystemConfigService.updateSystemSettings');
      return false;
    }
  }

  /**
   * Sincroniza planos com Stripe (placeholder para implementação futura)
   */
  static async syncPlansWithStripe(): Promise<boolean> {
    try {
      // Aqui seria implementada a lógica de sincronização com Stripe
      // Por enquanto, apenas atualiza o status de sincronização
      
      const stripeConfig = await this.getStripeConfig();
      if (!stripeConfig) return false;

      const updatedConfig = {
        ...stripeConfig,
        last_sync: new Date().toISOString(),
        products_synced: true
      };

      return await this.updateStripeConfig(updatedConfig);
    } catch (error) {
      logService.logError(error, 'SystemConfigService.syncPlansWithStripe');
      return false;
    }
  }

  /**
   * Valida se uma configuração de plano é válida
   */
  static validatePlanConfig(plan: PlanConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!plan.displayName?.trim()) {
      errors.push('Nome de exibição é obrigatório');
    }

    if (plan.price < 0) {
      errors.push('Preço não pode ser negativo');
    }

    if (plan.trialDays < 0) {
      errors.push('Dias de trial não podem ser negativos');
    }

    if (plan.features.contas_pagar < -1) {
      errors.push('Limite de contas a pagar inválido');
    }

    if (plan.features.fornecedores < -1) {
      errors.push('Limite de fornecedores inválido');
    }

    if (plan.features.categorias < -1) {
      errors.push('Limite de categorias inválido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Busca log de alterações de configurações
   */
  static async getConfigChangesLog(limit: number = 50): Promise<any[]> {
    try {
      const { data: logs, error } = await supabase
        .from('system_config')
        .select(`
          key,
          description,
          category,
          updated_at,
          updated_by,
          profiles:updated_by (
            name,
            email
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        logService.logError(error, 'SystemConfigService.getConfigChangesLog');
        return [];
      }

      return logs || [];
    } catch (error) {
      logService.logError(error, 'SystemConfigService.getConfigChangesLog');
      return [];
    }
  }
}