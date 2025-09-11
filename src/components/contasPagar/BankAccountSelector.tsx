import { useState, useEffect } from 'react';
import { Building2, CreditCard } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBanks } from '@/hooks/useBanks';
import { useBankAccounts } from '@/hooks/useBankAccounts';

interface BankAccountSelectorProps {
  value?: { banco_id?: string; conta_id?: string };
  onChange: (dados: { banco_id?: string; conta_id?: string }) => void;
  className?: string;
  disabled?: boolean;
}

export function BankAccountSelector({ 
  value, 
  onChange, 
  className = "",
  disabled = false
}: BankAccountSelectorProps) {
  const { banks: bancos } = useBanks();
  const { accounts: bankAccounts } = useBankAccounts(value?.banco_id);
  
  // Filtrar contas do banco selecionado
  const contasDisponiveis = bankAccounts;

  const handleBancoChange = (bancoId: string) => {
    onChange({
      banco_id: bancoId,
      conta_id: undefined // Limpar conta quando banco muda
    });
  };

  const handleContaChange = (contaId: string) => {
    onChange({
      ...value,
      conta_id: contaId
    });
  };

  const bancoSelecionado = bancos.find(b => b.id === value?.banco_id);
  const contaSelecionada = bankAccounts.find(c => c.id === value?.conta_id);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Seletor de Banco */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Banco <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={value?.banco_id || ''} 
          onValueChange={handleBancoChange}
          disabled={disabled}
        >
          <SelectTrigger className="glassmorphism-input">
            <SelectValue placeholder="Selecionar banco">
              {bancoSelecionado && (
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>{bancoSelecionado.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="z-50 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
            {bancos.filter(b => !b.deleted_at).map((banco) => (
              <SelectItem key={banco.id} value={banco.id}>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>{banco.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Seletor de Conta Bancária */}
      {value?.banco_id && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Conta Bancária <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={value?.conta_id || ''} 
            onValueChange={handleContaChange}
            disabled={disabled || contasDisponiveis.length === 0}
          >
            <SelectTrigger className="glassmorphism-input">
              <SelectValue placeholder="Selecionar conta">
                {contaSelecionada && (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-success" />
                    <span>
                      {contaSelecionada.agency && contaSelecionada.account_number 
                        ? `Ag: ${contaSelecionada.agency} - CC: ${contaSelecionada.account_number}`
                        : contaSelecionada.pix_key 
                        ? `PIX: ${contaSelecionada.pix_key}`
                        : 'Conta Bancária'}
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="z-50 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
              {contasDisponiveis.map((conta) => (
                <SelectItem key={conta.id} value={conta.id}>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-success" />
                    <span>
                      {conta.agency && conta.account_number 
                        ? `Ag: ${conta.agency} - CC: ${conta.account_number}`
                        : conta.pix_key 
                        ? `PIX: ${conta.pix_key}`
                        : 'Conta Bancária'}
                      {conta.agency && conta.account_number && conta.pix_key && ` | PIX: ${conta.pix_key.slice(0, 10)}...`}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {contasDisponiveis.length === 0 && value?.banco_id && (
            <p className="text-sm text-warning">
              Nenhuma conta cadastrada para este banco. Cadastre uma conta primeiro.
            </p>
          )}
        </div>
      )}
    </div>
  );
}