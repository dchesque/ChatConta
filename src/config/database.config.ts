// Configuração centralizada para alternância entre Mock e Supabase
export const DATABASE_CONFIG = {
  // Controle principal - alternar entre mock e Supabase com fallback seguro
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' && import.meta.env.DEV === true,
  
  // Configurações Supabase com fallback para Lovable
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://wrxosfdirgdlvfkzvcuh.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyeG9zZmRpcmdkbHZma3p2Y3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODY4OTUsImV4cCI6MjA3MDA2Mjg5NX0.1SBE-f-f5lLEc_7rzv87sbVv3WYLLBLi8wsblDwUSCc',
  
  // Configurações de desenvolvimento
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_DB_LOGGING === 'true',
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Validação de configuração
export function validateDatabaseConfig(): void {
  // Sempre validar URLs em produção
  if (!DATABASE_CONFIG.SUPABASE_URL || !DATABASE_CONFIG.SUPABASE_ANON_KEY) {
    console.error('🚨 Configuração Supabase:', {
      hasUrl: !!DATABASE_CONFIG.SUPABASE_URL,
      hasKey: !!DATABASE_CONFIG.SUPABASE_ANON_KEY,
      useMock: DATABASE_CONFIG.USE_MOCK_DATA
    });
    throw new Error(
      'Configuração do Supabase inválida. Em projetos Lovable, as chaves são configuradas automaticamente.'
    );
  }
  
  if (DATABASE_CONFIG.ENABLE_LOGGING) {
    console.warn('🔧 Configuração do banco:', {
      useMock: DATABASE_CONFIG.USE_MOCK_DATA,
      hasSupabaseUrl: !!DATABASE_CONFIG.SUPABASE_URL,
      hasSupabaseKey: !!DATABASE_CONFIG.SUPABASE_ANON_KEY
    });
  }
}