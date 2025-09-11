import { supabase } from '@/integrations/supabase/client';

export interface BankTransaction {
  id: string;
  user_id: string;
  from_account_id?: string;
  to_account_id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  date: string;
  reference_id?: string;
  accounts_payable_id?: string;
  accounts_receivable_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateTransactionData {
  from_account_id?: string;
  to_account_id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  date: string;
  reference_id?: string;
  accounts_payable_id?: string;
  accounts_receivable_id?: string;
  notes?: string;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {}

export interface TransactionFilters {
  account_id?: string;
  type?: 'income' | 'expense' | 'transfer';
  date_start?: string;
  date_end?: string;
  amount_min?: number;
  amount_max?: number;
}

export const transactionsService = {
  async getTransactions(filters?: TransactionFilters): Promise<BankTransaction[]> {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (filters?.account_id) {
      query = query.or(`from_account_id.eq.${filters.account_id},to_account_id.eq.${filters.account_id}`);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.date_start) {
      query = query.gte('date', filters.date_start);
    }

    if (filters?.date_end) {
      query = query.lte('date', filters.date_end);
    }

    if (filters?.amount_min) {
      query = query.gte('amount', filters.amount_min);
    }

    if (filters?.amount_max) {
      query = query.lte('amount', filters.amount_max);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getAll(filters?: TransactionFilters): Promise<BankTransaction[]> {
    return this.getTransactions(filters);
  },

  async create(transactionData: CreateTransactionData): Promise<BankTransaction> {
    return this.createTransaction(transactionData);
  },

  async update(id: string, updates: UpdateTransactionData): Promise<BankTransaction> {
    return this.updateTransaction(id, updates);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async getStatistics() {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

    if (error) throw error;

    const income = data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const expense = data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    return {
      total: data?.length || 0,
      income,
      expense,
      balance: income - expense
    };
  },

  async createTransaction(transactionData: CreateTransactionData): Promise<BankTransaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: UpdateTransactionData): Promise<BankTransaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async reconcileTransaction(transactionId: string, accountPayableId?: string, accountReceivableId?: string): Promise<BankTransaction> {
    const updates: UpdateTransactionData = {};
    
    if (accountPayableId) {
      updates.accounts_payable_id = accountPayableId;
    }
    
    if (accountReceivableId) {
      updates.accounts_receivable_id = accountReceivableId;
    }

    return this.updateTransaction(transactionId, updates);
  },

  async getAccountStatement(accountId: string, startDate: string, endDate: string): Promise<{
    transactions: BankTransaction[];
    initialBalance: number;
    finalBalance: number;
    totalIncome: number;
    totalExpense: number;
  }> {
    // Buscar transações do período
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (transactionsError) throw transactionsError;

    // Calcular saldos
    let totalIncome = 0;
    let totalExpense = 0;

    transactions?.forEach(transaction => {
      if (transaction.type === 'income' && transaction.to_account_id === accountId) {
        totalIncome += Number(transaction.amount);
      } else if (transaction.type === 'expense' && transaction.from_account_id === accountId) {
        totalExpense += Number(transaction.amount);
      } else if (transaction.type === 'transfer') {
        if (transaction.to_account_id === accountId) {
          totalIncome += Number(transaction.amount);
        } else if (transaction.from_account_id === accountId) {
          totalExpense += Number(transaction.amount);
        }
      }
    });

    // Buscar saldo inicial da conta (simulado)
    const { data: bankAccount } = await supabase
      .from('bank_accounts')
      .select('*, bank:banks(initial_balance)')
      .eq('id', accountId)
      .single();

    const initialBalance = Number(bankAccount?.bank?.initial_balance || 0);
    const finalBalance = initialBalance + totalIncome - totalExpense;

    return {
      transactions: transactions || [],
      initialBalance,
      finalBalance,
      totalIncome,
      totalExpense
    };
  }
};