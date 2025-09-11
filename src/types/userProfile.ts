export type UserRole = 'admin' | 'user';

export type UserPlan = 'trial' | 'free' | 'premium';

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

export interface FeatureLimits {
  contas_pagar: number; // -1 for unlimited
  fornecedores: number;
  categorias: number;
  relatorios: boolean;
  exportacao: boolean;
  backup: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  phone: string; // WhatsApp number
  name?: string;
  role: UserRole;
  plan: UserPlan;
  subscription_status: SubscriptionStatus;
  trial_ends_at?: Date;
  subscription_ends_at?: Date;
  features_limit: FeatureLimits;
  phone_verified: boolean;
  onboarding_completed: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
  ativo: boolean;
  avatar_url?: string;
  bio?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  whatsapp?: string;
}

export interface PlanInfo {
  id: UserPlan;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: FeatureLimits;
  popular?: boolean;
}

export const PLAN_CONFIGS: Record<UserPlan, PlanInfo> = {
  trial: {
    id: 'trial',
    name: 'Teste Grátis',
    price: 0,
    description: '14 dias para testar',
    features: [
      '50 contas a pagar',
      '20 fornecedores',
      'Relatórios básicos',
      'Suporte por email'
    ],
    limits: {
      contas_pagar: 50,
      fornecedores: 20,
      categorias: 10,
      relatorios: true,
      exportacao: false,
      backup: false
    }
  },
  free: {
    id: 'free',
    name: 'Grátis',
    price: 0,
    description: 'Para sempre com limitações',
    features: [
      '10 contas a pagar/mês',
      '5 fornecedores',
      'Relatórios limitados'
    ],
    limits: {
      contas_pagar: 10,
      fornecedores: 5,
      categorias: 5,
      relatorios: true,
      exportacao: false,
      backup: false
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 29.90,
    description: 'Tudo ilimitado',
    features: [
      'Contas ilimitadas',
      'Fornecedores ilimitados',
      'Todos os relatórios',
      'Exportação Excel/PDF',
      'Backup automático',
      'Suporte prioritário'
    ],
    limits: {
      contas_pagar: -1,
      fornecedores: -1,
      categorias: -1,
      relatorios: true,
      exportacao: true,
      backup: true
    },
    popular: true
  }
};