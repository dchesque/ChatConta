import { useState, useEffect } from 'react';
import { banksService } from '@/services/banksService';
import { BankAccount } from '@/types/bank';
import { showMessage } from '@/utils/messages';
import { useErrorHandler } from './useErrorHandler';

export interface UseBankAccountsReturn {
  accounts: BankAccount[];
  loading: boolean;
  error: string | null;
  createAccount: (account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>) => Promise<BankAccount>;
  updateAccount: (id: string, updates: Partial<BankAccount>) => Promise<BankAccount>;
  deleteAccount: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useBankAccounts(bankId?: string): UseBankAccountsReturn {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const fetchAccounts = async () => {
    if (!bankId) {
      setAccounts([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await banksService.getBankAccounts(bankId);
      setAccounts(data);
    } catch (err) {
      const appError = handleError(err, 'useBankAccounts.fetchAccounts');
      setError(appError.message);
      showMessage.saveError('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount> => {
    try {
      const newAccount = await banksService.createBankAccount(accountData);
      await fetchAccounts(); // Refresh the list
      showMessage.saveSuccess('Conta criada com sucesso!');
      return newAccount;
    } catch (err) {
      handleError(err, 'useBankAccounts.createAccount');
      showMessage.saveError('Erro ao criar conta');
      throw err;
    }
  };

  const updateAccount = async (id: string, updates: Partial<BankAccount>): Promise<BankAccount> => {
    try {
      const updatedAccount = await banksService.updateBankAccount(id, updates);
      await fetchAccounts(); // Refresh the list
      showMessage.saveSuccess('Conta atualizada com sucesso!');
      return updatedAccount;
    } catch (err) {
      handleError(err, 'useBankAccounts.updateAccount');
      showMessage.saveError('Erro ao atualizar conta');
      throw err;
    }
  };

  const deleteAccount = async (id: string): Promise<void> => {
    try {
      await banksService.deleteBankAccount(id);
      await fetchAccounts(); // Refresh the list
      showMessage.deleteSuccess('Conta excluída com sucesso!');
    } catch (err) {
      handleError(err, 'useBankAccounts.deleteAccount');
      showMessage.deleteError('Erro ao excluir conta');
      throw err;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [bankId]);

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts
  };
}