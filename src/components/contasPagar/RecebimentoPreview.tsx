import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AccountReceivable, RECEIVABLE_STATUS_LABELS, RECEIVABLE_STATUS_COLORS } from '@/types/accounts';
import { Pagador } from '@/hooks/usePagadores';
import { User, Building2, Calendar, CreditCard, Eye, Edit3, Trash2 } from 'lucide-react';
import { formatarMoedaExibicao } from '@/utils/masks';

interface RecebimentoPreviewProps {
  conta: Partial<AccountReceivable>;
  pagador?: Pagador | null;
  categoria?: { id: string; nome?: string; name?: string; cor?: string; color?: string } | null;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const RecebimentoPreview: React.FC<RecebimentoPreviewProps> = ({
  conta,
  pagador,
  categoria,
  onEdit,
  onView,
  onDelete,
  className = ''
}) => {
  if (!conta.description) {
    return (
      <Card className={`card-base p-6 ${className}`}>
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Preview do Recebimento</h3>
          <p className="text-gray-500">Preencha os dados para visualizar o preview</p>
        </div>
      </Card>
    );
  }

  const status = conta.status || 'pending';

  return (
    <Card className={`card-base ${className}`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {conta.description}
            </h3>
            <Badge className={RECEIVABLE_STATUS_COLORS[status as keyof typeof RECEIVABLE_STATUS_COLORS]}>
              {RECEIVABLE_STATUS_LABELS[status as keyof typeof RECEIVABLE_STATUS_LABELS]}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Pagador */}
        {pagador && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Pagador</h4>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {pagador.tipo === 'pessoa_fisica' ? (
                <User className="w-4 h-4 text-blue-600" />
              ) : (
                <Building2 className="w-4 h-4 text-purple-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">{pagador.nome}</p>
                <p className="text-sm text-gray-500">{pagador.documento}</p>
              </div>
            </div>
          </div>
        )}

        {/* Categoria */}
        {categoria && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Categoria</h4>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: categoria.cor || categoria.color || '#6B7280' }}
              />
              <span className="font-medium text-gray-900">{categoria.nome || categoria.name}</span>
            </div>
          </div>
        )}

        {/* Valores */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Valores</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Valor</p>
              <p className="text-lg font-semibold text-green-600">
                {formatarMoedaExibicao(conta.amount || 0)}
              </p>
            </div>
            
            {status === 'received' && conta.received_at && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Data Recebimento</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(conta.received_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Datas */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Datas</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Vencimento</p>
                <p className="font-medium">
                  {conta.due_date ? new Date(conta.due_date).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        {conta.notes && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Observações</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {conta.notes}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};