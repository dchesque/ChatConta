import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { transactionsService } from '@/services/transactionsService';
import { useAuth } from '@/hooks/useAuth';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { CalendarIcon, Download, FileText, Filter, Printer } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';

interface BankAccount {
  id: string;
  account_number: string;
  agency: string;
  bank: {
    name: string;
  };
}

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  from_account_id?: string;
  to_account_id?: string;
  accounts_payable_id?: string;
  accounts_receivable_id?: string;
  notes?: string;
}

interface ExtratoData {
  transacoes: Transaction[];
  saldoInicial: number;
  saldoFinal: number;
  totalEntradas: number;
  totalSaidas: number;
}

export function BankStatement() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    inicio: startOfMonth(new Date()),
    fim: endOfMonth(new Date())
  });
  const [extratoData, setExtratoData] = useState<ExtratoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const { user } = useAuth();
  const { accounts: bankAccounts } = useBankAccounts();

  useEffect(() => {
    if (bankAccounts) {
      const mappedAccounts = bankAccounts.map(account => ({
        id: account.id,
        account_number: account.account_number || '',
        agency: account.agency || '',
        bank: {
          name: 'Banco não identificado' // Temporário até termos dados relacionais
        }
      }));
      setAccounts(mappedAccounts);
    }
  }, [bankAccounts]);

  const gerarExtrato = async () => {
    if (!selectedAccount || !user) return;
    
    setLoading(true);
    
    try {
      const startDate = format(dateRange.inicio, 'yyyy-MM-dd');
      const endDate = format(dateRange.fim, 'yyyy-MM-dd');
      
      const statement = await transactionsService.getAccountStatement(
        selectedAccount,
        startDate,
        endDate
      );
      
      setExtratoData({
        transacoes: statement.transactions,
        saldoInicial: statement.initialBalance,
        saldoFinal: statement.finalBalance,
        totalEntradas: statement.totalIncome,
        totalSaidas: statement.totalExpense
      });
    } catch (error) {
      console.error('Erro ao gerar extrato:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100/80 text-green-700';
      case 'expense':
        return 'bg-red-100/80 text-red-700';
      case 'transfer':
        return 'bg-blue-100/80 text-blue-700';
      default:
        return 'bg-gray-100/80 text-gray-700';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'income':
        return 'Entrada';
      case 'expense':
        return 'Saída';
      case 'transfer':
        return 'Transferência';
      default:
        return type;
    }
  };

  const exportarPDF = () => {
    // TODO: Implementar exportação para PDF
  };

  const imprimirExtrato = () => {
    // TODO: Implementar funcionalidade de impressão
  };

  const exportarExcel = () => {
    // TODO: Implementar exportação para Excel
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Extrato Bancário</h1>
          <p className="text-gray-600">Visualize movimentações detalhadas por conta</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          
          {extratoData && (
            <>
              <Button variant="outline" onClick={exportarPDF}>
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={imprimirExtrato}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={exportarExcel}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conta Bancária
                </label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bank.name} - Ag: {account.agency} - CC: {account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.inicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.inicio ? format(dateRange.inicio, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.inicio}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, inicio: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.fim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.fim ? format(dateRange.fim, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.fim}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, fim: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={gerarExtrato}
                disabled={!selectedAccount || loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Gerando...' : 'Gerar Extrato'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo do Extrato */}
      {extratoData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Inicial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(extratoData.saldoInicial)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Total Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(extratoData.totalEntradas)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Total Saídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(extratoData.totalSaidas)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Final</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${extratoData.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(extratoData.saldoFinal)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Transações */}
      {extratoData && (
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle>Movimentações do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {extratoData.transacoes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma movimentação encontrada no período selecionado.
                </div>
              ) : (
                extratoData.transacoes.map((transacao) => (
                  <div key={transacao.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white/50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getTransactionTypeColor(transacao.type)}>
                          {getTransactionTypeLabel(transacao.type)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {format(new Date(transacao.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900">
                        {transacao.description || 'Movimentação bancária'}
                      </div>
                      {transacao.notes && (
                        <div className="text-sm text-gray-500 mt-1">
                          {transacao.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transacao.type === 'income' || 
                        (transacao.type === 'transfer' && transacao.to_account_id === selectedAccount)
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(transacao.type === 'income' || 
                          (transacao.type === 'transfer' && transacao.to_account_id === selectedAccount))
                          ? '+' : '-'
                        }
                        {formatCurrency(transacao.amount)}
                      </div>
                      
                      {(transacao.accounts_payable_id || transacao.accounts_receivable_id) && (
                        <Badge className="bg-blue-100/80 text-blue-700 mt-1">
                          Conciliado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}