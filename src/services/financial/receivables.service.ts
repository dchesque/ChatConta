import { supabase } from '@/integrations/supabase/client';
import { logService } from '@/services/logService';
import type { Database } from '@/integrations/supabase/types';

type AccountsReceivable = Database['public']['Tables']['accounts_receivable']['Row'];
type AccountsReceivableInsert = Database['public']['Tables']['accounts_receivable']['Insert'];
type AccountsReceivableUpdate = Database['public']['Tables']['accounts_receivable']['Update'];

export interface ReceivableFilters {
  status?: 'pending' | 'received' | 'overdue' | 'cancelled';
  startDate?: string;
  endDate?: string;
  contactId?: string;
  categoryId?: string;
  customerId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ReceivableCreateData {
  description: string;
  amount: number;
  due_date: string;
  contact_id?: string;
  customer_id?: string;
  customer_name?: string;
  category_id?: string;
  bank_account_id?: string;
  issue_date?: string;
  notes?: string;
  reference_document?: string;
}

export interface ReceivableUpdateData extends Partial<ReceivableCreateData> {
  status?: 'pending' | 'received' | 'overdue' | 'cancelled';
  received_at?: string;
  received_amount?: number;
  final_amount?: number;
}

/**
 * Serviço unificado para operações com contas a receber
 * Utiliza tipos do Supabase e implementa tratamento de erros consistente
 */
export class ReceivablesService {
  private readonly TABLE_NAME = 'accounts_receivable';

  /**
   * Busca todas as contas a receber com filtros opcionais
   */
  async findAll(filters: ReceivableFilters = {}): Promise<AccountsReceivable[]> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', currentUser.user.id)
        .is('deleted_at', null)
        .order('due_date', { ascending: true });

      // Aplicar filtros
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

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logService.logError(error, 'ReceivablesService.findAll');
        throw new Error(`Erro ao buscar contas a receber: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logService.logError(error, 'ReceivablesService.findAll');
      throw error;
    }
  }

  /**
   * Busca uma conta a receber por ID
   */
  async findById(id: string): Promise<AccountsReceivable | null> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .eq('user_id', currentUser.user.id)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        logService.logError(error, 'ReceivablesService.findById');
        throw new Error(`Erro ao buscar conta a receber: ${error.message}`);
      }

      return data || null;
    } catch (error) {
      logService.logError(error, 'ReceivablesService.findById');
      throw error;
    }
  }

  /**
   * Cria uma nova conta a receber
   */
  async create(receivableData: ReceivableCreateData): Promise<AccountsReceivable> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      const insertData: AccountsReceivableInsert = {
        ...receivableData,
        user_id: currentUser.user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        logService.logError(error, 'ReceivablesService.create');
        throw new Error(`Erro ao criar conta a receber: ${error.message}`);
      }

      logService.logInfo('Conta a receber criada com sucesso', { id: data.id }, 'ReceivablesService');
      return data;
    } catch (error) {
      logService.logError(error, 'ReceivablesService.create');
      throw error;
    }
  }

  /**
   * Atualiza uma conta a receber existente
   */
  async update(id: string, receivableData: ReceivableUpdateData): Promise<AccountsReceivable> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      const updateData: AccountsReceivableUpdate = {
        ...receivableData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', currentUser.user.id)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        logService.logError(error, 'ReceivablesService.update');
        throw new Error(`Erro ao atualizar conta a receber: ${error.message}`);
      }

      logService.logInfo('Conta a receber atualizada com sucesso', { id: data.id }, 'ReceivablesService');
      return data;
    } catch (error) {
      logService.logError(error, 'ReceivablesService.update');
      throw error;
    }
  }

  /**
   * Remove uma conta a receber (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', currentUser.user.id)
        .is('deleted_at', null);

      if (error) {
        logService.logError(error, 'ReceivablesService.delete');
        throw new Error(`Erro ao excluir conta a receber: ${error.message}`);
      }

      logService.logInfo('Conta a receber excluída com sucesso', { id }, 'ReceivablesService');
    } catch (error) {
      logService.logError(error, 'ReceivablesService.delete');
      throw error;
    }
  }

  /**
   * Busca contas a receber vencidas
   */
  async getOverdue(): Promise<AccountsReceivable[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      return this.findAll({
        status: 'pending',
        endDate: today
      });
    } catch (error) {
      logService.logError(error, 'ReceivablesService.getOverdue');
      throw error;
    }
  }

  /**
   * Busca contas a receber com vencimento próximo (próximos 7 dias)
   */
  async getUpcoming(days: number = 7): Promise<AccountsReceivable[]> {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
      
      return this.findAll({
        status: 'pending',
        startDate: today.toISOString().split('T')[0],
        endDate: futureDate.toISOString().split('T')[0]
      });
    } catch (error) {
      logService.logError(error, 'ReceivablesService.getUpcoming');
      throw error;
    }
  }

  /**
   * Marca uma conta como recebida
   */
  async markAsReceived(id: string, receivedAmount?: number, receivedAt?: string): Promise<AccountsReceivable> {
    try {
      const account = await this.findById(id);
      if (!account) {
        throw new Error('Conta a receber não encontrada');
      }

      return this.update(id, {
        status: 'received',
        received_at: receivedAt || new Date().toISOString(),
        received_amount: receivedAmount || account.amount,
        final_amount: receivedAmount || account.amount
      });
    } catch (error) {
      logService.logError(error, 'ReceivablesService.markAsReceived');
      throw error;
    }
  }

  /**
   * Cancela uma conta a receber
   */
  async cancel(id: string): Promise<AccountsReceivable> {
    try {
      return this.update(id, {
        status: 'cancelled'
      });
    } catch (error) {
      logService.logError(error, 'ReceivablesService.cancel');
      throw error;
    }
  }

  /**
   * Busca contas por cliente
   */
  async findByCustomer(customerId?: string, customerName?: string): Promise<AccountsReceivable[]> {
    try {
      const filters: ReceivableFilters = {};
      
      if (customerId) {
        filters.customerId = customerId;
      }
      
      if (customerName) {
        filters.search = customerName;
      }

      return this.findAll(filters);
    } catch (error) {
      logService.logError(error, 'ReceivablesService.findByCustomer');
      throw error;
    }
  }

  /**
   * Atualiza status para vencidas baseado na data de vencimento
   */
  async updateOverdueStatus(): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status: 'overdue',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.user.id)
        .eq('status', 'pending')
        .lt('due_date', today)
        .is('deleted_at', null);

      if (error) {
        logService.logError(error, 'ReceivablesService.updateOverdueStatus');
        throw new Error(`Erro ao atualizar status de contas vencidas: ${error.message}`);
      }

      logService.logInfo('Status de contas vencidas atualizado com sucesso', {}, 'ReceivablesService');
    } catch (error) {
      logService.logError(error, 'ReceivablesService.updateOverdueStatus');
      throw error;
    }
  }
}

// Instância singleton para uso global
export const receivablesService = new ReceivablesService();