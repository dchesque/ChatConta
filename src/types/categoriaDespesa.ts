// Tipos para categorias de despesas pessoais
export interface CategoriaDespesa {
  id: number;
  nome: string;
  grupo: 'moradia' | 'transporte' | 'alimentacao' | 'saude' | 'educacao' | 'lazer' | 'cuidados' | 'outros';
  cor: string;
  icone: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  ativo: boolean;
}

export interface CategoriaDespesaSupabase {
  id: number;
  nome: string;
  grupo: string;
  cor: string;
  icone: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  ativo: boolean;
}

export interface FiltrosCategoria {
  grupo?: string;
  ativo?: boolean;
  busca?: string;
}

// Grupos de categorias disponíveis
export const GRUPOS_CATEGORIA = {
  moradia: 'Moradia',
  transporte: 'Transporte', 
  alimentacao: 'Alimentação',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer',
  cuidados: 'Cuidados Pessoais',
  outros: 'Outros'
} as const;

// Funções de conversão
export const categoriaDespesaToSupabase = (categoria: CategoriaDespesa): CategoriaDespesaSupabase => ({
  id: categoria.id,
  nome: categoria.nome,
  grupo: categoria.grupo,
  cor: categoria.cor,
  icone: categoria.icone,
  user_id: categoria.user_id,
  created_at: categoria.created_at,
  updated_at: categoria.updated_at,
  ativo: categoria.ativo
});

export const supabaseToCategoriaDespesa = (data: CategoriaDespesaSupabase): CategoriaDespesa => ({
  id: data.id,
  nome: data.nome,
  grupo: data.grupo as CategoriaDespesa['grupo'],
  cor: data.cor,
  icone: data.icone,
  user_id: data.user_id,
  created_at: data.created_at,
  updated_at: data.updated_at,
  ativo: data.ativo
});