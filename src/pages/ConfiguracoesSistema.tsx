import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { createBreadcrumb } from '@/utils/breadcrumbUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Settings2, Package, CreditCard, Zap, Save, 
  AlertCircle, Check, X, Infinity, Crown, Gift,
  RefreshCw, ExternalLink, Activity, FileText
} from 'lucide-react';

export default function ConfiguracoesSistema() {
  // ✅ TODOS OS HOOKS DEVEM VIR PRIMEIRO - ANTES DE QUALQUER RETURN CONDICIONAL
  const { isAdmin } = useAuth();
  const { 
    plansConfig, 
    stripeConfig,
    loading, 
    saving,
    updatePlansConfig,
    updateStripeConfig,
    syncWithStripe,
    refreshConfigs
  } = useSystemConfig();

  // Estados locais para edição
  const [editedPlans, setEditedPlans] = useState(null);
  const [editedStripe, setEditedStripe] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('planos');

  // Inicializar com dados do banco quando carregar
  useEffect(() => {
    if (plansConfig && !editedPlans) {
      setEditedPlans(JSON.parse(JSON.stringify(plansConfig)));
    }
    if (stripeConfig && !editedStripe) {
      setEditedStripe(JSON.parse(JSON.stringify(stripeConfig)));
    }
  }, [plansConfig, stripeConfig, editedPlans, editedStripe]);

  // Verificar mudanças não salvas
  useEffect(() => {
    if (editedPlans && plansConfig) {
      const hasChanges = JSON.stringify(editedPlans) !== JSON.stringify(plansConfig);
      setHasUnsavedChanges(hasChanges);
    }
  }, [editedPlans, plansConfig]);

  // ✅ AGORA SIM - VERIFICAÇÕES CONDICIONAIS APÓS TODOS OS HOOKS
  // Verificar se é admin
  if (!isAdmin) {
    return (
      <div className="p-4 lg:p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Função para atualizar um plano específico
  const updatePlan = (planId, field, value) => {
    if (!editedPlans) return;
    
    const newPlans = { ...editedPlans };
    if (field.includes('.')) {
      const [section, subField] = field.split('.');
      newPlans[planId][section][subField] = value;
    } else {
      newPlans[planId][field] = value;
    }
    
    setEditedPlans(newPlans);
  };

  // Salvar alterações dos planos
  const handleSavePlans = async () => {
    if (!editedPlans) return;
    
    const success = await updatePlansConfig(editedPlans);
    if (success) {
      setHasUnsavedChanges(false);
    }
  };

  // Resetar alterações
  const handleResetPlans = () => {
    if (plansConfig) {
      setEditedPlans(JSON.parse(JSON.stringify(plansConfig)));
      setHasUnsavedChanges(false);
      toast.info('Alterações descartadas');
    }
  };

  // Sincronizar com Stripe
  const handleSyncStripe = async () => {
    const success = await syncWithStripe();
    if (success) {
      await refreshConfigs();
    }
  };

  // Função para formatar preço
  const formatPrice = (price) => {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Função para obter ícone do plano
  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free': return <Gift className="w-6 h-6 text-blue-600" />;
      case 'trial': return <Zap className="w-6 h-6 text-orange-600" />;
      case 'premium': return <Crown className="w-6 h-6 text-yellow-600" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  // Função para obter cor do plano
  const getPlanColor = (planId) => {
    switch (planId) {
      case 'free': return 'border-blue-200 bg-blue-50';
      case 'trial': return 'border-orange-200 bg-orange-50';
      case 'premium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <PageHeader
          breadcrumb={createBreadcrumb('/administrador/configuracoes-sistema')}
          title="Configurações do Sistema"
          subtitle="Carregando configurações..."
        />
        <div className="mt-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Background abstratos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
      </div>

      <PageHeader
        breadcrumb={createBreadcrumb('/administrador/configuracoes-sistema')}
        title="Configurações do Sistema"
        subtitle="Gerencie planos, preços e integrações de pagamento"
      />

      <div className="p-4 lg:p-8 space-y-6">
        {/* Barra de ações */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings2 className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle>Painel de Configurações</CardTitle>
                  <CardDescription>Configure planos e integrações de pagamento</CardDescription>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                    Alterações não salvas
                  </Badge>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshConfigs}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Atualizar</span>
                </Button>

                {hasUnsavedChanges && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetPlans}
                      disabled={saving}
                    >
                      Descartar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSavePlans}
                      disabled={saving}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="planos" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Planos</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Features</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Stripe</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Configuração de Planos */}
          <TabsContent value="planos" className="space-y-6">
            {editedPlans && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(editedPlans).map(([planId, plan]) => (
                  <Card key={planId} className={`${getPlanColor(planId)} border-2`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getPlanIcon(planId)}
                          <div>
                            <CardTitle className="capitalize">{plan.displayName}</CardTitle>
                            <CardDescription>{formatPrice(plan.price)}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="uppercase text-xs">
                          {planId}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Nome de exibição */}
                      <div className="space-y-2">
                        <Label htmlFor={`${planId}-name`}>Nome de Exibição</Label>
                        <Input
                          id={`${planId}-name`}
                          value={plan.displayName}
                          onChange={(e) => updatePlan(planId, 'displayName', e.target.value)}
                          placeholder="Nome do plano"
                        />
                      </div>

                      {/* Preço */}
                      <div className="space-y-2">
                        <Label htmlFor={`${planId}-price`}>Preço (R$)</Label>
                        <Input
                          id={`${planId}-price`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={plan.price}
                          onChange={(e) => updatePlan(planId, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>

                      {/* Dias de Trial */}
                      <div className="space-y-2">
                        <Label htmlFor={`${planId}-trial`}>Dias de Trial</Label>
                        <Input
                          id={`${planId}-trial`}
                          type="number"
                          min="0"
                          value={plan.trialDays}
                          onChange={(e) => updatePlan(planId, 'trialDays', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>

                      {/* Intervalo */}
                      <div className="space-y-2">
                        <Label htmlFor={`${planId}-interval`}>Intervalo de Cobrança</Label>
                        <select
                          id={`${planId}-interval`}
                          value={plan.interval}
                          onChange={(e) => updatePlan(planId, 'interval', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="month">Mensal</option>
                          <option value="year">Anual</option>
                        </select>
                      </div>

                      {/* Status Stripe */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status Stripe:</span>
                          {plan.stripe?.productId && plan.stripe?.priceId ? (
                            <Badge variant="default" className="bg-green-100 text-green-700">
                              <Check className="w-3 h-3 mr-1" />
                              Configurado
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="w-3 h-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Features */}
          <TabsContent value="features" className="space-y-6">
            {editedPlans && (
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Configuração de Features por Plano</span>
                  </CardTitle>
                  <CardDescription>
                    Configure limites e funcionalidades disponíveis em cada plano
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                          <th className="text-center py-3 px-4 font-medium text-blue-600">
                            <div className="flex items-center justify-center space-x-1">
                              <Gift className="w-4 h-4" />
                              <span>Grátis</span>
                            </div>
                          </th>
                          <th className="text-center py-3 px-4 font-medium text-orange-600">
                            <div className="flex items-center justify-center space-x-1">
                              <Zap className="w-4 h-4" />
                              <span>Trial</span>
                            </div>
                          </th>
                          <th className="text-center py-3 px-4 font-medium text-yellow-600">
                            <div className="flex items-center justify-center space-x-1">
                              <Crown className="w-4 h-4" />
                              <span>Premium</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {/* Limites numéricos */}
                        {[
                          { key: 'contas_pagar', label: 'Contas a Pagar', icon: FileText },
                          { key: 'fornecedores', label: 'Fornecedores', icon: Package },
                          { key: 'categorias', label: 'Categorias', icon: Package }
                        ].map(({ key, label, icon: Icon }) => (
                          <tr key={key}>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">{label}</span>
                              </div>
                            </td>
                            {['free', 'trial', 'premium'].map(planId => (
                              <td key={planId} className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <Input
                                    type="number"
                                    min="-1"
                                    value={editedPlans[planId].features[key]}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      updatePlan(planId, `features.${key}`, value);
                                    }}
                                    className="w-20 text-center"
                                    placeholder="0"
                                  />
                                  {editedPlans[planId].features[key] === -1 && (
                                    <Infinity className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {editedPlans[planId].features[key] === -1 ? 'Ilimitado' : 'Limite'}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}

                        {/* Features booleanas */}
                        {[
                          { key: 'relatorios', label: 'Relatórios Avançados', icon: FileText },
                          { key: 'exportacao', label: 'Exportação de Dados', icon: FileText },
                          { key: 'backup', label: 'Backup Automático', icon: FileText },
                          { key: 'suporte_prioritario', label: 'Suporte Prioritário', icon: FileText }
                        ].map(({ key, label, icon: Icon }) => (
                          <tr key={key}>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Icon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">{label}</span>
                              </div>
                            </td>
                            {['free', 'trial', 'premium'].map(planId => (
                              <td key={planId} className="py-3 px-4 text-center">
                                <Switch
                                  checked={editedPlans[planId].features[key]}
                                  onCheckedChange={(checked) => updatePlan(planId, `features.${key}`, checked)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Stripe */}
          <TabsContent value="stripe" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Integração Stripe</span>
                    </CardTitle>
                    <CardDescription>
                      Status e configurações da integração de pagamentos
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncStripe}
                      disabled={saving}
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                      <span>Sincronizar</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                      className="flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {stripeConfig ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Status da Integração</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Stripe Habilitado:</span>
                            <Badge variant={stripeConfig.enabled ? "default" : "secondary"}>
                              {stripeConfig.enabled ? 'Sim' : 'Não'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Ambiente:</span>
                            <Badge variant="outline">
                              {stripeConfig.environment === 'live' ? 'Produção' : 'Teste'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Produtos Sincronizados:</span>
                            <Badge variant={stripeConfig.products_synced ? "default" : "secondary"}>
                              {stripeConfig.products_synced ? 'Sim' : 'Não'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Última Sincronização</h4>
                        <div className="text-sm text-muted-foreground">
                          {stripeConfig.last_sync ? (
                            new Date(stripeConfig.last_sync).toLocaleString('pt-BR')
                          ) : (
                            'Nunca sincronizado'
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Configuração de Variáveis:</strong> As chaves do Stripe devem ser configuradas 
                        no arquivo .env.local. Nunca armazene chaves sensíveis no banco de dados.
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground">Configurações do Stripe não encontradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}