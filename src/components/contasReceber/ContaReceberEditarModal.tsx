
import React, { useState, useEffect } from 'react';
import { X, Edit, User, FileText, DollarSign, Calendar, Save } from 'lucide-react';
import { AccountReceivable } from '@/types/accounts';
import { Category } from '@/types/category';
import { formatCurrency } from '@/utils/currency';
import { PagadorSelector } from './PagadorSelector';
import { CategoriaReceitaSelector } from './CategoriaReceitaSelector';
import { toast } from 'sonner';
import type { Contact } from '@/types/contact';

interface ContaReceberEditarModalProps {
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
  observacoes?: string;
}

export default function ContaReceberEditarModal({ conta, isOpen, onClose, onSalvar }: ContaReceberEditarModalProps) {
  const [dadosEdicao, setDadosEdicao] = useState<DadosEdicao>({
    descricao: '',
    data_vencimento: '',
    amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string>('');
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});

  // Inicializar dados quando a conta for carregada
  useEffect(() => {
    if (conta && isOpen) {
      console.log('=== INICIALIZANDO MODAL EDIÇÃO RECEBER ===');
      console.log('Conta completa:', conta);
      console.log('Contact da conta:', conta.contact);
      console.log('Category da conta:', conta.category);
      
      const dadosIniciais = {
        descricao: conta.description || '',
        reference_document: conta.reference_document || '',
        data_vencimento: conta.due_date || '',
        contact: conta.contact || null,
        category: conta.category || null,
        amount: conta.amount || 0,
        observacoes: conta.notes || ''
      };
      
      console.log('Dados iniciais para setDadosEdicao:', dadosIniciais);
      setDadosEdicao(dadosIniciais);
      setErro('');
      setErrosValidacao({});
    }
  }, [conta, isOpen]);

  const handleSalvar = async () => {
    if (loading || !conta) return;
    
    setLoading(true);
    setErro('');
    
    try {
      // Validação básica
      if (!dadosEdicao.descricao.trim()) {
        setErro('Descrição é obrigatória');
        return;
      }
      
      if (!dadosEdicao.data_vencimento) {
        setErro('Data de vencimento é obrigatória');
        return;
      }
      
      if (dadosEdicao.amount <= 0) {
        setErro('Valor deve ser maior que zero');
        return;
      }

      // Preparar dados para salvar
      const dadosParaSalvar = {
        ...dadosEdicao,
        contact_id: dadosEdicao.contact?.id,
        category_id: dadosEdicao.category?.id
      };
      
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
                <div className="p-2 bg-green-100 rounded-xl">
                  <Edit className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Editar Conta a Receber
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
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
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
                      onChange={(e) => setDadosEdicao((prev) => ({ ...prev, descricao: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Digite a descrição da conta..."
                    />
                  </div>

                  {/* Documento/Referência */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Documento/Referência
                    </label>
                    <input
                      type="text"
                      value={dadosEdicao.reference_document || ''}
                      onChange={(e) => setDadosEdicao((prev) => ({ ...prev, reference_document: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
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
                      onChange={(e) => setDadosEdicao((prev) => ({ ...prev, data_vencimento: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Coluna 1: Pagador e Categoria */}
                <div className="space-y-4">
                  
                  {/* Contato/Pagador */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">Pagador</h4>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Pagador *
                      </label>
                      <PagadorSelector
                        value={dadosEdicao.contact}
                        onSelect={(contact) => {
                          setDadosEdicao((prev) => ({ ...prev, contact }));
                        }}
                        placeholder="Selecionar pagador..."
                        className="w-full"
                      />
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
                        Categoria de Receita *
                      </label>
                      <CategoriaReceitaSelector
                        value={dadosEdicao.category}
                        onSelect={(category) => {
                          setDadosEdicao((prev) => ({ ...prev, category }));
                        }}
                        placeholder="Selecionar categoria..."
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Coluna 2: Valores */}
                <div className="space-y-4">
                  
                  {/* Valores */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">Valor</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Valor */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Valor Total *
                        </label>
                        <input
                          type="text"
                          value={formatCurrency(dadosEdicao.amount || 0)}
                          onChange={(e) => {
                            const numbers = e.target.value.replace(/\D/g, '');
                            const value = parseFloat(numbers) / 100 || 0;
                            setDadosEdicao((prev) => ({ ...prev, amount: value }));
                          }}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="R$ 0,00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Observações */}
              <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">Observações</h4>
                </div>
                <textarea
                  value={dadosEdicao.observacoes || ''}
                  onChange={(e) => setDadosEdicao((prev) => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
                  rows={3}
                  placeholder="Observações adicionais..."
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
                className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
