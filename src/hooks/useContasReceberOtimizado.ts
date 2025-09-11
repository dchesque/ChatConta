
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AccountReceivable } from '@/types/accounts';
import { useAccountsReceivable } from './useAccountsReceivable';
import { useCategories } from './useCategories';
import { useContatos } from './useContatos';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface FiltrosContasReceber {
  busca: string;
  status: 'todos' | 'pendente' | 'recebido' | 'vencido';
  cliente_id: string;
  categoria_id: string;
  data_inicio: string;
  data_fim: string;
  valor_min: string;
  valor_max: string;
  mes_referencia: string;
  vencendo_em: string;
}

export interface EstatisticasContasReceber {
  total: number;
  total_valor: number;
  pendentes: number;
  valor_pendente: number;
  recebidas: number;
  valor_recebido: number;
  vencidas: number;
  valor_vencido: number;
  vencendoProximo: number;
  valorVencendoProximo: number;
}

export const useContasReceberOtimizado = () => {
  const { accounts, loading, error, createAccount, updateAccount, markAsReceived, deleteAccount, refetch } = useAccountsReceivable();
  const { categories } = useCategories();
  const { contatos: clientes } = useContatos();

  // Usar useRef para evitar re-renders desnecessários
  const previousAccountsRef = useRef<AccountReceivable[]>();
  const previousCategoriesRef = useRef<any[]>();
  const previousClientesRef = useRef<any[]>();

  const [filtros, setFiltros] = useState<FiltrosContasReceber>(() => ({
    busca: '',
    status: 'todos',
    cliente_id: '',
    categoria_id: '',
    data_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    valor_min: '',
    valor_max: '',
    mes_referencia: '',
    vencendo_em: ''
  }));

  const [filtroRapido, setFiltroRapido] = useState<string>('todos');

  // Memoizar dados para evitar re-renders
  const dadosStabilizados = useMemo(() => {
    // Só atualizar se os dados realmente mudaram
    if (!accounts || JSON.stringify(accounts) === JSON.stringify(previousAccountsRef.current)) {
      return {
        accounts: previousAccountsRef.current || [],
        categories: previousCategoriesRef.current || [],
        clientes: previousClientesRef.current || []
      };
    }

    previousAccountsRef.current = accounts;
    previousCategoriesRef.current = categories;
    previousClientesRef.current = clientes;

    return {
      accounts: accounts || [],
      categories: categories || [],
      clientes: clientes || []
    };
  }, [accounts, categories, clientes]);

  // Processar contas para garantir campos derivados - memoizado
  const contasProcessadas = useMemo(() => {
    return dadosStabilizados.accounts.map(conta => ({
      ...conta,
      // Garantir que customer_name seja sempre sincronizado com contact.name
      customer_name: conta.contact?.name || conta.customer_name || '',
      // Garantir que category_name seja sempre sincronizado 
      category_name: conta.category?.name || conta.category_name || ''
    }));
  }, [dadosStabilizados.accounts]);

  // Filtrar contas baseado nos critérios - memoizado com dependências estáveis
  const contasFiltradas = useMemo(() => {
    if (!contasProcessadas.length) return [];
    
    return contasProcessadas.filter(conta => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Resetar hora para comparação apenas de data
      const dataVencimento = new Date(conta.due_date);
      dataVencimento.setHours(0, 0, 0, 0); // Resetar hora para comparação apenas de data
      const isVencida = dataVencimento < hoje && conta.status === 'pending';

      // Filtro de busca
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        const matchDescricao = conta.description?.toLowerCase().includes(busca);
        const matchCliente = conta.customer_name?.toLowerCase().includes(busca);
        const matchReferencia = conta.reference_document?.toLowerCase().includes(busca);
        
        if (!matchDescricao && !matchCliente && !matchReferencia) {
          return false;
        }
      }

      // Filtro de status
      if (filtros.status !== 'todos') {
        if (filtros.status === 'vencido') {
          if (!isVencida) return false;
        } else if (filtros.status === 'pendente') {
          if (conta.status !== 'pending') return false;
        } else if (filtros.status === 'recebido') {
          if (conta.status !== 'received') return false;
        }
      }

      // Filtro de vencendo em X dias
      if (filtros.vencendo_em) {
        const diasVencimento = parseInt(filtros.vencendo_em);
        const diffTime = dataVencimento.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (conta.status !== 'pending' || diffDays < 0 || diffDays > diasVencimento) {
          return false;
        }
      }

      // Filtro de cliente
      if (filtros.cliente_id && conta.contact_id !== filtros.cliente_id) {
        return false;
      }

      // Filtro de categoria
      if (filtros.categoria_id && conta.category_id !== filtros.categoria_id) {
        return false;
      }

      // Filtro de valor
      if (filtros.valor_min && conta.amount < parseFloat(filtros.valor_min)) {
        return false;
      }

      if (filtros.valor_max && conta.amount > parseFloat(filtros.valor_max)) {
        return false;
      }

      // Filtro de mês de referência (tem prioridade sobre data_inicio/data_fim)
      if (filtros.mes_referencia) {
        const [ano, mes] = filtros.mes_referencia.split('-');
        const mesVencimento = new Date(conta.due_date);
        
        if (mesVencimento.getMonth() !== (parseInt(mes) - 1) || 
            mesVencimento.getFullYear() !== parseInt(ano)) {
          return false;
        }
      } else {
        // Filtro de data (apenas se não há mês de referência)
        if (filtros.data_inicio && conta.due_date < filtros.data_inicio) {
          return false;
        }

        if (filtros.data_fim && conta.due_date > filtros.data_fim) {
          return false;
        }
      }

      return true;
    });
  }, [contasProcessadas, filtros]);

  // Calcular estatísticas - memoizado (baseado nas contas FILTRADAS)
  const estatisticas = useMemo((): EstatisticasContasReceber => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Resetar hora para comparação apenas de data
    const proximosSete = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const stats = contasFiltradas.reduce((acc, conta) => {
      const dataVencimento = new Date(conta.due_date);
      dataVencimento.setHours(0, 0, 0, 0); // Resetar hora para comparação apenas de data
      const isVencida = dataVencimento < hoje && conta.status === 'pending';
      const isVencendoProximo = conta.status === 'pending' && dataVencimento >= hoje && dataVencimento <= proximosSete;
      

      acc.total++;
      acc.total_valor += conta.amount;

      if (conta.status === 'received') {
        acc.recebidas++;
        acc.valor_recebido += conta.received_amount || conta.amount;
      } else if (isVencida) {
        acc.vencidas++;
        acc.valor_vencido += conta.amount;
      } else if (conta.status === 'pending') {
        acc.pendentes++;
        acc.valor_pendente += conta.amount;
      }

      if (isVencendoProximo) {
        acc.vencendoProximo++;
        acc.valorVencendoProximo += conta.amount;
      }

      return acc;
    }, {
      total: 0,
      total_valor: 0,
      pendentes: 0,
      valor_pendente: 0,
      recebidas: 0,
      valor_recebido: 0,
      vencidas: 0,
      valor_vencido: 0,
      vencendoProximo: 0,
      valorVencendoProximo: 0
    });

    return stats;
  }, [contasFiltradas]);

  // Ações memoizadas para evitar re-renders
  const acoes = useMemo(() => ({
    criarConta: async (dadosConta: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      try {
        await createAccount(dadosConta);
        toast.success('Conta a receber criada com sucesso!');
        await refetch();
      } catch (error) {
        console.error('Erro ao criar conta:', error);
        toast.error('Erro ao criar conta a receber');
        throw error;
      }
    },

    atualizarConta: async (id: string, dadosAtualizacao: Partial<AccountReceivable>) => {
      try {
        const contaAtualizada = await updateAccount(id, dadosAtualizacao);
        
        toast.success('Conta atualizada com sucesso!');
        
        // Force refresh para garantir que os dados sejam atualizados
        await refetch();
        
        // Forçar re-render resetando os refs para quebrar o cache
        previousAccountsRef.current = undefined;
        
      } catch (error) {
        console.error('Erro ao atualizar conta:', error);
        toast.error('Erro ao atualizar conta');
        throw error;
      }
    },

    excluirConta: async (id: string) => {
      try {
        await deleteAccount(id);
        toast.success('Conta excluída com sucesso!');
        await refetch();
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        toast.error('Erro ao excluir conta');
        throw error;
      }
    },

    baixarConta: async (id: string, dadosRecebimento: { bank_account_id: string; received_at: string }) => {
      try {
        await markAsReceived(id, dadosRecebimento);
        toast.success('Recebimento registrado com sucesso!');
        await refetch();
      } catch (error) {
        console.error('Erro ao registrar recebimento:', error);
        toast.error('Erro ao registrar recebimento');
        throw error;
      }
    },

    duplicarConta: async (conta: AccountReceivable) => {
      try {
        const contaDuplicada = {
          ...conta,
          description: `${conta.description} (Cópia)`,
          status: 'pending' as const,
          received_at: undefined,
          received_amount: undefined,
          bank_account_id: undefined
        };
        
        delete (contaDuplicada as any).id;
        delete (contaDuplicada as any).created_at;
        delete (contaDuplicada as any).updated_at;
        delete (contaDuplicada as any).user_id;

        await createAccount(contaDuplicada);
        toast.success('Conta duplicada com sucesso!');
        await refetch();
      } catch (error) {
        console.error('Erro ao duplicar conta:', error);
        toast.error('Erro ao duplicar conta');
        throw error;
      }
    }
  }), [createAccount, updateAccount, deleteAccount, markAsReceived, refetch]);

  const limparFiltros = useCallback(() => {
    setFiltros({
      busca: '',
      status: 'todos',
      cliente_id: '',
      categoria_id: '',
      data_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      valor_min: '',
      valor_max: '',
      mes_referencia: '',
      vencendo_em: ''
    });
    setFiltroRapido('todos');
  }, []);

  const voltarMesAtual = useCallback(() => {
    setFiltros(prev => ({
      ...prev,
      data_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      mes_referencia: ''
    }));
  }, []);

  // Estados auxiliares estabilizados
  const estados = useMemo(() => ({
    loading,
    error,
    temContas: dadosStabilizados.accounts.length > 0,
    temContasFiltradas: contasFiltradas.length > 0
  }), [loading, error, dadosStabilizados.accounts.length, contasFiltradas.length]);

  return {
    // Dados estabilizados
    contas: dadosStabilizados.accounts,
    contasFiltradas,
    categorias: dadosStabilizados.categories,
    clientes: dadosStabilizados.clientes,
    
    // Filtros
    filtros,
    setFiltros,
    filtroRapido,
    setFiltroRapido,
    limparFiltros,
    
    // Estatísticas
    estatisticas,
    
    // Estados
    estados,
    
    // Ações memoizadas
    ...acoes,
    
    // Aliases para compatibilidade
    recarregar: refetch,
    salvarEdicao: acoes.atualizarConta,
    confirmarRecebimento: acoes.baixarConta,
    cancelarConta: acoes.excluirConta,
    voltarMesAtual
  };
};
