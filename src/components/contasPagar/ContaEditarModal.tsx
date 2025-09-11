import React, { useState, useEffect } from 'react';
import { X, Edit, User, FileText, DollarSign, Calendar, Save } from 'lucide-react';
import { ContaPagar } from '@/types/contaPagar';
import { formatarMoeda } from '@/utils/formatters';
import { CredorSelector } from './CredorSelector';
import { CategoriaSelector } from './CategoriaSelector';
import LoadingSpinner from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import type { Category } from '@/types/category';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContaEditarModalProps {
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

export default function ContaEditarModal({ conta, isOpen, onClose, onSalvar }: ContaEditarModalProps) {
  const [dadosEdicao, setDadosEdicao] = useState<DadosEdicao>({
    descricao: '',
    data_vencimento: '',
    valor_original: 0,
    valor_final: 0
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string>('');
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});

  // Inicializar dados quando a conta for carregada
  useEffect(() => {
    if (conta && isOpen) {
      console.log('=== INICIALIZANDO MODAL DE EDIÇÃO ===');
      console.log('Conta completa:', conta);
      console.log('Contact da conta:', conta.contact);
      console.log('Category da conta:', conta.category);
      console.log('Tipo do contact:', typeof conta.contact);
      console.log('Tipo do category:', typeof conta.category);
      console.log('Contact ID:', conta.contact?.id);
      console.log('Category ID:', conta.category?.id);
      
      const dadosIniciais = {
        descricao: conta.descricao || conta.description || '',
        documento_referencia: conta.documento_referencia || conta.reference_document || '',
        data_vencimento: conta.data_vencimento || conta.due_date || '',
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
      
      console.log('Dados iniciais para setDadosEdicao:', dadosIniciais);
      setDadosEdicao(dadosIniciais);
      
      console.log('=== FIM INICIALIZAÇÃO ===');
      
      setErro('');
      setErrosValidacao({});
    }
  }, [conta, isOpen]);

  // Calcular valores automaticamente
  useEffect(() => {
    const valorOriginal = dadosEdicao.valor_original || 0;
    const percentualJuros = dadosEdicao.percentual_juros || 0;
    const percentualDesconto = dadosEdicao.percentual_desconto || 0;
    
    const valorJuros = (valorOriginal * percentualJuros) / 100;
    const valorDesconto = (valorOriginal * percentualDesconto) / 100;
    const valorFinal = valorOriginal + valorJuros - valorDesconto;
    
    setDadosEdicao((prev) => ({
      ...prev,
      valor_juros: valorJuros,
      valor_desconto: valorDesconto,
      valor_final: valorFinal
    }));
  }, [dadosEdicao.valor_original, dadosEdicao.percentual_juros, dadosEdicao.percentual_desconto]);

  // Validação em tempo real
  const validarCampo = async (campo: string, valor: any) => {
    const { ValidationService } = await import('@/services/ValidationService');
    const dadosParaValidacao = {
      ...dadosEdicao,
      [campo]: valor,
      contact_id: dadosEdicao.contact?.id,
      category_id: dadosEdicao.category?.id
    };
    const novoErro = ValidationService.validarContaPagar(dadosParaValidacao);
    setErrosValidacao(prev => ({
      ...prev,
      [campo]: novoErro[campo] || ''
    }));
  };

  const handleSalvar = async () => {
    if (loading || !conta) return;
    
    setLoading(true);
    setErro('');
    
    try {
      // Preparar dados com IDs para validação
      const dadosParaValidacao = {
        ...dadosEdicao,
        contact_id: dadosEdicao.contact?.id,
        category_id: dadosEdicao.category?.id
      };

      // Validação completa antes de salvar
      const { ValidationService } = await import('@/services/ValidationService');
      const erros = ValidationService.validarContaPagar(dadosParaValidacao);
      
      if (Object.keys(erros).length > 0) {
        setErrosValidacao(erros);
        const primeiroErro = Object.values(erros)[0];
        setErro(primeiroErro);
        return;
      }

      // Preparar dados para salvar (mesmo objeto que foi validado)
      const dadosParaSalvar = dadosParaValidacao;
      
      console.log('Dados para salvar:', dadosParaSalvar);

      await onSalvar(dadosParaSalvar);
      toast.success('Conta editada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErro('Erro ao salvar alterações. Tente novamente.');
      toast.error('Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  if (!conta || !isOpen) return null;

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Edit className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Editar Conta a Pagar
                  </h2>
                  <p className="text-sm text-gray-500">ID: #{conta?.id}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{erro}</p>
            </div>
          )}

          {/* Conteúdo */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              
              {/* Informações Principais */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Dados da Conta</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Descrição */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Descrição *
                    </label>
                    <input
                      type="text"
                      value={dadosEdicao.descricao || ''}
                      onChange={(e) => {
                        setDadosEdicao((prev) => ({ ...prev, descricao: e.target.value }));
                        validarCampo('descricao', e.target.value);
                      }}
                      className={`w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errosValidacao.descricao ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite a descrição da conta..."
                    />
                    {errosValidacao.descricao && (
                      <p className="text-red-600 text-xs mt-1">{errosValidacao.descricao}</p>
                    )}
                  </div>

                  {/* Documento/Referência */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Documento/Referência
                    </label>
                    <input
                      type="text"
                      value={dadosEdicao.documento_referencia || ''}
                      onChange={(e) => setDadosEdicao((prev) => ({ ...prev, documento_referencia: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="NF 12345, Pedido 567, etc."
                    />
                  </div>

                  {/* Data de Vencimento */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Data de Vencimento *
                    </label>
                    <input
                      type="date"
                      value={dadosEdicao.data_vencimento || ''}
                      onChange={(e) => {
                        setDadosEdicao((prev) => ({ ...prev, data_vencimento: e.target.value }));
                        validarCampo('data_vencimento', e.target.value);
                      }}
                      className={`w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                        errosValidacao.data_vencimento ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errosValidacao.data_vencimento && (
                      <p className="text-red-600 text-xs mt-1">{errosValidacao.data_vencimento}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Coluna 1: Contato e Categoria */}
                <div className="space-y-4">
                  
                  {/* Contato/Credor */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">Contato</h4>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Credor *
                      </label>
                      <CredorSelector
                        value={dadosEdicao.contact}
                        onSelect={(contact) => {
                          setDadosEdicao((prev) => ({ ...prev, contact }));
                          validarCampo('contact_id', contact?.id);
                        }}
                        placeholder="Selecionar credor..."
                        className="w-full"
                      />
                      {errosValidacao.contact_id && (
                        <p className="text-red-600 text-xs mt-1">{errosValidacao.contact_id}</p>
                      )}
                    </div>
                  </div>

                  {/* Categoria */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">Categoria</h4>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Categoria *
                      </label>
                      <CategoriaSelector
                        value={dadosEdicao.category}
                        onSelect={(category) => {
                          setDadosEdicao((prev) => ({ ...prev, category }));
                          validarCampo('category_id', category?.id);
                        }}
                        placeholder="Selecionar categoria..."
                        className="w-full"
                      />
                      {errosValidacao.category_id && (
                        <p className="text-red-600 text-xs mt-1">{errosValidacao.category_id}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Coluna 2: Valores e Cálculos */}
                <div className="space-y-4">
                  
                  {/* Valores */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">Valores e Cálculos</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Valor Original */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Valor Original *
                        </label>
                        <input
                          type="text"
                          value={formatarMoeda(dadosEdicao.valor_original || 0)}
                          onChange={(e) => {
                            const numbers = e.target.value.replace(/\D/g, '');
                            const value = parseFloat(numbers) / 100 || 0;
                            setDadosEdicao((prev) => ({ ...prev, valor_original: value }));
                            validarCampo('valor_original', value);
                          }}
                          className={`w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                            errosValidacao.valor_original ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="R$ 0,00"
                        />
                        {errosValidacao.valor_original && (
                          <p className="text-red-600 text-xs mt-1">{errosValidacao.valor_original}</p>
                        )}
                      </div>

                      {/* Juros/Multa */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Juros/Multa
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              value={dadosEdicao.percentual_juros || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                                setDadosEdicao((prev) => ({ ...prev, percentual_juros: parseFloat(value) || 0 }));
                              }}
                              className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-center text-sm"
                              placeholder="0,00"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">Percentual (%)</p>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={formatarMoeda(dadosEdicao.valor_juros || 0)}
                              readOnly
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-right text-gray-600 font-medium text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">Valor (R$)</p>
                          </div>
                        </div>
                      </div>

                      {/* Desconto */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Desconto
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              value={dadosEdicao.percentual_desconto || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                                setDadosEdicao((prev) => ({ ...prev, percentual_desconto: parseFloat(value) || 0 }));
                              }}
                              className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1 text-center text-sm"
                              placeholder="0,00"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">Percentual (%)</p>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={formatarMoeda(dadosEdicao.valor_desconto || 0)}
                              readOnly
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-right text-gray-600 font-medium text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">Valor (R$)</p>
                          </div>
                        </div>
                      </div>

                      {/* Valor Final */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold text-gray-800">Valor Final:</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatarMoeda(dadosEdicao.valor_final || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">Observações</h4>
                </div>
                <textarea
                  value={dadosEdicao.observacoes || ''}
                  onChange={(e) => setDadosEdicao((prev) => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  rows={3}
                  placeholder="Adicione observações sobre esta conta..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSalvar}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              {loading && <LoadingSpinner />}
              <Save className="w-3 h-3" />
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}