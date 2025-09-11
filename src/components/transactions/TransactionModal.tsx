import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Transaction, CreateTransaction, TransactionType } from '@/types/transaction';
import { useBankAccountsAll } from '@/hooks/useBankAccountsAll';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAccountsReceivable } from '@/hooks/useAccountsReceivable';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTransaction) => void;
  transaction?: Transaction | null;
  mode: 'create' | 'edit';
}

export const TransactionModal = ({ isOpen, onClose, onSave, transaction, mode }: TransactionModalProps) => {
  const [formData, setFormData] = useState<CreateTransaction>({
    type: 'income',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    notes: ''
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { accounts: bankAccounts } = useBankAccountsAll();
  const { accounts: accountsPayable } = useAccountsPayable();
  const { accounts: accountsReceivable } = useAccountsReceivable();

  useEffect(() => {
    if (transaction && mode === 'edit') {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description || '',
        from_account_id: transaction.from_account_id,
        to_account_id: transaction.to_account_id,
        accounts_payable_id: transaction.accounts_payable_id,
        accounts_receivable_id: transaction.accounts_receivable_id,
        notes: transaction.notes || ''
      });
    } else {
      setFormData({
        type: 'income',
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        notes: ''
      });
    }
  }, [transaction, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.amount || formData.amount <= 0) {
      return;
    }

    if (formData.type === 'transfer') {
      if (!formData.from_account_id || !formData.to_account_id) {
        return;
      }
      if (formData.from_account_id === formData.to_account_id) {
        return;
      }
    }

    onSave(formData);
    onClose();
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData(prev => ({
      ...prev,
      type,
      from_account_id: undefined,
      to_account_id: undefined,
      accounts_payable_id: undefined,
      accounts_receivable_id: undefined
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Nova Transação' : 'Editar Transação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="bg-white/80 backdrop-blur-sm border border-gray-300/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Entrada</SelectItem>
                <SelectItem value="expense">Saída</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className="bg-white/80 backdrop-blur-sm border border-gray-300/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white/80 backdrop-blur-sm border border-gray-300/50",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(new Date(formData.date), "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      date: date ? format(date, 'yyyy-MM-dd') : '' 
                    }));
                    setCalendarOpen(false);
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/80 backdrop-blur-sm border border-gray-300/50"
            />
          </div>

          {/* Campos específicos por tipo */}
          {formData.type === 'income' && (
            <>
              <div className="space-y-2">
                <Label>Conta de Destino</Label>
                <Select 
                  value={formData.to_account_id || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, to_account_id: value || undefined }))}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border border-gray-300/50">
                    <SelectValue placeholder="Selecionar conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {(account as any).bank?.name || 'Banco'} - {account.agency}/{account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conta a Receber</Label>
                <Select 
                  value={formData.accounts_receivable_id || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, accounts_receivable_id: value || undefined }))}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border border-gray-300/50">
                    <SelectValue placeholder="Selecionar conta a receber" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountsReceivable.filter(acc => acc.status === 'pending').map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.description} - R$ {account.amount.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {formData.type === 'expense' && (
            <>
              <div className="space-y-2">
                <Label>Conta de Origem</Label>
                <Select 
                  value={formData.from_account_id || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, from_account_id: value || undefined }))}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border border-gray-300/50">
                    <SelectValue placeholder="Selecionar conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {(account as any).bank?.name || 'Banco'} - {account.agency}/{account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conta a Pagar</Label>
                <Select 
                  value={formData.accounts_payable_id || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, accounts_payable_id: value || undefined }))}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border border-gray-300/50">
                    <SelectValue placeholder="Selecionar conta a pagar" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountsPayable.filter(acc => acc.status === 'pending').map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.description} - R$ {account.amount.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {formData.type === 'transfer' && (
            <>
              <div className="space-y-2">
                <Label>Conta de Origem *</Label>
                <Select 
                  value={formData.from_account_id || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, from_account_id: value || undefined }))}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border border-gray-300/50">
                    <SelectValue placeholder="Selecionar conta de origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {(account as any).bank?.name || 'Banco'} - {account.agency}/{account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conta de Destino *</Label>
                <Select 
                  value={formData.to_account_id || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, to_account_id: value || undefined }))}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border border-gray-300/50">
                    <SelectValue placeholder="Selecionar conta de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.filter(acc => acc.id !== formData.from_account_id).map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {(account as any).bank?.name || 'Banco'} - {account.agency}/{account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-white/80 backdrop-blur-sm border border-gray-300/50"
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {mode === 'create' ? 'Criar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};