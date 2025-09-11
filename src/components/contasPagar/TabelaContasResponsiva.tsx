import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ContaEnriquecida } from '@/types/contaPagar';
import { formatarMoeda, formatarData } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, Edit, DollarSign, Copy, Trash2, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface TabelaContasResponsivaProps {
  contas: ContaEnriquecida[];
  height: number;
  onVisualizar: (conta: ContaEnriquecida) => void;
  onEditar: (conta: ContaEnriquecida) => void;
  onBaixar: (conta: ContaEnriquecida) => void;
  onDuplicar: (conta: ContaEnriquecida) => void;
  onExcluir: (conta: ContaEnriquecida) => void;
  onPagar?: (conta: ContaEnriquecida) => void;
}

interface ItemRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    contas: ContaEnriquecida[];
    onVisualizar: (conta: ContaEnriquecida) => void;
    onEditar: (conta: ContaEnriquecida) => void;
    onBaixar: (conta: ContaEnriquecida) => void;
    onDuplicar: (conta: ContaEnriquecida) => void;
    onExcluir: (conta: ContaEnriquecida) => void;
    onPagar?: (conta: ContaEnriquecida) => void;
  };
}

const getStatusConfig = (status: string) => {
  const configs = {
    pendente: { color: 'bg-yellow-100/80 text-yellow-700', dot: 'bg-yellow-600', label: 'Pendente' },
    pago: { color: 'bg-green-100/80 text-green-700', dot: 'bg-green-600', label: 'Pago' },
    vencido: { color: 'bg-red-100/80 text-red-700', dot: 'bg-red-600', label: 'Vencido' },
    cancelado: { color: 'bg-gray-100/80 text-gray-700', dot: 'bg-gray-600', label: 'Cancelado' }
  };
  return configs[status as keyof typeof configs] || configs.pendente;
};

const getVencimentoIndicator = (conta: ContaEnriquecida) => {
  if (conta.status !== 'pendente') return null;
  
  if (conta.dias_em_atraso > 0) {
    return (
      <div className="flex items-center space-x-1 text-red-600">
        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium">{conta.dias_em_atraso}d atraso</span>
      </div>
    );
  }
  
  if (conta.dias_para_vencimento <= 7) {
    return (
      <div className="flex items-center space-x-1 text-orange-600">
        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
        <span className="text-xs font-medium">Vence em {conta.dias_para_vencimento}d</span>
      </div>
    );
  }
  
  return null;
};

const ItemRow: React.FC<ItemRowProps> = ({ index, style, data }) => {
  const { contas, onVisualizar, onEditar, onBaixar, onDuplicar, onExcluir, onPagar } = data;
  const conta = contas[index];
  const statusConfig = getStatusConfig(conta.status);
  const vencimentoIndicator = getVencimentoIndicator(conta);

  return (
    <div style={style} className="px-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <div className="py-4 grid grid-cols-12 gap-4 items-center">
        {/* Status e Descrição */}
        <div className="col-span-4">
          <div className="flex items-start space-x-3">
            <Badge className={`${statusConfig.color} border-none`}>
              <div className={`w-2 h-2 ${statusConfig.dot} rounded-full mr-2`}></div>
              {statusConfig.label}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">{conta.descricao}</div>
              <div className="text-sm text-gray-500 truncate">{conta.fornecedor_nome}</div>
              {vencimentoIndicator}
            </div>
          </div>
        </div>

        {/* Data Vencimento */}
        <div className="col-span-2 text-sm text-gray-600">
          {formatarData(conta.data_vencimento)}
        </div>

        {/* Valor */}
        <div className="col-span-2 text-sm font-medium text-gray-900">
          {formatarMoeda(conta.valor_final)}
        </div>

        {/* Parcelas */}
        <div className="col-span-1 text-sm text-gray-600">
          {conta.parcela_atual}/{conta.total_parcelas}
        </div>

        {/* Forma Pagamento */}
        <div className="col-span-2 text-sm text-gray-600 capitalize">
          {conta.forma_pagamento?.replace('_', ' ') || 'N/A'}
        </div>

        {/* Ações */}
        <div className="col-span-1 flex justify-end items-center space-x-2">
          {/* Botão Pagar Inline */}
          {conta.status === 'pendente' && onPagar && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPagar(conta)}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 h-7 px-2"
            >
              <Check className="w-3 h-3 mr-1" />
              Pagar
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onVisualizar(conta)} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditar(conta)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {conta.status === 'pendente' && (
                <DropdownMenuItem onClick={() => onBaixar(conta)} className="cursor-pointer">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Baixar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicar(conta)} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onExcluir(conta)} 
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export const TabelaContasResponsiva: React.FC<TabelaContasResponsivaProps> = ({
  contas,
  height,
  onVisualizar,
  onEditar,
  onBaixar,
  onDuplicar,
  onExcluir,
  onPagar
}) => {
  const itemData = useMemo(() => ({
    contas,
    onVisualizar,
    onEditar,
    onBaixar,
    onDuplicar,
    onExcluir,
    onPagar
  }), [contas, onVisualizar, onEditar, onBaixar, onDuplicar, onExcluir, onPagar]);

  if (contas.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium">Nenhuma conta encontrada</div>
          <div className="text-sm">Tente ajustar os filtros ou adicionar novas contas</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
      {/* Header fixo */}
      <div className="bg-gray-50/80 border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-4">Conta / Fornecedor</div>
          <div className="col-span-2">Vencimento</div>
          <div className="col-span-2">Valor</div>
          <div className="col-span-1">Parcela</div>
          <div className="col-span-2">Pagamento</div>
          <div className="col-span-1 text-right">Ações</div>
        </div>
      </div>

      {/* Lista virtualizada */}
      <List
        height={height - 60} // Descontar header
        width="100%"
        itemCount={contas.length}
        itemSize={80} // Altura de cada linha
        itemData={itemData}
      >
        {ItemRow}
      </List>
    </div>
  );
};