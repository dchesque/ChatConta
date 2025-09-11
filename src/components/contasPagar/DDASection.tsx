import { useState } from 'react';
import { Shield, Info, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DDASectionProps {
  value: boolean;
  onChange: (dda: boolean) => void;
  className?: string;
}

export function DDASection({ 
  value, 
  onChange, 
  className = "" 
}: DDASectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header da Seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">DDA</h2>
            <p className="text-sm text-gray-600">Débito Direto Autorizado</p>
          </div>
        </div>
        
        <Switch
          checked={value}
          onCheckedChange={onChange}
        />
      </div>

      {/* Informações sobre DDA */}
      <Card className="p-4 bg-amber-50/80 border-amber-200">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-900">O que é DDA?</span>
          </div>
          
          <div className="text-sm text-amber-800 space-y-2">
            <p>
              O Débito Direto Autorizado (DDA) é um serviço que permite ao beneficiário 
              cobrar diretamente na conta do pagador, mediante autorização prévia.
            </p>
            
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Importante:</p>
                <p>
                  Contas marcadas como DDA não requerem pagamento manual. 
                  O valor será debitado automaticamente na data de vencimento.
                </p>
              </div>
            </div>
          </div>

          {value && (
            <div className="pt-2 border-t border-amber-200">
              <Badge className="bg-amber-100 text-amber-800">
                ✓ Esta conta será paga automaticamente via DDA
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}