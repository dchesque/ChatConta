
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { logService } from '@/services/logService';

export interface SubscriptionData {
  status: 'trial' | 'premium' | 'inactive' | 'admin';
  trialDaysLeft?: number;
  premiumExpiresAt?: string;
  role?: string;
}

export function useSubscriptionStatus() {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    status: 'trial',
    trialDaysLeft: 7,
    role: 'user'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Verificar se é admin através dos metadados do usuário ou role
        const userRole = user.user_metadata?.role || 'user';
        
        if (userRole === 'admin') {
          setSubscriptionData({
            status: 'admin',
            role: 'admin'
          });
          setLoading(false);
          return;
        }

        // Aqui você pode implementar a lógica real para buscar dados de assinatura
        // Por exemplo, chamando a API do Supabase ou um edge function
        
        // Por enquanto, vou simular alguns cenários baseados no email do usuário
        const email = user.email || '';
        
        if (email.includes('admin')) {
          setSubscriptionData({
            status: 'admin',
            role: 'admin'
          });
        } else if (email.includes('premium')) {
          setSubscriptionData({
            status: 'premium',
            premiumExpiresAt: '2024-12-31',
            role: 'user'
          });
        } else if (email.includes('inactive')) {
          setSubscriptionData({
            status: 'inactive',
            role: 'user'
          });
        } else {
          // Trial padrão
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 7);
          
          const today = new Date();
          const diffTime = trialEndDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          setSubscriptionData({
            status: 'trial',
            trialDaysLeft: Math.max(0, diffDays),
            role: 'user'
          });
        }
        
      } catch (error) {
        logService.logError(error, 'useSubscriptionStatus.fetchSubscriptionData');
        setSubscriptionData({
          status: 'inactive',
          role: 'user'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  return {
    subscriptionData,
    loading,
    refetch: () => {
      setLoading(true);
      // Re-trigger o effect
    }
  };
}
