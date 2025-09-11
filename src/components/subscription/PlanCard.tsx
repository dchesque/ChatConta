import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlanConfig } from '@/services/systemConfigService';
import { 
  Crown, 
  Gift, 
  Zap, 
  Check, 
  Star,
  Infinity
} from 'lucide-react';

interface PlanCardProps {
  plan: PlanConfig;
  isCurrentPlan: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PlanCard({
  plan,
  isCurrentPlan,
  isRecommended = false,
  onSelect,
  disabled = false,
  loading = false
}: PlanCardProps) {
  
  // Função para obter ícone do plano
  const getPlanIcon = () => {
    switch (plan.id) {
      case 'free': return <Gift className="w-6 h-6 text-blue-600" />;
      case 'trial': return <Zap className="w-6 h-6 text-orange-600" />;
      case 'premium': return <Crown className="w-6 h-6 text-yellow-600" />;
      default: return <Gift className="w-6 h-6" />;
    }
  };

  // Função para obter cores do plano
  const getPlanColors = () => {
    switch (plan.id) {
      case 'free': 
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          accent: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'trial': 
        return {
          border: 'border-orange-200',
          bg: 'bg-orange-50',
          accent: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'premium': 
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          accent: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default: 
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-50',
          accent: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const colors = getPlanColors();

  // Função para formatar preço
  const formatPrice = () => {
    if (plan.price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: plan.currency
    }).format(plan.price);
  };

  // Função para formatar features
  const formatFeatureValue = (key: string, value: number | boolean) => {
    if (typeof value === 'boolean') {
      return value ? <Check className="w-4 h-4 text-green-600" /> : '✗';
    }
    if (value === -1) {
      return <div className="flex items-center space-x-1">
        <Infinity className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-600">Ilimitado</span>
      </div>;
    }
    return value.toString();
  };

  return (
    <Card 
      className={`
        relative h-full transition-all duration-300 bg-white/80 backdrop-blur-sm
        ${isCurrentPlan ? `${colors.border} border-2 ${colors.bg}` : 'border border-white/20 hover:border-gray-300'}
        ${isRecommended ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}
      `}
      onClick={!disabled ? onSelect : undefined}
    >
      {/* Badge de recomendado */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-600 text-white px-3 py-1">
            <Star className="w-3 h-3 mr-1" />
            Recomendado
          </Badge>
        </div>
      )}

      {/* Badge de plano atual */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge className={`${colors.accent} bg-white border-2 ${colors.border} px-3 py-1`}>
            Plano Atual
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        {/* Ícone e nome */}
        <div className="flex flex-col items-center space-y-3">
          <div className={`p-3 rounded-xl ${colors.bg}`}>
            {getPlanIcon()}
          </div>
          <div>
            <CardTitle className="text-xl font-bold capitalize">
              {plan.displayName}
            </CardTitle>
            <CardDescription className="mt-1">
              {plan.id === 'free' && 'Ideal para começar'}
              {plan.id === 'trial' && `${plan.trialDays} dias de teste grátis`}
              {plan.id === 'premium' && 'Acesso completo e ilimitado'}
            </CardDescription>
          </div>
        </div>

        {/* Preço */}
        <div className="pt-4">
          <div className="text-3xl font-bold text-gray-900">
            {formatPrice()}
          </div>
          {plan.price > 0 && (
            <div className="text-sm text-muted-foreground">
              por {plan.interval === 'month' ? 'mês' : 'ano'}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features principais */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Recursos inclusos:</h4>
          
          <div className="space-y-2">
            {/* Contas a Pagar */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Contas a Pagar</span>
              <span className="font-medium">
                {formatFeatureValue('contas_pagar', plan.features.contas_pagar)}
              </span>
            </div>

            {/* Fornecedores */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Fornecedores</span>
              <span className="font-medium">
                {formatFeatureValue('fornecedores', plan.features.fornecedores)}
              </span>
            </div>

            {/* Categorias */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Categorias</span>
              <span className="font-medium">
                {formatFeatureValue('categorias', plan.features.categorias)}
              </span>
            </div>

            {/* Relatórios */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Relatórios Avançados</span>
              <span className="font-medium">
                {formatFeatureValue('relatorios', plan.features.relatorios)}
              </span>
            </div>

            {/* Exportação */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Exportação</span>
              <span className="font-medium">
                {formatFeatureValue('exportacao', plan.features.exportacao)}
              </span>
            </div>

            {/* Backup */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Backup Automático</span>
              <span className="font-medium">
                {formatFeatureValue('backup', plan.features.backup)}
              </span>
            </div>

            {/* Suporte */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Suporte Prioritário</span>
              <span className="font-medium">
                {formatFeatureValue('suporte_prioritario', plan.features.suporte_prioritario)}
              </span>
            </div>
          </div>
        </div>

        {/* Botão de ação */}
        <div className="pt-4">
          <Button 
            className={`w-full ${colors.button} text-white`}
            disabled={disabled || loading || isCurrentPlan}
            onClick={!disabled && !isCurrentPlan ? onSelect : undefined}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Carregando...</span>
              </div>
            ) : isCurrentPlan ? (
              'Plano Atual'
            ) : (
              `${plan.price === 0 ? 'Começar' : 'Assinar'} ${plan.displayName}`
            )}
          </Button>
        </div>

        {/* Informações extras */}
        {plan.id === 'trial' && plan.trialDays > 0 && (
          <div className="text-xs text-center text-muted-foreground">
            Sem compromisso • Cancele quando quiser
          </div>
        )}

        {plan.id === 'premium' && (
          <div className="text-xs text-center text-muted-foreground">
            Faturamento {plan.interval === 'month' ? 'mensal' : 'anual'} • Cancele quando quiser
          </div>
        )}
      </CardContent>
    </Card>
  );
}