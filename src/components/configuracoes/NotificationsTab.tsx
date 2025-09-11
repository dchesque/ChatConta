import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Check, CheckCheck, X, Filter, RefreshCw, Phone, Mail, Save } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationFilters, NOTIFICATION_CONFIGS } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface ConfiguracoesNotificacao {
  whatsapp_conta_vencer: boolean;
  whatsapp_conta_vencida: boolean;
  whatsapp_resumo_diario: boolean;
  whatsapp_resumo_semanal: boolean;
  email_backup: boolean;
  email_relatorios: boolean;
}

export function NotificationsTab() {
  // Configurações de notificação
  const [notificacoes, setNotificacoes] = useState<ConfiguracoesNotificacao>({
    whatsapp_conta_vencer: true,
    whatsapp_conta_vencida: true,
    whatsapp_resumo_diario: false,
    whatsapp_resumo_semanal: true,
    email_backup: true,
    email_relatorios: false
  });

  const [filters, setFilters] = useState<NotificationFilters>({
    limit: 25,
    offset: 0
  });
  
  const { 
    notifications, 
    unreadCount, 
    stats, 
    isLoading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    dismiss,
    refresh 
  } = useNotifications(filters);
  
  const navigate = useNavigate();

  // Salvar configurações
  const salvarConfiguracoes = async () => {
    try {
      // Aqui seria a chamada para salvar as configurações no backend
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({ title: 'Sucesso', description: 'Configurações de notificação salvas com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar configurações', variant: 'destructive' });
    }
  };

  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const handleNotificationClick = (notification: any) => {
    if (['sent', 'pending'].includes(notification.status)) {
      markAsRead(notification.id);
    }
    
    // Navegar para a rota se existir
    const route = notification.data?.route;
    if (route) {
      navigate(route);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      default: return 'secondary';
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <X className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configurações de Notificação */}
      <Card className="glassmorphism-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Notificações WhatsApp</span>
          </CardTitle>
          <CardDescription>
            Configure quando e como receber notificações via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Contas próximas ao vencimento</Label>
              <p className="text-sm text-muted-foreground">
                Receba avisos 3 dias antes do vencimento
              </p>
            </div>
            <Switch
              checked={notificacoes.whatsapp_conta_vencer}
              onCheckedChange={(checked) => 
                setNotificacoes(prev => ({ ...prev, whatsapp_conta_vencer: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Contas vencidas</Label>
              <p className="text-sm text-muted-foreground">
                Receba avisos diários sobre contas em atraso
              </p>
            </div>
            <Switch
              checked={notificacoes.whatsapp_conta_vencida}
              onCheckedChange={(checked) => 
                setNotificacoes(prev => ({ ...prev, whatsapp_conta_vencida: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Resumo diário</Label>
              <p className="text-sm text-muted-foreground">
                Receba um resumo das movimentações do dia
              </p>
            </div>
            <Switch
              checked={notificacoes.whatsapp_resumo_diario}
              onCheckedChange={(checked) => 
                setNotificacoes(prev => ({ ...prev, whatsapp_resumo_diario: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Resumo semanal</Label>
              <p className="text-sm text-muted-foreground">
                Receba um resumo das movimentações da semana
              </p>
            </div>
            <Switch
              checked={notificacoes.whatsapp_resumo_semanal}
              onCheckedChange={(checked) => 
                setNotificacoes(prev => ({ ...prev, whatsapp_resumo_semanal: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glassmorphism-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Notificações Email</span>
          </CardTitle>
          <CardDescription>
            Configure as notificações que serão enviadas por email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Backup de dados</Label>
              <p className="text-sm text-muted-foreground">
                Receba confirmações de backup dos seus dados
              </p>
            </div>
            <Switch
              checked={notificacoes.email_backup}
              onCheckedChange={(checked) => 
                setNotificacoes(prev => ({ ...prev, email_backup: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Relatórios mensais</Label>
              <p className="text-sm text-muted-foreground">
                Receba relatórios financeiros por email
              </p>
            </div>
            <Switch
              checked={notificacoes.email_relatorios}
              onCheckedChange={(checked) => 
                setNotificacoes(prev => ({ ...prev, email_relatorios: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={salvarConfiguracoes} className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      {/* Header do histórico */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
            </p>
            <p className="text-sm text-muted-foreground">
              {notifications.length} notificações total
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
          {unreadCount > 0 && (
            <Button size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
                <div className="text-sm text-muted-foreground">Não lidas</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.bySeverity.error || 0}
                </div>
                <div className="text-sm text-muted-foreground">Críticas</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={filters.status || ''} 
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="sent">Enviadas</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="dismissed">Dispensadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={filters.type || ''} 
                onValueChange={(value) => handleFilterChange('type', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="bill_due_soon">Conta vencendo</SelectItem>
                  <SelectItem value="bill_overdue">Conta vencida</SelectItem>
                  <SelectItem value="trial_expiring">Trial expirando</SelectItem>
                  <SelectItem value="payment_failed">Falha pagamento</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severidade</Label>
              <Select 
                value={filters.severity || ''} 
                onValueChange={(value) => handleFilterChange('severity', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Limpar filtros</Label>
              <Button 
                variant="outline" 
                onClick={() => setFilters({ limit: 25, offset: 0 })}
                className="w-full"
              >
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>
            {notifications.length} notificações encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton lines={5} height="h-20" type="list" />
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação encontrada</p>
              <p className="text-sm">As notificações aparecem aqui quando ações são necessárias</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const config = NOTIFICATION_CONFIGS[notification.type];
                const isUnread = ['sent', 'pending'].includes(notification.status);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      getSeverityColor(notification.severity)
                    } ${isUnread ? 'border-l-4 border-l-primary' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">
                          {config?.icon || '📬'}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {notification.title}
                            </h3>
                            {isUnread && (
                              <Badge variant="secondary" className="text-xs">
                                Nova
                              </Badge>
                            )}
                            <Badge variant={getSeverityBadgeVariant(notification.severity)} className="text-xs">
                              {notification.severity}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                            <span className="capitalize">
                              {notification.type.replace('_', ' ')}
                            </span>
                            <span className="capitalize">
                              {notification.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            title="Marcar como lida"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(notification.id);
                          }}
                          title="Dispensar"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}