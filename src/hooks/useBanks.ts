import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { banksService } from '@/services/banksService';
import { Bank, BankWithAccounts } from '@/types/bank';
import { showMessage } from '@/utils/messages';
import { useErrorHandler } from './useErrorHandler';

export interface UseBanksReturn {
  banks: BankWithAccounts[];
  loading: boolean;
  error: string | null;
  createBank: (bank: Omit<Bank, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Bank>;
  updateBank: (id: string, updates: Partial<Bank>) => Promise<Bank>;
  deleteBank: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useBanks(): UseBanksReturn {
  const [banks, setBanks] = useState<BankWithAccounts[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const fetchBanks = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await banksService.getBanksWithAccounts();
      setBanks(data);
    } catch (err) {
      const appError = handleError(err, 'useBanks.fetchBanks');
      setError(appError.message);
      showMessage.saveError('Erro ao carregar bancos');
    } finally {
      setLoading(false);
    }
  };

  const createBank = async (bankData: Omit<Bank, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Bank> => {
    try {
      const newBank = await banksService.createBank(bankData);
      await fetchBanks(); // Refresh the list
      showMessage.saveSuccess('Banco criado com sucesso!');
      return newBank;
    } catch (err) {
      handleError(err, 'useBanks.createBank');
      showMessage.saveError('Erro ao criar banco');
      throw err;
    }
  };

  const updateBank = async (id: string, updates: Partial<Bank>): Promise<Bank> => {
    try {
      const updatedBank = await banksService.updateBank(id, updates);
      await fetchBanks(); // Refresh the list
      showMessage.saveSuccess('Banco atualizado com sucesso!');
      return updatedBank;
    } catch (err) {
      handleError(err, 'useBanks.updateBank');
      showMessage.saveError('Erro ao atualizar banco');
      throw err;
    }
  };

  const deleteBank = async (id: string): Promise<void> => {
    try {
      await banksService.deleteBank(id);
      await fetchBanks(); // Refresh the list
      showMessage.deleteSuccess('Banco excluído com sucesso!');
    } catch (err) {
      handleError(err, 'useBanks.deleteBank');
      showMessage.deleteError('Erro ao excluir banco');
      throw err;
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [user]);

  return {
    banks,
    loading,
    error,
    createBank,
    updateBank,
    deleteBank,
    refetch: fetchBanks
  };
}