import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, Percent } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { useBanks } from '@/hooks/useBanks';

interface PaymentModalAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: any) => Promise<void>;
  conta: {
    id: string;
    description: string;
    amount: number;
    due_date: string;
    contact?: {
      id: string;
      name: string;
    };
    category?: {
      id: string;
      name: string;
      color?: string;
    };
  } | null;
  loading?: boolean;
}

export function PaymentModalAdvanced({ 
  isOpen, 
  onClose, 
  onConfirm, 
  conta, 
  loading = false 
}: PaymentModalAdvancedProps) {
  const { banks } = useBanks();
  
  const [formData, setFormData] = useState({
    bank_account_id: '',
    paid_at: new Date().toISOString().split('T')[0],
    valor_pago: 0,
    observacoes_pagamento: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculationType, setCalculationType] = useState<'juros' | 'desconto'>('juros');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && conta) {
      setFormData({
        bank_account_id: '',
        paid_at: new Date().toISOString().split('T')[0],
        valor_pago: conta.amount,
        observacoes_pagamento: ''
      });
      setErrors({});
    }
  }, [isOpen, conta]);

  if (!conta) return null;

  // Get all bank accounts from all banks
  const allBankAccounts = banks.flatMap(bank => 
    bank.accounts.map(account => ({
      ...account,
      bank_name: bank.name
    }))
  );

  // Cálculos automáticos
  const valorOriginal = conta.amount;
  const valorPago = formData.valor_pago;
  const diferenca = valorPago - valorOriginal;
  const jurosCalculado = diferenca > 0 ? diferenca : 0;
  const descontoCalculado = diferenca < 0 ? Math.abs(diferenca) : 0;

  const preencherValorOriginal = () => {
    setFormData(prev => ({ ...prev, valor_pago: valorOriginal }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.paid_at) {
      newErrors.paid_at = 'Data de pagamento é obrigatória';
    }

    if (!formData.valor_pago || formData.valor_pago <= 0) {
      newErrors.valor_pago = 'Valor pago deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const paymentData = {
        bank_account_id: formData.bank_account_id === 'none' ? undefined : formData.bank_account_id || undefined,
        paid_at: formData.paid_at,
        valor_pago: formData.valor_pago,
        valor_original: valorOriginal,
        observacoes: formData.observacoes_pagamento,
        juros: {
          percentual: valorOriginal > 0 ? (jurosCalculado / valorOriginal) * 100 : 0,
          valor: jurosCalculado
        },
        desconto: {
          percentual: valorOriginal > 0 ? (descontoCalculado / valorOriginal) * 100 : 0,
          valor: descontoCalculado
        }
      };
      
      await onConfirm(paymentData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl border border-white/20 z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Confirmar Pagamento
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-blue-50/80 rounded-lg border border-blue-200/50">
          <h4 className="font-medium text-blue-900 mb-3">Detalhes da Conta</h4>
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              <strong>Descrição:</strong> {conta.description}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Valor Original:</strong> {formatCurrency(valorOriginal)}
            </p>
            {conta.contact && (
              <p className="text-sm text-blue-800">
                <strong>Contato:</strong> {conta.contact.name}
              </p>
            )}
            {conta.category && (
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <strong>Categoria:</strong>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: conta.category.color || '#6B7280' }}
                  />
                  <span>{conta.category.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_account_id">Conta Bancária (Opcional)</Label>
              <Select 
                value={formData.bank_account_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, bank_account_id: value }))}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Selecione a conta (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-[10000]">
                  <SelectItem value="none">Não informar conta</SelectItem>
                  {allBankAccounts.length === 0 ? (
                  <SelectItem value="nenhuma" disabled>
                    Nenhuma conta cadastrada
                  </SelectItem>
                  ) : (
                     allBankAccounts.map(account => (
                       <SelectItem key={account.id} value={account.id}>
                         {account.bank_name} - {account.agency && account.account_number 
                           ? `Ag: ${account.agency} | CC: ${account.account_number}`
                           : account.pix_key 
                           ? `PIX: ${account.pix_key}`
                           : 'Conta bancária'}
                       </SelectItem>
                     ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_at">Data de Pagamento *</Label>
              <Input
                id="paid_at"
                type="date"
                value={formData.paid_at}
                onChange={(e) => setFormData(prev => ({ ...prev, paid_at: e.target.value }))}
                className={errors.paid_at ? 'border-red-500' : ''}
              />
              {errors.paid_at && <p className="text-sm text-red-600">{errors.paid_at}</p>}
            </div>
          </div>

          {/* Valor Pago */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="valor_pago">Valor Pago *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={preencherValorOriginal}
                className="text-xs"
              >
                Preencher Valor Original
              </Button>
            </div>
            <Input
              id="valor_pago"
              type="text"
              value={formatCurrency(formData.valor_pago)}
              onChange={(e) => {
                // Remove tudo exceto números
                const numbers = e.target.value.replace(/\D/g, '');
                // Converte para centavos e depois para reais
                const value = parseFloat(numbers) / 100 || 0;
                setFormData(prev => ({ ...prev, valor_pago: value }));
              }}
              className={errors.valor_pago ? 'border-red-500' : ''}
              placeholder="R$ 0,00"
            />
            {errors.valor_pago && <p className="text-sm text-red-600">{errors.valor_pago}</p>}
          </div>

          <Separator />

          {/* Resumo do Pagamento */}
          <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200/50">
            <h4 className="font-medium text-gray-900 mb-3">Resumo do Pagamento</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Valor Original:</span>
                <span className="font-medium">{formatCurrency(valorOriginal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor a Pagar:</span>
                <span className="font-medium">{formatCurrency(formData.valor_pago)}</span>
              </div>
              {jurosCalculado > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>+ Juros/Multa:</span>
                  <span className="font-medium">+{formatCurrency(jurosCalculado)} ({((jurosCalculado / valorOriginal) * 100).toFixed(2)}%)</span>
                </div>
              )}
              {descontoCalculado > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>- Desconto:</span>
                  <span className="font-medium">-{formatCurrency(descontoCalculado)} ({((descontoCalculado / valorOriginal) * 100).toFixed(2)}%)</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total a Pagar:</span>
                <span className="text-primary">
                  {formatCurrency(formData.valor_pago)}
                </span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações do Pagamento</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes_pagamento}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes_pagamento: e.target.value }))}
              placeholder="Adicione observações sobre este pagamento..."
              rows={3}
            />
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {loading ? 'Processando...' : `Confirmar Pagamento - ${formatCurrency(formData.valor_pago)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}