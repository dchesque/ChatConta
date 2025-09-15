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
  Building2,
  Calculator,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Percent,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ContaPagar } from '@/types/contaPagar';
import { formatarMoeda } from '@/utils/formatters';
import { CredorSelector } from './CredorSelector';
import { CategoriaSelector } from './CategoriaSelector';
import LoadingSpinner from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import type { Category } from '@/types/category';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContaEditarModalUXProps {
  conta: (ContaPagar & {
    contact?: Contact;
    category?: Category;
    description?: string;
    reference_document?: string;
    due_date?: string;
    original_amount?: number;
    final_amount?: number;
    notes?: string;
  }) | null;
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dadosEdicao: any) => Promise<void>;
}

interface DadosEdicao {
  descricao: string;
  documento_referencia?: string;
  data_vencimento: string;
  contact?: Contact;
  category?: Category;
  valor_original: number;
  percentual_juros?: number;
  valor_juros?: number;
  percentual_desconto?: number;
  valor_desconto?: number;
  valor_final: number;
  observacoes?: string;
}

export default function ContaEditarModalUX({ conta, isOpen, onClose, onSalvar }: ContaEditarModalUXProps) {
  const [dadosEdicao, setDadosEdicao] = useState<DadosEdicao>({
    descricao: '',
    data_vencimento: '',
    valor_original: 0,
    valor_final: 0
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
      console.log('=== INICIALIZANDO EDICAO ===');
      console.log('Conta:', conta);
      console.log('Contact:', conta.contact);
      console.log('Category:', conta.category);

      const dadosIniciais = {
        descricao: conta.descricao || conta.description || '',
        documento_referencia: conta.documento_referencia || conta.reference_document || '',
        data_vencimento: formatDateForInput(conta.data_vencimento || conta.due_date || ''),
        contact: conta.contact || null,
        category: conta.category || null,
        valor_original: conta.valor_original || conta.original_amount || conta.amount || 0,
        percentual_juros: conta.percentual_juros || 0,
        valor_juros: conta.valor_juros || 0,
        percentual_desconto: conta.percentual_desconto || 0,
        valor_desconto: conta.valor_desconto || 0,
        valor_final: conta.valor_final || conta.final_amount || conta.amount || 0,
        observacoes: conta.observacoes || conta.notes || ''
      };

      console.log('Dados iniciais:', dadosIniciais);
      setDadosEdicao(dadosIniciais);
      setErro('');
      setErrosValidacao({});
    }
  }, [conta, isOpen]);

  // Recalcular valor final quando houver mudanças
  useEffect(() => {
    const novoValorFinal = dadosEdicao.valor_original +
                          (dadosEdicao.valor_juros || 0) -
                          (dadosEdicao.valor_desconto || 0);

    if (novoValorFinal !== dadosEdicao.valor_final) {
      setDadosEdicao(prev => ({ ...prev, valor_final: novoValorFinal }));
    }
  }, [dadosEdicao.valor_original, dadosEdicao.valor_juros, dadosEdicao.valor_desconto]);

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!dadosEdicao.descricao?.trim()) {
      novosErros.descricao = 'Descrição é obrigatória';
    }

    if (!dadosEdicao.data_vencimento) {
      novosErros.data_vencimento = 'Data de vencimento é obrigatória';
    }

    if (dadosEdicao.valor_original <= 0) {
      novosErros.valor_original = 'Valor original deve ser maior que zero';
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
      // Preparar dados com IDs para salvar (mesmo formato do modal original)
      const dadosParaSalvar = {
        ...dadosEdicao,
        contact_id: dadosEdicao.contact?.id,
        category_id: dadosEdicao.category?.id
      };

      console.log('Dados para salvar:', dadosParaSalvar);
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

  const handlePercentualJurosChange = (value: string) => {
    const percentual = parseFloat(value) || 0;
    const valorJuros = (dadosEdicao.valor_original * percentual) / 100;
    setDadosEdicao(prev => ({
      ...prev,
      percentual_juros: percentual,
      valor_juros: valorJuros
    }));
  };

  const handlePercentualDescontoChange = (value: string) => {
    const percentual = parseFloat(value) || 0;
    const valorDesconto = (dadosEdicao.valor_original * percentual) / 100;
    setDadosEdicao(prev => ({
      ...prev,
      percentual_desconto: percentual,
      valor_desconto: valorDesconto
    }));
  };

  if (!isOpen || !conta) return null;

  const tabs = [
    { id: 'basico', label: 'Informações Básicas', icon: FileText },
    { id: 'financeiro', label: 'Valores', icon: Calculator },
    { id: 'adicional', label: 'Detalhes', icon: MessageSquare }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header Moderno */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Editar Conta a Pagar
                </h2>
                <p className="text-blue-600 text-sm mt-1">
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
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errosValidacao.descricao ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Ex: Pagamento de fornecedor, conta de luz..."
                />
                {errosValidacao.descricao && (
                  <p className="text-red-600 text-sm mt-2">{errosValidacao.descricao}</p>
                )}
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Credor/Fornecedor */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Credor/Fornecedor
                  </label>
                  <CredorSelector
                    value={dadosEdicao.contact}
                    onSelect={(contact) => setDadosEdicao(prev => ({ ...prev, contact }))}
                  />
                </div>

                {/* Categoria */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Categoria
                  </label>
                  <CategoriaSelector
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
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errosValidacao.data_vencimento ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errosValidacao.data_vencimento && (
                    <p className="text-red-600 text-sm mt-2">{errosValidacao.data_vencimento}</p>
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
                    value={dadosEdicao.documento_referencia || ''}
                    onChange={(e) => setDadosEdicao(prev => ({ ...prev, documento_referencia: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Valor Original *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={dadosEdicao.valor_original}
                  onChange={(e) => setDadosEdicao(prev => ({ ...prev, valor_original: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg font-semibold ${
                    errosValidacao.valor_original ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="0,00"
                />
                {errosValidacao.valor_original && (
                  <p className="text-red-600 text-sm mt-2">{errosValidacao.valor_original}</p>
                )}
              </div>

              {/* Ajustes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Juros/Multa */}
                <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    Juros/Multa
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        <Percent className="w-3 h-3 inline mr-1" />
                        Percentual (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dadosEdicao.percentual_juros || ''}
                        onChange={(e) => handlePercentualJurosChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                        placeholder="0,00"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Valor (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dadosEdicao.valor_juros || ''}
                        onChange={(e) => setDadosEdicao(prev => ({ ...prev, valor_juros: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>

                {/* Desconto */}
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    Desconto
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        <Percent className="w-3 h-3 inline mr-1" />
                        Percentual (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dadosEdicao.percentual_desconto || ''}
                        onChange={(e) => handlePercentualDescontoChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                        placeholder="0,00"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Valor (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dadosEdicao.valor_desconto || ''}
                        onChange={(e) => setDadosEdicao(prev => ({ ...prev, valor_desconto: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Valor Final */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Valor Final</h4>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatarMoeda(dadosEdicao.valor_final)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {formatarMoeda(dadosEdicao.valor_original)}
                  {dadosEdicao.valor_juros > 0 && (
                    <span className="text-red-600"> + {formatarMoeda(dadosEdicao.valor_juros)}</span>
                  )}
                  {dadosEdicao.valor_desconto > 0 && (
                    <span className="text-green-600"> - {formatarMoeda(dadosEdicao.valor_desconto)}</span>
                  )}
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Adicione observações importantes sobre esta conta..."
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
                    <span className="text-gray-600">Credor:</span>
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
                    <span className="text-gray-900 font-semibold">Valor Final:</span>
                    <span className="font-bold text-blue-600">{formatarMoeda(dadosEdicao.valor_final)}</span>
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
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <LoadingSpinner />
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