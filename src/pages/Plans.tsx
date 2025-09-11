import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PLAN_CONFIGS, UserPlan } from '@/hooks/useSubscription';
import { Crown, Clock, CheckCircle, Zap, Shield, BarChart3, Download, Cloud, MessageCircle, Check, X } from 'lucide-react';
import { GLASSMORPHISM, ANIMATIONS } from '@/constants/designSystem';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Plans() {
  const { 
    plan, 
    daysRemaining, 
    planConfig, 
    upgradePlan,
    getRemainingItems,
    getUsagePercentage 
  } = useSubscription();

  const [loading, setLoading] = useState<UserPlan | null>(null);

  const handleUpgrade = async (targetPlan: UserPlan) => {
    if (targetPlan === plan) return;
    
    setLoading(targetPlan);
    
    try {
      if (targetPlan === 'premium') {
        await upgradePlan();
      } else {
        toast.info('Plano alterado', {
          description: `Você será direcionado para o plano ${PLAN_CONFIGS[targetPlan].name}`
        });
      }
    } finally {
      setLoading(null);
    }
  };

  // Mock data para uso atual
  const mockUsage = {
    contas_pagar: 25,
    fornecedores: 8,
    categorias: 5
  };

  const features = [
    { id: 'contas_pagar', name: 'Contas a Pagar', icon: BarChart3 },
    { id: 'fornecedores', name: 'Fornecedores', icon: Shield },
    { id: 'categorias', name: 'Categorias', icon: Zap },
    { id: 'relatorios', name: 'Relatórios', icon: BarChart3 },
    { id: 'exportacao', name: 'Exportação', icon: Download },
    { id: 'backup', name: 'Backup', icon: Cloud }
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Meu Plano"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Planos', href: '/planos' }
        ]}
        subtitle="Gerencie sua assinatura e recursos"
      />

      <div className="space-y-8">
        {/* Plano Atual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`${GLASSMORPHISM.card} ${GLASSMORPHISM.cardHover} ${ANIMATIONS.smooth}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan === 'premium' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    plan === 'trial' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    'bg-gradient-to-r from-gray-400 to-gray-600'
                  }`}>
                    {plan === 'premium' ? (
                      <Crown className="w-6 h-6 text-white" />
                    ) : plan === 'trial' ? (
                      <Clock className="w-6 h-6 text-white" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">Plano {planConfig.name}</CardTitle>
                    <CardDescription>
                      {plan === 'trial' && `${daysRemaining} dias restantes`}
                      {plan === 'free' && 'Plano gratuito ativo'}
                      {plan === 'premium' && 'Próxima cobrança em 23 dias'}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={plan === 'premium' ? 'default' : plan === 'trial' ? 'secondary' : 'outline'}>
                  {plan === 'premium' && '⭐ Premium'}
                  {plan === 'trial' && `Trial - ${daysRemaining}d`}
                  {plan === 'free' && 'Grátis'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progresso do trial */}
              {plan === 'trial' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dias restantes</span>
                    <span>{daysRemaining}/14 dias</span>
                  </div>
                  <Progress value={(daysRemaining / 14) * 100} className="h-2" />
                </div>
              )}

              {/* Recursos do plano atual */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  const usage = mockUsage[feature.id as keyof typeof mockUsage] || 0;
                  const usagePercent = getUsagePercentage(feature.id as any, usage);
                  
                  return (
                    <div key={feature.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{feature.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getRemainingItems(feature.id as any, usage)}
                      </div>
                      {typeof planConfig.limits[feature.id as keyof typeof planConfig.limits] === 'number' && (
                        <Progress value={usagePercent} className="h-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparativo de Planos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className={GLASSMORPHISM.card}>
            <CardHeader>
              <CardTitle>Comparar Planos</CardTitle>
              <CardDescription>
                Escolha o plano ideal para suas necessidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Recurso</th>
                      <th className="text-center py-3 px-4">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold">Grátis</span>
                          <span className="text-sm text-muted-foreground">R$ 0</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold">Trial</span>
                          <span className="text-sm text-muted-foreground">14 dias</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-4">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold">Premium</span>
                          <span className="text-sm text-muted-foreground">R$ 29,90/mês</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Contas a Pagar</td>
                      <td className="text-center py-3 px-4">10/mês</td>
                      <td className="text-center py-3 px-4">50</td>
                      <td className="text-center py-3 px-4">Ilimitado</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Fornecedores</td>
                      <td className="text-center py-3 px-4">5</td>
                      <td className="text-center py-3 px-4">20</td>
                      <td className="text-center py-3 px-4">Ilimitado</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Relatórios</td>
                      <td className="text-center py-3 px-4">Limitados</td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Exportação Excel/PDF</td>
                      <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                      <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Backup Automático</td>
                      <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                      <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Suporte</td>
                      <td className="text-center py-3 px-4">Email</td>
                      <td className="text-center py-3 px-4">Email</td>
                      <td className="text-center py-3 px-4">Prioritário</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {plan !== 'trial' && (
                  <Button
                    onClick={() => handleUpgrade('trial')}
                    variant="outline"
                    className="flex-1"
                    disabled={loading === 'trial'}
                  >
                    {loading === 'trial' ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Clock className="w-4 h-4 mr-2" />
                    )}
                    Iniciar Trial
                  </Button>
                )}
                
                {plan !== 'premium' && (
                  <Button
                    onClick={() => handleUpgrade('premium')}
                    className="flex-1 btn-primary"
                    disabled={loading === 'premium'}
                  >
                    {loading === 'premium' ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Crown className="w-4 h-4 mr-2" />
                    )}
                    Assinar Premium
                  </Button>
                )}

                <Button
                  onClick={() => {
                    const message = encodeURIComponent('Olá! Tenho dúvidas sobre os planos do ChatConta.');
                    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className={GLASSMORPHISM.card}>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Como funciona o trial?</h4>
                <p className="text-sm text-muted-foreground">
                  O trial de 14 dias inclui acesso completo às funcionalidades básicas e de relatórios, 
                  permitindo testar o sistema antes de escolher um plano.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Posso cancelar a qualquer momento?</h4>
                <p className="text-sm text-muted-foreground">
                  Sim, você pode cancelar sua assinatura a qualquer momento pelo WhatsApp. 
                  Não há taxas de cancelamento.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">O que acontece quando o trial acaba?</h4>
                <p className="text-sm text-muted-foreground">
                  Quando o trial expira, sua conta automaticamente migra para o plano gratuito 
                  com limitações. Seus dados permanecem seguros.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Como faço o pagamento?</h4>
                <p className="text-sm text-muted-foreground">
                  Entre em contato pelo WhatsApp para combinar a forma de pagamento mais conveniente: 
                  PIX, boleto ou cartão de crédito.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
}