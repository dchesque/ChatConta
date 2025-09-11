import { Badge } from '@/components/ui/badge';
import { AccountReceivable } from '@/types/accounts';
import { formatCurrency } from '@/utils/currency';
import { Edit, FileText, X, DollarSign, Calendar, CreditCard, MessageSquare, Building2 } from 'lucide-react';

interface ContaReceberVisualizarModalProps {
  isOpen: boolean;
  onClose: () => void;
  conta: (AccountReceivable & {
    contact?: { id: string; name: string; type?: string };
    category?: { id: string; name: string; color?: string };
    dias_para_vencimento?: number;
    dias_em_atraso?: number;
  }) | null;
  onEditar: (conta: any) => void;
  onReceber: (conta: any) => void;
  onDuplicar: (conta: any) => void;
  onExcluir: (conta: any) => void;
}

export default function ContaReceberVisualizarModal({ 
  isOpen, 
  onClose, 
  conta, 
  onEditar, 
  onReceber, 
  onDuplicar, 
  onExcluir 
}: ContaReceberVisualizarModalProps) {
  if (!conta) return null;

  // Debug logs para verificar dados recebidos
  console.log('=== MODAL VISUALIZAR RECEBER - DADOS RECEBIDOS ===');
  console.log('Conta completa:', conta);
  console.log('Contact:', conta.contact);
  console.log('Category:', conta.category);
  console.log('Contact name:', conta.contact?.name);
  console.log('Category name:', conta.category?.name);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'bg-blue-100/80 text-blue-700', label: 'Pendente' },
      received: { color: 'bg-green-100/80 text-green-700', label: 'Recebido' },
      overdue: { color: 'bg-red-100/80 text-red-700', label: 'Vencido' },
      cancelled: { color: 'bg-gray-100/80 text-gray-700', label: 'Cancelado' }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusConfig = getStatusConfig(conta.status);

  const calcularDiasVencimento = () => {
    const hoje = new Date();
    const vencimento = new Date(conta.due_date);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasVencimento = calcularDiasVencimento();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Visualizar Conta a Receber
                </h2>
                <p className="text-sm text-gray-500">ID: #{conta.id}</p>
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

        {/* Status badges */}
        <div className="flex-shrink-0 px-6 py-4">
          <div className="flex items-center space-x-2">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            
            {/* Descrição Destacada */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Descrição</h3>
              <p className="text-gray-800 text-sm leading-relaxed">{conta.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Coluna 1: Informações do Pagador e Categoria */}
              <div className="space-y-4">
                
                {/* Pagador */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">Pagador</h4>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {conta.contact?.name || 'Sem pagador vinculado'}
                  </p>
                </div>

                {/* Categoria */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">Categoria</h4>
                  </div>
                  {conta.category ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: conta.category.color || '#6B7280' }}
                      />
                      <p className="text-gray-700 font-medium">{conta.category.name}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Sem categoria</p>
                  )}
                </div>

                {/* Documento de Referência */}
                {conta.reference_document && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900">Documento</h4>
                    </div>
                    <p className="text-gray-700 font-medium">{conta.reference_document}</p>
                  </div>
                )}
              </div>
              
              {/* Coluna 2: Informações Financeiras e Datas */}
              <div className="space-y-4">
                
                {/* Informações Financeiras */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">Valores</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Valor Original:</span>
                      <span className="font-semibold text-gray-900 text-sm">{formatCurrency(conta.original_amount || conta.amount)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Valor Total:</span>
                        <span className="text-xl font-bold text-green-600">{formatCurrency(conta.amount)}</span>
                      </div>
                    </div>
                    
                    {conta.status === 'received' && conta.received_amount && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-green-800 font-medium text-sm">Valor Recebido:</span>
                          <span className="font-bold text-green-600 text-sm">{formatCurrency(conta.received_amount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Datas */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900">Datas</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {conta.issue_date && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Data de Emissão:</span>
                        <span className="font-medium text-gray-900 text-sm">
                          {new Date(conta.issue_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Data de Vencimento:</span>
                      <span className={`font-medium text-sm ${
                        conta.status !== 'received' && diasVencimento < 0 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        {new Date(conta.due_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    {conta.status !== 'received' && diasVencimento < 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-800 font-semibold text-center text-sm">
                          ⚠️ {Math.abs(diasVencimento)} dias em atraso
                        </p>
                      </div>
                    )}
                    
                    {conta.status === 'received' && conta.received_at && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-green-800 font-medium text-sm">Data de Recebimento:</span>
                          <span className="font-bold text-green-600 text-sm">
                            {new Date(conta.received_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Observações */}
            {conta.notes && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">Observações</h4>
                </div>
                <p className="text-gray-800 leading-relaxed text-sm">{conta.notes}</p>
              </div>
            )}
            
            {/* Informações do Sistema */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-500">
                <div>
                  <span className="font-medium text-gray-700">Criado em:</span> {new Date(conta.created_at || '').toLocaleString('pt-BR')}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Última atualização:</span> {new Date(conta.updated_at || '').toLocaleString('pt-BR')}
                </div>
              </div>
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
              Fechar
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => onEditar(conta)}
                className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                <Edit className="w-3 h-3" />
                <span>Editar</span>
              </button>
              {conta.status === 'pending' && (
                <button
                  onClick={() => onReceber(conta)}
                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>Receber</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}