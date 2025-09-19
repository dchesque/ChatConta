import { supabase } from '@/integrations/supabase/client';
import { Bank, BankAccount, BankWithAccounts } from '@/types/bank';

export const banksService = {
  async getBanks(): Promise<Bank[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getBanksWithAccounts(): Promise<BankWithAccounts[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('banks')
      .select(`
        *,
        bank_accounts (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(bank => ({
      ...bank,
      accounts: bank.bank_accounts || []
    }));
  },

  async getBankById(id: string): Promise<Bank | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('banks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBank(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Bank Accounts
  async getBankAccounts(bankId: string): Promise<BankAccount[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Primeiro verifica se o banco pertence ao usuário
    const { data: bank } = await supabase
      .from('banks')
      .select('id')
      .eq('id', bankId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!bank) throw new Error('Banco não encontrado ou sem permissão');

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verifica se a conta bancária pertence a um banco do usuário
    const { data: account } = await supabase
      .from('bank_accounts')
      .select(`
        id,
        bank:banks!inner(user_id)
      `)
      .eq('id', id)
      .eq('bank.user_id', user.id)
      .maybeSingle();

    if (!account) throw new Error('Conta bancária não encontrada ou sem permissão');

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Verifica se a conta bancária pertence a um banco do usuário
    const { data: account } = await supabase
      .from('bank_accounts')
      .select(`
        id,
        bank:banks!inner(user_id)
      `)
      .eq('id', id)
      .eq('bank.user_id', user.id)
      .maybeSingle();

    if (!account) throw new Error('Conta bancária não encontrada ou sem permissão');

    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Buscar todas as contas bancárias do usuário
  async getAllBankAccounts(): Promise<BankAccount[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('bank_accounts')
      .select(`
        *,
        bank:banks!inner(id, name, user_id)
      `)
      .eq('bank.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};