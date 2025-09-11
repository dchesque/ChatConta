import React from 'react';
import { formatarMoeda, formatarData } from '@/lib/formatacaoBrasileira';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MetricaProps {
  label: string;
  valor: string | number;
  formato?: 'numero' | 'moeda' | 'data';
}

interface AcaoProps {
  icone: React.ReactNode;
  label: string;
  onClick: () => void;
  cor?: 'primary' | 'secondary' | 'danger';
}

interface CardCadastroProps {
  titulo: string;
  icone: React.ReactNode;
  cor: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  descricao: string;
  ativo: boolean;
  dataAtualizacao?: string;
  acoes: AcaoProps[];
  metricas?: MetricaProps[];
  className?: string;
}

export function CardCadastro({
  titulo,
  icone,
  cor,
  descricao,
  ativo,
  dataAtualizacao,
  acoes,
  metricas,
  className
}: CardCadastroProps) {
  const coresGradiente = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  const formatarValor = (valor: string | number, formato?: string) => {
    switch (formato) {
      case 'moeda':
        return formatarMoeda(Number(valor));
      case 'data':
        return formatarData(valor as string);
      case 'numero':
        return Number(valor).toLocaleString('pt-BR');
      default:
        return valor;
    }
  };

  return (
    <div className={cn(
      "bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6",
      "shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300",
      "group",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={cn(
            "w-12 h-12 bg-gradient-to-r rounded-xl flex items-center justify-center shadow-lg flex-shrink-0",
            coresGradiente[cor]
          )}>
            {React.cloneElement(icone as React.ReactElement, {
              className: "w-6 h-6 text-white"
            })}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {titulo}
            </h3>
            <p className="text-sm text-gray-600 truncate">{descricao}</p>
          </div>
        </div>
        
        <Badge 
          variant={ativo ? "default" : "secondary"}
          className={cn(
            "flex-shrink-0",
            ativo 
              ? "bg-green-100/80 text-green-700 border-green-200" 
              : "bg-red-100/80 text-red-700 border-red-200"
          )}
        >
          {ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {/* Métricas */}
      {metricas && metricas.length > 0 && (
        <div className="border-t border-gray-200/50 pt-4 mb-4">
          <div className={cn(
            "grid gap-4",
            metricas.length === 1 ? "grid-cols-1" :
            metricas.length === 2 ? "grid-cols-2" :
            metricas.length === 3 ? "grid-cols-3" :
            "grid-cols-2"
          )}>
            {metricas.map((metrica, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-gray-500 mb-1">{metrica.label}</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatarValor(metrica.valor, metrica.formato)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer com ações */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <TooltipProvider>
          <div className="flex space-x-2">
            {acoes.map((acao, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    onClick={acao.onClick}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200 opacity-70 group-hover:opacity-100",
                      acao.cor === 'danger'
                        ? "text-red-600 hover:bg-red-50/80 hover:text-red-700"
                        : acao.cor === 'primary'
                        ? "text-blue-600 hover:bg-blue-50/80 hover:text-blue-700"
                        : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-700"
                    )}
                  >
                    {React.cloneElement(acao.icone as React.ReactElement, {
                      className: "w-4 h-4"
                    })}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{acao.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        
        {dataAtualizacao && (
          <span className="text-xs text-gray-500">
            {formatarData(dataAtualizacao)}
          </span>
        )}
      </div>
    </div>
  );
}