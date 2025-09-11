import React, { useState } from 'react';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ConfirmacaoModal } from '@/components/ui/ConfirmacaoModal';
import { BankCard } from '@/components/banks/BankCard';
import { BanksList } from '@/components/banks/BanksList';
import { BankModal } from '@/components/banks/BankModal';
import { BankAccountModal } from '@/components/banks/BankAccountModal';
import { BankAccountsViewModal } from '@/components/banks/BankAccountsViewModal';
import { useBanks } from '@/hooks/useBanks';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useLoadingState } from '@/hooks/useLoadingStates';
import { Bank, BankWithAccounts, BankType, BANK_TYPE_OPTIONS, BANK_TYPE_LABELS } from '@/types/bank';

export default function Banks() {
  const { banks, loading, createBank, updateBank, deleteBank, refetch } = useBanks();
  const { createAccount } = useBankAccounts();
  const { isLoading, setLoading } = useLoadingState();

  // Estados dos modais
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankWithAccounts | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedBankForAccount, setSelectedBankForAccount] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | BankType>('all');
  const [viewAccountsModalOpen, setViewAccountsModalOpen] = useState(false);
  const [selectedBankForView, setSelectedBankForView] = useState<BankWithAccounts | null>(null);

  // Filtrar bancos
  const filteredBanks = banks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || bank.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calcular estatísticas (sem saldos)
  const totalBanks = banks.length;
  const totalAccounts = banks.reduce((sum, bank) => sum + bank.accounts.length, 0);
  const bancosPorTipo = banks.reduce((acc, bank) => {
    acc[bank.type] = (acc[bank.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const tipoMaisUsado = Object.entries(bancosPorTipo).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  const handleCreateBank = async (bankData: Omit<Bank, 'id' | 'created_at' | 'updated_at' | 'user_id'>, accountData?: { agency?: string; account_number?: string; pix_key?: string }) => {
    setLoading('saving', true);
    try {
      const newBank = await createBank(bankData);
      
      // Se tiver dados de conta, criar a conta junto
      if (accountData && newBank) {
        await createAccount({
          bank_id: newBank.id,
          agency: accountData.agency,
          account_number: accountData.account_number,
          pix_key: accountData.pix_key
        });
        // Refresh para mostrar a conta criada
        await refetch();
      }
    } finally {
      setLoading('saving', false);
    }
  };

  const handleUpdateBank = async (bankData: Omit<Bank, 'id' | 'created_at' | 'updated_at' | 'user_id'>, accountData?: { agency?: string; account_number?: string; pix_key?: string }) => {
    if (!selectedBank) return;
    setLoading('saving', true);
    try {
      await updateBank(selectedBank.id, bankData);
      // Note: Para edição, não criamos nova conta automaticamente
      // O usuário deve usar o botão "Adicionar Conta" para isso
    } finally {
      setLoading('saving', false);
    }
  };

  const handleEditBank = (bank: BankWithAccounts) => {
    setSelectedBank(bank);
    setBankModalOpen(true);
  };

  const handleDeleteBank = (bank: BankWithAccounts) => {
    setBankToDelete(bank.id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteBank = async () => {
    if (!bankToDelete) return;
    setLoading('deleting', true);
    try {
      await deleteBank(bankToDelete);
      setBankToDelete(null);
      setDeleteModalOpen(false);
    } finally {
      setLoading('deleting', false);
    }
  };

  const handleAddAccount = (bank: BankWithAccounts) => {
    setSelectedBankForAccount(bank.id);
    setAccountModalOpen(true);
  };

  const handleViewAccounts = (bank: BankWithAccounts) => {
    setSelectedBankForView(bank);
    setViewAccountsModalOpen(true);
  };

  const handleCreateAccount = async (accountData: any) => {
    setLoading('saving', true);
    try {
      await createAccount(accountData);
      // Refresh the banks list to show the new account
      await refetch();
    } finally {
      setLoading('saving', false);
    }
  };

  const breadcrumb = [
    { label: 'Início', href: '/' },
    { label: 'Cadastros', href: '#' },
    { label: 'Bancos e Contas', href: '/banks' }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <PageHeader
        title="Bancos e Contas"
        subtitle="Gerencie suas instituições financeiras e contas"
        breadcrumb={breadcrumb}
        actions={
          <Button
            onClick={() => {
              setSelectedBank(null);
              setBankModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Banco
          </Button>
        }
      />

      {/* Estatísticas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total de Bancos</h3>
            <p className="text-2xl font-bold text-gray-900">{totalBanks}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total de Contas</h3>
            <p className="text-2xl font-bold text-gray-900">{totalAccounts}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Tipo Mais Usado</h3>
            <p className="text-2xl font-bold text-gray-900">{BANK_TYPE_LABELS[tipoMaisUsado as BankType] || 'N/A'}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Bancos Ativos</h3>
            <p className="text-2xl font-bold text-gray-900">{totalBanks}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar bancos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={(value: 'all' | BankType) => setTypeFilter(value)}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {BANK_TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Toggle de visualização */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none border-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-none border-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de bancos */}
      {loading ? (
        viewMode === 'list' ? (
          <LoadingSkeleton className="h-96" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-64" />
            ))}
          </div>
        )
      ) : filteredBanks.length === 0 ? (
        <EmptyState
          icon={Plus}
          title={searchTerm || typeFilter !== 'all' ? 'Nenhum banco encontrado' : 'Nenhum banco cadastrado'}
          description={
            searchTerm || typeFilter !== 'all'
              ? 'Tente ajustar os filtros para encontrar o que procura.'
              : 'Comece criando seu primeiro banco ou carteira digital.'
          }
          actionLabel="Novo Banco"
          onAction={() => {
            setSelectedBank(null);
            setBankModalOpen(true);
          }}
        />
      ) : viewMode === 'list' ? (
        <BanksList
          banks={filteredBanks}
          onEdit={handleEditBank}
          onDelete={handleDeleteBank}
          onAddAccount={handleAddAccount}
          onViewAccounts={handleViewAccounts}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBanks.map(bank => (
            <BankCard
              key={bank.id}
              bank={bank}
              onEdit={handleEditBank}
              onDelete={handleDeleteBank}
              onAddAccount={handleAddAccount}
              onViewAccounts={handleViewAccounts}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <BankModal
        isOpen={bankModalOpen}
        onClose={() => {
          setBankModalOpen(false);
          setSelectedBank(null);
        }}
        onSave={selectedBank ? handleUpdateBank : handleCreateBank}
        bank={selectedBank}
        loading={isLoading('saving')}
      />

      <BankAccountModal
        isOpen={accountModalOpen}
        onClose={() => {
          setAccountModalOpen(false);
          setSelectedBankForAccount('');
        }}
        onSave={handleCreateAccount}
        bankId={selectedBankForAccount}
        loading={isLoading('saving')}
      />

      <BankAccountsViewModal
        isOpen={viewAccountsModalOpen}
        onClose={() => {
          setViewAccountsModalOpen(false);
          setSelectedBankForView(null);
        }}
        bank={selectedBankForView}
      />

      <ConfirmacaoModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBankToDelete(null);
        }}
        onConfirm={confirmDeleteBank}
        titulo="Excluir Banco"
        mensagem="Tem certeza que deseja excluir este banco? Esta ação não pode ser desfeita e todas as contas vinculadas também serão excluídas."
        loading={isLoading('deleting')}
      />
    </div>
  );
}