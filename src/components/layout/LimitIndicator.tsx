import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';

interface LimitIndicatorProps {
  feature: 'contas_pagar' | 'fornecedores' | 'categorias';
  current: number;
  className?: string;
}

export const LimitIndicator = ({ feature, current, className = '' }: LimitIndicatorProps) => {
  const { limits, getUsagePercentage, getRemainingItems, isFeatureBlocked } = useSubscription();
  
  const limit = limits[feature] as number;
  const percentage = getUsagePercentage(feature, current);
  const isBlocked = isFeatureBlocked(feature, current);
  
  // Não mostrar para recursos ilimitados
  if (limit === -1) {
    return (
      <div className={`text-xs text-green-600 ${className}`}>
        <span>Ilimitado</span>
      </div>
    );
  }
  
  const getColorClass = () => {
    if (isBlocked) return 'bg-red-500';
    if (percentage > 80) return 'bg-orange-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          {getRemainingItems(feature, current)}
        </span>
        <span className={`font-medium ${
          isBlocked ? 'text-red-600' : 
          percentage > 80 ? 'text-orange-600' : 
          'text-muted-foreground'
        }`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-1" 
        style={{ 
          '--progress-foreground': isBlocked ? '#ef4444' : 
            percentage > 80 ? '#f97316' : 
            percentage > 60 ? '#eab308' : '#22c55e'
        } as React.CSSProperties}
      />
    </div>
  );
};