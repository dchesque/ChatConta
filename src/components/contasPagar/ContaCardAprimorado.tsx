import { useState } from 'react';
import { MoreVertical, Edit, CheckCircle, Trash2, AlertTriangle, Clock, Copy, History, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatarMoeda, formatarData } from '@/utils/formatters';
import { ContaEnriquecida } from '@/hooks/useContasPagar';

interface ContaCardAprimoradoProps {
  conta: ContaEnriquecida;
  onVisualizar: (conta: ContaEnriquecida) => void;
  onEditar: (conta: ContaEnriquecida) => void;
  onBaixar: (conta: ContaEnriquecida) => void;
  onDuplicar: (conta: ContaEnriquecida) => void;
  onExcluir: (conta: ContaEnriquecida) => void;
  onCancelar?: (conta: ContaEnriquecida) => void;
  onVerHistorico?: (conta: ContaEnriquecida) => void;
}

const getStatusVariant = (status: string) => {
  const variants = {
    pendente: 'bg-yellow-100/80 text-yellow-700',
    pago: 'bg-green-100/80 text-green-700',
    vencido: 'bg-red-100/80 text-red-700',
    cancelado: 'bg-gray-100/80 text-gray-700'
  };
  return variants[status as keyof typeof variants] || variants.pendente;
};

const getStatusIcon = (status: string) => {
  const icons = {
    pendente: <Clock className="w-3 h-3 mr-1" />,
    pago: <CheckCircle className="w-3 h-3 mr-1" />,
    vencido: <AlertTriangle className="w-3 h-3 mr-1" />,
    cancelado: <Ban className="w-3 h-3 mr-1" />
  };
  return icons[status as keyof typeof icons] || icons.pendente;
};

const getStatusLabel = (status: string) => {
  const labels = {
    pendente: 'Pendente',
    pago: 'Pago',
    vencido: 'Vencido',
    cancelado: 'Cancelado'
  };
  return labels[status as keyof typeof labels] || 'Pendente';
};

export const ContaCardAprimorado = ({ 
  conta, 
  onBaixar, 
  onEditar, 
  onExcluir, 
  onVisualizar,
  onDuplicar,
  onCancelar,
  onVerHistorico
}: ContaCardAprimoradoProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  return (
    <Card 
      className={cn(
        "transition-all duration-200 cursor-pointer group",
        "hover:shadow-lg",
        conta.destacar && "ring-2 ring-blue-500 shadow-lg bg-blue-50/50",
        conta.status === 'vencido' && "border-l-4 border-l-red-500",
        conta.status === 'pendente' && conta.dias_para_vencimento <= 7 && "border-l-4 border-l-yellow-500"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onVisualizar(conta)}
    >
      <CardContent className="p-6">
        {/* Header com animação */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {conta.descricao}
              </h3>
              
              {/* Badge de status com animação */}
              <Badge 
                className={cn(
                  "transition-all duration-200",
                  getStatusVariant(conta.status)
                )}
              >
                {getStatusIcon(conta.status)}
                {getStatusLabel(conta.status)}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600">{conta.fornecedor.nome}</p>
            {conta.documento_referencia && (
              <p className="text-xs text-gray-500 mt-1">Ref: {conta.documento_referencia}</p>
            )}
          </div>
          
          {/* Botão de ações com animação */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className={cn(
                "transition-all duration-200",
                isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            
            {/* Menu de ações com animação */}
            {showActions && (
              <div className="absolute right-0 top-8 z-10 w-48 bg-white rounded-lg shadow-lg border animate-in slide-in-from-top-2 duration-200">
                <div className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditar(conta);
                      setShowActions(false);
                    }}
                    className="w-full justify-start hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  
                  {conta.status === 'pendente' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBaixar(conta);
                        setShowActions(false);
                      }}
                      className="w-full justify-start hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicar(conta);
                      setShowActions(false);
                    }}
                    className="w-full justify-start hover:bg-blue-50"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar
                  </Button>
                  
                  {onVerHistorico && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVerHistorico(conta);
                        setShowActions(false);
                      }}
                      className="w-full justify-start hover:bg-gray-50"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Histórico
                    </Button>
                  )}
                  
                  {onCancelar && (conta.status === 'pendente' || conta.status === 'vencido') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelar(conta);
                        setShowActions(false);
                      }}
                      className="w-full justify-start hover:bg-orange-50 text-orange-600"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                  
                  <hr className="my-1" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExcluir(conta);
                      setShowActions(false);
                    }}
                    className="w-full justify-start hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Valor com animação de contagem */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {formatarMoeda(conta.valor_final)}
          </div>
          <div className="text-sm text-gray-500">
            Vencimento: {formatarData(conta.data_vencimento)}
          </div>
        </div>
        
        {/* Indicadores visuais */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {conta.dias_para_vencimento <= 0 && conta.status === 'pendente' && (
              <div className="flex items-center text-red-600 text-sm animate-pulse">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {Math.abs(conta.dias_para_vencimento)} dias em atraso
              </div>
            )}
            
            {conta.dias_para_vencimento > 0 && conta.dias_para_vencimento <= 7 && conta.status === 'pendente' && (
              <div className="flex items-center text-yellow-600 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                Vence em {conta.dias_para_vencimento} dias
              </div>
            )}
            
            {conta.status === 'pago' && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Pago em {conta.data_pagamento ? formatarData(conta.data_pagamento) : 'N/A'}
              </div>
            )}
          </div>
          
          {/* Progress bar para vencimento */}
          {conta.status === 'pendente' && (
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  conta.dias_para_vencimento <= 0 ? "bg-red-500" :
                  conta.dias_para_vencimento <= 7 ? "bg-yellow-500" :
                  "bg-green-500"
                )}
                style={{
                  width: `${Math.max(10, Math.min(100, 100 - (conta.dias_para_vencimento * 3)))}%`
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};