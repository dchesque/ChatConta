/**
 * Estrutura de serviços financeiros unificada
 * 
 * Este módulo exporta todos os serviços relacionados às operações financeiras
 * do sistema, incluindo contas a pagar e contas a receber.
 * 
 * Características:
 * - Uso de tipos TypeScript do Supabase
 * - Tratamento de erros consistente
 * - Logging integrado
 * - Instâncias singleton para uso global
 */

// Serviços
export { PayablesService, payablesService } from './payables.service';
export { ReceivablesService, receivablesService } from './receivables.service';

// Tipos e interfaces para Payables
export type {
  PayableFilters,
  PayableCreateData,
  PayableUpdateData
} from './payables.service';

// Tipos e interfaces para Receivables  
export type {
  ReceivableFilters,
  ReceivableCreateData,
  ReceivableUpdateData
} from './receivables.service';

// Tipos do Supabase (re-export para conveniência)
export type { Database } from '@/integrations/supabase/types';

/**
 * Objeto consolidado com todos os serviços financeiros
 * Para uso conveniente quando precisar de múltiplos serviços
 */
export const financialServices = {
  payables: payablesService,
  receivables: receivablesService,
} as const;

/**
 * Utilitários auxiliares para operações financeiras
 */
export const financialUtils = {
  /**
   * Formata valor monetário em BRL
   */
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Calcula dias entre duas datas
   */
  daysBetween: (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Verifica se uma data está vencida
   */
  isOverdue: (dueDate: string): boolean => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  },

  /**
   * Calcula percentual de um valor
   */
  calculatePercentage: (value: number, percentage: number): number => {
    return (value * percentage) / 100;
  },

  /**
   * Aplica juros ou desconto a um valor
   */
  applyInterestOrDiscount: (
    originalValue: number,
    percentage: number,
    type: 'interest' | 'discount'
  ): number => {
    const adjustment = financialUtils.calculatePercentage(originalValue, percentage);
    return type === 'interest' 
      ? originalValue + adjustment 
      : originalValue - adjustment;
  }
} as const;