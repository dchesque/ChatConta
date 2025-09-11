import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AccountReceivable, ReceivableStatus } from '@/types/accounts';
import { formatCurrency, converterMoedaParaNumero } from '@/lib/formatacaoBrasileira';
import { useCategories } from '@/hooks/useCategories';

interface AccountReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  account?: AccountReceivable | null;
  loading?: boolean;
}

export function AccountReceivableModal({ isOpen, onClose, onSave, account, loading = false }: AccountReceivableModalProps) {
  const { categories } = useCategories();

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    due_date: '',
    status: 'pending' as ReceivableStatus,
    category_id: '',
    customer_name: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (account) {
      setFormData({
        description: account.description,
        amount: account.amount,
        due_date: account.due_date,
        status: account.status,
        category_id: account.category_id || '',
        customer_name: account.customer_name || '',
        notes: account.notes || ''
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        due_date: '',
        status: 'pending',
        category_id: '',
        customer_name: '',
        notes: ''
      });
    }
    setErrors({});
  }, [account, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Data de vencimento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const dataToSave = {
        description: formData.description.trim(),
        amount: formData.amount,
        due_date: formData.due_date,
        status: formData.status,
        category_id: formData.category_id || undefined,
        customer_name: formData.customer_name.trim() || undefined,
        notes: formData.notes.trim() || undefined
      };

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleAmountChange = (value: string) => {
    const numericValue = converterMoedaParaNumero(value);
    setFormData(prev => ({ ...prev, amount: numericValue }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {account ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Venda de produtos"
              className={errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                value={formatCurrency(formData.amount)}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="R$ 0,00"
                className={errors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Vencimento *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className={errors.due_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.due_date && <p className="text-sm text-red-600">{errors.due_date}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma categoria</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        {category.color && (
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                        )}
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_name">Cliente</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="Nome do cliente"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: ReceivableStatus) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="received">Recebido</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
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