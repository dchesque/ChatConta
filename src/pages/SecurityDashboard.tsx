import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Users, 
  Eye, 
  RefreshCw,
  TrendingUp,
  Clock,
  Ban,
  CheckCircle
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface SecurityMetrics {
  active_users: number;
  login_attempts: number;
  failed_logins: number;
  security_events: number;
  critical_events: number;
  error_rate: string;
  suspicious_activities: any[];
  last_updated: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export default function SecurityDashboard() {
  const { user, role, isAdmin } = useAuth();

  // Redirect if not admin
  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Query para métricas de segurança
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async (): Promise<SecurityMetrics> => {
      const { data, error } = await supabase.functions.invoke('security-metrics');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Query para eventos de segurança recentes
  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async (): Promise<SecurityEvent[]> => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });

  const getSeverityColor = (eventType: string) => {
    if (eventType.includes('unauthorized') || eventType.includes('critical')) {
      return 'destructive';
    }
    if (eventType.includes('failed') || eventType.includes('invalid')) {
      return 'secondary';
    }
    return 'default';
  };

  const getSeverityIcon = (eventType: string) => {
    if (eventType.includes('unauthorized') || eventType.includes('critical')) {
      return <Ban className="h-4 w-4" />;
    }
    if (eventType.includes('failed') || eventType.includes('invalid')) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Dashboard de Segurança" 
        subtitle="Monitoramento em tempo real da segurança do sistema"
        breadcrumb={[
          { label: 'Administração', href: '/administrador' },
          { label: 'Segurança', href: '/security-dashboard' }
        ]}
        actions={
          <Button 
            onClick={() => {
              refetchMetrics();
              window.location.reload();
            }}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        }
      />

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {metricsLoading ? '...' : metrics?.active_users || 0}
            </div>
            <p className="text-xs text-blue-600 mt-1">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-700 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Tentativas de Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {metricsLoading ? '...' : metrics?.login_attempts || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {metrics?.failed_logins || 0} falhas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Eventos de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {metricsLoading ? '...' : metrics?.security_events || 0}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {metrics?.critical_events || 0} críticos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Taxa de Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {metricsLoading ? '...' : metrics?.error_rate || '0.0'}%
            </div>
            <p className="text-xs text-purple-600 mt-1">Últimas 24 horas</p>
          </CardContent>
        </Card>
      </div>

      {/* Eventos de segurança recentes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Eventos de Segurança Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : securityEvents && securityEvents.length > 0 ? (
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getSeverityColor(event.event_type)} className="flex items-center gap-1">
                      {getSeverityIcon(event.event_type)}
                      {formatEventType(event.event_type)}
                    </Badge>
                    <div className="text-sm">
                      <div className="font-medium">
                        {event.ip_address} 
                        {event.user_id && ` (User: ${event.user_id.slice(0, 8)}...)`}
                      </div>
                      {event.user_agent && (
                        <div className="text-gray-500 text-xs truncate max-w-md">
                          {event.user_agent}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {new Date(event.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum evento de segurança recente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atividades suspeitas */}
      {metrics?.suspicious_activities && metrics.suspicious_activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Atividades Suspeitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.suspicious_activities.map((activity, index) => (
                <Alert key={index} className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>{formatEventType(activity.event_type)}</strong>
                    <br />
                    IP: {activity.ip_address} - {new Date(activity.created_at).toLocaleString('pt-BR')}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 text-xs font-mono bg-red-100 p-2 rounded">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Última atualização */}
      <div className="flex justify-center pt-6 text-sm text-gray-500">
        Última atualização: {metrics?.last_updated ? new Date(metrics.last_updated).toLocaleString('pt-BR') : 'Carregando...'}
      </div>
    </PageContainer>
  );
}