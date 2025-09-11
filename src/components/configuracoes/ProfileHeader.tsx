import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function ProfileHeader() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100/80 text-green-700 border-green-200';
      case 'trial':
        return 'bg-blue-100/80 text-blue-700 border-blue-200';
      case 'expired':
        return 'bg-red-100/80 text-red-700 border-red-200';
      default:
        return 'bg-gray-100/80 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Premium';
      case 'trial':
        return 'Trial';
      case 'expired':
        return 'Expirado';
      default:
        return 'Gratuito';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              Plano {profile?.plan === 'premium' ? 'Premium' : profile?.plan === 'trial' ? 'Trial' : 'Gratuito'}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(profile?.subscription_status || 'inactive')}>
                {getStatusText(profile?.subscription_status || 'inactive')}
              </Badge>
              {profile?.trial_ends_at && profile?.subscription_status === 'active' && (
                <span className="text-sm text-muted-foreground">
                  Trial até {new Date(profile.trial_ends_at).toLocaleDateString('pt-BR')}
                </span>
              )}
              {profile?.subscription_ends_at && profile?.subscription_status === 'active' && (
                <span className="text-sm text-muted-foreground">
                  Renovação em {new Date(profile.subscription_ends_at).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate('/assinatura')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Crown className="w-4 h-4 mr-2" />
          Gerenciar Assinatura
        </Button>
      </div>
    </div>
  );
}