export interface Cheque {
  id?: number;
  
  // Dados bancários
  banco_id: number;
  numero_cheque: string;
  
  // Beneficiário
  tipo_beneficiario: 'fornecedor' | 'outros';
  fornecedor_id?: number; // Se tipo_beneficiario = 'fornecedor'
  beneficiario_nome?: string; // Se tipo_beneficiario = 'outros'
  beneficiario_documento?: string;
  
  // Valores e datas
  valor: number;
  data_emissao: string;
  data_vencimento?: string;
  data_compensacao?: string;
  
  // Status e controle
  status: 'pendente' | 'compensado' | 'devolvido' | 'cancelado';
  finalidade?: string;
  observacoes?: string;
  
  // Vinculação com conta a pagar
  conta_pagar_id?: number;
  
  // Campos específicos para ações
  motivo_cancelamento?: string;
  motivo_devolucao?: string;
  
  // Sistema
  created_at?: string;
  updated_at?: string;
}

export interface FiltrosCheque {
  busca: string;
  status: 'todos' | 'pendente' | 'compensado' | 'devolvido' | 'cancelado';
  banco_id: 'todos' | number;
  data_inicio: string;
  data_fim: string;
}

export interface EstatisticasCheque {
  total_cheques: number;
  total_valor: number;
  pendentes: {
    quantidade: number;
    valor: number;
  };
  compensados: {
    quantidade: number;
    valor: number;
  };
  devolvidos: {
    quantidade: number;
    valor: number;
  };
  cancelados: {
    quantidade: number;
    valor: number;
  };
}

export const STATUS_CHEQUE_LABELS = {
  pendente: 'Pendente',
  compensado: 'Compensado',
  devolvido: 'Devolvido',
  cancelado: 'Cancelado'
};

export const STATUS_CHEQUE_COLORS = {
  pendente: 'bg-yellow-100/80 text-yellow-700',
  compensado: 'bg-green-100/80 text-green-700',
  devolvido: 'bg-red-100/80 text-red-700',
  cancelado: 'bg-gray-100/80 text-gray-700'
};

export const MOTIVOS_DEVOLUCAO = [
  'Insuficiência de fundos',
  'Assinatura divergente',
  'Cheque sustado',
  'Conta encerrada',
  'Ordem judicial',
  'Outros motivos'
];