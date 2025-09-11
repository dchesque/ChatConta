import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { showMessage } from '@/utils/messages';
import { useErrorHandler } from './useErrorHandler';

export interface RelatorioFiltros {
  dataInicio: string;
  dataFim: string;
  incluirPagos?: boolean;
  incluirPendentes?: boolean;
  incluirVencidos?: boolean;
}

export interface DadosRelatorio {
  totalContas: number;
  valorTotal: number;
  contasPagas: number;
  valorPago: number;
  contasPendentes: number;
  valorPendente: number;
  contasVencidas: number;
  valorVencido: number;
  resumoPorCategoria: Array<{
    categoria_nome: string;
    total_contas: number;
    valor_total: number;
  }>;
  resumoPorFornecedor: Array<{
    fornecedor_nome: string;
    total_contas: number;
    valor_total: number;
  }>;
  contasPorMes: Array<{
    mes: string;
    total_contas: number;
    valor_total: number;
  }>;
}

export function useRelatoriosGerais() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const gerarRelatorioContas = async (filtros: RelatorioFiltros): Promise<DadosRelatorio> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      // Query principal para contas a pagar
      let query = supabase
        .from('accounts_payable')
        .select(`
          *,
          category:categories(name),
          supplier:suppliers(name)
        `)
        .gte('due_date', filtros.dataInicio)
        .lte('due_date', filtros.dataFim);

      // Aplicar filtros de status
      const statusFiltros = [];
      if (filtros.incluirPagos) statusFiltros.push('paid');
      if (filtros.incluirPendentes) statusFiltros.push('pending');
      if (filtros.incluirVencidos) statusFiltros.push('overdue');
      
      if (statusFiltros.length > 0) {
        query = query.in('status', statusFiltros);
      }

      const { data: contas, error: contasError } = await query;
      if (contasError) throw contasError;

      // Calcular estatísticas principais
      const totalContas = contas?.length || 0;
      const valorTotal = contas?.reduce((acc, conta) => acc + Number(conta.amount), 0) || 0;
      
      const contasPagas = contas?.filter(c => c.status === 'paid') || [];
      const contasPendentes = contas?.filter(c => c.status === 'pending') || [];
      const contasVencidas = contas?.filter(c => c.status === 'overdue') || [];

      // Resumo por categoria
      const categoriaMap = new Map();
      contas?.forEach(conta => {
        const categoriaNome = conta.category?.name || 'Sem categoria';
        if (!categoriaMap.has(categoriaNome)) {
          categoriaMap.set(categoriaNome, { total_contas: 0, valor_total: 0 });
        }
        const categoria = categoriaMap.get(categoriaNome);
        categoria.total_contas++;
        categoria.valor_total += Number(conta.amount);
      });

      const resumoPorCategoria = Array.from(categoriaMap.entries()).map(([nome, dados]) => ({
        categoria_nome: nome,
        ...dados
      }));

      // Resumo por fornecedor
      const fornecedorMap = new Map();
      contas?.forEach(conta => {
        const fornecedorNome = conta.supplier?.name || 'Sem fornecedor';
        if (!fornecedorMap.has(fornecedorNome)) {
          fornecedorMap.set(fornecedorNome, { total_contas: 0, valor_total: 0 });
        }
        const fornecedor = fornecedorMap.get(fornecedorNome);
        fornecedor.total_contas++;
        fornecedor.valor_total += Number(conta.amount);
      });

      const resumoPorFornecedor = Array.from(fornecedorMap.entries()).map(([nome, dados]) => ({
        fornecedor_nome: nome,
        ...dados
      }));

      // Contas por mês
      const mesMap = new Map();
      contas?.forEach(conta => {
        const data = new Date(conta.due_date);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        if (!mesMap.has(mesAno)) {
          mesMap.set(mesAno, { total_contas: 0, valor_total: 0 });
        }
        const mes = mesMap.get(mesAno);
        mes.total_contas++;
        mes.valor_total += Number(conta.amount);
      });

      const contasPorMes = Array.from(mesMap.entries())
        .map(([mesAno, dados]) => ({
          mes: mesAno,
          ...dados
        }))
        .sort((a, b) => a.mes.localeCompare(b.mes));

      return {
        totalContas,
        valorTotal,
        contasPagas: contasPagas.length,
        valorPago: contasPagas.reduce((acc, c) => acc + Number(c.amount), 0),
        contasPendentes: contasPendentes.length,
        valorPendente: contasPendentes.reduce((acc, c) => acc + Number(c.amount), 0),
        contasVencidas: contasVencidas.length,
        valorVencido: contasVencidas.reduce((acc, c) => acc + Number(c.amount), 0),
        resumoPorCategoria,
        resumoPorFornecedor,
        contasPorMes
      };

    } catch (err) {
      const appError = handleError(err, 'useRelatoriosGerais.gerarRelatorioContas');
      setError(appError.message);
      showMessage.saveError('Erro ao gerar relatório');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorioReceitas = async (filtros: RelatorioFiltros): Promise<DadosRelatorio> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setLoading(true);
    setError(null);
    
    try {
      // Query para contas a receber
      let query = supabase
        .from('accounts_receivable')
        .select(`
          *,
          category:categories(name),
          customer:customers(name)
        `)
        .gte('due_date', filtros.dataInicio)
        .lte('due_date', filtros.dataFim);

      // Aplicar filtros de status (converter para inglês)
      const statusFiltros = [];
      if (filtros.incluirPagos) statusFiltros.push('received');
      if (filtros.incluirPendentes) statusFiltros.push('pending');
      if (filtros.incluirVencidos) statusFiltros.push('overdue');
      
      if (statusFiltros.length > 0) {
        query = query.in('status', statusFiltros);
      }

      const { data: contas, error: contasError } = await query;
      if (contasError) throw contasError;

      // Calcular estatísticas (adaptadas para receitas)
      const totalContas = contas?.length || 0;
      const valorTotal = contas?.reduce((acc, conta) => acc + Number(conta.amount), 0) || 0;
      
      const contasRecebidas = contas?.filter(c => c.status === 'received') || [];
      const contasPendentes = contas?.filter(c => c.status === 'pending') || [];
      const contasVencidas = contas?.filter(c => c.status === 'overdue') || [];

      // Resumo por categoria
      const categoriaMap = new Map();
      contas?.forEach(conta => {
        const categoriaNome = conta.category?.name || 'Sem categoria';
        if (!categoriaMap.has(categoriaNome)) {
          categoriaMap.set(categoriaNome, { total_contas: 0, valor_total: 0 });
        }
        const categoria = categoriaMap.get(categoriaNome);
        categoria.total_contas++;
        categoria.valor_total += Number(conta.amount);
      });

      const resumoPorCategoria = Array.from(categoriaMap.entries()).map(([nome, dados]) => ({
        categoria_nome: nome,
        ...dados
      }));

      // Resumo por cliente
      const clienteMap = new Map();
      contas?.forEach(conta => {
        const clienteNome = conta.customer?.name || conta.customer_name || 'Sem cliente';
        if (!clienteMap.has(clienteNome)) {
          clienteMap.set(clienteNome, { total_contas: 0, valor_total: 0 });
        }
        const cliente = clienteMap.get(clienteNome);
        cliente.total_contas++;
        cliente.valor_total += Number(conta.amount);
      });

      const resumoPorFornecedor = Array.from(clienteMap.entries()).map(([nome, dados]) => ({
        fornecedor_nome: nome, // Mantém a interface compatível
        ...dados
      }));

      // Contas por mês
      const mesMap = new Map();
      contas?.forEach(conta => {
        const data = new Date(conta.due_date);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        if (!mesMap.has(mesAno)) {
          mesMap.set(mesAno, { total_contas: 0, valor_total: 0 });
        }
        const mes = mesMap.get(mesAno);
        mes.total_contas++;
        mes.valor_total += Number(conta.amount);
      });

      const contasPorMes = Array.from(mesMap.entries())
        .map(([mesAno, dados]) => ({
          mes: mesAno,
          ...dados
        }))
        .sort((a, b) => a.mes.localeCompare(b.mes));

      return {
        totalContas,
        valorTotal,
        contasPagas: contasRecebidas.length,
        valorPago: contasRecebidas.reduce((acc, c) => acc + Number(c.amount), 0),
        contasPendentes: contasPendentes.length,
        valorPendente: contasPendentes.reduce((acc, c) => acc + Number(c.amount), 0),
        contasVencidas: contasVencidas.length,
        valorVencido: contasVencidas.reduce((acc, c) => acc + Number(c.amount), 0),
        resumoPorCategoria,
        resumoPorFornecedor,
        contasPorMes
      };

    } catch (err) {
      const appError = handleError(err, 'useRelatoriosGerais.gerarRelatorioReceitas');
      setError(appError.message);
      showMessage.saveError('Erro ao gerar relatório de receitas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    gerarRelatorioContas,
    gerarRelatorioReceitas
  };
}