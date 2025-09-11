import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { FiltrosContaPagar, ContaEnriquecida } from '@/types/contaPagar';

export function useContasPagarFiltros() {
  const [filtros, setFiltros] = useState<FiltrosContaPagar>({
    busca: '',
    status: 'todos',
    fornecedor_id: 'todos',
    plano_conta_id: 'todos',
    data_inicio: '',
    data_fim: ''
  });

  const [filtroRapido, setFiltroRapido] = useState<'todos' | 'pendente' | 'vencido' | 'vence_7_dias'>('todos');

  // Debounce na busca para otimizar performance
  const buscaDebounced = useDebounce(filtros.busca, 300);

  // Filtros otimizados com memoização
  const filtrosOtimizados = useMemo(() => ({
    ...filtros,
    busca: buscaDebounced
  }), [filtros, buscaDebounced]);

  // Função para aplicar filtros nas contas
  const aplicarFiltros = useMemo(() => (contas: ContaEnriquecida[]) => {
    return contas.filter(conta => {
      // Filtro rápido
      if (filtroRapido !== 'todos') {
        switch (filtroRapido) {
          case 'pendente':
            if (conta.status !== 'pendente') return false;
            break;
          case 'vencido':
            if (conta.status !== 'pendente' || conta.dias_em_atraso === 0) return false;
            break;
          case 'vence_7_dias':
            if (conta.status !== 'pendente' || conta.dias_para_vencimento > 7) return false;
            break;
        }
      }

      // Filtro por busca
      if (filtrosOtimizados.busca) {
        const busca = filtrosOtimizados.busca.toLowerCase();
        const matchDescricao = conta.descricao.toLowerCase().includes(busca);
        const matchFornecedor = conta.fornecedor_nome.toLowerCase().includes(busca);
        const matchDocumento = conta.documento_referencia?.toLowerCase().includes(busca);
        
        if (!matchDescricao && !matchFornecedor && !matchDocumento) return false;
      }

      // Filtro por status
      if (filtrosOtimizados.status !== 'todos' && conta.status !== filtrosOtimizados.status) {
        return false;
      }

      // Filtro por fornecedor
      if (filtrosOtimizados.fornecedor_id !== 'todos' && conta.fornecedor_id !== filtrosOtimizados.fornecedor_id) {
        return false;
      }

      // Filtro por plano de conta
      if (filtrosOtimizados.plano_conta_id !== 'todos' && conta.plano_conta_id !== filtrosOtimizados.plano_conta_id) {
        return false;
      }

      // Filtro por data de vencimento
      if (filtrosOtimizados.data_inicio) {
        if (conta.data_vencimento < filtrosOtimizados.data_inicio) return false;
      }

      if (filtrosOtimizados.data_fim) {
        if (conta.data_vencimento > filtrosOtimizados.data_fim) return false;
      }

      return true;
    });
  }, [filtrosOtimizados, filtroRapido]);

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      status: 'todos',
      fornecedor_id: 'todos',
      plano_conta_id: 'todos',
      data_inicio: '',
      data_fim: ''
    });
    setFiltroRapido('todos');
  };

  return {
    filtros,
    setFiltros,
    filtroRapido,
    setFiltroRapido,
    filtrosOtimizados,
    aplicarFiltros,
    limparFiltros
  };
}