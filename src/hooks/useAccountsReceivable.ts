import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { accountsReceivableService } from '@/services/accountsReceivableService';
import { AccountReceivable, ReceiptData } from '@/types/accounts';
import { showMessage } from '@/utils/messages';
import { useErrorHandler } from './useErrorHandler';

export interface UseAccountsReceivableReturn {
  accounts: AccountReceivable[];
  loading: boolean;
  error: string | null;
  createAccount: (account: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<AccountReceivable>;
  updateAccount: (id: string, updates: Partial<AccountReceivable>) => Promise<AccountReceivable>;
  markAsReceived: (id: string, receiptData: ReceiptData) => Promise<AccountReceivable>;
  deleteAccount: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAccountsReceivable(): UseAccountsReceivableReturn {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
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
      await accountsReceivableService.updateOverdueAccounts();
      
      const data = await accountsReceivableService.getAccountsReceivable();
      setAccounts(data);
    } catch (err) {
      const appError = handleError(err, 'useAccountsReceivable.fetchAccounts');
      setError(appError.message);
      showMessage.saveError('Erro ao carregar contas a receber');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<AccountReceivable> => {
    try {
      const newAccount = await accountsReceivableService.createAccountReceivable(accountData);
      await fetchAccounts(); // Refresh the list
      showMessage.saveSuccess('Conta a receber criada com sucesso!');
      return newAccount;
    } catch (err) {
      handleError(err, 'useAccountsReceivable.createAccount');
      showMessage.saveError('Erro ao criar conta a receber');
      throw err;
    }
  };

  const updateAccount = async (id: string, updates: Partial<AccountReceivable>): Promise<AccountReceivable> => {
    try {
      const updatedAccount = await accountsReceivableService.updateAccountReceivable(id, updates);
      await fetchAccounts(); // Refresh the list
      showMessage.saveSuccess('Conta a receber atualizada com sucesso!');
      return updatedAccount;
    } catch (err) {
      handleError(err, 'useAccountsReceivable.updateAccount');
      showMessage.saveError('Erro ao atualizar conta a receber');
      throw err;
    }
  };

  const markAsReceived = async (id: string, receiptData: ReceiptData): Promise<AccountReceivable> => {
    try {
      const receivedAccount = await accountsReceivableService.markAsReceived(id, receiptData);
      await fetchAccounts(); // Refresh the list
      showMessage.saveSuccess('Conta marcada como recebida com sucesso!');
      return receivedAccount;
    } catch (err) {
      handleError(err, 'useAccountsReceivable.markAsReceived');
      showMessage.saveError('Erro ao marcar conta como recebida');
      throw err;
    }
  };

  const deleteAccount = async (id: string): Promise<void> => {
    try {
      await accountsReceivableService.deleteAccountReceivable(id);
      await fetchAccounts(); // Refresh the list
      showMessage.deleteSuccess('Conta a receber excluída com sucesso!');
    } catch (err) {
      handleError(err, 'useAccountsReceivable.deleteAccount');
      showMessage.deleteError('Erro ao excluir conta a receber');
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
    markAsReceived,
    deleteAccount,
    refetch: fetchAccounts
  };
}