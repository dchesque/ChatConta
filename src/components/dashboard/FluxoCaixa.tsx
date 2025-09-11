import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService } from '@/services/DataServiceFactory';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MovimentacaoItem {
  id: string;
  data: string;
  tipo: 'pagar' | 'receber';
  descricao: string;
  valor: number;
  status: string;
  contato?: string;
}

interface DadosFluxo {
  data: string;
  saldoPrevisto: number;
  totalPagar: number;
  totalReceber: number;
  movimentacoes: MovimentacaoItem[];
}

export function FluxoCaixa() {
  const [dados, setDados] = useState<DadosFluxo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      carregarFluxoCaixa();
    }
  }, [user]);

  const carregarFluxoCaixa = async () => {
    try {
      setLoading(true);
      
      // Buscar dados dos próximos 30 dias
      const hoje = new Date();
      const fim = addDays(hoje, 30);
      
      const [contasPagar, contasReceber, bancos] = await Promise.all([
        dataService.contasPagar.getByVencimento(hoje.toISOString(), fim.toISOString()),
        dataService.contasReceber.getByVencimento(hoje.toISOString(), fim.toISOString()),
        dataService.bancos.getAll()
      ]);

      // Calcular saldo atual dos bancos
      const saldoInicial = bancos.reduce((total, banco) => {
        return total + Number(banco.saldo_inicial || 0);
      }, 0);
      setSaldoAtual(saldoInicial);

      // Processar dados para timeline
      const fluxoMap = new Map<string, DadosFluxo>();
      
      // Inicializar próximos 30 dias
      for (let i = 0; i < 30; i++) {
        const data = addDays(hoje, i);
        const dataStr = format(data, 'yyyy-MM-dd');
        
        fluxoMap.set(dataStr, {
          data: dataStr,
          saldoPrevisto: saldoInicial,
          totalPagar: 0,
          totalReceber: 0,
          movimentacoes: []
        });
      }

      // Adicionar contas a pagar
      contasPagar.forEach(conta => {
        if (conta.status === 'pendente') {
          const dataStr = conta.data_vencimento;
          const item = fluxoMap.get(dataStr);
          
          if (item) {
            item.totalPagar += Number(conta.valor_final);
            item.movimentacoes.push({
              id: String(conta.id),
              data: dataStr,
              tipo: 'pagar',
              descricao: conta.descricao,
              valor: Number(conta.valor_final),
              status: conta.status,
              contato: `Fornecedor ${conta.fornecedor_id}`
            });
          }
        }
      });

      // Adicionar contas a receber
      contasReceber.forEach(conta => {
        if (conta.status === 'pendente') {
          const dataStr = conta.data_vencimento;
          const item = fluxoMap.get(dataStr);
          
          if (item) {
            item.totalReceber += Number(conta.valor);
            item.movimentacoes.push({
              id: String(conta.id),
              data: dataStr,
              tipo: 'receber',
              descricao: conta.descricao,
              valor: Number(conta.valor),
              status: conta.status,
              contato: conta.pagador?.nome
            });
          }
        }
      });

      // Calcular saldo projetado acumulativo
      const dadosArray = Array.from(fluxoMap.values()).sort((a, b) => a.data.localeCompare(b.data));
      let saldoAcumulado = saldoInicial;
      
      dadosArray.forEach(item => {
        saldoAcumulado = saldoAcumulado + item.totalReceber - item.totalPagar;
        item.saldoPrevisto = saldoAcumulado;
      });

      setDados(dadosArray);
    } catch (error) {
      console.error('Erro ao carregar fluxo de caixa:', error);
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

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr + 'T00:00:00');
    
    if (isToday(data)) return 'Hoje';
    if (isTomorrow(data)) return 'Amanhã';
    
    return format(data, 'dd/MM', { locale: ptBR });
  };

  const dadosGrafico = dados.slice(0, 15).map(item => ({
    data: formatarData(item.data),
    saldo: item.saldoPrevisto,
    entradas: item.totalReceber,
    saidas: item.totalPagar
  }));

  if (loading) {
    return (
      <Card className="card-base">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Fluxo de Caixa</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const proximasMovimentacoes = dados
    .slice(0, 7)
    .filter(item => item.movimentacoes.length > 0)
    .slice(0, 5);

  const menorSaldo = Math.min(...dados.map(d => d.saldoPrevisto));
  const alertaSaldo = menorSaldo < 0;

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-base">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Saldo Atual</p>
                <p className="text-lg font-semibold">{formatarMoeda(saldoAtual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">A Receber (7 dias)</p>
                <p className="text-lg font-semibold text-green-700">
                  {formatarMoeda(dados.slice(0, 7).reduce((sum, d) => sum + d.totalReceber, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">A Pagar (7 dias)</p>
                <p className="text-lg font-semibold text-red-700">
                  {formatarMoeda(dados.slice(0, 7).reduce((sum, d) => sum + d.totalPagar, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`card-base ${alertaSaldo ? 'border-red-200 bg-red-50/50' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Menor Saldo Previsto</p>
                <p className={`text-lg font-semibold ${alertaSaldo ? 'text-red-700' : 'text-purple-700'}`}>
                  {formatarMoeda(menorSaldo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle>Evolução do Saldo Projetado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="data" 
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => formatarMoeda(value).replace('R$', 'R$')}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value, name) => [formatarMoeda(Number(value)), name]}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Saldo Projetado"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Entradas"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="saidas" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Saídas"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Movimentações */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle>Próximas Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {proximasMovimentacoes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma movimentação prevista para os próximos dias
            </p>
          ) : (
            <div className="space-y-4">
              {proximasMovimentacoes.map((dia) => (
                <div key={dia.data} className="border-l-4 border-blue-200 pl-4">
                  <div className="mb-2">
                    <h4 className="font-medium text-gray-900">
                      {formatarData(dia.data)}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {dia.totalReceber > 0 && (
                        <span className="text-green-600">
                          ↗ {formatarMoeda(dia.totalReceber)}
                        </span>
                      )}
                      {dia.totalPagar > 0 && (
                        <span className="text-red-600">
                          ↘ {formatarMoeda(dia.totalPagar)}
                        </span>
                      )}
                      <span className="text-purple-600 font-medium">
                        Saldo: {formatarMoeda(dia.saldoPrevisto)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dia.movimentacoes.map((mov) => (
                      <div 
                        key={mov.id} 
                        className="flex items-center justify-between p-2 bg-gray-50/80 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            mov.tipo === 'receber' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {mov.descricao}
                            </p>
                            {mov.contato && (
                              <p className="text-xs text-gray-500">
                                {mov.contato}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          mov.tipo === 'receber' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mov.tipo === 'receber' ? '+' : '-'}{formatarMoeda(mov.valor)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}