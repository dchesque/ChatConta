import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { accountsReceivableService } from '@/services/accountsReceivableService';
import { AccountReceivable, ReceiptData } from '@/types/accounts';
import { showMessage } from '@/utils/messages';
import { useErrorHandler } from './useErrorHandler';

export interface UseContasReceberReturn {
  contas: AccountReceivable[];
  loading: boolean;
  error: string | null;
  criarConta: (conta: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<AccountReceivable>;
  atualizarConta: (id: string, conta: Partial<AccountReceivable>) => Promise<AccountReceivable>;
  excluirConta: (id: string) => Promise<void>;
  marcarComoRecebido: (id: string, dados: ReceiptData) => Promise<AccountReceivable>;
  recarregar: () => Promise<void>;
  estatisticas: {
    total_contas: number;
    valor_total: number;
    pendentes: number;
    valor_pendente: number;
    vencidas: number;
    valor_vencido: number;
    recebidas: number;
    valor_recebido: number;
  };
}

export function useContasReceber(): UseContasReceberReturn {
  const [contas, setContas] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  // Calcular estatísticas
  const estatisticas = {
    total_contas: contas.length,
    valor_total: contas.reduce((total, conta) => total + conta.amount, 0),
    pendentes: contas.filter(conta => conta.status === 'pending').length,
    valor_pendente: contas.filter(conta => conta.status === 'pending').reduce((total, conta) => total + conta.amount, 0),
    vencidas: contas.filter(conta => conta.status === 'overdue').length,
    valor_vencido: contas.filter(conta => conta.status === 'overdue').reduce((total, conta) => total + conta.amount, 0),
    recebidas: contas.filter(conta => conta.status === 'received').length,
    valor_recebido: contas.filter(conta => conta.status === 'received').reduce((total, conta) => total + conta.amount, 0)
  };

  const carregarContas = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update overdue accounts first
      await accountsReceivableService.updateOverdueAccounts();
      
      const data = await accountsReceivableService.getAccountsReceivable();
      setContas(data);
    } catch (err) {
      const appError = handleError(err, 'useContasReceber.carregarContas');
      setError(appError.message);
      showMessage.saveError('Erro ao carregar contas a receber');
    } finally {
      setLoading(false);
    }
  };

  const criarConta = async (dadosConta: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<AccountReceivable> => {
    try {
      const novaConta = await accountsReceivableService.createAccountReceivable(dadosConta);
      await carregarContas(); // Refresh the list
      showMessage.saveSuccess('Conta a receber criada com sucesso!');
      return novaConta;
    } catch (err) {
      handleError(err, 'useContasReceber.criarConta');
      showMessage.saveError('Erro ao criar conta a receber');
      throw err;
    }
  };

  const atualizarConta = async (id: string, dadosAtualizacao: Partial<AccountReceivable>): Promise<AccountReceivable> => {
    try {
      const contaAtualizada = await accountsReceivableService.updateAccountReceivable(id, dadosAtualizacao);
      await carregarContas(); // Refresh the list
      showMessage.saveSuccess('Conta a receber atualizada com sucesso!');
      return contaAtualizada;
    } catch (err) {
      handleError(err, 'useContasReceber.atualizarConta');
      showMessage.saveError('Erro ao atualizar conta a receber');
      throw err;
    }
  };

  const excluirConta = async (id: string): Promise<void> => {
    try {
      await accountsReceivableService.deleteAccountReceivable(id);
      await carregarContas(); // Refresh the list
      showMessage.deleteSuccess('Conta a receber excluída com sucesso!');
    } catch (err) {
      handleError(err, 'useContasReceber.excluirConta');
      showMessage.deleteError('Erro ao excluir conta a receber');
      throw err;
    }
  };

  const marcarComoRecebido = async (id: string, dados: ReceiptData): Promise<AccountReceivable> => {
    try {
      const contaRecebida = await accountsReceivableService.markAsReceived(id, dados);
      await carregarContas(); // Refresh the list
      showMessage.saveSuccess('Conta marcada como recebida!');
      return contaRecebida;
    } catch (err) {
      handleError(err, 'useContasReceber.marcarComoRecebido');
      showMessage.saveError('Erro ao marcar conta como recebida');
      throw err;
    }
  };

  const recarregar = async (): Promise<void> => {
    await carregarContas();
  };

  useEffect(() => {
    if (user) {
      carregarContas();
    } else {
      setContas([]);
    }
  }, [user]);

  return {
    contas,
    loading,
    error,
    criarConta,
    atualizarConta,
    excluirConta,
    marcarComoRecebido,
    recarregar,
    estatisticas
  };
}