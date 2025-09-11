import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface KPICardProps {
  titulo: string;
  valor: string;
  variacao?: {
    valor: string;
    tipo: 'positiva' | 'negativa' | 'neutra';
  };
  subtitulo?: string;
  detalhes?: string[];
  status?: 'saudavel' | 'atencao' | 'critico';
  icone: ReactNode;
  gradiente: string;
}

export function KPICard({ 
  titulo, 
  valor, 
  variacao, 
  subtitulo, 
  detalhes, 
  status, 
  icone, 
  gradiente 
}: KPICardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'saudavel': return 'text-green-600 bg-green-100/80';
      case 'atencao': return 'text-orange-600 bg-orange-100/80';
      case 'critico': return 'text-red-600 bg-red-100/80';
      default: return 'text-gray-600 bg-gray-100/80';
    }
  };

  const getVariacaoIcon = () => {
    switch (variacao?.tipo) {
      case 'positiva': return <TrendingUp className="w-3 h-3" />;
      case 'negativa': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const getVariacaoColor = () => {
    switch (variacao?.tipo) {
      case 'positiva': return 'text-green-600';
      case 'negativa': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-lg transition-all duration-200 hover:bg-white/85">
      <CardContent className="p-6">
        {/* Header com ícone e status */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradiente}`}>
            <div className="text-white">
              {icone}
            </div>
          </div>
          
          {status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {status === 'saudavel' && '✅ Saudável'}
              {status === 'atencao' && '⚠️ Atenção'}
              {status === 'critico' && '🚨 Crítico'}
            </span>
          )}
        </div>

        {/* Título */}
        <h3 className="text-sm font-medium text-gray-600 mb-1">{titulo}</h3>

        {/* Valor principal */}
        <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{valor}</p>

        {/* Subtítulo */}
        {subtitulo && (
          <p className="text-sm text-gray-600 mb-2">{subtitulo}</p>
        )}

        {/* Variação */}
        {variacao && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getVariacaoColor()}`}>
            {getVariacaoIcon()}
            <span>{variacao.valor}</span>
          </div>
        )}

        {/* Detalhes */}
        {detalhes && detalhes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <div className="space-y-1">
              {detalhes.map((detalhe, index) => (
                <p key={index} className="text-xs text-gray-600">{detalhe}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}