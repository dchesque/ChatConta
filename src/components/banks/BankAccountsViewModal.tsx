import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, CreditCard, Key, Building2 } from 'lucide-react';
import { BankWithAccounts, BankAccount } from '@/types/bank';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { BankAccountModal } from './BankAccountModal';
import { ConfirmacaoModal } from '@/components/ui/ConfirmacaoModal';

interface BankAccountsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: BankWithAccounts | null;
}

export function BankAccountsViewModal({ isOpen, onClose, bank }: BankAccountsViewModalProps) {
  const { accounts, loading, createAccount, updateAccount, deleteAccount } = useBankAccounts(bank?.id);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setAccountModalOpen(true);
  };

  const handleDeleteAccount = (account: BankAccount) => {
    setAccountToDelete(account.id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    try {
      await deleteAccount(accountToDelete);
      setAccountToDelete(null);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
    }
  };

  const formatAccountInfo = (account: BankAccount) => {
    const parts = [];
    if (account.agency) parts.push(`Ag: ${account.agency}`);
    if (account.account_number) parts.push(`CC: ${account.account_number}`);
    if (account.pix_key) parts.push(`PIX: ${account.pix_key}`);
    return parts.length > 0 ? parts.join(' • ') : 'Dados não informados';
  };

  const getAccountIcon = (account: BankAccount) => {
    if (account.pix_key) return <Key className="h-4 w-4 text-purple-600" />;
    if (account.agency && account.account_number) return <CreditCard className="h-4 w-4 text-blue-600" />;
    return <Building2 className="h-4 w-4 text-gray-600" />;
  };

  if (!bank) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl bg-white/95 backdrop-blur-xl border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Contas de {bank.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cabeçalho com estatísticas */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total de Contas</p>
                  <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div>
                  <p className="text-sm text-gray-600">Contas com PIX</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {accounts.filter(acc => acc.pix_key).length}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSelectedAccount(null);
                  setAccountModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </div>

            {/* Lista de contas */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando contas...</p>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Nenhuma conta cadastrada</p>
                <p className="text-sm text-gray-400 mb-4">
                  Adicione uma conta para começar a organizar suas informações bancárias
                </p>
                <Button
                  onClick={() => {
                    setSelectedAccount(null);
                    setAccountModalOpen(true);
                  }}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeira Conta
                </Button>
              </div>
            ) : (
              <div className="bg-white/50 rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold">Tipo</TableHead>
                      <TableHead className="font-semibold">Informações</TableHead>
                      <TableHead className="font-semibold">Criada em</TableHead>
                      <TableHead className="font-semibold w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAccountIcon(account)}
                            <span className="text-sm font-medium">
                              {account.pix_key ? 'PIX' : 'Conta Corrente'}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              {formatAccountInfo(account)}
                            </div>
                            {account.pix_key && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                {account.pix_key}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {new Date(account.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-white/20">
                              <DropdownMenuItem onClick={() => handleEditAccount(account)} className="cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteAccount(account)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de conta */}
      <BankAccountModal
        isOpen={accountModalOpen}
        onClose={() => {
          setAccountModalOpen(false);
          setSelectedAccount(null);
        }}
        onSave={async (data) => {
          if (selectedAccount) {
            await updateAccount(selectedAccount.id, data);
          } else {
            await createAccount(data);
          }
          setAccountModalOpen(false);
          setSelectedAccount(null);
        }}
        bankId={bank.id}
        account={selectedAccount}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmacaoModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={confirmDeleteAccount}
        titulo="Excluir Conta"
        mensagem="Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita."
      />
    </>
  );
}