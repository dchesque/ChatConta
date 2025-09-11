export type BankType = 'banco' | 'carteira' | 'corretora' | 'cripto' | 'outro';

export interface Bank {
  id: string;
  user_id: string;
  name: string;
  type: BankType;
  initial_balance: number;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  bank_id: string;
  agency?: string;
  account_number?: string;
  pix_key?: string;
  created_at: string;
  updated_at: string;
}

export interface BankWithAccounts extends Bank {
  accounts: BankAccount[];
}

export const BANK_TYPE_LABELS: Record<BankType, string> = {
  banco: 'Banco',
  carteira: 'Carteira Digital',
  corretora: 'Corretora',
  cripto: 'Carteira Cripto',
  outro: 'Outro'
};

export const BANK_TYPE_OPTIONS = [
  { value: 'banco' as BankType, label: 'Banco' },
  { value: 'carteira' as BankType, label: 'Carteira Digital' },
  { value: 'corretora' as BankType, label: 'Corretora' },
  { value: 'cripto' as BankType, label: 'Carteira Cripto' },
  { value: 'outro' as BankType, label: 'Outro' }
];