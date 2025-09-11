import { useState, useEffect } from 'react';
import { dataService } from '@/services/DataServiceFactory';
import { useAuth } from './useAuth';
import { useErrorHandler } from './useErrorHandler';
import { showMessage } from '@/utils/messages';
import type { ContaPagar } from '@/types/contaPagar';

// Re-export types for compatibility
export type { ContaPagar } from '@/types/contaPagar';
export type { ContaEnriquecida } from '@/types/contaEnriquecida';

export function useContasPagar() {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError, withRetry, withTimeout, newAbortController, cancelAll } = useErrorHandler('contas-pagar');

  const carregarContas = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    const loadingToast = showMessage.loading('Carregando contas...');
    
    try {
      const contasCarregadas = await withRetry(() => 
        withTimeout(dataService.contasPagar.getAll(), 30000)
      );
      setContas(contasCarregadas);
      showMessage.dismiss();
    } catch (err) {
      showMessage.dismiss();
      const appErr = handleError(err, 'carregar-contas');
      setError(appErr.message);
    } finally {
      setLoading(false);
    }
  };

  const criarConta = async (conta: Omit<ContaPagar, 'id' | 'created_at' | 'updated_at'>): Promise<ContaPagar> => {
    try {
      const novaConta = await showMessage.promise(
        withRetry(() => dataService.contasPagar.create(conta)),
        {
          loading: 'Salvando conta...',
          success: 'Conta criada com sucesso!',
          error: 'Erro ao criar conta'
        }
      );
      setContas(prev => [...prev, novaConta]);
      return novaConta;
    } catch (err) {
      handleError(err, 'criar-conta');
      throw err;
    }
  };

  const atualizarConta = async (id: number, dadosAtualizacao: Partial<ContaPagar>): Promise<ContaPagar> => {
    try {
      const contaAtualizada = await showMessage.promise(
        withRetry(() => dataService.contasPagar.update(String(id), dadosAtualizacao)),
        {
          loading: 'Atualizando conta...',
          success: 'Conta atualizada com sucesso!',
          error: 'Erro ao atualizar conta'
        }
      );
      setContas(prev => prev.map(c => c.id === id ? contaAtualizada : c));
      return contaAtualizada;
    } catch (err) {
      handleError(err, 'atualizar-conta');
      throw err;
    }
  };

  const excluirConta = async (id: number): Promise<void> => {
    const contaAExcluir = contas.find(c => c.id === id);
    
    try {
      await showMessage.promise(
        withRetry(() => dataService.contasPagar.delete(String(id))),
        {
          loading: 'Excluindo conta...',
          success: 'Conta excluída com sucesso!',
          error: 'Erro ao excluir conta'
        }
      );
      
      setContas(prev => prev.filter(c => c.id !== id));
      
      // Oferecer ação de desfazer
      if (contaAExcluir) {
        showMessage.withUndo('Conta excluída', () => {
          setContas(prev => [...prev, contaAExcluir]);
        });
      }
    } catch (err) {
      handleError(err, 'excluir-conta');
      throw err;
    }
  };

  const baixarConta = async (id: number, dadosPagamento: { data_pagamento: string; banco_id?: number; valor_pago?: number }): Promise<void> => {
    const dataPagamento = new Date(dadosPagamento.data_pagamento);
    
    try {
      await showMessage.promise(
        withRetry(() => dataService.contasPagar.marcarComoPaga(String(id), {
          dataPagamento,
          valorPago: dadosPagamento.valor_pago,
          bankAccountId: dadosPagamento.banco_id?.toString(),
          observacoes: undefined
        })),
        {
          loading: 'Baixando conta...',
          success: 'Conta baixada com sucesso!',
          error: 'Erro ao baixar conta'
        }
      );
      
      // Atualizar estado local
      setContas(prev => prev.map(c => 
        c.id === id 
          ? { 
              ...c, 
              status: 'pago' as const, 
              data_pagamento: dadosPagamento.data_pagamento,
              banco_id: dadosPagamento.banco_id,
              valor_final: dadosPagamento.valor_pago || c.valor_final
            }
          : c
      ));
    } catch (err) {
      handleError(err, 'baixar-conta');
      throw err;
    }
  };

  const filtrarContas = (filtros: { status?: string; fornecedor_id?: number; data_inicio?: string; data_fim?: string }) => {
    return contas.filter(conta => {
      if (filtros.status && filtros.status !== 'todos' && conta.status !== filtros.status) return false;
      if (filtros.fornecedor_id && conta.fornecedor_id !== filtros.fornecedor_id) return false;
      if (filtros.data_inicio && conta.data_vencimento < filtros.data_inicio) return false;
      if (filtros.data_fim && conta.data_vencimento > filtros.data_fim) return false;
      return true;
    });
  };

  useEffect(() => {
    if (user) {
      carregarContas();
    }

    return () => {
      cancelAll();
    };
  }, [user, cancelAll]);

  // Tipo ContaEnriquecida para compatibilidade

  return {
    contas,
    loading,
    error,
    estados: {
      carregando: loading,
      salvandoEdicao: false,
      erro: error
    },
    carregarContas,
    criarConta,
    atualizarConta,
    excluirConta,
    baixarConta,
    filtrarContas
  };
}