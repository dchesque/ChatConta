import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
export function SubscriptionBadge() {
  const {
    getStatusBadge,
    loading
  } = useSubscription();
  if (loading) {
    return <Badge variant="outline" className="animate-pulse">
        Carregando...
      </Badge>;
  }
  const badge = getStatusBadge();
  return;
}