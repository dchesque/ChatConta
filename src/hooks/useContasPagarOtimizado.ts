import { useState, useMemo, useCallback } from 'react';
import { useAccountsPayable } from './useAccountsPayable';
import { useCategories } from './useCategories';
import { useContatos } from './useContatos';
import { AccountPayable } from '@/types/accounts';
import { toast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface FiltrosContasPagar {
  busca: string;
  status: 'todos' | 'pendente' | 'vencido' | 'pago';
  mes_referencia: string;
  fornecedor_id: string;
  categoria_id: string;
  data_inicio: string;
  data_fim: string;
  valor_min: string;
  valor_max: string;
  vencendo_em: string;
}

export interface EstatisticasContasPagar {
  total: number;
  total_valor: number;
  pendentes: number;
  valor_pendente: number;
  vencidas: number;
  valor_vencido: number;
  pagas: number;
  valor_pago: number;
  vencendoProximo: number;
  valorVencendoProximo: number;
}

export interface EstadosContasPagar {
  loading: boolean;
  error: string | null;
}

// Função para obter os filtros iniciais com o mês atual
const obterFiltrosIniciais = (): FiltrosContasPagar => ({
  busca: '',
  status: 'todos',
  mes_referencia: '',
  fornecedor_id: '',
  categoria_id: '',
  data_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  valor_min: '',
  valor_max: '',
  vencendo_em: ''
});

export function useContasPagarOtimizado(filtrosPersonalizados: Partial<FiltrosContasPagar> = {}) {
  const { accounts, loading, error, updateAccount, deleteAccount, markAsPaid } = useAccountsPayable();
  const { categories } = useCategories();
  const { contatos } = useContatos();
  
  // Estados dos filtros
  const [filtros, setFiltros] = useState<FiltrosContasPagar>(() => ({
    ...obterFiltrosIniciais(),
    ...filtrosPersonalizados
  }));
  const [filtroRapido, setFiltroRapido] = useState('todos');
  
  // Processar contas com dados relacionados
  const contasProcessadas = useMemo(() => {
    return accounts.map(conta => ({
      ...conta,
      // Garantir que contact seja sempre sincronizado
      contact: conta.contact || contatos.find(c => c.id === conta.contact_id),
      // Garantir que category seja sempre sincronizado
      category: conta.category || categories.find(c => c.id === conta.category_id)
    }));
  }, [accounts, contatos, categories]);

  // Filtrar contas baseado nos critérios
  const contasFiltradas = useMemo(() => {
    if (!contasProcessadas.length) return [];
    
    return contasProcessadas.filter(conta => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataVencimento = new Date(conta.due_date);
      dataVencimento.setHours(0, 0, 0, 0);
      const isVencida = dataVencimento < hoje && conta.status === 'pending';

      // Filtro de busca
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        const matchDescricao = conta.description?.toLowerCase().includes(busca);
        const matchFornecedor = conta.contact?.name?.toLowerCase().includes(busca);
        const matchReferencia = conta.reference_document?.toLowerCase().includes(busca);
        
        if (!matchDescricao && !matchFornecedor && !matchReferencia) {
          return false;
        }
      }

      // Filtro de status
      if (filtros.status !== 'todos') {
        if (filtros.status === 'vencido') {
          if (!isVencida) return false;
        } else if (filtros.status === 'pendente') {
          if (conta.status !== 'pending') return false;
        } else if (filtros.status === 'pago') {
          if (conta.status !== 'paid') return false;
        }
      }

      // Filtro de vencendo em X dias
      if (filtros.vencendo_em) {
        const diasVencimento = parseInt(filtros.vencendo_em);
        if (!isNaN(diasVencimento)) {
          const dataLimite = new Date(hoje.getTime() + diasVencimento * 24 * 60 * 60 * 1000);
          if (conta.status !== 'pending' || dataVencimento > dataLimite || dataVencimento < hoje) {
            return false;
          }
        }
      }

      // Filtro de mês de referência (tem prioridade sobre data_inicio/data_fim)
      if (filtros.mes_referencia) {
        const [ano, mes] = filtros.mes_referencia.split('-');
        const dataVenc = new Date(conta.due_date);
        if (dataVenc.getFullYear() !== parseInt(ano) || dataVenc.getMonth() + 1 !== parseInt(mes)) {
          return false;
        }
      } else {
        // Filtro de data início (apenas se não há mês de referência)
        if (filtros.data_inicio) {
          const dataInicio = new Date(filtros.data_inicio);
          if (dataVencimento < dataInicio) {
            return false;
          }
        }

        // Filtro de data fim (apenas se não há mês de referência)
        if (filtros.data_fim) {
          const dataFim = new Date(filtros.data_fim);
          if (dataVencimento > dataFim) {
            return false;
          }
        }
      }

      // Filtro de fornecedor
      if (filtros.fornecedor_id && filtros.fornecedor_id !== conta.contact_id) {
        return false;
      }

      // Filtro de categoria
      if (filtros.categoria_id && filtros.categoria_id !== conta.category_id) {
        return false;
      }

      // Filtro de valor mínimo
      if (filtros.valor_min) {
        const valorMin = parseFloat(filtros.valor_min.replace(/[^\d,]/g, '').replace(',', '.'));
        if (!isNaN(valorMin) && conta.amount < valorMin) {
          return false;
        }
      }

      // Filtro de valor máximo
      if (filtros.valor_max) {
        const valorMax = parseFloat(filtros.valor_max.replace(/[^\d,]/g, '').replace(',', '.'));
        if (!isNaN(valorMax) && conta.amount > valorMax) {
          return false;
        }
      }

      return true;
    });
  }, [contasProcessadas, filtros]);

  // Calcular estatísticas baseado nas contas FILTRADAS
  const estatisticas = useMemo((): EstatisticasContasPagar => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const proximosSete = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const stats = contasFiltradas.reduce((acc, conta) => {
      const dataVencimento = new Date(conta.due_date);
      dataVencimento.setHours(0, 0, 0, 0);
      const isVencida = dataVencimento < hoje && conta.status === 'pending';
      const isVencendoProximo = conta.status === 'pending' && dataVencimento >= hoje && dataVencimento <= proximosSete;

      acc.total++;
      acc.total_valor += conta.amount;

      if (conta.status === 'paid') {
        acc.pagas++;
        acc.valor_pago += conta.final_amount || conta.amount;
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
      vencidas: 0,
      valor_vencido: 0,
      pagas: 0,
      valor_pago: 0,
      vencendoProximo: 0,
      valorVencendoProximo: 0
    });

    return stats;
  }, [contasFiltradas]);

  // Estados
  const estados: EstadosContasPagar = {
    loading,
    error: error || null
  };

  // Ações
  const limparFiltros = useCallback(() => {
    setFiltros(obterFiltrosIniciais());
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

  const baixarConta = useCallback(async (id: string, dadosPagamento: any) => {
    try {
      await markAsPaid(id, dadosPagamento);
      toast({ title: 'Sucesso', description: 'Conta marcada como paga com sucesso!' });
    } catch (error) {
      console.error('Erro ao marcar conta como paga:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao marcar conta como paga', 
        variant: 'destructive' 
      });
      throw error;
    }
  }, [markAsPaid]);

  const excluirConta = useCallback(async (id: string) => {
    try {
      await deleteAccount(id);
      toast({ title: 'Sucesso', description: 'Conta excluída com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao excluir conta', 
        variant: 'destructive' 
      });
      throw error;
    }
  }, [deleteAccount]);

  const atualizarConta = useCallback(async (id: string, dadosAtualizacao: Partial<AccountPayable>) => {
    try {
      await updateAccount(id, dadosAtualizacao);
      toast({ title: 'Sucesso', description: 'Conta atualizada com sucesso!' });
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao atualizar conta', 
        variant: 'destructive' 
      });
      throw error;
    }
  }, [updateAccount]);

  return {
    // Dados
    contas: contasFiltradas,
    categorias: categories,
    fornecedores: contatos.filter(c => c.type === 'supplier'),
    
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
    
    // Ações
    baixarConta,
    excluirConta,
    atualizarConta,
    voltarMesAtual
  };
}