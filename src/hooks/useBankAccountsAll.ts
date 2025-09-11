import { useState, useEffect } from 'react';
import { banksService } from '@/services/banksService';
import { BankAccount } from '@/types/bank';
import { useErrorHandler } from './useErrorHandler';

export interface UseBankAccountsAllReturn {
  accounts: BankAccount[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBankAccountsAll(): UseBankAccountsAllReturn {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const fetchAllAccounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar o novo método otimizado do service
      const allAccounts = await banksService.getAllBankAccounts();
      setAccounts(allAccounts);
    } catch (err) {
      const appError = handleError(err, 'useBankAccountsAll.fetchAllAccounts');
      setError(appError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    refetch: fetchAllAccounts
  };
}