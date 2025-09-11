// Feature flags para controle de funcionalidades
export const FEATURES = {
  // Controle principal de dados
  USE_SUPABASE: !import.meta.env.VITE_USE_MOCK_DATA || import.meta.env.PROD,
  
  // Autenticação
  WHATSAPP_AUTH: false, // Ativar quando implementar n8n
  EMAIL_AUTH: true,
  
  // Pagamentos
  STRIPE_PAYMENTS: false, // Ativar quando configurar
  PIX_PAYMENTS: false,
  
  // Funcionalidades gerais
  NOTIFICATIONS: true,
  BACKUP_RESTORE: false, // Ativar quando estável
  DARK_MODE: true,
  
  // Recursos avançados
  ANALYTICS: false,
  API_INTEGRATIONS: false,
  MULTI_TENANT: false, // App é single-tenant
  
  // Desenvolvimento
  DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  PERFORMANCE_MONITORING: import.meta.env.DEV,
  
  // Módulos específicos
  CONTAS_PAGAR: true,
  CONTAS_RECEBER: true,
  FORNECEDORES: true, // Será migrado para CONTACTS
  CONTACTS: true, // Nova funcionalidade unificada
  CATEGORIAS: true,
  BANCOS: true,
  DASHBOARD: true,
  RELATORIOS: false // Implementar na próxima fase
} as const;

// Helper para verificar se feature está ativa
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}

// Configurações específicas por ambiente
export const ENVIRONMENT_CONFIG = {
  development: {
    showDebugInfo: true,
    enableMockData: true,
    logLevel: 'debug'
  },
  
  production: {
    showDebugInfo: false,
    enableMockData: false,
    logLevel: 'error'
  }
} as const;

// Função para obter configuração do ambiente atual
export function getEnvironmentConfig() {
  return import.meta.env.PROD 
    ? ENVIRONMENT_CONFIG.production 
    : ENVIRONMENT_CONFIG.development;
}

// Validação de features conflitantes
export function validateFeatures(): void {
  // Se Supabase está ativo, WhatsApp deve estar desabilitado (por enquanto)
  if (FEATURES.USE_SUPABASE && FEATURES.WHATSAPP_AUTH) {
    console.warn('⚠️ WhatsApp auth ainda não implementado com Supabase');
  }
  
  // Debug em produção deve estar sempre desabilitado
  if (import.meta.env.PROD && FEATURES.DEBUG_MODE) {
    console.error('🚨 Debug mode não deve estar ativo em produção');
  }
}

// Mensagens para features desabilitadas
export const FEATURE_MESSAGES = {
  WHATSAPP_AUTH: 'Login com WhatsApp em desenvolvimento. Use email por enquanto.',
  STRIPE_PAYMENTS: 'Pagamentos em desenvolvimento.',
  BACKUP_RESTORE: 'Backup automático em desenvolvimento.',
  RELATORIOS: 'Relatórios avançados em desenvolvimento.',
  API_INTEGRATIONS: 'Integrações com APIs externas em desenvolvimento.'
} as const;

// Função para obter mensagem de feature desabilitada
export function getFeatureMessage(feature: keyof typeof FEATURE_MESSAGES): string {
  return FEATURE_MESSAGES[feature] || 'Funcionalidade em desenvolvimento.';
}