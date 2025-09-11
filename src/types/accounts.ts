export type AccountStatus = 'pending' | 'paid' | 'overdue' | 'canceled';
export type ReceivableStatus = 'pending' | 'received' | 'overdue' | 'canceled';

export interface AccountPayable {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  due_date: string;
  status: AccountStatus;
  category_id?: string;
  contact_id?: string;
  bank_account_id?: string;
  paid_at?: string;
  notes?: string;
  reference_document?: string;
  paid_amount?: number;
  final_amount?: number;
  original_amount?: number;
  issue_date?: string;
  dda_enabled?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Joined data
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  contact?: {
    id: string;
    name: string;
    type: string;
  };
  bank_account?: {
    id: string;
    agency?: string;
    account_number?: string;
    bank: {
      name: string;
    };
  };
}

export interface AccountReceivable {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  due_date: string;
  issue_date?: string;
  status: ReceivableStatus;
  category_id?: string;
  customer_id?: string;
  customer_name?: string;
  contact_id?: string;
  bank_account_id?: string;
  received_at?: string;
  notes?: string;
  reference_document?: string;
  original_amount?: number;
  received_amount?: number;
  final_amount?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  
  // Joined data
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  contact?: {
    id: string;
    name: string;
    type: string;
  };
  customer?: {
    id: string;
    name: string;
  };
  bank_account?: {
    id: string;
    agency?: string;
    account_number?: string;
    bank: {
      name: string;
    };
  };
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
  canceled: 'Cancelado'
};

export const RECEIVABLE_STATUS_LABELS: Record<ReceivableStatus, string> = {
  pending: 'Pendente',
  received: 'Recebido',
  overdue: 'Vencido',
  canceled: 'Cancelado'
};

export const ACCOUNT_STATUS_COLORS: Record<AccountStatus, string> = {
  pending: 'bg-yellow-100/80 text-yellow-700',
  paid: 'bg-green-100/80 text-green-700',
  overdue: 'bg-red-100/80 text-red-700',
  canceled: 'bg-gray-100/80 text-gray-700'
};

export const RECEIVABLE_STATUS_COLORS: Record<ReceivableStatus, string> = {
  pending: 'bg-yellow-100/80 text-yellow-700',
  received: 'bg-green-100/80 text-green-700',
  overdue: 'bg-red-100/80 text-red-700',
  canceled: 'bg-gray-100/80 text-gray-700'
};

export interface PaymentData {
  bank_account_id: string;
  paid_at: string;
}

export interface ReceiptData {
  bank_account_id: string;
  received_at: string;
}