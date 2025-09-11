import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, Database, AlertTriangle, Info } from 'lucide-react';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { SubscriptionBadge } from './SubscriptionBadge';
export function StatusIndicators() {
  const {
    isOnline,
    isDemoMode,
    lastSync,
    appVersion
  } = useSystemStatus();
  return <TooltipProvider>
      <div className="flex items-center space-x-2">
        {/* Badge de Assinatura */}
        <SubscriptionBadge />
        
        {/* Status Online/Offline */}
        <Tooltip>
          <TooltipTrigger asChild>
            
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOnline ? 'Conectado à internet' : 'Sem conexão com a internet'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Modo Demo */}
        {isDemoMode && <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center space-x-1 bg-orange-100 border-orange-300 text-orange-700">
                <AlertTriangle className="w-3 h-3" />
                <span>Demo</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Modo demonstração ativo - dados simulados</p>
            </TooltipContent>
          </Tooltip>}

        {/* Última Sincronização */}
        {lastSync && <Tooltip>
            <TooltipTrigger asChild>
              
            </TooltipTrigger>
            <TooltipContent>
              <p>Última sincronização: {lastSync}</p>
            </TooltipContent>
          </Tooltip>}

        {/* Versão do App */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="flex items-center space-x-1">
              
              
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Versão do sistema: {appVersion}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>;
}