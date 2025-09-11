import { BaseRepository } from './base.repository';
import { logService } from '@/services/logService';
import type { Database } from '@/integrations/supabase/types';

// Tipos específicos para contas a receber
type AccountReceivable = Database['public']['Tables']['accounts_receivable']['Row'];
type AccountReceivableInsert = Database['public']['Tables']['accounts_receivable']['Insert'];
type AccountReceivableUpdate = Database['public']['Tables']['accounts_receivable']['Update'];
type ReceivableStatus = Database['public']['Enums']['receivable_status'];

/**
 * Interface para filtros específicos de contas a receber
 */
export interface ReceivableFilters {
  status?: ReceivableStatus;
  startDate?: string;
  endDate?: string;
  contactId?: string;
  customerId?: string;
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Repository para operações de acesso a dados das contas a receber
 * Estende BaseRepository para herdar operações CRUD básicas
 * Implementa métodos específicos para o domínio de contas a receber
 */
export class ReceivablesRepository extends BaseRepository<
  AccountReceivable,
  AccountReceivableInsert,
  AccountReceivableUpdate
> {
  protected readonly tableName = 'accounts_receivable';

  /**
   * Busca contas a receber por status específico
   */
  async findByStatus(status: ReceivableStatus): Promise<AccountReceivable[]> {
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

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findByStatus`);
      throw error;
    }
  }

  /**
   * Busca contas a receber dentro de um intervalo de datas
   */
  async findByDateRange(startDate: string, endDate: string): Promise<AccountReceivable[]> {
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

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findByDateRange`);
      throw error;
    }
  }

  /**
   * Busca contas a receber vencidas (status pending e data de vencimento anterior a hoje)
   */
  async findOverdue(): Promise<AccountReceivable[]> {
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

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findOverdue`);
      throw error;
    }
  }

  /**
   * Busca contas a receber com vencimento próximo (próximos N dias)
   */
  async findUpcoming(days: number = 7): Promise<AccountReceivable[]> {
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

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findUpcoming`);
      throw error;
    }
  }

  /**
   * Busca contas a receber por cliente (usando customer_id ou customer_name)
   */
  async findByCustomer(customerId?: string, customerName?: string): Promise<AccountReceivable[]> {
    try {
      const query = this.createQuery().select('*');
      let filteredQuery = await this.applyUserFilter(query);

      if (customerId) {
        filteredQuery = filteredQuery.eq('customer_id', customerId);
      }

      if (customerName) {
        filteredQuery = filteredQuery.ilike('customer_name', `%${customerName}%`);
      }

      if (!customerId && !customerName) {
        throw new Error('É necessário fornecer customerId ou customerName');
      }

      const { data, error } = await filteredQuery
        .order('due_date', { ascending: true });

      if (error) {
        logService.logError(error, `${this.constructor.name}.findByCustomer`);
        throw new Error(`Erro ao buscar contas por cliente: ${error.message}`);
      }

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findByCustomer`);
      throw error;
    }
  }

  /**
   * Busca contas a receber por contato
   */
  async findByContact(contactId: string): Promise<AccountReceivable[]> {
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

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findByContact`);
      throw error;
    }
  }

  /**
   * Busca contas a receber por categoria
   */
  async findByCategory(categoryId: string): Promise<AccountReceivable[]> {
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

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findByCategory`);
      throw error;
    }
  }

  /**
   * Busca contas a receber com filtros avançados
   */
  async findWithFilters(filters: ReceivableFilters): Promise<AccountReceivable[]> {
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

      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,reference_document.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`);
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

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findWithFilters`);
      throw error;
    }
  }

  /**
   * Calcula o total de valores a receber por status
   */
  async getTotalByStatus(status: ReceivableStatus): Promise<number> {
    try {
      const accounts = await this.findByStatus(status);
      return accounts.reduce((total, account) => total + account.amount, 0);
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.getTotalByStatus`);
      throw error;
    }
  }

  /**
   * Busca contas por nome do cliente (busca parcial)
   */
  async searchByCustomerName(customerName: string): Promise<AccountReceivable[]> {
    try {
      const query = this.createQuery().select('*');
      const filteredQuery = await this.applyUserFilter(query);
      
      const { data, error } = await filteredQuery
        .ilike('customer_name', `%${customerName}%`)
        .order('due_date', { ascending: true });

      if (error) {
        logService.logError(error, `${this.constructor.name}.searchByCustomerName`);
        throw new Error(`Erro ao buscar contas por nome do cliente: ${error.message}`);
      }

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.searchByCustomerName`);
      throw error;
    }
  }

  /**
   * Busca contas recebidas em um período específico
   */
  async findReceivedInPeriod(startDate: string, endDate: string): Promise<AccountReceivable[]> {
    try {
      const query = this.createQuery().select('*');
      const filteredQuery = await this.applyUserFilter(query);
      
      const { data, error } = await filteredQuery
        .eq('status', 'received')
        .gte('received_at', startDate)
        .lte('received_at', endDate)
        .order('received_at', { ascending: false });

      if (error) {
        logService.logError(error, `${this.constructor.name}.findReceivedInPeriod`);
        throw new Error(`Erro ao buscar contas recebidas no período: ${error.message}`);
      }

      return data as AccountReceivable[] || [];
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.findReceivedInPeriod`);
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
          status: 'overdue' as ReceivableStatus,
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

  /**
   * Obtém estatísticas de contas por cliente
   */
  async getCustomerStatistics(customerId?: string): Promise<{
    totalAmount: number;
    pendingAmount: number;
    receivedAmount: number;
    overdueAmount: number;
    totalCount: number;
  }> {
    try {
      let accounts: AccountReceivable[];
      
      if (customerId) {
        accounts = await this.findByCustomer(customerId);
      } else {
        accounts = await this.findAll();
      }

      const stats = accounts.reduce((acc, account) => {
        acc.totalAmount += account.amount;
        acc.totalCount++;

        switch (account.status) {
          case 'pending':
            acc.pendingAmount += account.amount;
            break;
          case 'received':
            acc.receivedAmount += account.received_amount || account.amount;
            break;
          case 'overdue':
            acc.overdueAmount += account.amount;
            break;
        }

        return acc;
      }, {
        totalAmount: 0,
        pendingAmount: 0,
        receivedAmount: 0,
        overdueAmount: 0,
        totalCount: 0
      });

      return stats;
    } catch (error) {
      logService.logError(error, `${this.constructor.name}.getCustomerStatistics`);
      throw error;
    }
  }
}

// Instância singleton para uso global
export const receivablesRepository = new ReceivablesRepository();