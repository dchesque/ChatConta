import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { createBreadcrumb } from '@/utils/breadcrumbUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanCard } from '@/components/subscription/PlanCard';
import { PlanComparisonTable } from '@/components/subscription/PlanComparisonTable';
import { StripeDisabledAlert } from '@/components/subscription/StripeDisabledAlert';
import { 
  Calendar, 
  Crown, 
  CreditCard, 
  ExternalLink, 
  RefreshCw,
  Gift,
  Zap,
  Package,
  Loader2,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function Assinatura() {
  const {
    subscription,
    loading,
    refreshing,
    status,
    isActive,
    isTrialActive,
    isPremiumActive,
    isExpired,
    remainingTrialDays,
    remainingSubscriptionDays,
    trialEndsAt,
    subscriptionEndsAt,
    refreshSubscription,
    availablePlans,
    currentPlanId,
    isStripeEnabled,
    selectPlan,
    planConfigsLoading,
    stripeLoading
  } = useSubscription();

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Função para lidar com seleção de plano
  const handleSelectPlan = async (planId: 'free' | 'trial' | 'premium') => {
    if (currentPlanId === planId) {
      toast.info('Você já possui este plano');
      return;
    }

    setActionLoading(planId);
    try {
      await selectPlan(planId);
      // Refresh para atualizar status
      setTimeout(() => {
        refreshSubscription();
      }, 1000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = async () => {
    await refreshSubscription();
    toast.success('Status da assinatura atualizado!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (isTrialActive) return 'bg-blue-100/80 text-blue-700 border-blue-200';
    if (isPremiumActive) return 'bg-green-100/80 text-green-700 border-green-200';
    return 'bg-red-100/80 text-red-700 border-red-200';
  };

  const getStatusIcon = () => {
    if (isTrialActive) return <Calendar className="w-4 h-4" />;
    if (isPremiumActive) return <Crown className="w-4 h-4" />;
    return <CreditCard className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isTrialActive) return 'Trial Ativo';
    if (isPremiumActive) return 'Premium Ativo';
    return 'Plano Gratuito';
  };

  const isPageLoading = loading || planConfigsLoading || stripeLoading;

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <PageHeader
          breadcrumb={createBreadcrumb('/assinatura')}
          title="Assinatura"
          subtitle="Gerencie sua assinatura e planos"
        />
        
        <div className="p-4 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Carregando informações dos planos...</p>
            </div>
          </div>
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

      {/* Page Header */}
      <PageHeader
        breadcrumb={createBreadcrumb('/assinatura')}
        title="Escolha seu Plano"
        subtitle="Selecione o plano ideal para suas necessidades"
      />

      <div className="p-4 lg:p-8 space-y-8">
        {/* Alerta do Stripe se desabilitado */}
        {!isStripeEnabled && <StripeDisabledAlert />}

        {/* Status Atual */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span>Status Atual</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </Button>
              </div>
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>
            <CardDescription>
              Seu plano atual e informações de renovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Plano atual */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Plano Atual</h4>
                  <div className="flex items-center space-x-2">
                    {currentPlanId === 'free' && <Gift className="w-4 h-4 text-blue-600" />}
                    {currentPlanId === 'trial' && <Zap className="w-4 h-4 text-orange-600" />}
                    {currentPlanId === 'premium' && <Crown className="w-4 h-4 text-yellow-600" />}
                    <span className="font-medium capitalize">
                      {availablePlans?.[currentPlanId]?.displayName || currentPlanId}
                    </span>
                  </div>
                </div>

                {/* Dias restantes */}
                {(isTrialActive || isPremiumActive) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Tempo Restante</h4>
                    <div className="text-2xl font-bold">
                      {isTrialActive ? remainingTrialDays : remainingSubscriptionDays}
                      <span className="text-sm font-normal text-muted-foreground ml-1">dias</span>
                    </div>
                  </div>
                )}

                {/* Próxima renovação */}
                {(trialEndsAt || subscriptionEndsAt) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">
                      {isTrialActive ? 'Trial expira em' : 'Renova em'}
                    </h4>
                    <div className="font-medium">
                      {formatDate(isTrialActive ? trialEndsAt! : subscriptionEndsAt!)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards de Planos */}
        {availablePlans && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Planos Disponíveis
              </h2>
              <p className="text-muted-foreground">
                Escolha o plano que melhor se adapta às suas necessidades
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(availablePlans).map(([planId, plan]) => (
                <PlanCard
                  key={planId}
                  plan={plan}
                  isCurrentPlan={currentPlanId === planId}
                  isRecommended={planId === 'premium'}
                  onSelect={() => handleSelectPlan(planId as 'free' | 'trial' | 'premium')}
                  disabled={currentPlanId === planId}
                  loading={actionLoading === planId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tabela de Comparação */}
        {availablePlans && (
          <PlanComparisonTable 
            plans={availablePlans} 
            currentPlanId={currentPlanId}
          />
        )}

        {/* Call to Action para Premium */}
        {currentPlanId !== 'premium' && (
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Crown className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Upgrade para Premium
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Desbloqueia todos os recursos e remove todas as limitações
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {availablePlans?.premium && (
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: availablePlans.premium.currency
                        }).format(availablePlans.premium.price)
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      por {availablePlans?.premium?.interval === 'month' ? 'mês' : 'ano'}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleSelectPlan('premium')}
                    disabled={actionLoading === 'premium'}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {actionLoading === 'premium' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Assinar Premium
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suporte */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="w-5 h-5" />
              <span>Precisa de Ajuda?</span>
            </CardTitle>
            <CardDescription>
              Entre em contato conosco para esclarecimentos sobre planos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => window.open('https://wa.me/5544999999999?text=Olá! Gostaria de informações sobre os planos de assinatura.', '_blank')}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>WhatsApp</span>
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p>• Dúvidas sobre funcionalidades</p>
                <p>• Suporte para pagamentos</p>
                <p>• Orientações sobre uso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>✓ Todos os planos incluem acesso completo aos recursos básicos</p>
          <p>✓ Cancele sua assinatura a qualquer momento sem taxas</p>
          <p>✓ Suporte técnico disponível para todos os usuários</p>
          <p>✓ Seus dados ficam sempre seguros e protegidos</p>
        </div>
      </div>
    </div>
  );
}