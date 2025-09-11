// Tipos específicos para credores no contexto de finanças pessoais
// Reutiliza a estrutura de fornecedor mas com nomenclatura pessoal

export type {
  Fornecedor as Credor,
  FornecedorSupabase as CredorSupabase,
  FiltrosFornecedor as FiltrosCredor
} from './fornecedor';

export {
  ESTADOS_BRASIL,
  fornecedorToSupabase as credorToSupabase,
  supabaseToFornecedor as supabaseToCredor
} from './fornecedor';

// Tipos específicos para finanças pessoais
export interface CategoriaGasto {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  nivel: number;
  tipo_dre: 'despesa_pessoal';
  aceita_lancamento: boolean;
  plano_pai_id?: number;
  ativo: boolean;
}

export interface ContaPessoal {
  id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  credor_id?: number;
  categoria_id: number;
  status: 'pendente' | 'pago' | 'vencido';
  observacoes?: string;
  data_pagamento?: string;
}