export interface Categoria {
  id: number;
  nome: string;
  tipo: 'despesa' | 'receita';
  grupo: string;
  cor: string;
  icone: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  ativo: boolean;
}

export interface CriarCategoria {
  nome: string;
  tipo: 'despesa' | 'receita';
  grupo: string;
  cor: string;
  icone: string;
}

export interface AtualizarCategoria extends Partial<CriarCategoria> {
  id: number;
}

export interface FiltrosCategoria {
  busca?: string;
  tipo?: 'despesa' | 'receita' | 'todos';
  grupo?: string;
  ativo?: boolean;
}

export interface EstatisticasCategoria {
  total_categorias: number;
  total_despesas: number;
  total_receitas: number;
  por_grupo: Record<string, number>;
}

// Grupos de despesas
export const GRUPOS_DESPESA = {
  moradia: 'Moradia',
  transporte: 'Transporte', 
  alimentacao: 'Alimentação',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer',
  cuidados: 'Cuidados Pessoais',
  outros: 'Outros'
} as const;

// Grupos de receitas
export const GRUPOS_RECEITA = {
  trabalho: 'Trabalho',
  investimentos: 'Investimentos', 
  outros: 'Outros'
} as const;

export type GrupoDespesa = keyof typeof GRUPOS_DESPESA;
export type GrupoReceita = keyof typeof GRUPOS_RECEITA;

// Função para obter grupos baseado no tipo
export const obterGrupos = (tipo: 'despesa' | 'receita') => {
  return tipo === 'despesa' ? GRUPOS_DESPESA : GRUPOS_RECEITA;
};

// Função para validar grupo baseado no tipo
export const validarGrupo = (tipo: 'despesa' | 'receita', grupo: string): boolean => {
  const grupos = obterGrupos(tipo);
  return Object.keys(grupos).includes(grupo);
};