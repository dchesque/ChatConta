import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { dataService } from '@/services/DataServiceFactory';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, AlertTriangle, Upload, Search, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  description: string;
  from_account_id?: string;
  to_account_id?: string;
  reconciled: boolean;
  accounts_payable?: { description: string };
  accounts_receivable?: { description: string };
}

export function Reconciliation() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    status: 'todos', // todos, conciliado, pendente
    tipo: 'todos' // todos, income, expense, transfer
  });
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      carregarContas();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAccount) {
      carregarTransacoes();
    }
  }, [selectedAccount]);

  const carregarContas = async () => {
    try {
      const bancos = await dataService.bancos.getAll();
      const allAccounts: BankAccount[] = [];
      
      for (const banco of bancos) {
        // Mock bank accounts - na implementação real seria dataService.bankAccounts.getByBankId(banco.id)
        const contas = [{
          id: `${banco.id}-1`,
          account_number: '12345-6',
          agency: '1234',
          bank: { name: banco.nome }
        }];
        allAccounts.push(...contas);
      }
      
      setAccounts(allAccounts);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  const carregarTransacoes = async () => {
    if (!selectedAccount) return;

    try {
      setLoading(true);
      // Mock transactions - na implementação real seria dataService.transactions.getByAccount
      const transacoesData = [
        {
          id: '1',
          date: '2024-01-15',
          type: 'expense' as const,
          amount: 500,
          description: 'Pagamento fornecedor',
          from_account_id: selectedAccount
        }
      ];
      
      // Adicionar campo reconciled mock
      const transacoesComStatus = transacoesData.map(t => ({
        ...t,
        reconciled: crypto.getRandomValues(new Uint8Array(1))[0] / 255 > 0.3
      }));
      
      setTransactions(transacoesComStatus);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
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
    return format(new Date(dataStr), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.accounts_payable) {
      return `Pagamento: ${transaction.accounts_payable.description}`;
    }
    if (transaction.accounts_receivable) {
      return `Recebimento: ${transaction.accounts_receivable.description}`;
    }
    return transaction.description || 'Transação manual';
  };

  const getTransactionValue = (transaction: Transaction) => {
    const isCredit = transaction.to_account_id === selectedAccount;
    return isCredit ? transaction.amount : -transaction.amount;
  };

  const transacoesFiltradas = transactions.filter(transaction => {
    const matchBusca = !filtros.busca || 
      getTransactionDescription(transaction).toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchStatus = filtros.status === 'todos' || 
      (filtros.status === 'conciliado' && transaction.reconciled) ||
      (filtros.status === 'pendente' && !transaction.reconciled);
    
    const matchTipo = filtros.tipo === 'todos' || transaction.type === filtros.tipo;
    
    return matchBusca && matchStatus && matchTipo;
  });

  const estatisticas = {
    total: transactions.length,
    conciliadas: transactions.filter(t => t.reconciled).length,
    pendentes: transactions.filter(t => !t.reconciled).length,
    divergencias: Math.floor(transactions.length * 0.05) // Mock: 5% de divergências
  };

  const marcarComoConciliada = async (transactionId: string) => {
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId ? { ...t, reconciled: true } : t
      )
    );
  };

  const marcarSelecionadasComoConciliadas = async () => {
    setTransactions(prev => 
      prev.map(t => 
        selectedTransactions.has(t.id) ? { ...t, reconciled: true } : t
      )
    );
    setSelectedTransactions(new Set());
  };

  const toggleTransactionSelection = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-base">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold">{estatisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Conciliadas</p>
                <p className="text-lg font-semibold text-green-700">{estatisticas.conciliadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-lg font-semibold text-yellow-700">{estatisticas.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Divergências</p>
                <p className="text-lg font-semibold text-red-700">{estatisticas.divergencias}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Controles */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reconciliação Bancária</span>
            <Button variant="outline" className="btn-primary">
              <Upload className="w-4 h-4 mr-2" />
              Importar OFX
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Seleção de Conta */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Conta Bancária</label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bank.name} - {account.agency}/{account.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Busca */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar transação..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filtros.status} 
                onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="conciliado">Conciliados</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select 
                value={filtros.tipo} 
                onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                  <SelectItem value="transfer">Transferências</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ações */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ações</label>
              <Button 
                onClick={marcarSelecionadasComoConciliadas}
                disabled={selectedTransactions.size === 0}
                className="w-full btn-primary"
              >
                Conciliar Selecionadas ({selectedTransactions.size})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : transacoesFiltradas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma transação encontrada
            </p>
          ) : (
            <div className="space-y-2">
              {transacoesFiltradas.map((transaction) => {
                const valor = getTransactionValue(transaction);
                const isCredit = valor > 0;
                
                return (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50/50 ${
                      transaction.reconciled ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                    }`}
                  >
                    <Checkbox
                      checked={selectedTransactions.has(transaction.id)}
                      onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                      disabled={transaction.reconciled}
                    />

                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          isCredit ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getTransactionDescription(transaction)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatarData(transaction.date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-semibold ${
                        isCredit ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isCredit ? '+' : ''}{formatarMoeda(valor)}
                      </p>
                      <Badge 
                        variant={transaction.reconciled ? "default" : "secondary"}
                        className={transaction.reconciled ? "bg-green-100 text-green-800" : ""}
                      >
                        {transaction.reconciled ? 'Conciliado' : 'Pendente'}
                      </Badge>
                    </div>

                    {!transaction.reconciled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => marcarComoConciliada(transaction.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}