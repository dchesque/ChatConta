import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BadgeFiltroLoteProps {
  quantidadeParcelas: number;
  loteId: string;
  onVerTodas: () => void;
  onLimpar: () => void;
}

export const BadgeFiltroLote: React.FC<BadgeFiltroLoteProps> = ({
  quantidadeParcelas,
  loteId,
  onVerTodas,
  onLimpar
}) => {
  return (
    <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🆕</div>
          <div>
            <h3 className="font-semibold text-blue-800">
              Filtro Ativo: Lote Recém-Criado
            </h3>
            <p className="text-sm text-blue-600">
              Mostrando {quantidadeParcelas} parcelas criadas
            </p>
            <p className="text-xs text-blue-500 mt-1">
              Lote ID: #{loteId.substring(0, 8)}...
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={onVerTodas}
            variant="outline"
            size="sm"
            className="bg-white/80 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Ver Todas as Contas
          </Button>
          
          <Button
            onClick={onLimpar}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};