import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { accountsPayableService } from '@/services/accountsPayableService';
import { AccountPayable, PaymentData } from '@/types/accounts';
import { showMessage } from '@/utils/messages';
import { useErrorHandler } from './useErrorHandler';

export interface UseAccountsPayableReturn {
  accounts: AccountPayable[];
  loading: boolean;
  error: string | null;
  createAccount: (account: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<AccountPayable>;
  updateAccount: (id: string, updates: Partial<AccountPayable>) => Promise<AccountPayable>;
  markAsPaid: (id: string, paymentData: PaymentData) => Promise<AccountPayable>;
  deleteAccount: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAccountsPayable(): UseAccountsPayableReturn {
  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const fetchAccounts = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update overdue accounts first
      await accountsPayableService.updateOverdueAccounts();
      
      const data = await accountsPayableService.getAccountsPayable();
      setAccounts(data);
    } catch (err) {
      const appError = handleError(err, 'useAccountsPayable.fetchAccounts');
      setError(appError.message);
      showMessage.saveError('Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<AccountPayable> => {
    try {
      const newAccount = await accountsPayableService.createAccountPayable(accountData);
      await fetchAccounts(); // Refresh the list
      showMessage.saveSuccess('Conta a pagar criada com sucesso!');
      return newAccount;
    } catch (err) {
      handleError(err, 'useAccountsPayable.createAccount');
      showMessage.saveError('Erro ao criar conta a pagar');
      throw err;
    }
  };

  const updateAccount = async (id: string, updates: Partial<AccountPayable>): Promise<AccountPayable> => {
    try {
      const updatedAccount = await accountsPayableService.updateAccountPayable(id, updates);
      await fetchAccounts(); // Refresh the list
      showMessage.saveSuccess('Conta a pagar atualizada com sucesso!');
      return updatedAccount;
    } catch (err) {
      handleError(err, 'useAccountsPayable.updateAccount');
      showMessage.saveError('Erro ao atualizar conta a pagar');
      throw err;
    }
  };

  const markAsPaid = async (id: string, paymentData: PaymentData): Promise<AccountPayable> => {
    try {
      const paidAccount = await accountsPayableService.markAsPaid(id, paymentData);
      await fetchAccounts(); // Refresh the list
      showMessage.saveSuccess('Conta marcada como paga com sucesso!');
      return paidAccount;
    } catch (err) {
      handleError(err, 'useAccountsPayable.markAsPaid');
      showMessage.saveError('Erro ao marcar conta como paga');
      throw err;
    }
  };

  const deleteAccount = async (id: string): Promise<void> => {
    try {
      await accountsPayableService.deleteAccountPayable(id);
      await fetchAccounts(); // Refresh the list
      showMessage.deleteSuccess('Conta a pagar excluída com sucesso!');
    } catch (err) {
      handleError(err, 'useAccountsPayable.deleteAccount');
      showMessage.deleteError('Erro ao excluir conta a pagar');
      throw err;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    markAsPaid,
    deleteAccount,
    refetch: fetchAccounts
  };
}