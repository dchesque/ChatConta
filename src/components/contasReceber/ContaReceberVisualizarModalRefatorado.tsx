import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AccountReceivable } from '@/types/accounts';
import { formatCurrency } from '@/utils/currency';
import {
  Edit,
  FileText,
  X,
  DollarSign,
  Calendar,
  CreditCard,
  MessageSquare,
  Building2,
  RotateCcw,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { accountsReceivableService } from '@/services/accountsReceivableService';
import { useToast } from '@/components/ui/use-toast';

interface ContaReceberVisualizarModalRefatoradoProps {
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
  onReload?: () => void;
}

export default function ContaReceberVisualizarModalRefatorado({
  isOpen,
  onClose,
  conta,
  onEditar,
  onReceber,
  onDuplicar,
  onExcluir,
  onReload
}: ContaReceberVisualizarModalRefatoradoProps) {
  const [isReverting, setIsReverting] = useState(false);
  const { toast } = useToast();

  if (!conta) return null;

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        label: 'Pendente',
        icon: Clock
      },
      received: {
        color: 'bg-green-100 text-green-700 border-green-200',
        label: 'Recebido',
        icon: CheckCircle
      },
      overdue: {
        color: 'bg-red-100 text-red-700 border-red-200',
        label: 'Vencido',
        icon: AlertCircle
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: 'Cancelado',
        icon: XCircle
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusConfig = getStatusConfig(conta.status);
  const StatusIcon = statusConfig.icon;

  const calcularDiasVencimento = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(conta.due_date);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasVencimento = calcularDiasVencimento();

  const handleReverterRecebimento = async () => {
    if (!conta) return;

    setIsReverting(true);
    try {
      await accountsReceivableService.revertReceipt(conta.id);
      toast({
        title: "Sucesso",
        description: "Recebimento revertido com sucesso!",
      });
      onReload?.();
      onClose();
    } catch (error) {
      console.error('Erro ao reverter recebimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao reverter recebimento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsReverting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header Melhorado */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Conta a Receber
                </h2>
                <p className="text-green-100 text-sm mt-1">
                  Detalhes completos da conta
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* ID e Status no Header */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-green-100 font-mono">
              ID: {conta.id.substring(0, 8).toUpperCase()}
            </span>
            <Badge className={`${statusConfig.color} border px-3 py-1`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Card de Descrição */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
            <p className="text-gray-700 leading-relaxed">{conta.description}</p>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Coluna Esquerda */}
            <div className="space-y-6">

              {/* Card de Pagador */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Pagador</h4>
                </div>
                <p className="text-gray-700 font-medium text-lg">
                  {conta.contact?.name || 'Não informado'}
                </p>
                {conta.contact?.type && (
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                    {conta.contact.type}
                  </span>
                )}
              </div>

              {/* Card de Categoria */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Categoria</h4>
                </div>
                {conta.category ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-gray-200"
                      style={{ backgroundColor: conta.category.color || '#6B7280' }}
                    />
                    <p className="text-gray-700 font-medium text-lg">{conta.category.name}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Não categorizado</p>
                )}
              </div>

              {/* Card de Documento */}
              {conta.reference_document && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-green-100 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Documento de Referência</h4>
                  </div>
                  <p className="text-gray-700 font-medium font-mono">
                    {conta.reference_document}
                  </p>
                </div>
              )}
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">

              {/* Card de Valores */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Informações Financeiras</h4>
                </div>

                <div className="space-y-3">
                  {conta.original_amount && conta.original_amount !== conta.amount && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Valor Original:</span>
                      <span className="font-medium text-gray-700">
                        {formatCurrency(conta.original_amount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 border-t border-gray-100">
                    <span className="text-lg font-semibold text-gray-900">Valor Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(conta.amount)}
                    </span>
                  </div>

                  {conta.status === 'received' && conta.received_amount && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-800 font-medium">Recebido:</span>
                        </div>
                        <span className="font-bold text-green-700">
                          {formatCurrency(conta.received_amount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card de Datas */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Datas Importantes</h4>
                </div>

                <div className="space-y-3">
                  {conta.issue_date && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Emissão:</span>
                      <span className="font-medium text-gray-700">
                        {new Date(conta.issue_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Vencimento:</span>
                    <span className={`font-medium ${
                      conta.status !== 'received' && diasVencimento < 0
                        ? 'text-red-600 font-semibold'
                        : 'text-gray-700'
                    }`}>
                      {new Date(conta.due_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {/* Indicador de Prazo */}
                  {conta.status === 'pending' && (
                    <div className={`rounded-lg p-3 ${
                      diasVencimento < 0
                        ? 'bg-red-50 border border-red-200'
                        : diasVencimento <= 3
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <p className={`text-center font-semibold ${
                        diasVencimento < 0
                          ? 'text-red-700'
                          : diasVencimento <= 3
                          ? 'text-yellow-700'
                          : 'text-blue-700'
                      }`}>
                        {diasVencimento < 0
                          ? `⚠️ ${Math.abs(diasVencimento)} dias em atraso`
                          : diasVencimento === 0
                          ? '⏰ Vence hoje'
                          : `📅 Faltam ${diasVencimento} dias`
                        }
                      </p>
                    </div>
                  )}

                  {conta.status === 'received' && conta.received_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-green-800 font-medium">Recebido em:</span>
                        <span className="font-bold text-green-700">
                          {new Date(conta.received_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card de Conta Bancária */}
              {conta.bank_account && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Conta Bancária</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">
                      {conta.bank_account.bank?.name || 'Banco'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Ag: {conta.bank_account.agency} | CC: {conta.bank_account.account_number}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {conta.notes && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gray-200 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Observações</h4>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {conta.notes}
              </p>
            </div>
          )}

          {/* Metadados */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium text-gray-600">Criado em:</span>{' '}
                {new Date(conta.created_at || '').toLocaleString('pt-BR')}
              </div>
              <div>
                <span className="font-medium text-gray-600">Atualizado em:</span>{' '}
                {new Date(conta.updated_at || '').toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Fechar
              </button>

              {/* Botões de ação secundária */}
              <button
                onClick={() => onDuplicar(conta)}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                title="Duplicar"
              >
                <Copy className="w-5 h-5" />
              </button>

              <button
                onClick={() => onExcluir(conta)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Botão de Reverter (só aparece se estiver recebido) */}
              {conta.status === 'received' && (
                <button
                  onClick={handleReverterRecebimento}
                  disabled={isReverting}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isReverting ? 'Revertendo...' : 'Reverter Recebimento'}</span>
                </button>
              )}

              {/* Botão de Editar */}
              <button
                onClick={() => onEditar(conta)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>

              {/* Botão de Receber (só aparece se estiver pendente) */}
              {conta.status === 'pending' && (
                <button
                  onClick={() => onReceber(conta)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <DollarSign className="w-4 h-4" />
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