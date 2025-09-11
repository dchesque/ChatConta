import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Clock, CheckCircle } from 'lucide-react';

export const PlanBadge = () => {
  const { plan, daysRemaining, isPremium, isTrial } = useSubscription();
  
  if (isPremium) {
    return (
      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
        <Crown className="w-3 h-3 mr-1" />
        Premium
      </Badge>
    );
  }
  
  if (isTrial) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
        <Clock className="w-3 h-3 mr-1" />
        Trial - {daysRemaining}d
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
      <CheckCircle className="w-3 h-3 mr-1" />
      Grátis
    </Badge>
  );
};