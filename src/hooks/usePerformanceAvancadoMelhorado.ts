import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface MetricasPerformance {
  carregamento: number;
  renderizacao: number;
  memoria: number;
  cpu: number;
}

export interface MetricaDetalhada {
  metrica: string;
  status: 'success' | 'warning' | 'error';
  recomendacao: string;
  valor?: number;
  unidade?: string;
  meta?: number;
}

export interface EstatisticasConsistentes {
  scoreGeral: number;
  sucessos: number;
  problemas: number;
  hitRateCache: number;
  totalVendasMes: number;
  valorTotalMes: number;
  contasPendentes: number;
  clientesAtivos: number;
}

export interface InfoCache {
  totalItens: number;
  hitRate: number;
  memoryUsage: number;
  totalHits: number;
  ultimaLimpeza?: string;
  eficiencia: number;
}

export interface AnaliseDetalhada {
  scoreGeral: number;
  sucessos: number;
  problemas: number;
  hitRateCache: number;
  totalOperacoes: number;
  atividadeRecente: number;
  usuariosAtivos: number;
  operacoesPorTabela: Record<string, number>;
  operacoesPorTipo: Record<string, number>;
  tendencias: {
    performanceUltimaSemana: number[];
    cacheEfficiencyTrend: number[];
  };
}

export interface AlertaCritico {
  id: string;
  tipo: 'performance' | 'cache' | 'memoria' | 'conexao';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  mensagem: string;
  timestamp: string;
  resolvido: boolean;
}

