import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dataService } from '@/services/DataServiceFactory';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Download, Filter, Calendar as CalendarIcon, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

interface RelatorioFiltros {
  periodo: { inicio: Date; fim: Date };
  categorias: string[];
  contas: string[];
  tipo: 'todas' | 'pagar' | 'receber';
}

interface DadosRelatorio {
  resumo: {
    totalReceitas: number;
    totalDespesas: number;
    saldoLiquido: number;
    contasPendentes: number;
  };
  porCategoria: Array<{
    categoria: string;
    valor: number;
    percentual: number;
  }>;
  evolucaoMensal: Array<{
    mes: string;
    receitas: number;
    despesas: number;
  }>;
}

export default function Relatorios() {
  const [filtros, setFiltros] = useState<RelatorioFiltros>({
    periodo: {
      inicio: startOfMonth(new Date()),
      fim: endOfMonth(new Date())
    },
    categorias: [],
    contas: [],
    tipo: 'todas'
  });
  const [dadosRelatorio, setDadosRelatorio] = useState<DadosRelatorio | null>(null);
  const [loading, setLoading] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState('demonstrativo');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      gerarRelatorio();
    }
  }, [user, filtros, tipoRelatorio]);

  const gerarRelatorio = async () => {
    try {
      setLoading(true);
      
      // Mock data para demonstração
      const mockData: DadosRelatorio = {
        resumo: {
          totalReceitas: 25000 + crypto.getRandomValues(new Uint32Array(1))[0] % 10000,
          totalDespesas: 18000 + crypto.getRandomValues(new Uint32Array(1))[0] % 8000,
          saldoLiquido: 7000 + crypto.getRandomValues(new Uint32Array(1))[0] % 3000,
          contasPendentes: (crypto.getRandomValues(new Uint8Array(1))[0] % 20) + 5
        },
        porCategoria: [
          { categoria: 'Vendas', valor: 15000, percentual: 45 },
          { categoria: 'Serviços', valor: 10000, percentual: 30 },
          { categoria: 'Outros', valor: 8000, percentual: 25 }
        ],
        evolucaoMensal: Array.from({ length: 6 }, (_, i) => ({
          mes: format(subMonths(new Date(), 5 - i), 'MMM', { locale: ptBR }),
          receitas: 20000 + crypto.getRandomValues(new Uint32Array(1))[0] % 10000,
          despesas: 15000 + crypto.getRandomValues(new Uint32Array(1))[0] % 8000
        }))
      };
      
      setDadosRelatorio(mockData);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: Date) => {
    return format(data, 'dd/MM/yyyy', { locale: ptBR });
  };

  const periodosPredefinidos = [
    { label: 'Este mês', inicio: startOfMonth(new Date()), fim: endOfMonth(new Date()) },
    { label: 'Mês passado', inicio: startOfMonth(subMonths(new Date(), 1)), fim: endOfMonth(subMonths(new Date(), 1)) },
    { label: 'Últimos 3 meses', inicio: startOfMonth(subMonths(new Date(), 2)), fim: endOfMonth(new Date()) },
    { label: 'Este ano', inicio: new Date(new Date().getFullYear(), 0, 1), fim: new Date(new Date().getFullYear(), 11, 31) }
  ];

  const exportarPDF = () => {
    window.print();
  };

  const cores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-gray-600">Análise financeira e demonstrativos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportarPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros do Relatório</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tipo de Relatório */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demonstrativo">Demonstrativo Mensal</SelectItem>
                  <SelectItem value="categoria">Por Categoria</SelectItem>
                  <SelectItem value="contato">Por Contato</SelectItem>
                  <SelectItem value="fluxo">Fluxo de Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Período Predefinido */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select 
                onValueChange={(value) => {
                  const periodo = periodosPredefinidos[parseInt(value)];
                  if (periodo) {
                    setFiltros(prev => ({ ...prev, periodo }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {periodosPredefinidos.map((periodo, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {periodo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Início */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filtros.periodo.inicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatarData(filtros.periodo.inicio)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtros.periodo.inicio}
                    onSelect={(date) => date && setFiltros(prev => ({ 
                      ...prev, 
                      periodo: { ...prev.periodo, inicio: date } 
                    }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filtros.periodo.fim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatarData(filtros.periodo.fim)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtros.periodo.fim}
                    onSelect={(date) => date && setFiltros(prev => ({ 
                      ...prev, 
                      periodo: { ...prev.periodo, fim: date } 
                    }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo dos Relatórios */}
      {dadosRelatorio && (
        <Tabs value={tipoRelatorio} onValueChange={setTipoRelatorio}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demonstrativo" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Demonstrativo</span>
            </TabsTrigger>
            <TabsTrigger value="categoria" className="flex items-center space-x-2">
              <PieChart className="w-4 h-4" />
              <span>Por Categoria</span>
            </TabsTrigger>
            <TabsTrigger value="contato" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Por Contato</span>
            </TabsTrigger>
            <TabsTrigger value="fluxo" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Fluxo de Caixa</span>
            </TabsTrigger>
          </TabsList>

          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="card-base">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Receitas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatarMoeda(dadosRelatorio.resumo.totalReceitas)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Despesas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatarMoeda(dadosRelatorio.resumo.totalDespesas)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Saldo Líquido</p>
                  <p className={`text-2xl font-bold ${
                    dadosRelatorio.resumo.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatarMoeda(dadosRelatorio.resumo.saldoLiquido)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Contas Pendentes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dadosRelatorio.resumo.contasPendentes}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="demonstrativo" className="space-y-6">
            {/* Gráfico de Evolução Mensal */}
            <Card className="card-base">
              <CardHeader>
                <CardTitle>Evolução Mensal - Receitas vs Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosRelatorio.evolucaoMensal}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="mes" />
                      <YAxis tickFormatter={(value) => formatarMoeda(value).replace('R$', 'R$')} />
                      <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                      <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                      <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categoria" className="space-y-6">
            {/* Gráfico por Categoria */}
            <Card className="card-base">
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                      <RechartsPieChart data={dadosRelatorio.porCategoria}>
                        {dadosRelatorio.porCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}