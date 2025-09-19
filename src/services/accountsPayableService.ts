import { supabase } from '@/integrations/supabase/client';
import { AccountPayable, PaymentData } from '@/types/accounts';

export const accountsPayableService = {
  async getAccountsPayable(): Promise<AccountPayable[]> {
    // Get current user to filter data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('accounts_payable')
      .select(`
        *,
        category:categories(id, name, color),
        contact:contacts(id, name, type),
        bank_account:bank_accounts(
          id,
          agency,
          account_number,
          bank:banks(name)
        )
      `)
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAccountPayableById(id: string): Promise<AccountPayable | null> {
    // Get current user to filter data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('accounts_payable')
      .select(`
        *,
        category:categories(id, name, color),
        contact:contacts(id, name, type),
        bank_account:bank_accounts(
          id,
          agency,
          account_number,
          bank:banks(name)
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createAccountPayable(
    account: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ): Promise<AccountPayable> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Update status based on due date
    const today = new Date().toISOString().split('T')[0];
    const status = account.due_date < today ? 'overdue' : account.status;

    const { data, error } = await supabase
      .from('accounts_payable')
      .insert([{ ...account, status, user_id: user.id }])
      .select(`
        *,
        category:categories(id, name, color),
        contact:contacts(id, name, type),
        bank_account:bank_accounts(
          id,
          agency,
          account_number,
          bank:banks(name)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateAccountPayable(
    id: string,
    updates: Partial<Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
  ): Promise<AccountPayable> {
    console.log('🔄 accountsPayableService.updateAccountPayable - ID:', id);
    console.log('🔄 accountsPayableService.updateAccountPayable - Updates:', updates);

    // Get current user to filter data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Update status based on due date if due_date is being updated
    if (updates.due_date && updates.status === 'pending') {
      const today = new Date().toISOString().split('T')[0];
      updates.status = updates.due_date < today ? 'overdue' : 'pending';
    }

    const { data, error } = await supabase
      .from('accounts_payable')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:categories(id, name, color),
        contact:contacts(id, name, type, document, email, phone),
        bank_account:bank_accounts(
          id,
          agency,
          account_number,
          bank:banks(name)
        )
      `)
      .single();

    if (error) {
      console.error('🚨 accountsPayableService.updateAccountPayable - Error:', error);
      throw error;
    }
    
    console.log('✅ accountsPayableService.updateAccountPayable - Success:', data);
    return data;
  },

  async markAsPaid(id: string, paymentData: PaymentData): Promise<AccountPayable> {
    // Get current user to filter data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('accounts_payable')
      .update({
        status: 'paid',
        bank_account_id: paymentData.bank_account_id,
        paid_at: paymentData.paid_at
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:categories(id, name, color),
        contact:contacts(id, name, type),
        bank_account:bank_accounts(
          id,
          agency,
          account_number,
          bank:banks(name)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAccountPayable(id: string): Promise<void> {
    // Get current user to filter data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('accounts_payable')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async revertPayment(id: string): Promise<AccountPayable> {
    // Get current user to filter data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('accounts_payable')
      .update({
        status: 'pending',
        paid_at: null,
        bank_account_id: null
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:categories(id, name, color),
        contact:contacts(id, name, type),
        bank_account:bank_accounts(
          id,
          agency,
          account_number,
          bank:banks(name)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Utility method to update overdue accounts
  async updateOverdueAccounts(): Promise<void> {
    // Get current user to filter data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('accounts_payable')
      .update({ status: 'overdue' })
      .eq('status', 'pending')
      .eq('user_id', user.id)
      .lt('due_date', today);

    if (error) throw error;
  }
};