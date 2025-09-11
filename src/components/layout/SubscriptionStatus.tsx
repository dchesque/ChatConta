
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Clock, AlertTriangle, User } from 'lucide-react';

interface SubscriptionStatusProps {
  expanded: boolean;
  mobile?: boolean;
}

export function SubscriptionStatus({ expanded, mobile = false }: SubscriptionStatusProps) {
  const navigate = useNavigate();
  const { loading, status, isPremium, isTrial, isExpired, daysRemaining, plan } = useSubscription();

  if (loading) {
    return (
      <div className={`mt-3 ${expanded || mobile ? 'px-4' : 'px-2'}`}>
        <div className="animate-pulse bg-gray-700/50 rounded-lg h-8"></div>
      </div>
    );
  }

  const getStatusConfig = () => {
    if (isPremium) {
      return {
        icon: Crown,
        label: daysRemaining > 0 
          ? `Premium Ativo - ${daysRemaining} dias`
          : 'Premium Ativo',
        bgColor: 'from-yellow-500/20 to-yellow-600/20',
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500/30'
      };
    }
    
    if (isTrial) {
      return {
        icon: Clock,
        label: `Período de Teste - ${daysRemaining} dias`,
        bgColor: 'from-blue-500/20 to-blue-600/20',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30'
      };
    }
    
    return {
      icon: AlertTriangle,
      label: 'Versão Gratuita',
      bgColor: 'from-gray-500/20 to-gray-600/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-500/30'
    };
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const handleStatusClick = () => {
    navigate('/assinatura');
  };

  // Versão colapsada (apenas ícone)
  if (!expanded && !mobile) {
    return (
      <div className="mt-3 px-2">
        <button
          onClick={handleStatusClick}
          className={`w-full flex items-center justify-center p-2 rounded-xl border transition-all duration-200 hover:scale-105 bg-gradient-to-r ${config.bgColor} ${config.borderColor} hover:shadow-lg group relative`}
        >
          <IconComponent className={`w-4 h-4 ${config.textColor}`} />
          
          {/* Tooltip para versão colapsada */}
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 border border-gray-700/50 shadow-xl">
            {config.label}
          </div>
        </button>
      </div>
    );
  }

  // Versão expandida
  return (
    <div className="mt-3 px-4">
      <button
        onClick={handleStatusClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r ${config.bgColor} ${config.borderColor} hover:shadow-lg group`}
      >
        <div className="flex items-center space-x-3">
          <IconComponent className={`w-4 h-4 ${config.textColor} flex-shrink-0`} />
          <span className={`text-sm font-medium ${config.textColor} truncate`}>
            {config.label}
          </span>
        </div>
        
        {/* Indicador de upgrade se não for premium */}
        {!isPremium && (
          <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Fazer Upgrade →
          </div>
        )}
      </button>
    </div>
  );
}
