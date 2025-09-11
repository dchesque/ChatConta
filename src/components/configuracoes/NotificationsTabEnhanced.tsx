import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  Filter, 
  RefreshCw, 
  Phone, 
  Mail, 
  Save, 
  Settings,
  TestTube,
  Clock,
  Volume2,
  VolumeX,
  Info
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSettings } from '@/hooks/useSettings';
import { NotificationFilters, NOTIFICATION_CONFIGS } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { toast } from '@/hooks/use-toast';

interface NotificationPreferences {
  whatsapp_conta_vencer: boolean;
  whatsapp_conta_vencida: boolean;
  whatsapp_resumo_diario: boolean;
  whatsapp_resumo_semanal: boolean;
  email_backup: boolean;
  email_relatorios: boolean;
  horario_resumo_diario: string;
  dia_resumo_semanal: string;
  antecedencia_vencimento: number;
}

export function NotificationsTabEnhanced() {
  const { data: settings, updateLocal, save, isSaving } = useSettings();
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>({
    whatsapp_conta_vencer: true,
    whatsapp_conta_vencida: true,
    whatsapp_resumo_diario: false,
    whatsapp_resumo_semanal: true,
    email_backup: true,
    email_relatorios: false,
    horario_resumo_diario: '08:00',
    dia_resumo_semanal: 'monday',
    antecedencia_vencimento: 3
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

  // Carregar preferências do settings.extras
  useEffect(() => {
    if (settings?.extras?.notifications) {
      setLocalPreferences(prev => ({ ...prev, ...settings.extras.notifications }));
    }
  }, [settings]);

  // Salvar configurações gerais de notificação
  const handleGeneralNotificationChange = (key: string, value: boolean) => {
    updateLocal({ 
      notifications: { 
        ...settings?.notifications, 
        [key]: value 
      } 
    });
  };

  // Salvar preferências específicas
  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    const updated = { ...localPreferences, [key]: value };
    setLocalPreferences(updated);
    
    updateLocal({
      extras: {
        ...settings?.extras,
        notifications: updated
      }
    });
  };

  const salvarConfiguracoes = async () => {
    try {
      await save({
        notifications: settings?.notifications,
        extras: {
          ...settings?.extras,
          notifications: localPreferences
        }
      });
      toast({ title: 'Sucesso', description: 'Configurações de notificação salvas com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar configurações', variant: 'destructive' });
    }
  };

  const enviarNotificacaoTeste = () => {
    toast({ 
      title: 'Notificação de Teste', 
      description: 'Este é um exemplo de como as notificações aparecerão no sistema.',
      duration: 5000
    });
  };

  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const handleNotificationClick = (notification: any) => {
    if (['sent', 'pending'].includes(notification.status)) {
      markAsRead(notification.id);
    }
    
    const route = notification.data?.route;
    if (route) {
      navigate(route);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-destructive/20 bg-destructive/5';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-primary/20 bg-primary/5';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
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
      {/* Configurações Gerais */}
      <Card className="glassmorphism-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configurações Gerais</span>
          </CardTitle>
          <CardDescription>
            Configure as preferências básicas de notificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações no App</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações dentro do aplicativo
              </p>
            </div>
            <Switch
              checked={settings?.notifications?.in_app ?? true}
              onCheckedChange={(checked) => handleGeneralNotificationChange('in_app', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações importantes por email
              </p>
            </div>
            <Switch
              checked={settings?.notifications?.email ?? false}
              onCheckedChange={(checked) => handleGeneralNotificationChange('email', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Comunicações de Marketing</Label>
              <p className="text-sm text-muted-foreground">
                Receber novidades, dicas e promoções
              </p>
            </div>
            <Switch
              checked={settings?.notifications?.marketing ?? false}
              onCheckedChange={(checked) => handleGeneralNotificationChange('marketing', checked)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={enviarNotificacaoTeste}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Teste de Notificação
            </Button>
            {settings?.notifications?.in_app ? (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Volume2 className="w-4 h-4" />
                <span>Ativo</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <VolumeX className="w-4 h-4" />
                <span>Silenciado</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações WhatsApp */}
      <Card className="glassmorphism-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Notificações WhatsApp</span>
          </CardTitle>
          <CardDescription>
            Configure alertas e resumos via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-foreground">Alertas de Contas</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Contas próximas ao vencimento</Label>
                  <p className="text-sm text-muted-foreground">
                    Aviso com {localPreferences.antecedencia_vencimento} dias de antecedência
                  </p>
                </div>
                <Switch
                  checked={localPreferences.whatsapp_conta_vencer}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('whatsapp_conta_vencer', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Contas vencidas</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas diários sobre contas em atraso
                  </p>
                </div>
                <Switch
                  checked={localPreferences.whatsapp_conta_vencida}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('whatsapp_conta_vencida', checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Antecedência (dias)</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={localPreferences.antecedencia_vencimento}
                  onChange={(e) => 
                    handlePreferenceChange('antecedencia_vencimento', parseInt(e.target.value))
                  }
                  className="w-20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-foreground">Resumos Automáticos</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resumo diário</Label>
                  <p className="text-sm text-muted-foreground">
                    Resumo das movimentações às {localPreferences.horario_resumo_diario}
                  </p>
                </div>
                <Switch
                  checked={localPreferences.whatsapp_resumo_diario}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('whatsapp_resumo_diario', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resumo semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Resumo toda segunda-feira
                  </p>
                </div>
                <Switch
                  checked={localPreferences.whatsapp_resumo_semanal}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('whatsapp_resumo_semanal', checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Horário do resumo diário</Label>
                <Input
                  type="time"
                  value={localPreferences.horario_resumo_diario}
                  onChange={(e) => 
                    handlePreferenceChange('horario_resumo_diario', e.target.value)
                  }
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Email */}
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
              <Label>Confirmações de Backup</Label>
              <p className="text-sm text-muted-foreground">
                Receba confirmações quando os backups forem realizados
              </p>
            </div>
            <Switch
              checked={localPreferences.email_backup}
              onCheckedChange={(checked) => 
                handlePreferenceChange('email_backup', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Relatórios Mensais</Label>
              <p className="text-sm text-muted-foreground">
                Receba relatórios financeiros mensais por email
              </p>
            </div>
            <Switch
              checked={localPreferences.email_relatorios}
              onCheckedChange={(checked) => 
                handlePreferenceChange('email_relatorios', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={salvarConfiguracoes} 
          disabled={isSaving}
          className="btn-primary"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      {/* Histórico de Notificações */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Histórico de Notificações</h3>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'} • {notifications.length} total
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
                  value={filters.status || 'all'} 
                  onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
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
                  value={filters.type || 'all'} 
                  onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
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
                  value={filters.severity || 'all'} 
                  onValueChange={(value) => handleFilterChange('severity', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
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
          <CardContent className="p-6">
            {isLoading ? (
              <LoadingSkeleton lines={5} height="h-20" type="list" />
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Nenhuma notificação encontrada</p>
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
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                        getSeverityColor(notification.severity)
                      } ${isUnread ? 'border-l-4 border-l-primary shadow-sm' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-2xl">
                            {config?.icon || '📬'}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
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
                                {notification.status === 'sent' ? 'enviada' : 
                                 notification.status === 'read' ? 'lida' :
                                 notification.status === 'pending' ? 'pendente' : 'dispensada'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          {isUnread && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismiss(notification.id);
                            }}
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
    </div>
  );
}