import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlansConfig } from '@/services/systemConfigService';
import { 
  Check, 
  X, 
  Infinity,
  Gift,
  Zap,
  Crown,
  FileText,
  Package,
  Download,
  Shield,
  HeadphonesIcon
} from 'lucide-react';

interface PlanComparisonTableProps {
  plans: PlansConfig;
  currentPlanId?: 'free' | 'trial' | 'premium' | null;
}

export function PlanComparisonTable({ plans, currentPlanId }: PlanComparisonTableProps) {
  
  // Função para obter ícone do plano
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Gift className="w-4 h-4 text-blue-600" />;
      case 'trial': return <Zap className="w-4 h-4 text-orange-600" />;
      case 'premium': return <Crown className="w-4 h-4 text-yellow-600" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Função para formatar valor de feature
  const formatFeatureValue = (value: number | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-4 h-4 text-green-600 mx-auto" />
      ) : (
        <X className="w-4 h-4 text-red-500 mx-auto" />
      );
    }
    
    if (value === -1) {
      return (
        <div className="flex items-center justify-center space-x-1">
          <Infinity className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-600 hidden sm:inline">Ilimitado</span>
        </div>
      );
    }
    
    return (
      <span className="font-medium text-gray-900">{value}</span>
    );
  };

  // Função para formatar preço
  const formatPrice = (plan: any) => {
    if (plan.price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: plan.currency
    }).format(plan.price);
  };

  // Lista de features para comparação
  const features = [
    {
      key: 'contas_pagar',
      label: 'Contas a Pagar',
      icon: <FileText className="w-4 h-4 text-gray-500" />,
      description: 'Número máximo de contas a pagar'
    },
    {
      key: 'fornecedores',
      label: 'Fornecedores',
      icon: <Package className="w-4 h-4 text-gray-500" />,
      description: 'Número máximo de fornecedores cadastrados'
    },
    {
      key: 'categorias',
      label: 'Categorias',
      icon: <Package className="w-4 h-4 text-gray-500" />,
      description: 'Número máximo de categorias'
    },
    {
      key: 'relatorios',
      label: 'Relatórios Avançados',
      icon: <FileText className="w-4 h-4 text-gray-500" />,
      description: 'Acesso a relatórios detalhados e gráficos'
    },
    {
      key: 'exportacao',
      label: 'Exportação de Dados',
      icon: <Download className="w-4 h-4 text-gray-500" />,
      description: 'Exportar dados em Excel, PDF e CSV'
    },
    {
      key: 'backup',
      label: 'Backup Automático',
      icon: <Shield className="w-4 h-4 text-gray-500" />,
      description: 'Backup automático dos seus dados'
    },
    {
      key: 'suporte_prioritario',
      label: 'Suporte Prioritário',
      icon: <HeadphonesIcon className="w-4 h-4 text-gray-500" />,
      description: 'Atendimento prioritário via WhatsApp'
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">Comparação Detalhada de Planos</CardTitle>
        <p className="text-center text-muted-foreground">
          Compare todos os recursos disponíveis em cada plano
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Cabeçalho da tabela */}
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-medium text-gray-900">
                  Recursos
                </th>
                {Object.entries(plans).map(([planId, plan]) => (
                  <th key={planId} className="text-center py-4 px-4 min-w-[140px]">
                    <div className="flex flex-col items-center space-y-2">
                      {/* Ícone e nome */}
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(planId)}
                        <span className="font-semibold capitalize">{plan.displayName}</span>
                        {currentPlanId === planId && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                      
                      {/* Preço */}
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(plan)}
                        </div>
                        {plan.price > 0 && (
                          <div className="text-xs text-muted-foreground">
                            por {plan.interval === 'month' ? 'mês' : 'ano'}
                          </div>
                        )}
                        {plan.id === 'trial' && plan.trialDays > 0 && (
                          <div className="text-xs text-orange-600 font-medium">
                            {plan.trialDays} dias grátis
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Corpo da tabela */}
            <tbody className="divide-y divide-gray-200">
              {features.map((feature) => (
                <tr key={feature.key} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-start space-x-3">
                      {feature.icon}
                      <div>
                        <div className="font-medium text-gray-900">
                          {feature.label}
                        </div>
                        <div className="text-sm text-muted-foreground hidden sm:block">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {Object.entries(plans).map(([planId, plan]) => (
                    <td key={planId} className="py-4 px-4 text-center">
                      {formatFeatureValue(plan.features[feature.key as keyof typeof plan.features])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Linha especial para destacar diferenças */}
              <tr className="bg-blue-50/50">
                <td className="py-4 px-4">
                  <div className="flex items-start space-x-3">
                    <Package className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold text-blue-900">
                        Recomendado para
                      </div>
                      <div className="text-sm text-blue-700">
                        Perfil de usuário ideal
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="py-4 px-4 text-center">
                  <div className="text-sm font-medium text-blue-900">
                    Uso básico
                  </div>
                  <div className="text-xs text-blue-700">
                    Poucos fornecedores
                  </div>
                </td>
                
                <td className="py-4 px-4 text-center">
                  <div className="text-sm font-medium text-orange-900">
                    Teste completo
                  </div>
                  <div className="text-xs text-orange-700">
                    Avaliar o sistema
                  </div>
                </td>
                
                <td className="py-4 px-4 text-center">
                  <div className="text-sm font-medium text-yellow-900">
                    Uso profissional
                  </div>
                  <div className="text-xs text-yellow-700">
                    Múltiplos fornecedores
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notas importantes */}
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-gray-900">💡 Notas Importantes</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Ilimitado</strong> significa sem restrições de quantidade</li>
            <li>• O <strong>trial</strong> oferece acesso completo por {plans.trial?.trialDays || 7} dias</li>
            <li>• Você pode cancelar sua assinatura a qualquer momento</li>
            <li>• Upgrade e downgrade podem ser feitos instantaneamente</li>
            <li>• Todos os dados são mantidos independente do plano</li>
          </ul>
        </div>

        {/* Call to action */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-2">
              🚀 Comece seu trial gratuito hoje mesmo!
            </h4>
            <p className="text-sm text-muted-foreground">
              Teste todos os recursos premium por {plans.trial?.trialDays || 7} dias, 
              sem compromisso e sem cartão de crédito.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}