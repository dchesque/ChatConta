export interface ContaReceber {
  id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status: 'pendente' | 'recebido' | 'vencido';
  pagador_id: number;
  categoria_id: number;
  banco_id?: number;
  observacoes?: string;
  recorrente: boolean;
  user_id: string;
  created_at: string;
  updated_at?: string;
  // Relacionamentos
  pagador?: {
    id: number;
    nome: string;
    tipo: string;
  };
  categoria?: {
    id: number;
    nome: string;
    grupo: string;
    cor: string;
  };
  banco?: {
    id: number;
    nome: string;
  };
}

export interface CriarContaReceber {
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status?: 'pendente' | 'recebido' | 'vencido';
  pagador_id: number;
  categoria_id: number;
  banco_id?: number;
  observacoes?: string;
  recorrente?: boolean;
}

export interface AtualizarContaReceber extends Partial<CriarContaReceber> {
  id: number;
}

export interface FiltrosContaReceber {
  busca?: string;
  status?: 'pendente' | 'recebido' | 'vencido';
  pagador_id?: number;
  categoria_id?: number;
  banco_id?: number;
  data_inicio?: string;
  data_fim?: string;
  valor_min?: number;
  valor_max?: number;
  recorrente?: boolean;
}

export interface EstatisticasContaReceber {
  total_contas: number;
  total_valor: number;
  valor_pendente: number;
  valor_recebido: number;
  valor_vencido: number;
  pendentes: number;
  recebidas: number;
  vencidas: number;
  vencimento_proximo: number;
  valor_vencimento_proximo: number;
  maior_conta: number;
  menor_conta: number;
  conta_media: number;
}

export interface LancamentoLoteReceita {
  descricao_base: string;
  valor: number;
  pagador_id: number;
  categoria_id: number;
  banco_id?: number;
  data_inicio: string;
  quantidade_parcelas: number;
  periodicidade: 'mensal' | 'quinzenal' | 'semanal';
  observacoes?: string;
}