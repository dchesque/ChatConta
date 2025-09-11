import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Calendar, Plus, Eye, ArrowRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { KPICard } from '@/components/dashboard/KPICard';
import { AcoesRapidas } from '@/components/dashboard/AcoesRapidas';
import { useDashboardWithPeriod } from '@/hooks/useDashboardWithPeriod';
import { MonthYearSelector } from '@/components/dashboard/MonthYearSelector';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';
import { formatarMoeda } from '@/utils/formatters';
import { dataService } from '@/services/DataServiceFactory';
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    summary,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    recarregar
  } = useDashboardWithPeriod();
  
  const [upcomingExpenses, setUpcomingExpenses] = useState<any[]>([]);
  useNotificationTriggers(); // Executar verificações automáticas

  // Buscar despesas dos próximos 5 dias
  useEffect(() => {
    const fetchUpcomingExpenses = async () => {
      try {
        const hoje = new Date();
        const proximos5Dias = new Date();
        proximos5Dias.setDate(hoje.getDate() + 5);
        
        const hojeStr = hoje.toISOString().split('T')[0];
        const proximos5DiasStr = proximos5Dias.toISOString().split('T')[0];
        
        const contas = await dataService.contasPagar.getByVencimento(hojeStr, proximos5DiasStr);
        const contasPendentes = contas.filter(conta => conta.status !== 'paid');
        setUpcomingExpenses(contasPendentes.slice(0, 5)); // Máximo 5 contas
      } catch (error) {
        console.error('Erro ao buscar próximas despesas:', error);
      }
    };

    if (summary) {
      fetchUpcomingExpenses();
    }
  }, [summary]);

  if (loading) {
    return <div className="p-4 lg:p-8">
        <div className="space-y-8">
          {/* Header com loading */}
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>

          {/* Skeleton dos cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="p-4 lg:p-8">
        <div className="text-center py-16">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={recarregar}>
            Tentar novamente
          </Button>
        </div>
      </div>;
  }
  if (!summary) {
    return <div className="p-4 lg:p-8">
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard não disponível</h3>
          <p className="text-gray-600">Dados do dashboard não puderam ser carregados</p>
        </div>
      </div>;
  }
  const {
    totalBalance,
    totalAccountsPayable,
    totalAccountsReceivable,
    monthlyIncome,
    monthlyExpenses
  } = summary;

  // Calcular fluxo líquido do mês
  const fluxoLiquido = monthlyIncome - monthlyExpenses;
  return <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0 lg:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium w-full sm:w-auto justify-between sm:justify-start">
            <span className="whitespace-nowrap">Filtrar por mês:</span>
            <MonthYearSelector 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
          <Button onClick={recarregar} variant="outline" className="w-full sm:w-auto">
            <TrendingUp className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard titulo="Saldo Total" valor={formatarMoeda(totalBalance)} icone={<DollarSign className="w-6 h-6" />} gradiente="from-blue-600 to-blue-700" status={totalBalance >= 0 ? 'saudavel' : 'critico'} subtitulo="Saldo atual em bancos" />

        <KPICard titulo="Contas a Pagar" valor={formatarMoeda(totalAccountsPayable)} icone={<AlertTriangle className="w-6 h-6" />} gradiente="from-orange-500 to-orange-600" status="atencao" subtitulo={`A pagar no período selecionado`} />

        <KPICard titulo="Contas a Receber" valor={formatarMoeda(totalAccountsReceivable)} icone={<CheckCircle className="w-6 h-6" />} gradiente="from-green-500 to-green-600" status="saudavel" subtitulo={`A receber no período selecionado`} />

        <KPICard titulo="Fluxo do Mês" valor={formatarMoeda(fluxoLiquido)} icone={<TrendingUp className="w-6 h-6" />} gradiente={fluxoLiquido >= 0 ? "from-green-600 to-green-600" : "from-red-500 to-red-600"} status={fluxoLiquido >= 0 ? 'saudavel' : 'critico'} subtitulo="Receitas - Despesas" />
      </div>

      {/* Seção Detalhada - Duas Colunas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Coluna Despesas */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
            Despesas do Período
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
            <MetricCard titulo="Contas Pendentes" valor={summary.accountsPayableCount} formato="numero" icone={<Calendar className="w-6 h-6 text-orange-600" />} cor="orange" />
            <MetricCard titulo="Contas Vencidas" valor={summary.overdueAccountsPayable} formato="moeda" icone={<AlertTriangle className="w-6 h-6 text-red-600" />} cor="red" />
            <MetricCard titulo="Pagas no Período" valor={summary.paidAccountsPayableCount} formato="numero" icone={<CheckCircle className="w-6 h-6 text-green-600" />} cor="green" />
            <MetricCard titulo="Valores Pagos" valor={summary.paidAccountsPayable} formato="moeda" icone={<TrendingDown className="w-6 h-6 text-green-600" />} cor="green" />
            <MetricCard titulo="Gastos do Mês" valor={monthlyExpenses} formato="moeda" icone={<TrendingDown className="w-6 h-6 text-red-600" />} cor="red" />
            <MetricCard 
              titulo="Média Gasto/Dia" 
              valor={monthlyExpenses > 0 ? monthlyExpenses / new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() : 0} 
              formato="moeda" 
              icone={<Calendar className="w-6 h-6 text-gray-600" />} 
              cor="gray" 
            />
          </div>
        </div>

        {/* Coluna Receitas */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Receitas do Período
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
            <MetricCard titulo="Receitas Pendentes" valor={summary.accountsReceivableCount} formato="numero" icone={<CheckCircle className="w-6 h-6 text-blue-600" />} cor="blue" />
            <MetricCard titulo="Recebidas no Período" valor={summary.paidAccountsReceivableCount} formato="numero" icone={<CheckCircle className="w-6 h-6 text-green-600" />} cor="green" />
            <MetricCard titulo="Valores Recebidos" valor={summary.paidAccountsReceivable} formato="moeda" icone={<TrendingUp className="w-6 h-6 text-green-600" />} cor="green" />
            <MetricCard titulo="Receitas do Mês" valor={monthlyIncome} formato="moeda" icone={<TrendingUp className="w-6 h-6 text-green-600" />} cor="green" />
            <MetricCard 
              titulo="Taxa de Pagamento" 
              valor={summary.accountsPayableCount > 0 ? Math.round((summary.paidAccountsPayableCount / (summary.accountsPayableCount + summary.paidAccountsPayableCount)) * 100) : 0} 
              formato="percentual" 
              icone={<CheckCircle className="w-6 h-6 text-blue-600" />} 
              cor="blue" 
            />
            <MetricCard 
              titulo="Média Receita/Dia" 
              valor={monthlyIncome > 0 ? monthlyIncome / new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() : 0} 
              formato="moeda" 
              icone={<Calendar className="w-6 h-6 text-gray-600" />} 
              cor="gray" 
            />
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          Resumo Geral
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        <MetricCard titulo="Saldo Total" valor={totalBalance} formato="moeda" icone={<DollarSign className="w-6 h-6 text-blue-600" />} cor="blue" />
        <MetricCard titulo="Fluxo Líquido" valor={fluxoLiquido} formato="moeda" icone={<TrendingUp className="w-6 h-6 text-purple-600" />} cor="purple" />
        <MetricCard titulo="Total Gastos" valor={monthlyExpenses} formato="moeda" icone={<TrendingDown className="w-6 h-6 text-red-600" />} cor="red" />
        <MetricCard titulo="Total Receitas" valor={monthlyIncome} formato="moeda" icone={<TrendingUp className="w-6 h-6 text-green-600" />} cor="green" />
        <MetricCard 
          titulo="Total de Contas" 
          valor={summary.accountsPayableCount + summary.accountsReceivableCount + summary.paidAccountsPayableCount + summary.paidAccountsReceivableCount} 
          formato="numero" 
          icone={<Calendar className="w-6 h-6 text-indigo-600" />} 
          cor="indigo" 
        />
        <MetricCard 
          titulo="Eficiência %" 
          valor={summary.accountsPayableCount + summary.accountsReceivableCount > 0 
            ? Math.round(((summary.paidAccountsPayableCount + summary.paidAccountsReceivableCount) / (summary.accountsPayableCount + summary.accountsReceivableCount + summary.paidAccountsPayableCount + summary.paidAccountsReceivableCount)) * 100) 
            : 100} 
          formato="percentual" 
          icone={<CheckCircle className="w-6 h-6 text-teal-600" />} 
          cor="teal" 
        />
        </div>
      </div>

      {/* Ações Rápidas e Próximas Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Coluna 1: Ações Rápidas */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Ações Rápidas
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate('/contas-pagar')}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start sm:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">Gerenciar Contas a Pagar</h4>
                    <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                      Visualize e gerencie todas as suas contas a pagar
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate('/contas-receber')}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start sm:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-green-900 mb-1 sm:mb-2 text-sm sm:text-base">Gerenciar Contas a Receber</h4>
                    <p className="text-green-700 text-xs sm:text-sm leading-relaxed">
                      Controle suas receitas e valores a receber
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate('/categorias')}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start sm:items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-purple-900 mb-1 sm:mb-2 text-sm sm:text-base">Configurar Categorias</h4>
                    <p className="text-purple-700 text-xs sm:text-sm leading-relaxed">
                      Organize suas despesas por categorias
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coluna 2: Próximas Despesas */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Próximas Despesas (5 dias)
          </h3>
          <Card className="bg-white/80 backdrop-blur-sm border border-orange-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              {upcomingExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhuma despesa nos próximos 5 dias!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-1">
                    {upcomingExpenses.map((expense, index) => (
                      <div key={expense.id || index} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded border-b border-gray-100 last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{expense.description}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(expense.due_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatarMoeda(parseFloat(expense.amount) || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {upcomingExpenses.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3 text-gray-600 border-gray-200 hover:bg-gray-50"
                      onClick={() => navigate('/contas-pagar')}
                    >
                      Ver todas as contas
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}