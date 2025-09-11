
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Trash2, DollarSign, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AccountReceivable } from '@/types/accounts';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export interface ContaReceberListItem {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'received' | 'overdue' | 'canceled';
  contact?: {
    id: string;
    name: string;
    type: string;
  };
  customer_name?: string;
  category?: {
    id: string;
    name: string;
    color?: string;
  };
  notes?: string;
  reference_document?: string;
  received_at?: string;
  created_at: string;
}

interface ContasReceberListProps {
  contas: ContaReceberListItem[];
  loading: boolean;
  onEdit: (conta: ContaReceberListItem) => void;
  onDelete: (conta: ContaReceberListItem) => void;
  onView: (conta: ContaReceberListItem) => void;
  onReceive: (conta: ContaReceberListItem) => void;
}

export const ContasReceberList: React.FC<ContasReceberListProps> = ({
  contas,
  loading,
  onEdit,
  onDelete,
  onView,
  onReceive
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100/80 text-yellow-700' },
      received: { label: 'Recebido', className: 'bg-green-100/80 text-green-700' },
      overdue: { label: 'Vencido', className: 'bg-red-100/80 text-red-700' },
      canceled: { label: 'Cancelado', className: 'bg-gray-100/80 text-gray-700' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge className={`${config.className} font-medium px-3 py-1.5`}>
        {config.label}
      </Badge>
    );
  };

  const isOverdue = (conta: ContaReceberListItem) => {
    if (conta.status !== 'pending') return false;
    const today = new Date();
    const dueDate = new Date(conta.due_date);
    return dueDate < today;
  };

  const getStatusIcon = (conta: ContaReceberListItem) => {
    if (conta.status === 'received') {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    
    if (isOverdue(conta)) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    
    if (conta.status === 'pending') {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    
    return <DollarSign className="h-4 w-4 text-gray-600" />;
  };

  // Verificar se a conta pode receber baixa
  const canReceive = (conta: ContaReceberListItem) => {
    return conta.status === 'pending' || conta.status === 'overdue' || isOverdue(conta);
  };

  // Log para debug
  console.log('ContasReceberList - onReceive function:', typeof onReceive);
  console.log('ContasReceberList - contas count:', contas.length);
  console.log('ContasReceberList - contas with canReceive:', contas.filter(conta => canReceive(conta)).length);

  if (loading) {
    return (
      <Card className="card-base">
        <CardHeader>
          <CardTitle>Contas a Receber</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contas.length) {
    return (
      <Card className="card-base">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma conta encontrada
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            Não foram encontradas contas a receber com os filtros aplicados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-base">
      <CardContent className="p-0">
        {/* View mobile - cards */}
        <div className="block md:hidden p-4 space-y-3">
          {contas.map((conta) => (
            <div
              key={conta.id}
              className={`border rounded-lg p-4 space-y-3 transition-colors ${
                isOverdue(conta) 
                  ? 'bg-red-50/30 border-red-200' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Header do card móvel */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">
                    {conta.description}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(conta)}
                      <span className={`text-sm ${
                        isOverdue(conta) 
                          ? 'text-red-700 font-medium' 
                          : 'text-gray-600'
                      }`}>
                        {format(new Date(conta.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    {getStatusBadge(conta.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(conta.amount)}
                  </div>
                </div>
              </div>

              {/* Informações adicionais */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {(conta.contact?.name || conta.customer_name) && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Pagador</div>
                    <div className="text-gray-900 font-medium">
                      {conta.contact?.name || conta.customer_name}
                    </div>
                  </div>
                )}
                {conta.category && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Categoria</div>
                    <div className="flex items-center gap-1">
                      {conta.category.color && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: conta.category.color }}
                        />
                      )}
                      <span className="text-gray-900 font-medium">{conta.category.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ações mobile */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(conta)}
                  className="flex-1 min-w-0 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(conta)}
                  className="flex-1 min-w-0 text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                
                {canReceive(conta) && (
                  <Button
                    size="sm"
                    onClick={() => onReceive(conta)}
                    className={`flex-1 min-w-0 text-xs ${
                      isOverdue(conta) 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    } text-white`}
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    Receber
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(conta)}
                  className="w-auto px-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View desktop - tabela */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="font-semibold text-gray-700">Vencimento</TableHead>
                <TableHead className="font-semibold text-gray-700">Descrição</TableHead>
                <TableHead className="font-semibold text-gray-700">Pagador</TableHead>
                <TableHead className="font-semibold text-gray-700">Categoria</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Valor</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center w-64">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.map((conta) => {
                const isVencida = isOverdue(conta);
                const podeReceber = canReceive(conta);
                
                // Log para debug de cada conta
                console.log(`Conta ${conta.id} - Status: ${conta.status}, Vencida: ${isVencida}, Pode receber: ${podeReceber}`);
                
                return (
                  <TableRow 
                    key={conta.id} 
                    className={`hover:bg-gray-50/80 transition-colors border-gray-100 ${
                      isVencida ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(conta)}
                        <span className={`text-sm ${isVencida ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                          {format(new Date(conta.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">
                          {conta.description}
                        </p>
                        {conta.reference_document && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            Doc: {conta.reference_document}
                          </p>
                        )}
                        {conta.notes && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {conta.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <span className="text-sm text-gray-700">
                        {conta.customer_name || conta.contact?.name || '-'}
                      </span>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      {conta.category ? (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: conta.category.color || '#6b7280' }}
                          />
                          <span className="text-sm text-gray-700 truncate">
                            {conta.category.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(conta.amount)}
                      </span>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      {getStatusBadge(isVencida ? 'overdue' : conta.status)}
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(conta)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(conta)}
                          className="h-8 w-8 p-0 hover:bg-green-100 text-green-600 hover:text-green-700"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(conta)}
                          className="h-8 w-8 p-0 hover:bg-red-100 text-red-600 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {podeReceber && onReceive && (
                          <div 
                            onClick={() => onReceive(conta)}
                            className="cursor-pointer bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium px-3 py-1 text-xs ml-2 rounded-full inline-flex items-center"
                            title={isVencida ? 'Baixar conta vencida' : 'Baixar recebimento'}
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            BAIXAR
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
