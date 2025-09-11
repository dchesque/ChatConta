import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';

export interface MovimentacaoRecente {
  id: string;
  tipo: 'pagar' | 'receber';
  descricao: string;
  valor: number;
  data: string;
  status: string;
  categoria?: string;
  fornecedor?: string;
  cliente?: string;
}

export const useMovimentacoesRecentes = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const carregarMovimentacoes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar contas a pagar recentes
      const { data: contasPagar } = await supabase
        .from('accounts_payable')
        .select(`
          id,
          description,
          amount,
          due_date,
          status,
          category:categories(name),
          supplier:suppliers(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Buscar contas a receber recentes
      const { data: contasReceber } = await supabase
        .from('accounts_receivable')
        .select(`
          id,
          description,
          amount,
          due_date,
          status,
          customer_name,
          category:categories(name),
          customer:customers(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Combinar e ordenar todas as movimentações
      const todasMovimentacoes: MovimentacaoRecente[] = [];

      // Adicionar contas a pagar
      contasPagar?.forEach(conta => {
        todasMovimentacoes.push({
          id: conta.id,
          tipo: 'pagar',
          descricao: conta.description,
          valor: Number(conta.amount),
          data: conta.due_date,
          status: conta.status,
          categoria: (conta as any).category?.name,
          fornecedor: (conta as any).supplier?.name
        });
      });

      // Adicionar contas a receber
      contasReceber?.forEach(conta => {
        todasMovimentacoes.push({
          id: conta.id,
          tipo: 'receber',
          descricao: conta.description,
          valor: Number(conta.amount),
          data: conta.due_date,
          status: conta.status,
          categoria: (conta as any).category?.name,
          cliente: (conta as any).customer?.name || conta.customer_name
        });
      });

      // Ordenar por data mais recente e limitar a 15 itens
      const movimentacoesOrdenadas = todasMovimentacoes
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 15);

      setMovimentacoes(movimentacoesOrdenadas);

    } catch (error) {
      handleError(error, 'useMovimentacoesRecentes.carregarMovimentacoes');
      console.error('Erro ao carregar movimentações recentes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarMovimentacoes();
    }
  }, [user]);

  return {
    movimentacoes,
    loading,
    recarregar: carregarMovimentacoes
  };
};