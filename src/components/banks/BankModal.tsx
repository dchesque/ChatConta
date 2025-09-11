import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Bank, BankType, BANK_TYPE_OPTIONS } from '@/types/bank';

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Bank, 'id' | 'created_at' | 'updated_at' | 'user_id'>, accountData?: { agency?: string; account_number?: string; pix_key?: string }) => Promise<void>;
  bank?: Bank | null;
  loading?: boolean;
}

export function BankModal({ isOpen, onClose, onSave, bank, loading = false }: BankModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'banco' as BankType,
    initial_balance: 0 // Mantido para compatibilidade, sempre será 0
  });

  const [accountData, setAccountData] = useState({
    agency: '',
    account_number: '',
    pix_key: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (bank) {
      setFormData({
        name: bank.name,
        type: bank.type,
        initial_balance: 0 // Sempre 0, não editável
      });
    } else {
      setFormData({
        name: '',
        type: 'banco',
        initial_balance: 0 // Sempre 0
      });
      setAccountData({
        agency: '',
        account_number: '',
        pix_key: ''
      });
    }
    setErrors({});
  }, [bank, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    // Removida validação de saldo - não é mais usado

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Se tiver dados de conta, passa junto
      const hasAccountData = accountData.agency || accountData.account_number || accountData.pix_key;
      await onSave(formData, hasAccountData ? accountData : undefined);
      onClose();
    } catch {
      // Error handling is done in the parent component
    }
  };

  // Função removida - não é mais necessária para saldo

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {bank ? 'Editar Banco' : 'Novo Banco'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Banco do Brasil"
              className={errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select value={formData.type} onValueChange={(value: BankType) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {BANK_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campos opcionais da conta */}
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Dados da Conta (Opcional)</h4>
              <p className="text-xs text-gray-500">Você pode adicionar estes dados agora ou criar contas separadamente depois.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="agency">Agência</Label>
                <Input
                  id="agency"
                  value={accountData.agency}
                  onChange={(e) => setAccountData(prev => ({ ...prev, agency: e.target.value }))}
                  placeholder="0001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">Número da Conta</Label>
                <Input
                  id="account_number"
                  value={accountData.account_number}
                  onChange={(e) => setAccountData(prev => ({ ...prev, account_number: e.target.value }))}
                  placeholder="12345-6"
                />
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <Label htmlFor="pix_key">Chave PIX</Label>
              <Input
                id="pix_key"
                value={accountData.pix_key}
                onChange={(e) => setAccountData(prev => ({ ...prev, pix_key: e.target.value }))}
                placeholder="email@exemplo.com, CPF, telefone..."
              />
            </div>
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}