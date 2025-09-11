export interface CategoriaReceita {
  id: number;
  nome: string;
  grupo: string;
  cor: string;
  icone: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface CriarCategoriaReceita {
  nome: string;
  grupo: string;
  cor: string;
  icone: string;
}

export interface AtualizarCategoriaReceita extends Partial<CriarCategoriaReceita> {
  id: number;
}

export interface FiltrosCategoriaReceita {
  busca?: string;
  grupo?: string;
}

export interface EstatisticasCategoriaReceita {
  total_categorias: number;
  por_grupo: Record<string, number>;
}

// Grupos pré-definidos
export const GRUPOS_RECEITA = {
  trabalho: 'Trabalho',
  investimentos: 'Investimentos', 
  outros: 'Outros'
} as const;

export type GrupoReceita = keyof typeof GRUPOS_RECEITA;