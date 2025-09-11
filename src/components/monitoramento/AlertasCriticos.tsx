import React from 'react';
import { AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertaCritico } from '@/hooks/usePerformanceAvancadoMelhorado';

interface AlertasCriticosProps {
  alertas: AlertaCritico[];
  onResolverAlerta: (alertaId: string) => void;
}

export function AlertasCriticos({ alertas, onResolverAlerta }: AlertasCriticosProps) {
  const alertasAtivos = alertas.filter(a => !a.resolvido);
  const alertasResolvidos = alertas.filter(a => a.resolvido);

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case 'critica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeveridadeIcon = (severidade: string) => {
    switch (severidade) {
      case 'critica':
      case 'alta':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatarTempo = (timestamp: string) => {
    const agora = new Date();
    const tempo = new Date(timestamp);
    const diff = agora.getTime() - tempo.getTime();
    
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    
    if (horas > 0) {
      return `há ${horas}h${minutos % 60 > 0 ? ` ${minutos % 60}min` : ''}`;
    }
    return `há ${minutos} min`;
  };

  if (alertas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Sistema Operacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Nenhum alerta crítico detectado. Todos os sistemas estão funcionando normalmente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas Ativos */}
      {alertasAtivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Alertas Críticos ({alertasAtivos.length})
              </div>
              <Badge variant="destructive">
                {alertasAtivos.filter(a => a.severidade === 'critica').length} Críticos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertasAtivos.map((alerta) => (
              <div
                key={alerta.id}
                className="flex items-start justify-between p-4 border rounded-lg bg-gradient-to-r from-red-50 to-transparent border-red-200"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full ${getSeveridadeColor(alerta.severidade)} text-white`}>
                    {getSeveridadeIcon(alerta.severidade)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline"
                        className={`${getSeveridadeColor(alerta.severidade)} text-white border-transparent`}
                      >
                        {alerta.severidade.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">
                        {alerta.tipo}
                      </Badge>
                    </div>
                    
                    <p className="font-medium text-gray-900 mb-1">
                      {alerta.mensagem}
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      {formatarTempo(alerta.timestamp)}
                    </p>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onResolverAlerta(alerta.id)}
                  className="ml-4"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Resolver
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alertas Resolvidos Recentes */}
      {alertasResolvidos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Alertas Resolvidos Recentemente ({alertasResolvidos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertasResolvidos.slice(0, 5).map((alerta) => (
              <div
                key={alerta.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 line-through decoration-green-500">
                      {alerta.mensagem}
                    </p>
                    <p className="text-sm text-gray-600">
                      Resolvido {formatarTempo(alerta.timestamp)}
                    </p>
                  </div>
                </div>
                
                <Badge className="bg-green-500 text-white">
                  Resolvido
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}