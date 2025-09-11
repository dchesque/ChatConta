import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlansConfig } from '@/services/systemConfigService';
import { 
  CheckCircle, 
  XCircle, 
  Infinity,
  DollarSign,
  Calendar,
  Crown,
  Users,
  FileText,
  Download,
  Shield,
  HeadphonesIcon
} from 'lucide-react';

interface PlanComparisonTableProps {
  plansConfig: PlansConfig | null;
  loading?: boolean;
}

export function PlanComparisonTable({ plansConfig, loading = false }: PlanComparisonTableProps) {
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Planos</CardTitle>
          <CardDescription>Carregando configurações...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plansConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Planos</CardTitle>
          <CardDescription>Erro ao carregar configurações dos planos</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatPrice = (price: number, currency: string = 'BRL') => {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(price);
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <Infinity className="w-4 h-4" />
          <span>Ilimitado</span>
        </div>
      );
    }
    return <span className="text-gray-700">{limit}</span>;
  };

  const FeatureIcon = ({ feature, enabled }: { feature: string; enabled: boolean }) => {
    const icons = {
      relatorios: FileText,
      exportacao: Download,
      backup: Shield,
      suporte_prioritario: HeadphonesIcon
    };
    
    const IconComponent = icons[feature as keyof typeof icons] || CheckCircle;
    
    return enabled ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const plans = [plansConfig.free, plansConfig.trial, plansConfig.premium];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Comparação de Planos</span>
        </CardTitle>
        <CardDescription>
          Visão geral das funcionalidades e limites de cada plano
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Recurso</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center py-3 px-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-1">
                        {plan.id === 'free' && <DollarSign className="w-4 h-4 text-gray-600" />}
                        {plan.id === 'trial' && <Calendar className="w-4 h-4 text-blue-600" />}
                        {plan.id === 'premium' && <Crown className="w-4 h-4 text-yellow-600" />}
                        <span className="font-medium">{plan.displayName}</span>
                      </div>
                      <div className="text-lg font-bold">
                        {formatPrice(plan.price, plan.currency)}
                        {plan.price > 0 && (
                          <span className="text-sm font-normal text-gray-500">
                            /{plan.interval === 'month' ? 'mês' : 'ano'}
                          </span>
                        )}
                      </div>
                      {plan.trialDays > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {plan.trialDays} dias grátis
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {/* Limites numéricos */}
              <tr>
                <td className="py-3 px-4 font-medium text-gray-900">Contas a Pagar</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    {formatLimit(plan.features.contas_pagar)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-gray-900">Fornecedores</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    {formatLimit(plan.features.fornecedores)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-gray-900">Categorias</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    {formatLimit(plan.features.categorias)}
                  </td>
                ))}
              </tr>

              {/* Features booleanas */}
              <tr>
                <td className="py-3 px-4 font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Relatórios Avançados</span>
                  </div>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <FeatureIcon feature="relatorios" enabled={plan.features.relatorios} />
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Exportação de Dados</span>
                  </div>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <FeatureIcon feature="exportacao" enabled={plan.features.exportacao} />
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Backup Automático</span>
                  </div>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <FeatureIcon feature="backup" enabled={plan.features.backup} />
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <HeadphonesIcon className="w-4 h-4" />
                    <span>Suporte Prioritário</span>
                  </div>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <FeatureIcon feature="suporte_prioritario" enabled={plan.features.suporte_prioritario} />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Informações do Stripe */}
              <tr className="bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">Status Stripe</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      {plan.stripe.productId && plan.stripe.priceId ? (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                          Configurado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Pendente
                        </Badge>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumo */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Resumo dos Planos</h4>
              <div className="mt-2 text-sm text-blue-800 space-y-1">
                <p>• <strong>Grátis:</strong> Ideal para testes básicos com limitações</p>
                <p>• <strong>Trial:</strong> Teste completo por tempo limitado</p>
                <p>• <strong>Premium:</strong> Acesso total sem limitações</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}