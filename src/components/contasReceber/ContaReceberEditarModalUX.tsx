import React, { useState, useEffect } from 'react';
import {
  X,
  Edit,
  User,
  FileText,
  DollarSign,
  Calendar,
  Save,
  Receipt,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Calculator,
  TrendingUp,
  Building2
} from 'lucide-react';
import { AccountReceivable } from '@/types/accounts';
import { Category } from '@/types/category';
import { formatCurrency } from '@/utils/currency';
import { PagadorSelector } from './PagadorSelector';
import { CategoriaReceitaSelector } from './CategoriaReceitaSelector';
import { toast } from 'sonner';
import type { Contact } from '@/types/contact';

interface ContaReceberEditarModalUXProps {
  conta: (AccountReceivable & {
    contact?: Contact;
    category?: Category;
  }) | null;
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dadosEdicao: any) => Promise<void>;
}

interface DadosEdicao {
  descricao: string;
  reference_document?: string;
  data_vencimento: string;
  contact?: Contact;
  category?: Category;
  amount: number;
  original_amount?: number;
  observacoes?: string;
}

export default function ContaReceberEditarModalUX({ conta, isOpen, onClose, onSalvar }: ContaReceberEditarModalUXProps) {
  const [dadosEdicao, setDadosEdicao] = useState<DadosEdicao>({
    descricao: '',
    data_vencimento: '',
    amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string>('');
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basico' | 'financeiro' | 'adicional'>('basico');

  // Função para converter data para formato YYYY-MM-DD
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Inicializar dados quando a conta for carregada
  useEffect(() => {
    if (conta && isOpen) {
      console.log('=== INICIALIZANDO EDICAO RECEBER ===');
      console.log('Conta:', conta);
      console.log('Contact:', conta.contact);
      console.log('Category:', conta.category);

      const dadosIniciais = {
        descricao: conta.description || '',
        reference_document: conta.reference_document || '',
        data_vencimento: formatDateForInput(conta.due_date || ''),
        contact: conta.contact || null,
        category: conta.category || null,
        amount: conta.amount || 0,
        original_amount: conta.original_amount || conta.amount || 0,
        observacoes: conta.notes || ''
      };

      console.log('Dados iniciais receber:', dadosIniciais);
      setDadosEdicao(dadosIniciais);
      setErro('');
      setErrosValidacao({});
    }
  }, [conta, isOpen]);

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!dadosEdicao.descricao?.trim()) {
      novosErros.descricao = 'Descrição é obrigatória';
    }

    if (!dadosEdicao.data_vencimento) {
      novosErros.data_vencimento = 'Data de vencimento é obrigatória';
    }

    if (dadosEdicao.amount <= 0) {
      novosErros.amount = 'Valor deve ser maior que zero';
    }

    setErrosValidacao(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      toast.error('Por favor, corrija os erros antes de salvar');
      return;
    }

    setLoading(true);
    try {
      // Preparar dados para salvar (mesmo formato do modal original)
      const dadosParaSalvar = {
        ...dadosEdicao,
        contact_id: dadosEdicao.contact?.id,
        category_id: dadosEdicao.category?.id
      };

      console.log('Dados para salvar receber:', dadosParaSalvar);
      await onSalvar(dadosParaSalvar);
      toast.success('Conta atualizada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErro('Erro ao salvar a conta. Tente novamente.');
      toast.error('Erro ao salvar a conta');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !conta) return null;

  const tabs = [
    { id: 'basico', label: 'Informações Básicas', icon: FileText },
    { id: 'financeiro', label: 'Valores', icon: Calculator },
    { id: 'adicional', label: 'Detalhes', icon: MessageSquare }
  ];

  const diasParaVencimento = () => {
    if (!dadosEdicao.data_vencimento) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dadosEdicao.data_vencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const dias = diasParaVencimento();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header Moderno */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-2xl">
                <Edit className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Editar Conta a Receber
                </h2>
                <p className="text-green-600 text-sm mt-1">
                  ID: #{conta.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 bg-white/50 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {erro && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{erro}</span>
            </div>
          )}

          {/* Tab: Informações Básicas */}
          {activeTab === 'basico' && (
            <div className="space-y-6">
              {/* Descrição */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Receipt className="w-4 h-4 inline mr-2" />
                  Descrição da Conta *
                </label>
                <input
                  type="text"
                  value={dadosEdicao.descricao}
                  onChange={(e) => setDadosEdicao(prev => ({ ...prev, descricao: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errosValidacao.descricao ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Ex: Prestação de serviços, venda de produtos..."
                />
                {errosValidacao.descricao && (
                  <p className="text-red-600 text-sm mt-2">{errosValidacao.descricao}</p>
                )}
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pagador/Cliente */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Pagador/Cliente
                  </label>
                  <PagadorSelector
                    value={dadosEdicao.contact}
                    onSelect={(contact) => setDadosEdicao(prev => ({ ...prev, contact }))}
                  />
                </div>

                {/* Categoria */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Categoria de Receita
                  </label>
                  <CategoriaReceitaSelector
                    value={dadosEdicao.category}
                    onSelect={(category) => setDadosEdicao(prev => ({ ...prev, category }))}
                  />
                </div>
              </div>

              {/* Data de Vencimento e Documento */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Data de Vencimento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    value={dadosEdicao.data_vencimento}
                    onChange={(e) => setDadosEdicao(prev => ({ ...prev, data_vencimento: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errosValidacao.data_vencimento ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errosValidacao.data_vencimento && (
                    <p className="text-red-600 text-sm mt-2">{errosValidacao.data_vencimento}</p>
                  )}

                  {/* Indicador de prazo */}
                  {dias !== null && (
                    <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium ${
                      dias < 0
                        ? 'bg-red-100 text-red-700'
                        : dias <= 7
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {dias < 0
                        ? `${Math.abs(dias)} dias em atraso`
                        : dias === 0
                        ? 'Vence hoje'
                        : `Vence em ${dias} dias`
                      }
                    </div>
                  )}
                </div>

                {/* Documento de Referência */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Documento de Referência
                  </label>
                  <input
                    type="text"
                    value={dadosEdicao.reference_document || ''}
                    onChange={(e) => setDadosEdicao(prev => ({ ...prev, reference_document: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Número da nota fiscal, contrato..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Valores */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">

              {/* Valor Original */}
              {dadosEdicao.original_amount && dadosEdicao.original_amount !== dadosEdicao.amount && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Valor Original
                  </label>
                  <div className="text-2xl font-bold text-gray-600">
                    {formatCurrency(dadosEdicao.original_amount)}
                  </div>
                </div>
              )}

              {/* Valor Atual */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Valor a Receber *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={dadosEdicao.amount}
                  onChange={(e) => setDadosEdicao(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg font-semibold ${
                    errosValidacao.amount ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="0,00"
                />
                {errosValidacao.amount && (
                  <p className="text-red-600 text-sm mt-2">{errosValidacao.amount}</p>
                )}
              </div>

              {/* Resumo Financeiro */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h4>

                <div className="space-y-3">
                  {dadosEdicao.original_amount && dadosEdicao.original_amount !== dadosEdicao.amount && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Valor Original:</span>
                        <span className="font-medium">{formatCurrency(dadosEdicao.original_amount)}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ajuste:</span>
                        <span className={`font-medium flex items-center gap-1 ${
                          dadosEdicao.amount > dadosEdicao.original_amount ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {dadosEdicao.amount > dadosEdicao.original_amount ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3 rotate-180" />
                          )}
                          {dadosEdicao.amount > dadosEdicao.original_amount ? '+' : ''}
                          {formatCurrency(dadosEdicao.amount - dadosEdicao.original_amount)}
                        </span>
                      </div>

                      <div className="border-t border-blue-200 pt-3" />
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Valor Total:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {formatCurrency(dadosEdicao.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Detalhes Adicionais */}
          {activeTab === 'adicional' && (
            <div className="space-y-6">

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Observações
                </label>
                <textarea
                  value={dadosEdicao.observacoes || ''}
                  onChange={(e) => setDadosEdicao(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="Adicione observações importantes sobre esta conta a receber..."
                />
              </div>

              {/* Resumo da Conta */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Resumo da Edição</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descrição:</span>
                    <span className="font-medium">{dadosEdicao.descricao || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagador:</span>
                    <span className="font-medium">{dadosEdicao.contact?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium">{dadosEdicao.category?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vencimento:</span>
                    <span className="font-medium">
                      {dadosEdicao.data_vencimento
                        ? new Date(dadosEdicao.data_vencimento).toLocaleDateString('pt-BR')
                        : '—'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-gray-900 font-semibold">Valor Total:</span>
                    <span className="font-bold text-green-600">{formatCurrency(dadosEdicao.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 p-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all font-medium disabled:opacity-50"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-3">
              {Object.keys(errosValidacao).length > 0 && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{Object.keys(errosValidacao).length} erro(s) encontrado(s)</span>
                </div>
              )}

              <button
                onClick={handleSalvar}
                disabled={loading || Object.keys(errosValidacao).length > 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}