export interface LancamentoLoteFormData {
  // Dados principais
  fornecedor_id: number | null;
  plano_conta_id: number | null;
  descricao: string;
  documento_referencia: string;
  
  // Configuração das parcelas
  valor_parcela: number;
  primeira_data_vencimento: string;
  quantidade_parcelas: number;
  intervalo_parcelas: 'mensal' | 'quinzenal' | 'semanal';
  
  // Campos adicionais
  data_emissao: string;
  dda: boolean;
}

export interface ParcelaPreview {
  numero: number;
  data_vencimento: string;
  valor: number;
  status: 'calculada' | 'editada';
  editada?: boolean;
  numero_cheque?: string; // Novo campo para cheque individual
}

export interface LancamentoLoteSummary {
  total_parcelas: number;
  valor_total: number;
  primeira_data: string;
  ultima_data: string;
  intervalo: string;
}

export const INTERVALOS_PARCELA = {
  mensal: { label: 'Mensal', dias: 30 },
  quinzenal: { label: 'Quinzenal', dias: 15 },
  semanal: { label: 'Semanal', dias: 7 }
} as const;

export const INTERVALOS_OPCOES = [
  { value: 'mensal', label: 'Mensal (30 dias)' },
  { value: 'quinzenal', label: 'Quinzenal (15 dias)' },
  { value: 'semanal', label: 'Semanal (7 dias)' }
] as const;