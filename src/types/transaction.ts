export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description?: string;
  from_account_id?: string;
  to_account_id?: string;
  accounts_payable_id?: string;
  accounts_receivable_id?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Dados relacionados
  from_account?: {
    id: string;
    agency?: string;
    account_number?: string;
    bank: {
      name: string;
    };
  };
  to_account?: {
    id: string;
    agency?: string;
    account_number?: string;
    bank: {
      name: string;
    };
  };
  accounts_payable?: {
    id: string;
    description: string;
  };
  accounts_receivable?: {
    id: string;
    description: string;
  };
}

export interface CreateTransaction {
  type: TransactionType;
  amount: number;
  date: string;
  description?: string;
  from_account_id?: string;
  to_account_id?: string;
  accounts_payable_id?: string;
  accounts_receivable_id?: string;
  reference_id?: string;
  notes?: string;
}

export interface UpdateTransaction extends Partial<CreateTransaction> {
  id: string;
}

export interface TransactionFilters {
  search?: string;
  type?: TransactionType | 'all';
  account_id?: string | 'all';
  date_start?: string;
  date_end?: string;
  amount_min?: number;
  amount_max?: number;
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Entrada',
  expense: 'Saída',
  transfer: 'Transferência'
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  income: 'bg-green-100/80 text-green-700',
  expense: 'bg-red-100/80 text-red-700',
  transfer: 'bg-blue-100/80 text-blue-700'
};

export const TRANSACTION_TYPE_ICONS: Record<TransactionType, string> = {
  income: 'TrendingUp',
  expense: 'TrendingDown',
  transfer: 'ArrowRightLeft'
};