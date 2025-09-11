import { supabase } from '@/integrations/supabase/client';
import { logService } from '@/services/logService';
import type { Database } from '@/integrations/supabase/types';

type AccountsPayable = Database['public']['Tables']['accounts_payable']['Row'];
type AccountsPayableInsert = Database['public']['Tables']['accounts_payable']['Insert'];
type AccountsPayableUpdate = Database['public']['Tables']['accounts_payable']['Update'];

export interface PayableFilters {
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  startDate?: string;
  endDate?: string;
  contactId?: string;
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PayableCreateData {
  description: string;
  amount: number;
  due_date: string;
  contact_id?: string;
  category_id?: string;
  bank_account_id?: string;
  issue_date?: string;
  notes?: string;
  reference_document?: string;
  dda_enabled?: boolean;
}

export interface PayableUpdateData extends Partial<PayableCreateData> {
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_at?: string;
  paid_amount?: number;
  final_amount?: number;
}

/**
 * Serviço unificado para operações com contas a pagar
 * Utiliza tipos do Supabase e implementa tratamento de erros consistente
 */
export class PayablesService {
  private readonly TABLE_NAME = 'accounts_payable';

  /**
   * Busca todas as contas a pagar com filtros opcionais
   */
  async findAll(filters: PayableFilters = {}): Promise<AccountsPayable[]> {
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

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,reference_document.ilike.%${filters.search}%`);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        logService.logError(error, 'PayablesService.findAll');
        throw new Error(`Erro ao buscar contas a pagar: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logService.logError(error, 'PayablesService.findAll');
      throw error;
    }
  }

  /**
   * Busca uma conta a pagar por ID
   */
  async findById(id: string): Promise<AccountsPayable | null> {
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
        logService.logError(error, 'PayablesService.findById');
        throw new Error(`Erro ao buscar conta a pagar: ${error.message}`);
      }

      return data || null;
    } catch (error) {
      logService.logError(error, 'PayablesService.findById');
      throw error;
    }
  }

  /**
   * Cria uma nova conta a pagar
   */
  async create(payableData: PayableCreateData): Promise<AccountsPayable> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      const insertData: AccountsPayableInsert = {
        ...payableData,
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
        logService.logError(error, 'PayablesService.create');
        throw new Error(`Erro ao criar conta a pagar: ${error.message}`);
      }

      logService.logInfo('Conta a pagar criada com sucesso', { id: data.id }, 'PayablesService');
      return data;
    } catch (error) {
      logService.logError(error, 'PayablesService.create');
      throw error;
    }
  }

  /**
   * Atualiza uma conta a pagar existente
   */
  async update(id: string, payableData: PayableUpdateData): Promise<AccountsPayable> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      const updateData: AccountsPayableUpdate = {
        ...payableData,
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
        logService.logError(error, 'PayablesService.update');
        throw new Error(`Erro ao atualizar conta a pagar: ${error.message}`);
      }

      logService.logInfo('Conta a pagar atualizada com sucesso', { id: data.id }, 'PayablesService');
      return data;
    } catch (error) {
      logService.logError(error, 'PayablesService.update');
      throw error;
    }
  }

  /**
   * Remove uma conta a pagar (soft delete)
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
        logService.logError(error, 'PayablesService.delete');
        throw new Error(`Erro ao excluir conta a pagar: ${error.message}`);
      }

      logService.logInfo('Conta a pagar excluída com sucesso', { id }, 'PayablesService');
    } catch (error) {
      logService.logError(error, 'PayablesService.delete');
      throw error;
    }
  }

  /**
   * Busca contas a pagar vencidas
   */
  async getOverdue(): Promise<AccountsPayable[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      return this.findAll({
        status: 'pending',
        endDate: today
      });
    } catch (error) {
      logService.logError(error, 'PayablesService.getOverdue');
      throw error;
    }
  }

  /**
   * Busca contas a pagar com vencimento próximo (próximos 7 dias)
   */
  async getUpcoming(days: number = 7): Promise<AccountsPayable[]> {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
      
      return this.findAll({
        status: 'pending',
        startDate: today.toISOString().split('T')[0],
        endDate: futureDate.toISOString().split('T')[0]
      });
    } catch (error) {
      logService.logError(error, 'PayablesService.getUpcoming');
      throw error;
    }
  }

  /**
   * Marca uma conta como paga
   */
  async markAsPaid(id: string, paidAmount?: number, paidAt?: string): Promise<AccountsPayable> {
    try {
      const account = await this.findById(id);
      if (!account) {
        throw new Error('Conta a pagar não encontrada');
      }

      return this.update(id, {
        status: 'paid',
        paid_at: paidAt || new Date().toISOString(),
        paid_amount: paidAmount || account.amount,
        final_amount: paidAmount || account.amount
      });
    } catch (error) {
      logService.logError(error, 'PayablesService.markAsPaid');
      throw error;
    }
  }

  /**
   * Cancela uma conta a pagar
   */
  async cancel(id: string): Promise<AccountsPayable> {
    try {
      return this.update(id, {
        status: 'cancelled'
      });
    } catch (error) {
      logService.logError(error, 'PayablesService.cancel');
      throw error;
    }
  }
}

// Instância singleton para uso global
export const payablesService = new PayablesService();