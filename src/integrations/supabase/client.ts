
import { createClient } from '@supabase/supabase-js';

// Configuração segura com fallback para Lovable
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wrxosfdirgdlvfkzvcuh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyeG9zZmRpcmdkbHZma3p2Y3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODY4OTUsImV4cCI6MjA3MDA2Mjg5NX0.1SBE-f-f5lLEc_7rzv87sbVv3WYLLBLi8wsblDwUSCc';

// Validação das variáveis de ambiente
function validateSupabaseConfig(): void {
  // Log das variáveis para debugging (sempre mostrar para facilitar debug)
  console.log('🔧 🔧 🔧 CONFIGURAÇÃO SUPABASE CLIENT 🔧 🔧 🔧');
  console.log('  Environment mode:', import.meta.env.MODE);
  console.log('  Environment DEV:', import.meta.env.DEV);
  console.log('  Environment PROD:', import.meta.env.PROD);
  console.log('  Has URL?:', !!supabaseUrl);
  console.log('  URL prefix:', supabaseUrl?.substring(0, 30) + '...');
  console.log('  URL completa:', supabaseUrl);
  console.log('  Has Key?:', !!supabaseAnonKey);
  console.log('  Key prefix:', supabaseAnonKey?.substring(0, 30) + '...');
  console.log('  Source:', import.meta.env.VITE_SUPABASE_URL ? 'environment vars' : 'hardcoded fallback');
  console.log('  VITE_SUPABASE_URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
  console.log('  VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  if (import.meta.env.VITE_SUPABASE_URL) {
    console.log('  ENV URL:', import.meta.env.VITE_SUPABASE_URL);
  }
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.log('  ENV KEY prefix:', import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 30) + '...');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '🚨 Configuração do Supabase inválida!\n\n' +
      'As chaves do Supabase não foram encontradas.\n' +
      'Em projetos Lovable, as chaves são configuradas automaticamente.\n' +
      'Se este erro persistir, contate o suporte.'
    );
  }

  // Validação de formato da URL
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(
      '🚨 VITE_SUPABASE_URL deve ser uma URL válida!\n' +
      `Valor atual: ${supabaseUrl}`
    );
  }

  // Validação básica do token JWT
  if (!supabaseAnonKey.includes('.')) {
    throw new Error(
      '🚨 VITE_SUPABASE_ANON_KEY deve ser um token JWT válido!\n' +
      'Verifique se copiou a chave completa do painel do Supabase.'
    );
  }
}

// Executar validação
validateSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Log final da criação do cliente
console.log('✅ Cliente Supabase criado com sucesso');
console.log('  URL final:', supabase.supabaseUrl);
console.log('  Key final prefix:', supabase.supabaseKey?.substring(0, 30) + '...');

// Testar conexão básica ao carregar
if (typeof window !== 'undefined') {
  // Só executar no browser, não no SSR
  setTimeout(async () => {
    try {
      console.log('🔍 Testando conexão básica com Supabase...');
      const { data, error } = await supabase.auth.getSession();
      console.log('📡 Teste de conexão:', error ? '❌ ERRO' : '✅ OK');
      if (error) {
        console.error('  Erro de conexão:', error);
      } else {
        console.log('  Sessão atual:', data.session ? 'Existe' : 'Nenhuma');
      }
    } catch (err) {
      console.error('💥 Exceção no teste de conexão:', err);
    }
  }, 100);
}