export function usePerformanceAvancadoMelhorado() {
  const [metricas, setMetricas] = useState<MetricasPerformance>({
    carregamento: 0,
    renderizacao: 0,
    memoria: 0,
    cpu: 0
  });

  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [alertas, setAlertas] = useState<AlertaCritico[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [cacheLocalDados, setCacheLocalDados] = useState<Map<string, any>>(new Map());

  // Debounce para ações de otimização
  const [otimizacaoDebounced, setOtimizacaoDebounced] = useState('');
  const debouncedOtimizacao = useDebounce(otimizacaoDebounced, 1000);

  const coletarMetricas = useCallback(async (forcarReload = false) => {
    const cacheKey = 'metricas-performance';
    
    // Verificar cache local se não for reload forçado
    if (!forcarReload && cacheLocalDados.has(cacheKey)) {
      const dadosCache = cacheLocalDados.get(cacheKey);
      const agora = Date.now();
      if (agora - dadosCache.timestamp < 30000) { // 30 segundos
        setMetricas(dadosCache.data);
        return;
      }
    }

    setLoading(true);
    
    try {
      // Simular coleta de métricas com valores mais realistas
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate secure random performance metrics for simulation
      const secureRandom = () => {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] / (0xFFFFFFFF + 1);
      };
      
      const novasMetricas = {
        carregamento: secureRandom() * 1000 + 200,
        renderizacao: secureRandom() * 50 + 8,
        memoria: secureRandom() * 80 + 15,
        cpu: secureRandom() * 60 + 5
      };
      
      setMetricas(novasMetricas);
      
      // Salvar no cache local
      setCacheLocalDados(prev => new Map(prev.set(cacheKey, {
        data: novasMetricas,
        timestamp: Date.now()
      })));

      // Verificar alertas críticos
      verificarAlertasCriticos(novasMetricas);
      
    } catch (error) {
      console.error('Erro ao coletar métricas:', error);
    } finally {
      setLoading(false);
    }
  }, [cacheLocalDados]);

  const verificarAlertasCriticos = useCallback((metricas: MetricasPerformance) => {
    const novosAlertas: AlertaCritico[] = [];

    if (metricas.carregamento > 3000) {
      novosAlertas.push({
        id: `carregamento-${Date.now()}`,
        tipo: 'performance',
        severidade: 'critica',
        mensagem: `Tempo de carregamento muito alto: ${metricas.carregamento.toFixed(0)}ms`,
        timestamp: new Date().toISOString(),
        resolvido: false
      });
    }

    if (metricas.memoria > 85) {
      novosAlertas.push({
        id: `memoria-${Date.now()}`,
        tipo: 'memoria',
        severidade: 'alta',
        mensagem: `Uso de memória crítico: ${metricas.memoria.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        resolvido: false
      });
    }

    if (novosAlertas.length > 0) {
      setAlertas(prev => [...prev, ...novosAlertas]);
    }
  }, []);

  const otimizarSistema = useCallback(async () => {
    setOptimizing(true);
    
    try {
      // Simular otimização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Limpar cache
      setCacheLocalDados(new Map());
      
      // Recolher métricas após otimização
      await coletarMetricas(true);
      
    } catch (error) {
      console.error('Erro na otimização:', error);
    } finally {
      setOptimizing(false);
    }
  }, [coletarMetricas]);

  const limparCache = useCallback(async (categoria: string) => {
    if (categoria === 'all') {
      setCacheLocalDados(new Map());
    } else {
      setCacheLocalDados(prev => {
        const novoCache = new Map(prev);
        novoCache.delete(`cache-${categoria}`);
        return novoCache;
      });
    }
  }, []);

  const exportarRelatorioPerformance = useCallback(async () => {
    const relatorio = {
      timestamp: new Date().toISOString(),
      metricas,
      alertas: alertas.filter(a => !a.resolvido),
      estatisticas: {
        scoreGeral: 85,
        sucessos: 120,
        problemas: alertas.filter(a => !a.resolvido).length,
        hitRateCache: 78
      }
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-performance-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metricas, alertas]);

  const resolverAlerta = useCallback((alertaId: string) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === alertaId 
        ? { ...alerta, resolvido: true }
        : alerta
    ));
  }, []);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        coletarMetricas();
      }, 30000); // A cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh, coletarMetricas]);

  // Coleta inicial
  useEffect(() => {
    coletarMetricas();
  }, []);

  // Métricas detalhadas
  const [metricasDetalhadas] = useState<MetricaDetalhada[]>([
    { 
      metrica: 'carregamento_pagina', 
      status: 'success', 
      recomendacao: 'Velocidade ótima',
      valor: 250,
      unidade: 'ms',
      meta: 1000
    },
    { 
      metrica: 'memoria_cache', 
      status: 'warning', 
      recomendacao: 'Considere limpeza',
      valor: 68,
      unidade: '%',
      meta: 80
    },
    { 
      metrica: 'renderizacao_componentes', 
      status: 'success', 
      recomendacao: 'Performance adequada',
      valor: 16,
      unidade: 'ms',
      meta: 50
    },
    { 
      metrica: 'conexao_banco', 
      status: 'success', 
      recomendacao: 'Conexão estável',
      valor: 95,
      unidade: '%',
      meta: 90
    }
  ]);

  const estatisticas: EstatisticasConsistentes = {
    scoreGeral: 85,
    sucessos: 120,
    problemas: alertas.filter(a => !a.resolvido).length,
    hitRateCache: 78,
    totalVendasMes: 150000,
    valorTotalMes: 75000,
    contasPendentes: 25,
    clientesAtivos: 45
  };

  const infoCache: InfoCache = {
    totalItens: 250,
    hitRate: 95,
    memoryUsage: 45,
    totalHits: 1200,
    ultimaLimpeza: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    eficiencia: 92
  };

  const analise: AnaliseDetalhada = {
    scoreGeral: 85,
    sucessos: 120,
    problemas: alertas.filter(a => !a.resolvido).length,
    hitRateCache: 78,
    totalOperacoes: 500,
    atividadeRecente: 50,
    usuariosAtivos: 12,
    operacoesPorTabela: { 
      contas_pagar: 200, 
      fornecedores: 50, 
      categorias: 30,
      bancos: 20
    },
    operacoesPorTipo: { 
      create: 100, 
      read: 300, 
      update: 80, 
      delete: 20 
    },
    tendencias: {
      performanceUltimaSemana: [85, 87, 84, 88, 89, 85, 87],
      cacheEfficiencyTrend: [78, 80, 76, 82, 85, 78, 81]
    }
  };

  return {
    metricas,
    metricasDetalhadas,
    loading,
    optimizing,
    alertas,
    autoRefresh,
    estatisticas,
    infoCache,
    analise,
    coletarMetricas,
    carregarTodosDados: coletarMetricas,
    limparCache,
    otimizarSistema,
    preCarregarDados: async () => {
      await coletarMetricas(true);
    },
    exportarRelatorioPerformance,
    resolverAlerta,
    setAutoRefresh,
    limparCacheLocal: () => setCacheLocalDados(new Map())
  };
}