// Este arquivo mantém compatibilidade com o código existente
// mas agora usa o hook Supabase internamente

export { useSupabaseAuth as useAuth } from './useSupabaseAuth';

// Re-exportar tipos para compatibilidade
export type { User, Session } from '@supabase/supabase-js';