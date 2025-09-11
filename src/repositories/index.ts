/**
 * Camada Repository - Acesso a Dados
 * 
 * Esta camada implementa o padrão Repository para separar completamente
 * a lógica de acesso a dados da lógica de negócio. Os repositories são
 * responsáveis apenas por operações CRUD e queries específicas.
 * 
 * Características:
 * - Herança de BaseRepository para operações CRUD básicas
 * - Tipos TypeScript nativos do Supabase
 * - Filtragem automática por usuário (user_id)
 * - Soft delete (deleted_at)
 * - Logging integrado
 * - Tratamento de erros consistente
 * 
 * Separação de Responsabilidades:
 * - Repository: Acesso a dados, queries, persistência
 * - Service: Lógica de negócio, validações, orquestração
 */

// Classes base
export { BaseRepository } from './base.repository';
export type { BaseFilters } from './base.repository';

// Repositories específicos
export { PayablesRepository, payablesRepository } from './payables.repository';
export { ReceivablesRepository, receivablesRepository } from './receivables.repository';

// Tipos e interfaces para Payables Repository
export type { PayableFilters } from './payables.repository';

// Tipos e interfaces para Receivables Repository
export type { ReceivableFilters } from './receivables.repository';

// Tipos do Supabase (re-export para conveniência)
export type { Database } from '@/integrations/supabase/types';

/**
 * Objeto consolidado com todos os repositories
 * Para uso conveniente quando precisar de múltiplos repositories
 */
export const repositories = {
  payables: payablesRepository,
  receivables: receivablesRepository,
} as const;

/**
 * Tipos auxiliares para trabalhar com entidades do banco
 */
export type AccountPayable = Database['public']['Tables']['accounts_payable']['Row'];
export type AccountPayableInsert = Database['public']['Tables']['accounts_payable']['Insert'];
export type AccountPayableUpdate = Database['public']['Tables']['accounts_payable']['Update'];

export type AccountReceivable = Database['public']['Tables']['accounts_receivable']['Row'];
export type AccountReceivableInsert = Database['public']['Tables']['accounts_receivable']['Insert'];
export type AccountReceivableUpdate = Database['public']['Tables']['accounts_receivable']['Update'];

// Enums do Supabase
export type AccountStatus = Database['public']['Enums']['account_status'];
export type ReceivableStatus = Database['public']['Enums']['receivable_status'];

/**
 * Utilitários para trabalhar com repositories
 */
export const repositoryUtils = {
  /**
   * Verifica se um erro é de registro não encontrado
   */
  isNotFoundError: (error: { code?: string }): boolean => {
    return error?.code === 'PGRST116';
  },

  /**
   * Cria filtros de data para buscar registros em um período
   */
  createDateRangeFilter: (startDate: Date, endDate: Date) => ({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }),

  /**
   * Cria filtros de paginação
   */
  createPaginationFilter: (page: number, limit: number = 50) => ({
    limit,
    offset: (page - 1) * limit
  }),

  /**
   * Calcula páginas totais baseado no total de registros
   */
  calculateTotalPages: (totalRecords: number, limit: number = 50): number => {
    return Math.ceil(totalRecords / limit);
  },

  /**
   * Valida se um status é válido para contas a pagar
   */
  isValidPayableStatus: (status: string): status is AccountStatus => {
    return ['pending', 'paid', 'overdue', 'cancelled'].includes(status);
  },

  /**
   * Valida se um status é válido para contas a receber
   */
  isValidReceivableStatus: (status: string): status is ReceivableStatus => {
    return ['pending', 'received', 'overdue', 'cancelled'].includes(status);
  },
} as const;

/**
 * Configurações globais para repositories
 */
export const repositoryConfig = {
  defaultLimit: 50,
  maxLimit: 1000,
  defaultOrderBy: 'created_at',
  defaultOrderDirection: 'desc' as const,
} as const;