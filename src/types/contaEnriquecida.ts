import { ContaPagar } from '@/types/contaPagar';

// Tipo ContaEnriquecida para compatibilidade
export interface ContaEnriquecida extends ContaPagar {
  // Novos campos modernos
  contact?: { nome: string; name: string };
  category?: { nome: string; name: string };
  banco?: { nome: string };
  contact_name?: string;
  category_name?: string;
  banco_nome?: string;
  dias_para_vencimento?: number;
  dias_em_atraso?: number;
  destacar?: boolean;
  
  // Campos legados para compatibilidade (deprecados)
  fornecedor?: { nome: string };
  plano_contas?: { nome: string };
  fornecedor_nome?: string;
  plano_conta_nome?: string;
}