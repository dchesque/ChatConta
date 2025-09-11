import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';

export interface ChartDataCategoria {
  categoria: string;
  valor: number;
  cor: string;
}

export interface ChartDataFluxoMensal {
  mes: string;
  valor: number;
  meta?: number;
}

export interface ChartDataStatus {
  status: string;
  quantidade: number;
  cor: string;
}

export interface ChartData {
  categorias: ChartDataCategoria[];
  fluxoMensal: ChartDataFluxoMensal[];
  statusContas: ChartDataStatus[];
}

const cores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export const useDashboardCharts = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({
    categorias: [],
    fluxoMensal: [],
    statusContas: []
  });
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const carregarDadosGraficos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar dados reais do Supabase
      const [{ data: contasPagar }, { data: contasReceber }, { data: categorias }] = await Promise.all([
        supabase.from('accounts_payable').select('amount, status, due_date, category_id, category:categories(name, color)'),
        supabase.from('accounts_receivable').select('amount, status, due_date, category_id, category:categories(name, color)'),
        supabase.from('categories').select('id, name, color')
      ]);

      // Processar dados por categoria
      const categoriaMap = new Map<string, number>();
      const categoriaColors = new Map<string, string>();

      // Processar contas a pagar
      contasPagar?.forEach(conta => {
        const categoriaNome = (conta as any).category?.name || 'Sem categoria';
        const valor = Number(conta.amount) || 0;
        categoriaMap.set(categoriaNome, (categoriaMap.get(categoriaNome) || 0) + valor);
        if ((conta as any).category?.color) {
          categoriaColors.set(categoriaNome, (conta as any).category.color);
        }
      });

      // Processar contas a receber
      contasReceber?.forEach(conta => {
        const categoriaNome = (conta as any).category?.name || 'Sem categoria';
        const valor = Number(conta.amount) || 0;
        categoriaMap.set(categoriaNome, (categoriaMap.get(categoriaNome) || 0) + valor);
        if ((conta as any).category?.color) {
          categoriaColors.set(categoriaNome, (conta as any).category.color);
        }
      });

      const categoriasChart: ChartDataCategoria[] = Array.from(categoriaMap.entries())
        .map(([categoria, valor], index) => ({
          categoria,
          valor,
          cor: categoriaColors.get(categoria) || cores[index % cores.length]
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 8);

      // Processar fluxo mensal (últimos 6 meses)
      const hoje = new Date();
      const fluxoMensal: ChartDataFluxoMensal[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        const mesNome = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        // Calcular total do mês (receitas - despesas)
        const receitasMes = contasReceber?.filter(conta => {
          const contaData = new Date(conta.due_date);
          return contaData.getFullYear() === data.getFullYear() && 
                 contaData.getMonth() === data.getMonth() &&
                 conta.status === 'received';
        }).reduce((acc, conta) => acc + Number(conta.amount), 0) || 0;

        const despesasMes = contasPagar?.filter(conta => {
          const contaData = new Date(conta.due_date);
          return contaData.getFullYear() === data.getFullYear() && 
                 contaData.getMonth() === data.getMonth() &&
                 conta.status === 'paid';
        }).reduce((acc, conta) => acc + Number(conta.amount), 0) || 0;

        fluxoMensal.push({
          mes: mesNome,
          valor: receitasMes - despesasMes
        });
      }

      // Processar status das contas
      const statusMap = new Map<string, number>();
      const statusColors = {
        'pending': '#3b82f6',
        'paid': '#10b981',
        'received': '#10b981',
        'overdue': '#ef4444'
      };

      // Contar status das contas a pagar
      contasPagar?.forEach(conta => {
        statusMap.set(conta.status, (statusMap.get(conta.status) || 0) + 1);
      });

      // Contar status das contas a receber
      contasReceber?.forEach(conta => {
        statusMap.set(conta.status, (statusMap.get(conta.status) || 0) + 1);
      });

      const statusLabels = {
        'pending': 'Pendentes',
        'paid': 'Pagas',
        'received': 'Recebidas',
        'overdue': 'Vencidas'
      };

      const statusContas: ChartDataStatus[] = Array.from(statusMap.entries())
        .map(([status, quantidade]) => ({
          status: statusLabels[status as keyof typeof statusLabels] || status,
          quantidade,
          cor: statusColors[status as keyof typeof statusColors] || cores[0]
        }));

      setChartData({
        categorias: categoriasChart,
        fluxoMensal,
        statusContas
      });

    } catch (error) {
      handleError(error, 'useDashboardCharts.carregarDadosGraficos');
      console.error('Erro ao carregar dados dos gráficos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarDadosGraficos();
    }
  }, [user]);

  return {
    chartData,
    loading,
    recarregar: carregarDadosGraficos
  };
};