import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { useMovimentacoesRecentes } from '@/hooks/useMovimentacoesRecentes';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MovimentacoesTable() {
  const { movimentacoes, loading } = useMovimentacoesRecentes();

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg">
        <div className="p-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3 p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50">
        <h3 className="text-lg font-semibold text-gray-900">Últimas Movimentações</h3>
        <p className="text-xs text-gray-600 mt-1">Últimas transações registradas no sistema</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="px-8 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fornecedor</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Valor</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-card divide-y divide-border">
            {movimentacoes.slice(0, 8).map((movimentacao) => (
              <TableRow key={movimentacao.id} className="hover:bg-muted/30 transition-colors duration-150">
                <TableCell className="px-8 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {format(movimentacao.data, 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {movimentacao.fornecedor}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate" title={movimentacao.descricao}>
                  {movimentacao.descricao}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-foreground">
                  R$ {movimentacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={movimentacao.status as "pendente" | "pago" | "vencido"} />
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}