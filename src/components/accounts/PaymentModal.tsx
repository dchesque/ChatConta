import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PaymentData } from '@/types/accounts';
import { useBanks } from '@/hooks/useBanks';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: PaymentData) => Promise<void>;
  accountDescription: string;
  loading?: boolean;
}

export function PaymentModal({ isOpen, onClose, onConfirm, accountDescription, loading = false }: PaymentModalProps) {
  const { banks } = useBanks();
  
  const [formData, setFormData] = useState({
    bank_account_id: '',
    paid_at: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        bank_account_id: '',
        paid_at: new Date().toISOString().split('T')[0]
      });
      setErrors({});
    }
  }, [isOpen]);

  // Get all bank accounts from all banks
  const allBankAccounts = banks.flatMap(bank => 
    bank.accounts.map(account => ({
      ...account,
      bank_name: bank.name
    }))
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bank_account_id) {
      newErrors.bank_account_id = 'Conta bancária é obrigatória';
    }

    if (!formData.paid_at) {
      newErrors.paid_at = 'Data de pagamento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onConfirm(formData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Marcar como Pago
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-blue-50/80 rounded-lg border border-blue-200/50">
          <p className="text-sm text-blue-800">
            <strong>Conta:</strong> {accountDescription}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank_account_id">Conta Bancária *</Label>
            <Select 
              value={formData.bank_account_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, bank_account_id: value }))}
            >
              <SelectTrigger className={errors.bank_account_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder="Selecione a conta bancária" />
              </SelectTrigger>
              <SelectContent>
                {allBankAccounts.length === 0 ? (
                  <SelectItem value="" disabled>
                    Nenhuma conta bancária cadastrada
                  </SelectItem>
                ) : (
                  allBankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{account.bank_name}</span>
                        <span className="text-sm text-gray-500">
                          {account.agency && account.account_number 
                            ? `Ag: ${account.agency} | CC: ${account.account_number}`
                            : account.pix_key 
                            ? `PIX: ${account.pix_key}`
                            : 'Conta bancária'}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.bank_account_id && <p className="text-sm text-red-600">{errors.bank_account_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paid_at">Data de Pagamento *</Label>
            <Input
              id="paid_at"
              type="date"
              value={formData.paid_at}
              onChange={(e) => setFormData(prev => ({ ...prev, paid_at: e.target.value }))}
              className={errors.paid_at ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.paid_at && <p className="text-sm text-red-600">{errors.paid_at}</p>}
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
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}