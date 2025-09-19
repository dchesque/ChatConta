import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmacaoModal } from '@/components/ui/ConfirmacaoModal';
import { BankAccount } from '@/types/bank';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  bankId: string;
  account?: BankAccount | null;
  loading?: boolean;
}

export function BankAccountModal({ 
  isOpen, 
  onClose, 
  onSave, 
  bankId, 
  account, 
  loading = false 
}: BankAccountModalProps) {
  const [formData, setFormData] = useState({
    bank_id: bankId,
    agency: '',
    account_number: '',
    pix_key: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        bank_id: account.bank_id,
        agency: account.agency || '',
        account_number: account.account_number || '',
        pix_key: account.pix_key || ''
      });
    } else {
      setFormData({
        bank_id: bankId,
        agency: '',
        account_number: '',
        pix_key: ''
      });
    }
    setErrors({});
  }, [account, bankId, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Para edição, permitir que todos os campos sejam removidos (conta será excluída)
    // Para criação, exigir pelo menos um campo
    if (!account && !formData.agency.trim() && !formData.account_number.trim() && !formData.pix_key.trim()) {
      newErrors.general = 'Preencha pelo menos um dos campos: Agência, Conta ou PIX';
    }

    // Se agência for preenchida, conta também deve ser
    if (formData.agency.trim() && !formData.account_number.trim()) {
      newErrors.account_number = 'Conta é obrigatória quando agência é informada';
    }

    // Se conta for preenchida, agência também deve ser
    if (formData.account_number.trim() && !formData.agency.trim()) {
      newErrors.agency = 'Agência é obrigatória quando conta é informada';
    }

    // Validação básica de PIX (email, CPF/CNPJ, telefone, ou chave aleatória)
    if (formData.pix_key.trim()) {
      const pixKey = formData.pix_key.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey);
      const isCPF = /^\d{11}$/.test(pixKey.replace(/\D/g, ''));
      const isCNPJ = /^\d{14}$/.test(pixKey.replace(/\D/g, ''));
      const isPhone = /^\+?5[5]\d{2}\d{8,9}$/.test(pixKey.replace(/\D/g, '')) || /^\d{10,11}$/.test(pixKey.replace(/\D/g, ''));
      const isRandomKey = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pixKey);

      if (!isEmail && !isCPF && !isCNPJ && !isPhone && !isRandomKey) {
        newErrors.pix_key = 'Informe uma chave PIX válida (email, CPF, CNPJ, telefone ou chave aleatória)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Se está editando e todos os campos estão vazios, significa que o usuário quer excluir a conta
      const allFieldsEmpty = !formData.agency.trim() && !formData.account_number.trim() && !formData.pix_key.trim();

      if (account && allFieldsEmpty) {
        // Abrir modal de confirmação
        setConfirmDeleteOpen(true);
        return;
      }

      // Limpar campos vazios antes de enviar
      const dataToSave = {
        bank_id: formData.bank_id,
        agency: formData.agency.trim() || undefined,
        account_number: formData.account_number.trim() || undefined,
        pix_key: formData.pix_key.trim() || undefined
      };

      // Dados validados, prosseguindo com o salvamento
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('❌ Erro no modal ao salvar conta:', error);
      // Error handling is done in the parent component
    }
  };

  const handleConfirmDelete = () => {
    // Fechar modal de confirmação e modal principal
    setConfirmDeleteOpen(false);
    onClose();
    // Informar ao usuário para usar o botão excluir
    setTimeout(() => {
      alert('Para excluir a conta, use o botão "Excluir" no menu de ações da conta.');
    }, 100);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-white/20 z-50">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {account ? 'Editar Conta' : 'Nova Conta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agency">Agência</Label>
              <Input
                id="agency"
                value={formData.agency}
                onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
                placeholder="1234-5"
                className={errors.agency ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.agency && <p className="text-sm text-red-600">{errors.agency}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Conta</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="12345-6"
                className={errors.account_number ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {errors.account_number && <p className="text-sm text-red-600">{errors.account_number}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix_key">Chave PIX</Label>
            <Input
              id="pix_key"
              value={formData.pix_key}
              onChange={(e) => setFormData(prev => ({ ...prev, pix_key: e.target.value }))}
              placeholder="email@exemplo.com ou CPF/CNPJ ou telefone"
              className={errors.pix_key ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {errors.pix_key && <p className="text-sm text-red-600">{errors.pix_key}</p>}
            <p className="text-xs text-gray-500">
              Informe sua chave PIX (email, CPF, CNPJ ou telefone)
              {account && formData.pix_key && (
                <span className="block text-blue-600 mt-1">
                  💡 Para remover a chave PIX, apague o conteúdo deste campo
                </span>
              )}
            </p>
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

    {/* Modal de Confirmação - z-index maior que o modal principal */}
    {confirmDeleteOpen && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100/80 rounded-lg">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Campos Vazios</h3>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Todos os campos estão vazios. Para excluir a conta, use o botão 'Excluir' no menu de ações. Deseja continuar?
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}