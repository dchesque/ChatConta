import { useState, useEffect } from 'react';
import { DollarSign, Building2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormaPagamento, TipoPagamento } from '@/types/formaPagamento';
import { useBankAccountsAll } from '@/hooks/useBankAccountsAll';

interface FormaRecebimentoSectionProps {
  value: FormaPagamento;
  onChange: (formaPagamento: FormaPagamento) => void;
  className?: string;
}

// Tipos de recebimento específicos (sem cartão)
const TIPOS_RECEBIMENTO_LABELS = {
  'dinheiro_pix': 'Dinheiro/PIX',
  'transferencia': 'Transferência',
  'deposito': 'Depósito'
};

const TIPOS_RECEBIMENTO_ICONS = {
  'dinheiro_pix': '💰',
  'transferencia': '🏦', 
  'deposito': '📥'
};

export function FormaRecebimentoSection({ 
  value, 
  onChange, 
  className = ""
}: FormaRecebimentoSectionProps) {
  const { accounts: bankAccounts = [] } = useBankAccountsAll();
  const handleTipoChange = (tipo: string) => {
    onChange({
      ...value,
      tipo: tipo as TipoPagamento,
      banco_id: undefined,
      numero_cheque: undefined,
      numeros_cheques: undefined,
      tipo_cartao: undefined
    });
  };

  const contasBancarias = bankAccounts.filter(account => account.id && account.id.trim() !== '');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Radio Buttons para Tipo de Recebimento */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">
          Forma de Recebimento <span className="text-red-500">*</span>
        </Label>
        
        <RadioGroup
          value={value.tipo}
          onValueChange={handleTipoChange}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {Object.entries(TIPOS_RECEBIMENTO_LABELS).map(([tipo, label]) => (
            <div key={tipo} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem 
                value={tipo} 
                id={tipo}
                className="border-2 border-gray-300 text-green-600"
              />
              <Label 
                htmlFor={tipo} 
                className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex-1"
              >
                <span className="text-lg">{TIPOS_RECEBIMENTO_ICONS[tipo as keyof typeof TIPOS_RECEBIMENTO_ICONS]}</span>
                <span>{label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Seleção de Conta Bancária - visível apenas para transferência e depósito */}
      {(value.tipo === 'transferencia' || value.tipo === 'deposito') && (
        <div className="space-y-4 p-4 bg-green-50/50 border border-green-200/50 rounded-xl">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <Label className="text-sm font-medium text-gray-700">
              Conta Bancária de Recebimento <span className="text-gray-400">(opcional)</span>
            </Label>
          </div>
          
          <Select 
            value={value.banco_id?.toString() || ""} 
            onValueChange={(accountId) => onChange({ ...value, banco_id: accountId })}
          >
            <SelectTrigger className="input-base">
              <SelectValue placeholder="Selecione a conta bancária..." />
            </SelectTrigger>
            <SelectContent>
              {contasBancarias.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center space-x-2">
                    <span>
                      {account.bank?.name && (account.agency && account.account_number) 
                        ? `${account.bank.name} - Ag: ${account.agency} | CC: ${account.account_number}`
                        : account.bank?.name && account.pix_key
                        ? `${account.bank.name} - PIX: ${account.pix_key}`
                        : account.bank?.name
                        ? `${account.bank.name} - Conta Bancária`
                        : `Conta ${account.id.substring(0, 8)}...`
                      }
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {contasBancarias.length === 0 && (
            <div className="flex items-center space-x-2 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Nenhuma conta bancária cadastrada. Cadastre uma conta primeiro.</span>
            </div>
          )}
        </div>
      )}

      {/* Informação para PIX/Dinheiro */}
      {value.tipo === 'dinheiro_pix' && (
        <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
          <div className="flex items-center space-x-2 text-blue-700">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">
              Recebimento em dinheiro ou PIX - não requer especificação de banco
            </span>
          </div>
        </div>
      )}
    </div>
  );
}