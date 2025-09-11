import { BaseRepository } from './base.repository';
import { logService } from '@/services/logService';
import type { Database } from '@/integrations/supabase/types';

// Tipos específicos para contas a pagar
type AccountPayable = Database['public']['Tables']['accounts_payable']['Row'];
type AccountPayableInsert = Database['public']['Tables']['accounts_payable']['Insert'];
type AccountPayableUpdate = Database['public']['Tables']['accounts_payable']['Update'];
type AccountStatus = Database['public']['Enums']['account_status'];

/**
 * Interface para filtros específicos de contas a pagar
 */
export interface PayableFilters {
  status?: AccountStatus;
  startDate?: string;
  endDate?: string;
  contactId?: string;
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Repository para operações de acesso a dados das contas a pagar
 * Estende BaseRepository para herdar operações CRUD básicas
 * Implementa métodos específicos para o domínio de contas a pagar
 */
export class PayablesRepository extends BaseRepository<
  AccountPayable,
  AccountPayableInsert,
  AccountPayableUpdate
> {
  protected readonly tableName = 'accounts_payable';

  /**
   * Busca contas a pagar por status específico
   */
  async findByStatus(status: AccountStatus): Promise<AccountPayable[]> {
    try {
      const query = this.createQuery().select('*');
      const filteredQuery = await this.applyUserFilter(query);
      
      const { data, error } = await filteredQuery
        .eq('status', status)
        .order('due_date', { ascending: true });

      if (error) {
        logService.logError(error, `${this.constructor.name}.findByStatus`);
        throw new Error(`Erro ao buscar contas por status: ${error.message}`);
      }

      return data as AccountPayable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findByStatus`);
      throw error;
    }
  }

  /**
   * Busca contas a pagar dentro de um intervalo de datas
   */
  async findByDateRange(startDate: string, endDate: string): Promise<AccountPayable[]> {
    try {
      const query = this.createQuery().select('*');
      const filteredQuery = await this.applyUserFilter(query);
      
      const { data, error } = await filteredQuery
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .order('due_date', { ascending: true });

      if (error) {
        logService.logError(error, `${this.constructor.name}.findByDateRange`);
        throw new Error(`Erro ao buscar contas por período: ${error.message}`);
      }

      return data as AccountPayable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findByDateRange`);
      throw error;
    }
  }

  /**
   * Busca contas a pagar vencidas (status pending e data de vencimento anterior a hoje)
   */
  async findOverdue(): Promise<AccountPayable[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const query = this.createQuery().select('*');
      const filteredQuery = await this.applyUserFilter(query);
      
      const { data, error } = await filteredQuery
        .eq('status', 'pending')
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (error) {
        logService.logError(error, `${this.constructor.name}.findOverdue`);
        throw new Error(`Erro ao buscar contas vencidas: ${error.message}`);
      }

      return data as AccountPayable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findOverdue`);
      throw error;
    }
  }

  /**
   * Busca contas a pagar com vencimento próximo (próximos N dias)
   */
  async findUpcoming(days: number = 7): Promise<AccountPayable[]> {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const query = this.createQuery().select('*');
      const filteredQuery = await this.applyUserFilter(query);
      
      const { data, error } = await filteredQuery
        .eq('status', 'pending')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      if (error) {
        logService.logError(error, `${this.constructor.name}.findUpcoming`);
        throw new Error(`Erro ao buscar contas próximas ao vencimento: ${error.message}`);
      }

      return data as AccountPayable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findUpcoming`);
      throw error;
    }
  }

  /**
   * Busca contas a pagar por contato/fornecedor
   */
  async findByContact(contactId: string): Promise<AccountPayable[]> {
    try {
      const query = this.createQuery().select('*');
      const filteredQuery = await this.applyUserFilter(query);
      
      const { data, error } = await filteredQuery
        .eq('contact_id', contactId)
        .order('due_date', { ascending: true });

      if (error) {
        logService.logError(error, `${this.constructor.name}.findByContact`);
        throw new Error(`Erro ao buscar contas por contato: ${error.message}`);
      }

      return data as AccountPayable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findByContact`);
      throw error;
    }
  }

  /**
   * Busca contas a pagar por categoria
   */
  async findByCategory(categoryId: string): Promise<AccountPayable[]> {
    try {
      const query = this.createQuery().select('*');
      const filteredQuery = await this.applyUserFilter(query);
      
      const { data, error } = await filteredQuery
        .eq('category_id', categoryId)
        .order('due_date', { ascending: true });

      if (error) {
        logService.logError(error, `${this.constructor.name}.findByCategory`);
        throw new Error(`Erro ao buscar contas por categoria: ${error.message}`);
      }

      return data as AccountPayable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findByCategory`);
      throw error;
    }
  }

  /**
   * Busca contas a pagar com filtros avançados
   */
  async findWithFilters(filters: PayableFilters): Promise<AccountPayable[]> {
    try {
      let query = this.createQuery().select('*');
      query = await this.applyUserFilter(query);

      // Aplicar filtros específicos
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.startDate) {
        query = query.gte('due_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('due_date', filters.endDate);
      }

      if (filters.contactId) {
        query = query.eq('contact_id', filters.contactId);
      }

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,reference_document.ilike.%${filters.search}%`);
      }

      // Ordenação e paginação
      query = query.order('due_date', { ascending: true });

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logService.logError(error, `${this.constructor.name}.findWithFilters`);
        throw new Error(`Erro ao buscar contas com filtros: ${error.message}`);
      }

      return data as AccountPayable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findWithFilters`);
      throw error;
    }
  }

  /**
   * Calcula o total de valores a pagar por status
   */
  async getTotalByStatus(status: AccountStatus): Promise<number> {
    try {
      const accounts = await this.findByStatus(status);
      return accounts.reduce((total, account) => total + account.amount, 0);
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.getTotalByStatus`);
      throw error;
    }
  }

  /**
   * Busca contas com DDA habilitado
   */
  async findWithDDAEnabled(): Promise<AccountPayable[]> {
    try {
      const query = this.createQuery().select('*');
      const filteredQuery = await this.applyUserFilter(query);
      
      const { data, error } = await filteredQuery
        .eq('dda_enabled', true)
        .order('due_date', { ascending: true });

      if (error) {
        logService.logError(error, `${this.constructor.name}.findWithDDAEnabled`);
        throw new Error(`Erro ao buscar contas com DDA: ${error.message}`);
      }

      return data as AccountPayable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findWithDDAEnabled`);
      throw error;
    }
  }

  /**
   * Atualiza status de contas vencidas automaticamente
   */
  async updateOverdueStatus(): Promise<number> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await this.client
        .from(this.tableName)
        .update({
          status: 'overdue' as AccountStatus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'pending')
        .lt('due_date', today)
        .is('deleted_at', null)
        .select('id');

      if (error) {
        logService.logError(error, `${this.constructor.name}.updateOverdueStatus`);
        throw new Error(`Erro ao atualizar contas vencidas: ${error.message}`);
      }

      const updatedCount = data?.length || 0;
      
      logService.logInfo(
        `Status de contas vencidas atualizado`,
        { updatedCount },
        this.constructor.name
      );

      return updatedCount;
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.updateOverdueStatus`);
      throw error;
    }
  }
}

// Instância singleton para uso global
export const payablesRepository = new PayablesRepository();