import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';
import { transactionsService } from '@/services/transactionsService';
import { Transaction, CreateTransaction, UpdateTransaction, TransactionFilters } from '@/types/transaction';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const loadTransactions = async (filters?: TransactionFilters) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Converter filtros para formato do service
      const serviceFilters = filters ? {
        account_id: filters.account_id === 'all' ? undefined : filters.account_id,
        type: filters.type === 'all' ? undefined : filters.type as 'income' | 'expense' | 'transfer',
        date_start: filters.date_start,
        date_end: filters.date_end,
        amount_min: filters.amount_min,
        amount_max: filters.amount_max
      } : undefined;

      const data = await transactionsService.getAll(serviceFilters);
      setTransactions(data);
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: CreateTransaction): Promise<Transaction | null> => {
    try {
      const newTransaction = await transactionsService.create(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      toast.success('Transação criada com sucesso!');
      return newTransaction;
    } catch (err) {
      handleError(err);
      toast.error('Erro ao criar transação');
      return null;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<UpdateTransaction>): Promise<boolean> => {
    try {
      const updatedTransaction = await transactionsService.update(id, updates);
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? updatedTransaction : transaction
        )
      );
      toast.success('Transação atualizada com sucesso!');
      return true;
    } catch (err) {
      handleError(err);
      toast.error('Erro ao atualizar transação');
      return false;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      await transactionsService.delete(id);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      toast.success('Transação excluída com sucesso!');
      return true;
    } catch (err) {
      handleError(err);
      toast.error('Erro ao excluir transação');
      return false;
    }
  };

  const getStatistics = async () => {
    try {
      return await transactionsService.getStatistics();
    } catch (err) {
      handleError(err);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  return {
    transactions,
    loading,
    error,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getStatistics,
    refetch: () => loadTransactions()
  };
};