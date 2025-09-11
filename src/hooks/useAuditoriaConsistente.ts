import { useState, useEffect, useCallback } from 'react';

export interface LogAuditoria {
  id: number;
  usuario: string;
  acao: string;
  tabela: string;
  registro_id: number;
  dados_anteriores?: any;
  dados_novos?: any;
  timestamp: string;
}

export interface LogAuditoriaExtendido extends LogAuditoria {
  operacao: string;
  descricao: string;
  data_operacao: string;
  duracao?: number;
  ip_origem?: string;
  user_agent?: string;
}

export interface EstatisticasAuditoria {
  totalOperacoes: number;
  atividadeRecente: number;
  usuariosAtivos: number;
  operacoesPorTabela: Array<{
    nome: string;
    tabela: string;
    count: number;
    total: number;
  }>;
  operacoesPorTipo: Array<{
    tipo: string;
    operacao: string;
    count: number;
    total: number;
  }>;
}

const mockLogs: LogAuditoriaExtendido[] = [
  {
    id: 1,
    usuario: 'Admin',
    acao: 'CREATE',
    operacao: 'Criação',
    descricao: 'Nova conta a pagar criada',
    tabela: 'contas_pagar',
    registro_id: 1,
    dados_novos: { descricao: 'Conta de energia', valor: 1200.50 },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data_operacao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duracao: 245,
    ip_origem: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 2,
    usuario: 'Admin',
    acao: 'UPDATE',
    operacao: 'Atualização',
    descricao: 'Dados do fornecedor atualizados',
    tabela: 'fornecedores',
    registro_id: 15,
    dados_anteriores: { nome: 'Fornecedor ABC Ltda' },
    dados_novos: { nome: 'Fornecedor ABC Eireli' },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    data_operacao: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    duracao: 156,
    ip_origem: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 3,
    usuario: 'Admin',
    acao: 'DELETE',
    operacao: 'Exclusão',
    descricao: 'Categoria removida do sistema',
    tabela: 'categorias',
    registro_id: 8,
    dados_anteriores: { nome: 'Categoria Teste' },
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    data_operacao: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    duracao: 89,
    ip_origem: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 4,
    usuario: 'Admin',
    acao: 'READ',
    operacao: 'Consulta',
    descricao: 'Relatório de contas gerado',
    tabela: 'contas_pagar',
    registro_id: 0,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    data_operacao: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    duracao: 1230,
    ip_origem: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 5,
    usuario: 'Admin',
    acao: 'UPDATE',
    operacao: 'Atualização',
    descricao: 'Status da conta alterado para pago',
    tabela: 'contas_pagar',
    registro_id: 23,
    dados_anteriores: { status: 'pendente' },
    dados_novos: { status: 'pago', data_pagamento: new Date().toISOString() },
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    data_operacao: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    duracao: 167,
    ip_origem: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
];

export function useAuditoriaConsistente() {
  const [logs, setLogs] = useState<LogAuditoriaExtendido[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState<string>('');

  const carregarLogs = useCallback(async (limite?: number) => {
    setLoading(true);
    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const logsOrdenados = mockLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limite || 50);
      
      setLogs(logsOrdenados);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarLogs = useCallback(async (filtro: string) => {
    setFiltroAtivo(filtro);
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let logsFiltrados = mockLogs;
      
      if (filtro === 'recent') {
        const ultimas24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        logsFiltrados = mockLogs.filter(log => 
          new Date(log.timestamp) > ultimas24h
        );
      } else if (filtro === 'errors') {
        logsFiltrados = mockLogs.filter(log => 
          log.acao === 'DELETE' || log.duracao! > 1000
        );
      } else if (filtro !== '') {
        logsFiltrados = mockLogs.filter(log =>
          log.tabela.toLowerCase().includes(filtro.toLowerCase()) ||
          log.operacao.toLowerCase().includes(filtro.toLowerCase()) ||
          log.descricao.toLowerCase().includes(filtro.toLowerCase())
        );
      }
      
      setLogs(logsFiltrados.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportarLogs = useCallback(async (formato: 'xlsx' | 'csv' | 'json' = 'json') => {
    try {
      const dadosExport = {
        timestamp_export: new Date().toISOString(),
        total_logs: logs.length,
        filtro_aplicado: filtroAtivo || 'nenhum',
        logs: logs.map(log => ({
          ...log,
          dados_anteriores: JSON.stringify(log.dados_anteriores),
          dados_novos: JSON.stringify(log.dados_novos)
        }))
      };

      const nomeArquivo = `auditoria-logs-${new Date().toISOString().split('T')[0]}.${formato}`;
      
      let content: string;
      let mimeType: string;

      switch (formato) {
        case 'csv':
          const headers = ['ID', 'Usuário', 'Operação', 'Tabela', 'Descrição', 'Data/Hora', 'Duração (ms)'];
          const csvRows = logs.map(log => [
            log.id,
            log.usuario,
            log.operacao,
            log.tabela,
            log.descricao,
            new Date(log.timestamp).toLocaleString('pt-BR'),
            log.duracao || 0
          ]);
          content = [headers, ...csvRows].map(row => row.join(';')).join('\n');
          mimeType = 'text/csv;charset=utf-8;';
          break;
        
        case 'xlsx':
          // Para Excel, exportamos como CSV por simplicidade
          content = JSON.stringify(dadosExport, null, 2);
          mimeType = 'application/json';
          break;
        
        default:
          content = JSON.stringify(dadosExport, null, 2);
          mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
    }
  }, [logs, filtroAtivo]);

  const limparLogsAntigos = useCallback(async (diasAntigos: number = 90) => {
    try {
      const dataLimite = new Date(Date.now() - diasAntigos * 24 * 60 * 60 * 1000);
      const logsRecentes = logs.filter(log => 
        new Date(log.timestamp) > dataLimite
      );
      
      setLogs(logsRecentes);
      
      return {
        logsRemovidos: logs.length - logsRecentes.length,
        logsRestantes: logsRecentes.length
      };
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      return { logsRemovidos: 0, logsRestantes: logs.length };
    }
  }, [logs]);

  // Carregamento inicial
  useEffect(() => {
    carregarLogs(20);
  }, [carregarLogs]);

  const estatisticas: EstatisticasAuditoria = {
    totalOperacoes: 500,
    atividadeRecente: logs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
    usuariosAtivos: [...new Set(logs.map(log => log.usuario))].length,
    operacoesPorTabela: [
      { nome: 'Contas a Pagar', tabela: 'contas_pagar', count: 200, total: 200 },
      { nome: 'Fornecedores', tabela: 'fornecedores', count: 150, total: 150 },
      { nome: 'Categorias', tabela: 'categorias', count: 80, total: 80 },
      { nome: 'Bancos', tabela: 'bancos', count: 70, total: 70 }
    ],
    operacoesPorTipo: [
      { tipo: 'Criação', operacao: 'CREATE', count: 100, total: 100 },
      { tipo: 'Leitura', operacao: 'READ', count: 300, total: 300 },
      { tipo: 'Atualização', operacao: 'UPDATE', count: 80, total: 80 },
      { tipo: 'Exclusão', operacao: 'DELETE', count: 20, total: 20 }
    ]
  };

  return {
    logs,
    loading,
    filtroAtivo,
    estatisticas,
    carregarLogs,
    buscarLogs,
    exportarLogs,
    limparLogsAntigos,
    limparFiltros: () => {
      setFiltroAtivo('');
      carregarLogs();
    }
  };
}