import { UserProfile } from '@/types/userProfile';
import { differenceInDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export const checkPlanNotifications = (userProfile?: UserProfile | null) => {
  if (!userProfile) return;

  // Verificar trial expirando
  if (userProfile.plan === 'trial' && userProfile.trial_ends_at) {
    const daysLeft = differenceInDays(new Date(userProfile.trial_ends_at), new Date());
    
    if (daysLeft <= 3 && daysLeft > 0) {
      toast({
        title: `Seu trial expira em ${daysLeft} dias`,
        description: 'Considere fazer upgrade para continuar usando todos os recursos',
        variant: 'destructive'
      });
    }
    
    if (daysLeft <= 0) {
      toast({
        title: 'Seu trial expirou!',
        description: 'Faça upgrade para continuar usando todos os recursos',
        variant: 'destructive'
      });
    }
  }
  
  // Verificar limites próximos para plano free
  if (userProfile.plan === 'free') {
    // Mock: calcular uso atual (em produção, viria do backend)
    const mockUsage = calculateMockUsage(userProfile);
    
    Object.entries(mockUsage).forEach(([feature, percentage]) => {
      if (percentage > 80) {
        toast({
          title: `Você está próximo do limite de ${feature}`,
          description: `${percentage.toFixed(0)}% do limite utilizado. Considere fazer upgrade.`
        });
      }
    });
  }
};

// Mock function para calcular uso atual
const calculateMockUsage = (userProfile: UserProfile): Record<string, number> => {
  // Em produção, isso viria de consultas reais ao banco
  const array = new Uint32Array(3);
  crypto.getRandomValues(array);
  
  return {
    contas_pagar: (array[0] / (0xFFFFFFFF + 1)) * 100,
    fornecedores: (array[1] / (0xFFFFFFFF + 1)) * 100,
    categorias: (array[2] / (0xFFFFFFFF + 1)) * 100
  };
};

export const showUpgradePrompt = (feature: string, description?: string) => {
  toast({
    title: `Recurso ${feature} indisponível`,
    description: description || 'Este recurso está disponível apenas para planos superiores',
    variant: 'destructive'
  });
};

export const showLimitReached = (feature: string, current: number, limit: number) => {
  toast({
    title: `Limite atingido: ${feature}`,
    description: `Você atingiu o limite de ${limit} ${feature}. Atual: ${current}/${limit}`,
    variant: 'destructive'
  });
};