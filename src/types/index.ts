export interface Credor {
  id: string;
  nome: string;
  documento?: string; // CPF ou CNPJ
  contato?: string;
  email?: string;
  tipo?: 'pessoa_fisica' | 'pessoa_juridica';
}

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

export interface Banco {
  id: string;
  nome: string;
  agencia?: string;
  conta?: string;
}

export interface ContaPagar {
  id: string;
  credorId: string;
  credor: Credor;
  categoriaId: string;
  categoria: Categoria;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: 'pendente' | 'paga' | 'vencida';
  observacoes?: string;
}

export interface DashboardMetrics {
  totalPendente: number;
  contasVencidas: { quantidade: number; valor: number };
  aVencer30Dias: { quantidade: number; valor: number };
  pagasNoMes: number;
  indicadores: {
    totalPendente: number;
    contasVencidas: number;
    aVencer30Dias: number;
    pagasNoMes: number;
  };
}

export interface MovimentacaoRecente {
  id: string;
  data: Date;
  credor: string;
  descricao: string;
  valor: number;
  status: 'pendente' | 'paga' | 'vencida';
}