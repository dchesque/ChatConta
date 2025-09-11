import type { ContaPagar } from '@/types/contaPagar';
import type { ContaReceber } from '@/types/contaReceber';
import type { Fornecedor } from '@/types/fornecedor';
import type { Categoria } from '@/types/categoria';
import type { Banco } from '@/types/banco';

// User interfaces for auth
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at?: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Dashboard summary interface
export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalAccountsPayable: number;
  totalAccountsReceivable: number;
  overdueAccountsPayable: number;
  overdueAccountsReceivable: number;
  accountsPayableCount: number;
  accountsReceivableCount: number;
  paidAccountsPayable: number;
  paidAccountsReceivable: number;
  paidAccountsPayableCount: number;
  paidAccountsReceivableCount: number;
  recentActivity: Array<{
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
  }>;
}

// Main service interface - simplified for Supabase migration
export interface IDataService {
  // ============ AUTH ============
  auth: {
    signIn(email: string, password: string): Promise<Session>;
    signUp(email: string, password: string, userData?: any): Promise<User>;
    signOut(): Promise<void>;
    verifyOTP(email: string, token: string): Promise<Session>;
    resendOTP(email: string): Promise<void>;
    updateProfile(data: Partial<User>): Promise<User>;
    getCurrentUser(): Promise<User | null>;
  };

  // ============ CONTAS A PAGAR ============
  contasPagar: {
    getAll(filtros?: any): Promise<any[]>;
    getById(id: string): Promise<any>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
    getByVencimento(dataInicio: string, dataFim: string): Promise<any[]>;
    getByStatus(status: string): Promise<any[]>;
    marcarComoPaga(id: string, dados: any): Promise<any>;
  };

  // ============ CONTAS A RECEBER ============
  contasReceber: {
    getAll(filtros?: any): Promise<any[]>;
    getById(id: string): Promise<any | null>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
    getByVencimento(dataInicio: string, dataFim: string): Promise<any[]>;
    getByStatus(status: string): Promise<any[]>;
    marcarComoRecebida(id: string, dataRecebimento: string, valorRecebido?: number): Promise<any>;
  };

  // ============ FORNECEDORES/CONTATOS ============
  fornecedores: {
    getAll(filtros?: any): Promise<any[]>;
    getById(id: string): Promise<any | null>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
  };

  // ============ CONTATOS ============
  contatos: {
    getAll(filtros?: any): Promise<any[]>;
    getById(id: string): Promise<any | null>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
  };

  // ============ CATEGORIAS ============
  categorias: {
    getAll(filtros?: any): Promise<any[]>;
    getById(id: string): Promise<any | null>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
  };

  // ============ BANCOS ============
  bancos: {
    getAll(filtros?: any): Promise<any[]>;
    getById(id: string): Promise<any | null>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
  };

  // ============ BANK ACCOUNTS ============
  bankAccounts: {
    getAll(): Promise<any[]>;
    create(bankId: string, data: any): Promise<any>;
    transfer(fromAccountId: string, toAccountId: string, amount: number, description: string): Promise<any>;
  };

  // ============ TRANSACTIONS ============
  transactions: {
    getAll(filters?: any): Promise<any[]>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
    getStatement(accountId: string, startDate: Date, endDate: Date): Promise<any[]>;
  };

  // ============ DASHBOARD ============
  dashboard: {
    getSummary(selectedYear?: number, selectedMonth?: number): Promise<DashboardSummary>;
  };

  // ============ UTILS ============
  utils: {
    exportData(format: 'json' | 'csv'): Promise<Blob>;
    importData(file: File): Promise<{ success: boolean; message: string }>;
    clearCache(): Promise<void>;
    checkConnection(): Promise<boolean>;
    resetData(): Promise<void>;
  };
}