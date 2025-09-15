
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useContasReceberOtimizado } from '@/hooks/useContasReceberOtimizado';
import { formatCurrency } from '@/utils/currency';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ConfirmacaoModal } from '@/components/ui/ConfirmacaoModal';
import { FiltrosInteligentesReceber } from '@/components/contasReceber/FiltrosInteligentesReceber';
import { ContasReceberList, ContaReceberListItem } from '@/components/contasReceber/ContasReceberList';
import { RecebimentoModalAdvanced } from '@/components/contasReceber/RecebimentoModalAdvanced';
import ContaReceberVisualizarModalUX from '@/components/contasReceber/ContaReceberVisualizarModalUX';
import ContaReceberEditarModalUX from '@/components/contasReceber/ContaReceberEditarModalUX';
import { AccountReceivable } from '@/types/accounts';
import { processAccountReceivableForModal } from '@/utils/typeAdapters';

const ContasReceber: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    contasFiltradas,
    categorias,
    clientes,
    filtros,
    setFiltros,
    filtroRapido,
    setFiltroRapido,
    limparFiltros,
    estatisticas,
    estados,
    baixarConta,
    excluirConta,
    atualizarConta,
    duplicarConta,
    voltarMesAtual
  } = useContasReceberOtimizado();

  const [modalRecebimentoAberto, setModalRecebimentoAberto] = useState(false);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<AccountReceivable | null>(null);

  // Transformar contas para o formato da lista - memoizado para evitar re-renders
  const contasListadas = useMemo((): ContaReceberListItem[] => {
    if (!contasFiltradas || !Array.isArray(contasFiltradas)) {
      return [];
    }
    
    return contasFiltradas.map(conta => ({
      id: conta.id,
      description: conta.description,
      amount: conta.amount,
      due_date: conta.due_date,
      status: conta.status,
      contact: conta.contact,
      customer_name: conta.customer_name,
      category: conta.category,
      notes: conta.notes,
      reference_document: conta.reference_document,
      received_at: conta.received_at,
      created_at: conta.created_at
    }));
  }, [contasFiltradas]);

  // Handlers memoizados
  const handlers = useMemo(() => ({
    handleCreateAccount: () => navigate('/novo-recebimento'),
    
    handleView: (conta: ContaReceberListItem) => {
      const contaCompleta = contasFiltradas.find(c => c.id === conta.id);
      if (contaCompleta) {
        console.log('🔍 ContasReceber handleView - Conta original:', contaCompleta);
        const contaProcessada = processAccountReceivableForModal(contaCompleta);
        setContaSelecionada(contaProcessada);
      }
      setModalVisualizarAberto(true);
    },

    handleEdit: (conta: ContaReceberListItem) => {
      const contaCompleta = contasFiltradas.find(c => c.id === conta.id);
      if (contaCompleta) {
        console.log('🔍 ContasReceber handleEdit - Conta original:', contaCompleta);
        const contaProcessada = processAccountReceivableForModal(contaCompleta);
        setContaSelecionada(contaProcessada);
      }
      setModalEditarAberto(true);
    },

    handleMarkAsReceived: (conta: ContaReceberListItem) => {
      const contaCompleta = contasFiltradas.find(c => c.id === conta.id);
      if (contaCompleta) {
        const contaProcessada = processAccountReceivableForModal(contaCompleta);
        setContaSelecionada(contaProcessada);
      }
      setModalRecebimentoAberto(true);
    },

    handleDelete: (conta: ContaReceberListItem) => {
      const contaCompleta = contasFiltradas.find(c => c.id === conta.id);
      if (contaCompleta) {
        const contaProcessada = processAccountReceivableForModal(contaCompleta);
        setContaSelecionada(contaProcessada);
      }
      setModalConfirmacaoAberto(true);
    },

    confirmMarkAsReceived: async (dadosRecebimento: any) => {
      if (!contaSelecionada) return;
      try {
        await baixarConta(contaSelecionada.id, dadosRecebimento);
        setModalRecebimentoAberto(false);
        setContaSelecionada(null);
      } catch (error) {
        console.error('Erro ao marcar como recebido:', error);
      }
    },

    confirmDelete: async () => {
      if (!contaSelecionada) return;
      try {
        await excluirConta(contaSelecionada.id);
        setModalConfirmacaoAberto(false);
        setContaSelecionada(null);
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
      }
    },

    handleSaveEdit: async (dadosAtualizacao: any) => {
      if (!contaSelecionada) return;
      try {
        console.log('🔄 ContasReceber handleSaveEdit - Dados recebidos:', dadosAtualizacao);
        
        // Converter campos do português para inglês
        const updateData = {
          description: dadosAtualizacao.descricao,
          amount: dadosAtualizacao.amount,
          due_date: dadosAtualizacao.data_vencimento,
          notes: dadosAtualizacao.observacoes,
          contact_id: dadosAtualizacao.contact_id || dadosAtualizacao.contact?.id,
          category_id: dadosAtualizacao.category_id || dadosAtualizacao.category?.id,
          reference_document: dadosAtualizacao.reference_document
        };
        
        console.log('🔄 ContasReceber handleSaveEdit - Dados para update:', updateData);
        
        await atualizarConta(contaSelecionada.id, updateData);
        // Pequeno delay para garantir que a UI seja atualizada
        setTimeout(() => {
          setModalEditarAberto(false);
          setContaSelecionada(null);
        }, 100);
      } catch (error) {
        console.error('Erro ao atualizar conta:', error);
      }
    },

    handleDuplicate: async (conta: any) => {
      try {
        await duplicarConta(conta);
        setModalVisualizarAberto(false);
        setContaSelecionada(null);
      } catch (error) {
        console.error('Erro ao duplicar conta:', error);
      }
    }
  }), [navigate, contasFiltradas, baixarConta, excluirConta, atualizarConta, duplicarConta, contaSelecionada]);

  if (estados.loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="space-y-6">
          <LoadingSkeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-24" />
            ))}
          </div>
          <LoadingSkeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (estados.error) {
    return (
      <div className="p-4 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-red-600">
            {estados.error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contas a Receber</h1>
            <p className="text-gray-600 mt-1">Gerencie suas receitas e recebimentos</p>
          </div>
          <Button onClick={handlers.handleCreateAccount} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total a Receber
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(estatisticas?.total_valor || 0)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {estatisticas?.total || 0} conta(s)
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
              {formatCurrency(estatisticas?.valor_pendente || 0)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {estatisticas?.pendentes || 0} conta(s)
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
              {formatCurrency(estatisticas?.valor_vencido || 0)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {estatisticas?.vencidas || 0} conta(s)
            </p>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Recebidas
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(estatisticas?.valor_recebido || 0)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {estatisticas?.recebidas || 0} conta(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Inteligentes */}
      <FiltrosInteligentesReceber
        filtros={filtros}
        setFiltros={setFiltros}
        filtroRapido={filtroRapido}
        setFiltroRapido={setFiltroRapido}
        clientes={clientes?.map(c => ({ id: c.id, nome: c.name })) || []}
        categorias={categorias || []}
        estatisticas={estatisticas || {
          total: 0,
          total_valor: 0,
          pendentes: 0,
          valor_pendente: 0,
          vencidas: 0,
          valor_vencido: 0,
          recebidas: 0,
          valor_recebido: 0,
          vencendoProximo: 0,
          valorVencendoProximo: 0
        }}
        onLimparFiltros={limparFiltros}
        onVoltarMesAtual={voltarMesAtual}
      />

      {/* Lista de Contas */}
      <ContasReceberList
        contas={contasListadas}
        loading={estados.loading}
        onEdit={handlers.handleEdit}
        onDelete={handlers.handleDelete}
        onView={handlers.handleView}
        onReceive={handlers.handleMarkAsReceived}
      />

      {/* Modals */}
      <ContaReceberVisualizarModalUX
        isOpen={modalVisualizarAberto}
        onClose={() => {
          setModalVisualizarAberto(false);
          setContaSelecionada(null);
        }}
        conta={contaSelecionada}
        onEditar={(conta) => {
          setModalVisualizarAberto(false);
          setContaSelecionada(conta);
          setModalEditarAberto(true);
        }}
        onReceber={(conta) => {
          setModalVisualizarAberto(false);
          setContaSelecionada(conta);
          setModalRecebimentoAberto(true);
        }}
        onDuplicar={handlers.handleDuplicate}
        onExcluir={(conta) => {
          setModalVisualizarAberto(false);
          setContaSelecionada(conta);
          setModalConfirmacaoAberto(true);
        }}
        onReload={() => window.location.reload()}
      />

      <ContaReceberEditarModalUX
        isOpen={modalEditarAberto}
        onClose={() => {
          setModalEditarAberto(false);
          setContaSelecionada(null);
        }}
        conta={contaSelecionada}
        onSalvar={handlers.handleSaveEdit}
      />

      <RecebimentoModalAdvanced
        isOpen={modalRecebimentoAberto}
        onClose={() => {
          setModalRecebimentoAberto(false);
          setContaSelecionada(null);
        }}
        conta={contaSelecionada}
        onConfirm={handlers.confirmMarkAsReceived}
      />

      <ConfirmacaoModal
        isOpen={modalConfirmacaoAberto}
        onClose={() => {
          setModalConfirmacaoAberto(false);
          setContaSelecionada(null);
        }}
        onConfirm={handlers.confirmDelete}
        titulo="Excluir Conta a Receber"
        mensagem={`Tem certeza que deseja excluir a conta "${contaSelecionada?.description}"? Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        tipo="danger"
      />
    </div>
  );
};

export default ContasReceber;
