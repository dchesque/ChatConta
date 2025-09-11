import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Building2, FileText, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormaPagamento, TipoPagamento, TIPOS_PAGAMENTO_LABELS, TIPOS_PAGAMENTO_ICONS } from '@/types/formaPagamento';
import { Banco } from '@/types/banco';
import { Cheque } from '@/types/cheque';

interface FormaPagamentoSectionProps {
  value: FormaPagamento;
  onChange: (formaPagamento: FormaPagamento) => void;
  numeroParcelas?: number;
  className?: string;
  bancos?: Banco[];
  cheques?: Cheque[];
}

export function FormaPagamentoSection({ 
  value, 
  onChange, 
  numeroParcelas = 1,
  className = "",
  bancos = [],
  cheques = []
}: FormaPagamentoSectionProps) {
  const handleTipoChange = (tipo: TipoPagamento) => {
    onChange({
      ...value,
      tipo,
      banco_id: undefined,
      numero_cheque: undefined,
      numeros_cheques: undefined,
      tipo_cartao: tipo === 'cartao' ? 'debito' : undefined
    });
  };

  const bancosAtivos = bancos.filter(b => b.ativo);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header da Seção */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">5</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Forma de Pagamento</h2>
      </div>

      {/* Radio Buttons para Tipo de Pagamento */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">
          Tipo de Pagamento <span className="text-red-500">*</span>
        </Label>
        
        <RadioGroup
          value={value.tipo}
          onValueChange={handleTipoChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {Object.entries(TIPOS_PAGAMENTO_LABELS).map(([tipo, label]) => (
            <div key={tipo} className="flex items-center space-x-3">
              <RadioGroupItem 
                value={tipo} 
                id={tipo}
                className="border-2 border-gray-300 text-blue-600"
              />
              <Label 
                htmlFor={tipo} 
                className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span className="text-lg">{TIPOS_PAGAMENTO_ICONS[tipo as TipoPagamento]}</span>
                <span>{label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Campos específicos por tipo */}
      {value.tipo === 'cartao' && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            Tipo de Cartão <span className="text-red-500">*</span>
          </Label>
          
          <RadioGroup
            value={value.tipo_cartao}
            onValueChange={(tipo: 'debito' | 'credito') => onChange({ ...value, tipo_cartao: tipo })}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="debito" id="debito" />
              <Label htmlFor="debito" className="text-sm font-medium text-gray-700">
                💳 Débito
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credito" id="credito" />
              <Label htmlFor="credito" className="text-sm font-medium text-gray-700">
                💸 Crédito
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
}