
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, Building2, FileText } from 'lucide-react';
import { AccountReceivable } from '@/types/accounts';
import { formatCurrency } from '@/utils/currency';
import { useBankAccountsAll } from '@/hooks/useBankAccountsAll';
import { toast } from 'sonner';

interface RecebimentoModalAdvancedProps {
  isOpen: boolean;
  onClose: () => void;
  conta: AccountReceivable | null;
  onConfirm: (dadosRecebimento: {
    bank_account_id: string;
    received_at: string;
    received_amount?: number;
    notes?: string;
  }) => void;
}

export const RecebimentoModalAdvanced: React.FC<RecebimentoModalAdvancedProps> = ({
  isOpen,
  onClose,
  conta,
  onConfirm
}) => {
  const { accounts: bankAccounts } = useBankAccountsAll();
  
  const [formData, setFormData] = useState({
    bank_account_id: '',
    received_at: new Date().toISOString().split('T')[0],
    received_amount: conta?.amount || 0,
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (conta) {
      setFormData({
        bank_account_id: '',
        received_at: new Date().toISOString().split('T')[0],
        received_amount: conta.amount,
        notes: ''
      });
    }
  }, [conta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bank_account_id) {
      toast.error('Selecione uma conta bancária');
      return;
    }

    if (!formData.received_at) {
      toast.error('Informe a data do recebimento');
      return;
    }

    if (!formData.received_amount || formData.received_amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    setLoading(true);
    
    try {
      await onConfirm({
        bank_account_id: formData.bank_account_id,
        received_at: formData.received_at,
        received_amount: formData.received_amount,
        notes: formData.notes || undefined
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const diferenca = formData.received_amount - (conta?.amount || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-base max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-lg font-semibold">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Registrar Recebimento</span>
          </DialogTitle>
        </DialogHeader>

        {conta && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resumo da Conta */}
            <Card className="bg-green-50/50 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Descrição:</span>
                    <span className="font-medium text-gray-900 text-right max-w-48 truncate">
                      {conta.description}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor Original:</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(conta.amount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vencimento:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(conta.due_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {conta.customer_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cliente:</span>
                      <span className="text-sm text-gray-900 text-right max-w-48 truncate">
                        {conta.customer_name}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dados do Recebimento */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="received_at" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Data do Recebimento *</span>
                </Label>
                <Input
                  id="received_at"
                  type="date"
                  value={formData.received_at}
                  onChange={(e) => setFormData({ ...formData, received_at: e.target.value })}
                  className="input-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account_id" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Conta Bancária *</span>
                </Label>
                <Select
                  value={formData.bank_account_id}
                  onValueChange={(value) => setFormData({ ...formData, bank_account_id: value })}
                >
                  <SelectTrigger className="input-base">
                    <SelectValue placeholder="Selecione a conta bancária" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts && bankAccounts.length > 0 ? (
                      bankAccounts
                        .filter(account => account.id && account.id.trim() !== '') // Filtrar contas com ID válido
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.bank?.name && (account.agency && account.account_number) 
                              ? `${account.bank.name} - Ag: ${account.agency} | CC: ${account.account_number}`
                              : account.bank?.name && account.pix_key
                              ? `${account.bank.name} - PIX: ${account.pix_key}`
                              : account.bank?.name
                              ? `${account.bank.name} - Conta Bancária`
                              : `Conta ${account.id.substring(0, 8)}...`
                            }
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-accounts" disabled>
                        Nenhuma conta bancária encontrada
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="received_amount" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Valor Recebido *</span>
                </Label>
                <Input
                  id="received_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.received_amount}
                  onChange={(e) => setFormData({ ...formData, received_amount: parseFloat(e.target.value) })}
                  className="input-base"
                  required
                />
                
                {diferenca !== 0 && (
                  <div className={`text-sm p-2 rounded-md ${
                    diferenca > 0 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {diferenca > 0 ? (
                      <>Recebimento <strong>superior</strong> em {formatCurrency(diferenca)}</>
                    ) : (
                      <>Recebimento <strong>inferior</strong> em {formatCurrency(Math.abs(diferenca))}</>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Observações</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Observações sobre o recebimento (opcional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-base min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Registrando...</span>
                  </div>
                ) : (
                  'Registrar Recebimento'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
