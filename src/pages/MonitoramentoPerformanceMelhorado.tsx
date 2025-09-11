import React, { Suspense, lazy } from 'react';
import { usePerformanceAvancadoMelhorado } from '@/hooks/usePerformanceAvancadoMelhorado';
import { useAuditoriaConsistente } from '@/hooks/useAuditoriaConsistente';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundaryPerformance } from '@/components/ui/ErrorBoundaryPerformance';
import { AlertasCriticos } from '@/components/monitoramento/AlertasCriticos';
import { 
  Activity, 
  Zap, 
  Database, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Trash2,
  BarChart3,
  Timer,
  Gauge,
  History,
  FileText,
  Settings
} from 'lucide-react';
import { formatarMoeda, formatarData } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

// Lazy loading dos componentes não críticos
const ChartContainer = lazy(() => import('@/components/ui/chart').then(m => ({ default: m.ChartContainer })));
const AreaChart = lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function MonitoramentoPerformanceMelhorado() {
  const { toast } = useToast();
  const { isAdmin, role } = useAuth();

  // Dupla verificação de segurança - se não for admin, não renderizar nada
  if (!isAdmin) {
    console.warn(`[SECURITY] Unauthorized direct access to /monitoramento-performance - User role: ${role}`);
    return null;
  }
  
  const {
    loading: loadingPerf,
    optimizing,
    alertas,
    autoRefresh,
    estatisticas,
    metricas,
    metricasDetalhadas,
    infoCache,
    analise,
    coletarMetricas,
    limparCache,
    otimizarSistema,
    preCarregarDados,
    exportarRelatorioPerformance,
    resolverAlerta,
    setAutoRefresh,
    limparCacheLocal
  } = usePerformanceAvancadoMelhorado();

  const {
    logs,
    estatisticas: statsAuditoria,
    loading: loadingAudit,
    filtroAtivo,
    buscarLogs,
    exportarLogs,
    limparLogsAntigos,
    limparFiltros
  } = useAuditoriaConsistente();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleOtimizarSistema = async () => {
    try {
      await otimizarSistema();
      toast({
        title: "Sistema Otimizado",
        description: "Otimização concluída com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na Otimização",
        description: "Não foi possível otimizar o sistema.",
        variant: "destructive",
      });
    }
  };

  const handleExportarRelatorio = async () => {
    try {
      await exportarRelatorioPerformance();
      toast({
        title: "Relatório Exportado",
        description: "Relatório de performance exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    }
  };

  const handleLimparCache = async (categoria: string) => {
    try {
      await limparCache(categoria);
      toast({
        title: "Cache Limpo",
        description: `Cache ${categoria === 'all' ? 'completo' : categoria} limpo com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro ao Limpar Cache",
        description: "Não foi possível limpar o cache.",
        variant: "destructive",
      });
    }
  };

  return (
    <ErrorBoundaryPerformance>
      <div className="p-4 lg:p-8 space-y-8">
        {/* Header com configurações */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Monitoramento de Performance
            </h1>
            <p className="text-muted-foreground">
              Análise completa de performance, cache e auditoria do sistema
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Auto Refresh Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm">
                Auto-refresh (30s)
              </Label>
            </div>
            
            <Button
              variant="outline"
              onClick={() => coletarMetricas(true)}
              disabled={loadingPerf}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingPerf ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportarRelatorio}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <Button
              onClick={handleOtimizarSistema}
              disabled={optimizing}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Zap className={`w-4 h-4 mr-2 ${optimizing ? 'animate-pulse' : ''}`} />
              {optimizing ? 'Otimizando...' : 'Otimizar Sistema'}
            </Button>
          </div>
        </div>

        {/* Alertas Críticos */}
        <AlertasCriticos 
          alertas={alertas} 
          onResolverAlerta={resolverAlerta}
        />

        {/* Score Geral */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Score Geral do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="relative">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {estatisticas.scoreGeral}%
                  </div>
                  <Progress value={estatisticas.scoreGeral} className="mt-2" />
                </div>
                <div className="text-sm text-muted-foreground">Score Geral</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2 flex items-center justify-center gap-1">
                  <CheckCircle className="w-5 h-5" />
                  {estatisticas.sucessos}
                </div>
                <div className="text-sm text-muted-foreground">Métricas OK</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-5 h-5" />
                  {estatisticas.problemas}
                </div>
                <div className="text-sm text-muted-foreground">Problemas</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-1">
                  <Database className="w-5 h-5" />
                  {estatisticas.hitRateCache.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="cache" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Cache
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Auditoria
            </TabsTrigger>
            <TabsTrigger value="tendencias" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tendências
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* Aba Performance */}
          <TabsContent value="performance" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Métricas de Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Métricas do Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingPerf ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p>Carregando métricas...</p>
                      </div>
                    ) : (
                      metricasDetalhadas.map((metrica, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(metrica.status)}
                            <div>
                              <div className="font-medium">{metrica.metrica.replace(/_/g, ' ')}</div>
                              <div className="text-sm text-muted-foreground">
                                {metrica.recomendacao}
                              </div>
                              {metrica.valor && (
                                <div className="text-xs text-gray-500">
                                  {metrica.valor}{metrica.unidade} / {metrica.meta}{metrica.unidade}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant="secondary" 
                              className={`${getStatusColor(metrica.status)} text-white`}
                            >
                              {metrica.status}
                            </Badge>
                            {metrica.valor && metrica.meta && (
                              <Progress 
                                value={(metrica.valor / metrica.meta) * 100} 
                                className="mt-2 w-20"
                              />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Estatísticas Rápidas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Estatísticas Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-primary">
                          {estatisticas.totalVendasMes.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-muted-foreground">Vendas/Mês</div>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-green-600">
                          {formatarMoeda(estatisticas.valorTotalMes)}
                        </div>
                        <div className="text-sm text-muted-foreground">Faturamento</div>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-blue-600">
                          {estatisticas.contasPendentes}
                        </div>
                        <div className="text-sm text-muted-foreground">Contas Pendentes</div>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="text-2xl font-bold text-purple-600">
                          {estatisticas.clientesAtivos}
                        </div>
                        <div className="text-sm text-muted-foreground">Clientes Ativos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Suspense>
          </TabsContent>

          {/* Aba Cache */}
          <TabsContent value="cache" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Gerenciamento de Cache
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações do Cache */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {infoCache.totalItens.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-muted-foreground">Itens Cached</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {infoCache.hitRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Hit Rate</div>
                    <Progress value={infoCache.hitRate} className="mt-2" />
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(infoCache.memoryUsage / 1024).toFixed(1)} KB
                    </div>
                    <div className="text-sm text-muted-foreground">Uso Memória</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {infoCache.eficiencia}%
                    </div>
                    <div className="text-sm text-muted-foreground">Eficiência</div>
                    <Progress value={infoCache.eficiencia} className="mt-2" />
                  </div>
                </div>

                {/* Informações de Cache */}
                {infoCache.ultimaLimpeza && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        Última limpeza: {formatarData(infoCache.ultimaLimpeza)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Ações de Cache */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={preCarregarDados}
                    disabled={loadingPerf}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Pré-carregar Dados
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleLimparCache('all')}
                    disabled={loadingPerf}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Todo Cache
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleLimparCache('vendas')}
                    disabled={loadingPerf}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Cache Vendas
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={limparCacheLocal}
                    disabled={loadingPerf}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Cache Local
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Auditoria */}
          <TabsContent value="auditoria" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estatísticas de Auditoria */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Estatísticas de Auditoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {statsAuditoria.totalOperacoes.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Operações</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {statsAuditoria.atividadeRecente}
                      </div>
                      <div className="text-sm text-muted-foreground">Últimas 24h</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {statsAuditoria.usuariosAtivos}
                      </div>
                      <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {statsAuditoria.operacoesPorTabela.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Tabelas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações de Auditoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações de Auditoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => buscarLogs('recent')}
                      disabled={loadingAudit}
                      className="flex-1"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingAudit ? 'animate-spin' : ''}`} />
                      Logs Recentes
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => buscarLogs('errors')}
                      disabled={loadingAudit}
                      className="flex-1"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Erros
                    </Button>
                  </div>
                  
                  {filtroAtivo && (
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm text-blue-800">
                        Filtro ativo: {filtroAtivo}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={limparFiltros}
                      >
                        Limpar
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => exportarLogs('json')}
                    disabled={loadingAudit}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Logs
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => limparLogsAntigos(90)}
                    disabled={loadingAudit}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Logs Antigos (90+ dias)
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Logs Recentes */}
            {logs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Logs Recentes</span>
                    <Badge variant="secondary">{logs.length} registros</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {logs.map((log) => (
                      <div key={log.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{log.operacao}</Badge>
                            <span className="font-medium">{log.tabela}</span>
                            {log.descricao && (
                              <span className="text-sm text-muted-foreground">
                                - {log.descricao}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {formatarData(log.data_operacao)}
                            </div>
                            {log.duracao && (
                              <div className="text-xs text-gray-500">
                                {log.duracao}ms
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Tendências */}
          <TabsContent value="tendencias" className="space-y-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Operações por Tabela */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Operações por Tabela
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statsAuditoria.operacoesPorTabela.map((item) => (
                        <div key={item.tabela} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{item.nome}</div>
                            <div className="text-sm text-muted-foreground">{item.tabela}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{item.count.toLocaleString('pt-BR')}</div>
                            <Progress value={(item.count / item.total) * 100} className="w-20 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Operações por Tipo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Operações por Tipo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statsAuditoria.operacoesPorTipo.map((item) => (
                        <div key={item.operacao} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{item.tipo}</div>
                            <div className="text-sm text-muted-foreground">{item.operacao}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{item.count.toLocaleString('pt-BR')}</div>
                            <Progress value={(item.count / item.total) * 100} className="w-20 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Suspense>
          </TabsContent>

          {/* Aba Configurações */}
          <TabsContent value="configuracoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Monitoramento</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-refresh-settings">Auto-refresh (30s)</Label>
                      <Switch
                        id="auto-refresh-settings"
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alertas-criticos">Alertas Críticos</Label>
                      <Switch
                        id="alertas-criticos"
                        defaultChecked={true}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Cache</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cache-automatico">Limpeza Automática</Label>
                      <Switch
                        id="cache-automatico"
                        defaultChecked={false}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cache-inteligente">Cache Inteligente</Label>
                      <Switch
                        id="cache-inteligente"
                        defaultChecked={true}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Relatório Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundaryPerformance>
  );
}