import React, { useState, useMemo } from 'react';
import { Plus, FileText, TrendingDown, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContasPagarList, ContaListItem } from '@/components/contasPagar/ContasPagarList';
import { PaymentModalAdvanced } from '@/components/contasPagar/PaymentModalAdvanced';
import { FiltrosInteligentes } from '@/components/contasPagar/FiltrosInteligentes';
import { useContasPagarOtimizado } from '@/hooks/useContasPagarOtimizado';
import { useLoadingState } from '@/hooks/useLoadingStates';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { AccountPayable } from '@/types/accounts';
import { formatCurrency } from '@/utils/currency';
import { showMessage } from '@/utils/messages';
import { ConfirmacaoModal } from '@/components/ui/ConfirmacaoModal';
import ContaVisualizarModalUX from '@/components/contasPagar/ContaVisualizarModalUX';
import ContaEditarModalUX from '@/components/contasPagar/ContaEditarModalUX';
import { accountPayableToContaPagar } from '@/utils/typeAdapters';

export default function ContasPagar() {
  const navigate = useNavigate();
  const filtrosIniciais = {};

  const { 
    contas: accounts, 
    categorias: categories,
    fornecedores: contacts,
    filtros,
    setFiltros,
    filtroRapido,
    setFiltroRapido,
    limparFiltros,
    estatisticas,
    estados,
    baixarConta: markAsPaid, 
    excluirConta: deleteAccount,
    atualizarConta: updateAccount,
    voltarMesAtual
  } = useContasPagarOtimizado(filtrosIniciais);
  const { isLoading, setLoading } = useLoadingState();
  const { createAccount } = useAccountsPayable();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null);

  // Converter accounts para ContaListItem
  const contasListadas = useMemo((): ContaListItem[] => {
    return accounts.map(account => ({
      id: account.id,
      description: account.description,
      amount: account.amount,
      due_date: account.due_date,
      status: account.status,
      contact: account.contact,
      category: account.category,
      notes: account.notes,
      reference_document: account.reference_document,
      paid_at: account.paid_at,
      created_at: account.created_at
    }));
  }, [accounts]);

  const loading = estados.loading;

  const handleNovaContaClick = () => {
    navigate('/nova-conta');
  };

  const handleViewAccount = (conta: ContaListItem) => {
    setSelectedAccount(accounts.find(acc => acc.id === conta.id) || null);
    setViewModalOpen(true);
  };

  const handleEditAccount = (conta: ContaListItem) => {
    setSelectedAccount(accounts.find(acc => acc.id === conta.id) || null);
    setEditModalOpen(true);
  };

  const handlePayAccount = (conta: ContaListItem) => {
    setSelectedAccount(accounts.find(acc => acc.id === conta.id) || null);
    setPaymentModalOpen(true);
  };

  const handleDeleteAccount = (conta: ContaListItem) => {
    setSelectedAccount(accounts.find(acc => acc.id === conta.id) || null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAccount) return;
    try {
      await deleteAccount(selectedAccount.id);
      setDeleteModalOpen(false);
      setSelectedAccount(null);
      showMessage.deleteSuccess('Conta excluída com sucesso!');
    } catch (error) {
      showMessage.deleteError('Erro ao excluir conta');
    }
  };

  const handlePaymentConfirm = async (paymentData: any) => {
    if (!selectedAccount) return;
    setLoading('saving', true);
    try {
      await markAsPaid(selectedAccount.id, paymentData);
      setPaymentModalOpen(false);
      setSelectedAccount(null);
      showMessage.saveSuccess('Pagamento confirmado com sucesso!');
    } catch (error) {
      showMessage.saveError('Erro ao confirmar pagamento');
    } finally {
      setLoading('saving', false);
    }
  };

  const breadcrumb = [
    { label: 'Início', href: '/' },
    { label: 'Financeiro', href: '#' },
    { label: 'Contas a Pagar', href: '/contas-pagar' }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <PageHeader
        title="Contas a Pagar"
        subtitle="Gerencie suas despesas e obrigações financeiras"
        breadcrumb={breadcrumb}
        actions={
          <Button
            onClick={handleNovaContaClick}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        }
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total a Pagar
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(estatisticas.total_valor)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {estatisticas.total} conta(s)
            </p>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {formatCurrency(estatisticas.valor_pendente)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {estatisticas.pendentes} conta(s)
            </p>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vencidas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(estatisticas.valor_vencido)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {estatisticas.vencidas} conta(s)
            </p>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pagas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(estatisticas.valor_pago)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {estatisticas.pagas} conta(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Inteligentes */}
      <FiltrosInteligentes
        filtros={filtros}
        setFiltros={setFiltros}
        filtroRapido={filtroRapido}
        setFiltroRapido={setFiltroRapido}
        fornecedores={contacts.map(c => ({ id: c.id, name: c.name }))}
        categorias={categories.map(c => ({ id: c.id, name: c.name, color: c.color }))}
        estatisticas={estatisticas}
        onLimparFiltros={limparFiltros}
        onVoltarMesAtual={voltarMesAtual}
      />

      {/* Lista de Contas */}
      <ContasPagarList
        contas={contasListadas}
        loading={loading}
        onView={handleViewAccount}
        onEdit={handleEditAccount}
        onPay={handlePayAccount}
        onDelete={handleDeleteAccount}
      />

      {/* Modals */}
      <PaymentModalAdvanced
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedAccount(null);
        }}
        onConfirm={handlePaymentConfirm}
        conta={selectedAccount ? {
          id: selectedAccount.id,
          description: selectedAccount.description,
          amount: selectedAccount.amount,
          due_date: selectedAccount.due_date
        } : null}
        loading={isLoading('saving')}
      />

      {/* Modal de Visualização */}
      <ContaVisualizarModalUX
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedAccount(null);
        }}
        conta={selectedAccount ? accountPayableToContaPagar(selectedAccount) as any : null}
        onEditar={(conta) => {
          setViewModalOpen(false);
          setEditModalOpen(true);
        }}
        onBaixar={(conta) => {
          setViewModalOpen(false);
          setPaymentModalOpen(true);
        }}
        onDuplicar={(conta) => {
          // TODO: Implementar duplicação de conta
        }}
        onExcluir={(conta) => {
          setViewModalOpen(false);
          setDeleteModalOpen(true);
        }}
        onReload={() => window.location.reload()}
      />

      {/* Modal de Edição */}
      <ContaEditarModalUX
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedAccount(null);
        }}
        conta={selectedAccount ? accountPayableToContaPagar(selectedAccount) as any : null}
        onSalvar={async (dadosEdicao) => {
          if (!selectedAccount) return;
          try {
            console.log('🔄 ContasPagar onSalvar - Dados recebidos:', dadosEdicao);
            const updateData = {
              description: dadosEdicao.descricao,
              amount: dadosEdicao.valor_final,
              due_date: dadosEdicao.data_vencimento,
              notes: dadosEdicao.observacoes,
              contact_id: dadosEdicao.contact_id || dadosEdicao.contact?.id,
              category_id: dadosEdicao.category_id || dadosEdicao.category?.id,
              reference_document: dadosEdicao.documento_referencia,
              original_amount: dadosEdicao.valor_original,
              final_amount: dadosEdicao.valor_final
            };
            console.log('🔄 ContasPagar onSalvar - Dados para update:', updateData);
            
            await updateAccount(selectedAccount.id, updateData);
            // Pequeno delay para garantir que a UI seja atualizada
            setTimeout(() => {
              setEditModalOpen(false);
              setSelectedAccount(null);
            }, 100);
            showMessage.saveSuccess('Conta atualizada com sucesso!');
          } catch (error) {
            console.error('Erro ao atualizar conta:', error);
            showMessage.saveError('Erro ao atualizar conta');
          }
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmacaoModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedAccount(null);
        }}
        onConfirm={handleConfirmDelete}
        titulo="Confirmar Exclusão"
        mensagem={`Tem certeza que deseja excluir a conta "${selectedAccount?.description}"? Esta ação não pode ser desfeita.`}
        tipo="danger"
        textoConfirmar="Excluir Conta"
        textoCancelar="Cancelar"
      />
    </div>
  );
}