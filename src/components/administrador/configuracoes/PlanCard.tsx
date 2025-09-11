import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PlanConfig } from '@/services/systemConfigService';
import { FeatureLimitInput } from './FeatureLimitInput';
import { 
  Crown, 
  Calendar, 
  DollarSign, 
  Save, 
  RotateCcw,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PlanCardProps {
  plan: PlanConfig;
  onSave: (plan: PlanConfig) => void;
  onReset: () => void;
  saving?: boolean;
  disabled?: boolean;
}

export function PlanCard({ plan, onSave, onReset, saving = false, disabled = false }: PlanCardProps) {
  const [editedPlan, setEditedPlan] = useState<PlanConfig>(plan);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof PlanConfig, value: any) => {
    const newPlan = { ...editedPlan, [field]: value };
    setEditedPlan(newPlan);
    setHasChanges(JSON.stringify(newPlan) !== JSON.stringify(plan));
  };

  const handleFeatureChange = (feature: keyof PlanConfig['features'], value: any) => {
    const newPlan = {
      ...editedPlan,
      features: {
        ...editedPlan.features,
        [feature]: value
      }
    };
    setEditedPlan(newPlan);
    setHasChanges(JSON.stringify(newPlan) !== JSON.stringify(plan));
  };

  const handleSave = () => {
    onSave(editedPlan);
    setHasChanges(false);
  };

  const handleReset = () => {
    setEditedPlan(plan);
    setHasChanges(false);
    onReset();
  };

  const getPlanIcon = () => {
    switch (plan.id) {
      case 'free':
        return <DollarSign className="w-5 h-5 text-gray-600" />;
      case 'trial':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'premium':
        return <Crown className="w-5 h-5 text-yellow-600" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getPlanColor = () => {
    switch (plan.id) {
      case 'free':
        return 'bg-gray-100 border-gray-200';
      case 'trial':
        return 'bg-blue-50 border-blue-200';
      case 'premium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className={`${getPlanColor()} transition-all duration-300 ${disabled ? 'opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getPlanIcon()}
            <div>
              <CardTitle className="text-lg capitalize">{plan.displayName}</CardTitle>
              <CardDescription>
                {plan.id === 'free' && 'Plano gratuito básico'}
                {plan.id === 'trial' && 'Período de teste gratuito'}
                {plan.id === 'premium' && 'Plano premium com todos os recursos'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                Não salvo
              </Badge>
            )}
            <Badge variant={plan.id === 'premium' ? 'default' : 'secondary'}>
              {plan.id.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${plan.id}-display-name`}>Nome de Exibição</Label>
            <Input
              id={`${plan.id}-display-name`}
              value={editedPlan.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              disabled={disabled}
              placeholder="Nome do plano"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${plan.id}-price`}>Preço (R$)</Label>
            <Input
              id={`${plan.id}-price`}
              type="number"
              step="0.01"
              min="0"
              value={editedPlan.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Trial e intervalo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${plan.id}-trial-days`}>Dias de Trial</Label>
            <Input
              id={`${plan.id}-trial-days`}
              type="number"
              min="0"
              value={editedPlan.trialDays}
              onChange={(e) => handleChange('trialDays', parseInt(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${plan.id}-interval`}>Intervalo de Cobrança</Label>
            <select
              id={`${plan.id}-interval`}
              value={editedPlan.interval}
              onChange={(e) => handleChange('interval', e.target.value as 'month' | 'year')}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">Mensal</option>
              <option value="year">Anual</option>
            </select>
          </div>
        </div>

        {/* Limites de recursos */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Limites de Recursos</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureLimitInput
              label="Contas a Pagar"
              value={editedPlan.features.contas_pagar}
              onChange={(value) => handleFeatureChange('contas_pagar', value)}
              disabled={disabled}
            />

            <FeatureLimitInput
              label="Fornecedores"
              value={editedPlan.features.fornecedores}
              onChange={(value) => handleFeatureChange('fornecedores', value)}
              disabled={disabled}
            />

            <FeatureLimitInput
              label="Categorias"
              value={editedPlan.features.categorias}
              onChange={(value) => handleFeatureChange('categorias', value)}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Features booleanas */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Recursos Disponíveis</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${plan.id}-relatorios`}>Relatórios Avançados</Label>
              <Switch
                id={`${plan.id}-relatorios`}
                checked={editedPlan.features.relatorios}
                onCheckedChange={(checked) => handleFeatureChange('relatorios', checked)}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor={`${plan.id}-exportacao`}>Exportação de Dados</Label>
              <Switch
                id={`${plan.id}-exportacao`}
                checked={editedPlan.features.exportacao}
                onCheckedChange={(checked) => handleFeatureChange('exportacao', checked)}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor={`${plan.id}-backup`}>Backup Automático</Label>
              <Switch
                id={`${plan.id}-backup`}
                checked={editedPlan.features.backup}
                onCheckedChange={(checked) => handleFeatureChange('backup', checked)}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor={`${plan.id}-suporte`}>Suporte Prioritário</Label>
              <Switch
                id={`${plan.id}-suporte`}
                checked={editedPlan.features.suporte_prioritario}
                onCheckedChange={(checked) => handleFeatureChange('suporte_prioritario', checked)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        {/* Informações do Stripe */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Integração Stripe</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product ID</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={editedPlan.stripe.productId || 'Não configurado'}
                  disabled
                  className="bg-gray-50"
                />
                {editedPlan.stripe.productId ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price ID</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={editedPlan.stripe.priceId || 'Não configurado'}
                  disabled
                  className="bg-gray-50"
                />
                {editedPlan.stripe.priceId ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        {!disabled && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || saving}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetar</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}