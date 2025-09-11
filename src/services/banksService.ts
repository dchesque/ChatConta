import { supabase } from '@/integrations/supabase/client';
import { Bank, BankAccount, BankWithAccounts } from '@/types/bank';

export const banksService = {
  async getBanks(): Promise<Bank[]> {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getBanksWithAccounts(): Promise<BankWithAccounts[]> {
    const { data, error } = await supabase
      .from('banks')
      .select(`
        *,
        bank_accounts (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(bank => ({
      ...bank,
      accounts: bank.bank_accounts || []
    }));
  },

  async getBankById(id: string): Promise<Bank | null> {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createBank(bank: Omit<Bank, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Bank> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('banks')
      .insert([{ ...bank, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBank(id: string, updates: Partial<Omit<Bank, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Bank> {
    const { data, error } = await supabase
      .from('banks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBank(id: string): Promise<void> {
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Bank Accounts
  async getBankAccounts(bankId: string): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('bank_id', bankId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createBankAccount(account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount> {
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([account])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar conta bancária:', error);
      throw error;
    }
    
    
    return data;
  },

  async updateBankAccount(id: string, updates: Partial<Omit<BankAccount, 'id' | 'created_at' | 'updated_at' | 'bank_id'>>): Promise<BankAccount> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBankAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Buscar todas as contas bancárias do usuário
  async getAllBankAccounts(): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select(`
        *,
        bank:banks(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};