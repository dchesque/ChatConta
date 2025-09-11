import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { transactionsService, BankTransaction, CreateTransactionData, UpdateTransactionData, TransactionFilters } from '@/services/transactionsService';
import { showMessage } from '@/utils/messages';
import { useErrorHandler } from './useErrorHandler';

export interface MovimentacaoOFXSupabase {
  id: string;
  banco_id: string;
  data_movimentacao: string;
  descricao: string;
  valor: number;
  tipo: 'debito' | 'credito';
  saldo_anterior: number;
  saldo_posterior: number;
  codigo_autenticacao?: string;
  status_conciliacao: 'pendente' | 'conciliado' | 'divergente';
  conta_pagar_id?: string;
  observacao_conciliacao?: string;
  created_at: string;
  updated_at: string;
}

// Converter BankTransaction para MovimentacaoOFXSupabase
const transactionToMovimentacao = (transaction: BankTransaction, accountId: string): MovimentacaoOFXSupabase => ({
  id: transaction.id,
  banco_id: transaction.from_account_id || transaction.to_account_id || '',
  data_movimentacao: transaction.date,
  descricao: transaction.description || 'Movimentação bancária',
  valor: Number(transaction.amount),
  tipo: transaction.type === 'expense' || (transaction.type === 'transfer' && transaction.from_account_id === accountId) ? 'debito' : 'credito',
  saldo_anterior: 0, // Será calculado dinamicamente
  saldo_posterior: 0, // Será calculado dinamicamente
  codigo_autenticacao: transaction.reference_id,
  status_conciliacao: transaction.accounts_payable_id || transaction.accounts_receivable_id ? 'conciliado' : 'pendente',
  conta_pagar_id: transaction.accounts_payable_id,
  observacao_conciliacao: transaction.notes,
  created_at: transaction.created_at,
  updated_at: transaction.updated_at
});

export function useMovimentacaoOFX(bancoId?: string) {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoOFXSupabase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const listarMovimentacoes = async (bancoIdParam?: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const accountId = bancoIdParam || bancoId;
      const filters: TransactionFilters = {};
      
      if (accountId) {
        filters.account_id = accountId;
      }
      
      const transactions = await transactionsService.getTransactions(filters);
      
      // Converter transactions para movimentações e calcular saldos
      let saldoAcumulado = 0;
      const movimentacoesConvertidas = transactions.map((transaction, index) => {
        const movimentacao = transactionToMovimentacao(transaction, accountId || '');
        
        // Calcular saldos (simulado)
        const valorMovimentacao = movimentacao.tipo === 'credito' ? movimentacao.valor : -movimentacao.valor;
        movimentacao.saldo_anterior = saldoAcumulado;
        saldoAcumulado += valorMovimentacao;
        movimentacao.saldo_posterior = saldoAcumulado;
        
        return movimentacao;
      });
      
      setMovimentacoes(movimentacoesConvertidas);
    } catch (err) {
      const appError = handleError(err, 'useMovimentacaoOFX.listarMovimentacoes');
      setError(appError.message);
      showMessage.saveError('Erro ao carregar movimentações OFX');
    } finally {
      setLoading(false);
    }
  };

  const criarMovimentacao = async (movimentacao: Omit<MovimentacaoOFXSupabase, 'id' | 'created_at' | 'updated_at'>): Promise<MovimentacaoOFXSupabase> => {
    try {
      const transactionData: CreateTransactionData = {
        from_account_id: movimentacao.tipo === 'debito' ? movimentacao.banco_id : undefined,
        to_account_id: movimentacao.tipo === 'credito' ? movimentacao.banco_id : undefined,
        type: movimentacao.tipo === 'debito' ? 'expense' : 'income',
        amount: movimentacao.valor,
        description: movimentacao.descricao,
        date: movimentacao.data_movimentacao,
        reference_id: movimentacao.codigo_autenticacao,
        notes: movimentacao.observacao_conciliacao
      };
      
      const transaction = await transactionsService.createTransaction(transactionData);
      const novaMovimentacao = transactionToMovimentacao(transaction, movimentacao.banco_id);
      
      setMovimentacoes(prev => [...prev, novaMovimentacao]);
      showMessage.saveSuccess('Movimentação criada com sucesso!');
      
      return novaMovimentacao;
    } catch (err) {
      handleError(err, 'useMovimentacaoOFX.criarMovimentacao');
      showMessage.saveError('Erro ao criar movimentação');
      throw err;
    }
  };

  const atualizarMovimentacao = async (id: string, updates: Partial<MovimentacaoOFXSupabase>): Promise<MovimentacaoOFXSupabase> => {
    try {
      const transactionUpdates: UpdateTransactionData = {};
      
      if (updates.descricao) transactionUpdates.description = updates.descricao;
      if (updates.valor) transactionUpdates.amount = updates.valor;
      if (updates.data_movimentacao) transactionUpdates.date = updates.data_movimentacao;
      if (updates.codigo_autenticacao) transactionUpdates.reference_id = updates.codigo_autenticacao;
      if (updates.observacao_conciliacao) transactionUpdates.notes = updates.observacao_conciliacao;
      if (updates.conta_pagar_id) transactionUpdates.accounts_payable_id = updates.conta_pagar_id;
      
      const transaction = await transactionsService.updateTransaction(id, transactionUpdates);
      const movimentacaoAtualizada = transactionToMovimentacao(transaction, bancoId || '');
      
      setMovimentacoes(prev => prev.map(m => m.id === id ? movimentacaoAtualizada : m));
      showMessage.saveSuccess('Movimentação atualizada com sucesso!');
      
      return movimentacaoAtualizada;
    } catch (err) {
      handleError(err, 'useMovimentacaoOFX.atualizarMovimentacao');
      showMessage.saveError('Erro ao atualizar movimentação');
      throw err;
    }
  };

  const vincularContaPagar = async (movimentacaoId: string, contaPagarId: string): Promise<void> => {
    try {
      await transactionsService.reconcileTransaction(movimentacaoId, contaPagarId);
      
      setMovimentacoes(prev => prev.map(m => 
        m.id === movimentacaoId 
          ? { ...m, status_conciliacao: 'conciliado', conta_pagar_id: contaPagarId }
          : m
      ));
      
      showMessage.saveSuccess('Movimentação vinculada à conta a pagar!');
    } catch (err) {
      handleError(err, 'useMovimentacaoOFX.vincularContaPagar');
      showMessage.saveError('Erro ao vincular conta a pagar');
      throw err;
    }
  };

  const marcarComoIgnorada = async (movimentacaoId: string, observacao?: string): Promise<void> => {
    try {
      await atualizarMovimentacao(movimentacaoId, {
        status_conciliacao: 'divergente',
        observacao_conciliacao: observacao
      });
      
      showMessage.saveSuccess('Movimentação marcada como divergente!');
    } catch (err) {
      handleError(err, 'useMovimentacaoOFX.marcarComoIgnorada');
      showMessage.saveError('Erro ao marcar movimentação como divergente');
      throw err;
    }
  };

  useEffect(() => {
    if (bancoId && user) {
      listarMovimentacoes(bancoId);
    }
  }, [bancoId, user]);

  return {
    movimentacoes,
    loading,
    error,
    listarMovimentacoes,
    criarMovimentacao,
    atualizarMovimentacao,
    vincularContaPagar,
    marcarComoIgnorada
  };
}