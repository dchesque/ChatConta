import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StripeConfig } from '@/services/systemConfigService';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Settings,
  Zap
} from 'lucide-react';

interface StripeStatusIndicatorProps {
  config: StripeConfig | null;
  onSync?: () => void;
  onToggle?: () => void;
  syncing?: boolean;
  disabled?: boolean;
}

export function StripeStatusIndicator({ 
  config, 
  onSync, 
  onToggle,
  syncing = false,
  disabled = false 
}: StripeStatusIndicatorProps) {
  
  const getConnectionStatus = () => {
    if (!config) {
      return {
        status: 'error',
        label: 'Erro',
        description: 'Não foi possível carregar configurações',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200'
      };
    }

    if (!config.enabled) {
      return {
        status: 'disabled',
        label: 'Desabilitado',
        description: 'Stripe não está habilitado',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200'
      };
    }

    if (config.enabled && config.products_synced && config.webhook_configured) {
      return {
        status: 'connected',
        label: 'Conectado',
        description: 'Totalmente configurado e funcional',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200'
      };
    }

    if (config.enabled && !config.products_synced) {
      return {
        status: 'warning',
        label: 'Configuração Incompleta',
        description: 'Produtos não sincronizados',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200'
      };
    }

    return {
      status: 'warning',
      label: 'Configuração Parcial',
      description: 'Algumas configurações estão pendentes',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    };
  };

  const statusInfo = getConnectionStatus();

  const getStatusIcon = () => {
    switch (statusInfo.status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'disabled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Nunca';
    
    try {
      const date = new Date(lastSync);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>Status do Stripe</span>
                {config?.environment && (
                  <Badge variant={config.environment === 'live' ? 'default' : 'secondary'}>
                    {config.environment === 'live' ? 'Produção' : 'Teste'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className={statusInfo.color}>
                {statusInfo.description}
              </CardDescription>
            </div>
          </div>
          
          <Badge 
            variant={statusInfo.status === 'connected' ? 'default' : 'secondary'}
            className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}
          >
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Detalhes de configuração */}
        {config && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stripe habilitado:</span>
                <div className="flex items-center space-x-1">
                  {config.enabled ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Sim</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Não</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Produtos sincronizados:</span>
                <div className="flex items-center space-x-1">
                  {config.products_synced ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Sim</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Não</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Webhook configurado:</span>
                <div className="flex items-center space-x-1">
                  {config.webhook_configured ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Sim</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Não</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Última sincronização:</span>
                <span className="text-foreground text-xs">
                  {formatLastSync(config.last_sync)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            {config?.enabled && onSync && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={syncing || disabled}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Dashboard Stripe</span>
            </Button>
          </div>

          {onToggle && (
            <Button
              variant={config?.enabled ? "destructive" : "default"}
              size="sm"
              onClick={onToggle}
              disabled={disabled}
              className="flex items-center space-x-2"
            >
              {config?.enabled ? (
                <>
                  <Settings className="w-4 h-4" />
                  <span>Desabilitar</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Habilitar</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Informações adicionais */}
        {config?.enabled && !config.products_synced && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Sincronização Necessária</p>
                <p className="text-yellow-700 mt-1">
                  Os produtos não foram sincronizados com o Stripe. Execute a sincronização para ativar os pagamentos.
                </p>
              </div>
            </div>
          </div>
        )}

        {!config?.enabled && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Settings className="w-4 h-4 text-gray-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-gray-800">Stripe Desabilitado</p>
                <p className="text-gray-700 mt-1">
                  O sistema está funcionando em modo manual. Habilite o Stripe para aceitar pagamentos automáticos.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}