import { useState, useEffect } from 'react';
import { dataService } from '@/services/DataServiceFactory';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UseContasPagarReturn {
  contas: any[];
  loading: boolean;
  error: string | null;
  criarConta: (conta: any) => Promise<any>;
  atualizarConta: (id: string, conta: any) => Promise<any>;
  excluirConta: (id: string) => Promise<void>;
  baixarConta: (id: string, dados: { data_pagamento: string; valor_pago?: number }) => Promise<any>;
  recarregar: () => Promise<void>;
  estatisticas: {
    total_contas: number;
    valor_total: number;
    pendentes: number;
    valor_pendente: number;
    vencidas: number;
    valor_vencido: number;
    pagas: number;
    valor_pago: number;
  };
}

export function useContasPagar(): UseContasPagarReturn {
  const [contas, setContas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Calcular estatísticas
  const estatisticas = {
    total_contas: contas.length,
    valor_total: contas.reduce((total, conta) => total + (conta.amount || conta.valor_original || 0), 0),
    pendentes: contas.filter(conta => conta.status === 'pendente' || conta.status === 'pending').length,
    valor_pendente: contas.filter(conta => conta.status === 'pendente' || conta.status === 'pending').reduce((total, conta) => total + (conta.amount || conta.valor_original || 0), 0),
    vencidas: contas.filter(conta => conta.status === 'vencido' || conta.status === 'overdue').length,
    valor_vencido: contas.filter(conta => conta.status === 'vencido' || conta.status === 'overdue').reduce((total, conta) => total + (conta.amount || conta.valor_original || 0), 0),
    pagas: contas.filter(conta => conta.status === 'pago' || conta.status === 'paid').length,
    valor_pago: contas.filter(conta => conta.status === 'pago' || conta.status === 'paid').reduce((total, conta) => total + (conta.amount || conta.valor_pago || conta.valor_original || 0), 0)
  };

  const carregarContas = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await dataService.contasPagar.getAll();
      setContas(data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      setError('Erro ao carregar contas');
      toast.error('Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  const criarConta = async (dadosConta: any): Promise<any> => {
    try {
      setLoading(true);
      
      // Validações básicas
      const valor = dadosConta.amount || dadosConta.valor_original;
      if (valor <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      const dataVencimento = dadosConta.due_date || dadosConta.data_vencimento;
      if (dataVencimento && new Date(dataVencimento) < new Date()) {
        // Permitir datas passadas, mas alertar
        console.warn('Data de vencimento no passado');
      }

      const novaConta = await dataService.contasPagar.create(dadosConta);
      setContas(prev => [...prev, novaConta]);
      
      toast.success('Conta a pagar criada com sucesso!');
      return novaConta;
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta a pagar';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const atualizarConta = async (id: string, dadosAtualizacao: any): Promise<any> => {
    try {
      setLoading(true);
      
      // Validações
      const valor = dadosAtualizacao.amount || dadosAtualizacao.valor_original;
      if (valor !== undefined && valor <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      const contaAtualizada = await dataService.contasPagar.update(id, dadosAtualizacao);
      
      if (contaAtualizada) {
        setContas(prev => 
          prev.map(conta => conta.id === id ? contaAtualizada : conta)
        );
        toast.success('Conta a pagar atualizada com sucesso!');
      }
      
      return contaAtualizada;
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar conta a pagar';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const excluirConta = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      
      await dataService.contasPagar.delete(id);
      setContas(prev => prev.filter(conta => conta.id !== id));
      toast.success('Conta a pagar excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir conta a pagar';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const baixarConta = async (id: string, dados: { data_pagamento: string; valor_pago?: number }): Promise<any> => {
    try {
      setLoading(true);
      
      const conta = contas.find(c => c.id === id);
      if (!conta) {
        throw new Error('Conta não encontrada');
      }

      const dadosAtualizacao = {
        status: 'paid',
        paid_at: dados.data_pagamento,
        amount: dados.valor_pago ?? (conta.amount || conta.valor_original)
      };

      const contaAtualizada = await dataService.contasPagar.marcarComoPaga(id, dadosAtualizacao);
      
      if (contaAtualizada) {
        setContas(prev => 
          prev.map(c => c.id === id ? contaAtualizada : c)
        );
        toast.success('Conta baixada com sucesso!');
      }
      
      return contaAtualizada;
    } catch (error) {
      console.error('Erro ao baixar conta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao baixar conta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
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
    baixarConta,
    recarregar,
    estatisticas
  };
}