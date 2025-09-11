import { formatarMoeda } from '@/lib/formatacaoBrasileira';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  titulo: string;
  valor: number;
  valorAnterior?: number;
  formato: 'moeda' | 'numero' | 'percentual';
  icone: React.ReactNode;
  cor: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray' | 'indigo' | 'teal';
  trend?: 'up' | 'down' | 'neutral';
}

const backgroundColors = {
  blue: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20',
  green: 'bg-gradient-to-r from-green-500/20 to-green-600/20',
  red: 'bg-gradient-to-r from-red-500/20 to-red-600/20',
  orange: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20',
  purple: 'bg-gradient-to-r from-purple-500/20 to-purple-600/20',
  gray: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20',
  indigo: 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20',
  teal: 'bg-gradient-to-r from-teal-500/20 to-teal-600/20'
};

const formatarValor = (valor: number, formato: MetricCardProps['formato']) => {
  switch (formato) {
    case 'moeda':
      return formatarMoeda(valor);
    case 'percentual':
      return `${valor.toFixed(1)}%`;
    case 'numero':
    default:
      return valor.toLocaleString('pt-BR');
  }
};

export function MetricCard({ titulo, valor, formato, icone, cor }: MetricCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-lg hover:bg-white/85 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{titulo}</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatarValor(valor, formato)}
          </p>
        </div>
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${backgroundColors[cor]} flex-shrink-0`}>
          {icone}
        </div>
      </div>
    </div>
  );
}