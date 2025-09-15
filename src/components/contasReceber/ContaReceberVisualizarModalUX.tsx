import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AccountReceivable } from '@/types/accounts';
import { formatCurrency } from '@/utils/currency';
import {
  Edit,
  X,
  DollarSign,
  Calendar,
  CreditCard,
  MessageSquare,
  Building2,
  RotateCcw,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Receipt,
  TrendingUp,
  Wallet,
  FileText,
  CalendarDays,
  ChevronRight,
  Banknote,
  User
} from 'lucide-react';
import { accountsReceivableService } from '@/services/accountsReceivableService';
import { useToast } from '@/components/ui/use-toast';

interface ContaReceberVisualizarModalUXProps {
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

export default function ContaReceberVisualizarModalUX({
  isOpen,
  onClose,
  conta,
  onEditar,
  onReceber,
  onDuplicar,
  onExcluir,
  onReload
}: ContaReceberVisualizarModalUXProps) {
  const [isReverting, setIsReverting] = useState(false);
  const { toast } = useToast();

  if (!conta) return null;

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        bgGradient: 'from-blue-50 to-indigo-50',
        label: 'Pendente',
        icon: Clock,
        dotColor: 'bg-blue-500'
      },
      received: {
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bgGradient: 'from-emerald-50 to-green-50',
        label: 'Recebido',
        icon: CheckCircle2,
        dotColor: 'bg-emerald-500'
      },
      overdue: {
        color: 'bg-red-50 text-red-700 border-red-200',
        bgGradient: 'from-red-50 to-rose-50',
        label: 'Vencido',
        icon: AlertCircle,
        dotColor: 'bg-red-500'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        bgGradient: 'from-gray-50 to-slate-50',
        label: 'Cancelado',
        icon: XCircle,
        dotColor: 'bg-gray-500'
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header Compacto e Moderno */}
        <div className={`bg-gradient-to-br ${statusConfig.bgGradient} p-6 border-b border-gray-100`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Status e ID em linha */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.color} border backdrop-blur-sm`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="font-medium text-sm">{statusConfig.label}</span>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  #{conta.id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              {/* Descrição como título principal */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {conta.description}
              </h2>

              {/* Informações principais em linha */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {conta.contact && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 font-medium">{conta.contact.name}</span>
                    {conta.contact.type && (
                      <Badge variant="outline" className="text-xs">
                        {conta.contact.type}
                      </Badge>
                    )}
                  </div>
                )}
                {conta.category && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: conta.category.color || '#6B7280' }} />
                    <span className="text-gray-600">{conta.category.name}</span>
                  </div>
                )}
                {conta.reference_document && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 font-mono text-xs">{conta.reference_document}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 ml-4"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal Redesenhado */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Seção Financeira - Destaque Principal */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-600" />
                  Resumo Financeiro
                </h3>
                {conta.status === 'received' && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Recebido
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Valor Original */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor Original</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(conta.original_amount || conta.amount)}
                  </p>
                </div>

                {/* Ajustes (se houver diferença) */}
                {conta.original_amount && conta.original_amount !== conta.amount && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-1">Ajustes</p>
                    <div className="flex items-center gap-2">
                      {conta.amount > conta.original_amount ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                      )}
                      <span className={`text-sm ${conta.amount > conta.original_amount ? 'text-green-600' : 'text-red-600'}`}>
                        {conta.amount > conta.original_amount ? '+' : ''}{formatCurrency(conta.amount - conta.original_amount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Valor Total */}
                <div className="md:text-right">
                  <p className="text-sm text-gray-500 mb-1">Valor Total</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatCurrency(conta.amount)}
                  </p>
                  {conta.status === 'received' && conta.received_amount && (
                    <p className="text-sm text-green-600 mt-1">
                      Recebido: {formatCurrency(conta.received_amount)}
                    </p>
                  )}
                </div>
              </div>

              {/* Barra de progresso visual para recebimento */}
              {conta.status === 'received' && (
                <div className="mt-4 pt-4 border-t border-green-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Status do Recebimento</span>
                    <span className="text-green-600 font-medium">100% Completo</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline de Datas */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-purple-600" />
                Timeline
              </h3>

              <div className="relative">
                <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-4">
                  {/* Data de Emissão */}
                  {conta.issue_date && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center relative z-10">
                        <Receipt className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Emissão</p>
                        <p className="font-medium text-gray-900">
                          {new Date(conta.issue_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Data de Vencimento */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                      conta.status !== 'received' && diasVencimento < 0
                        ? 'bg-red-100'
                        : conta.status !== 'received' && diasVencimento <= 3
                        ? 'bg-amber-100'
                        : 'bg-blue-100'
                    }`}>
                      <Calendar className={`w-5 h-5 ${
                        conta.status !== 'received' && diasVencimento < 0
                          ? 'text-red-600'
                          : conta.status !== 'received' && diasVencimento <= 3
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Vencimento</p>
                      <p className={`font-medium ${
                        conta.status !== 'received' && diasVencimento < 0
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {new Date(conta.due_date).toLocaleDateString('pt-BR')}
                      </p>
                      {conta.status === 'pending' && (
                        <p className={`text-xs mt-1 ${
                          diasVencimento < 0
                            ? 'text-red-500 font-semibold'
                            : diasVencimento <= 3
                            ? 'text-amber-500'
                            : 'text-gray-500'
                        }`}>
                          {diasVencimento < 0
                            ? `${Math.abs(diasVencimento)} dias em atraso`
                            : diasVencimento === 0
                            ? 'Vence hoje'
                            : `Em ${diasVencimento} dias`
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Data de Recebimento */}
                  {conta.status === 'received' && conta.received_at && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center relative z-10">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Recebimento Realizado</p>
                        <p className="font-medium text-green-700">
                          {new Date(conta.received_at).toLocaleDateString('pt-BR')}
                        </p>
                        {conta.bank_account && (
                          <div className="flex items-center gap-2 mt-1">
                            <Banknote className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {conta.bank_account.bank?.name || 'Conta Bancária'}
                              {conta.bank_account.agency && ` - Ag: ${conta.bank_account.agency}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Observações - Design Minimalista */}
            {conta.notes && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Observações</h4>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {conta.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadados - Mais Discreto */}
            <div className="flex items-center justify-between text-xs text-gray-400 px-2">
              <span>Criado em {new Date(conta.created_at || '').toLocaleString('pt-BR')}</span>
              <span>Atualizado em {new Date(conta.updated_at || '').toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Footer Redesenhado - Ações Contextuais */}
        <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Ações Secundárias */}
            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all font-medium"
              >
                Fechar
              </button>

              <div className="h-6 w-px bg-gray-200 mx-2" />

              <button
                onClick={() => onDuplicar(conta)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Duplicar"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={() => onExcluir(conta)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Ações Principais */}
            <div className="flex items-center gap-3">
              {/* Botão Reverter - Condicional */}
              {conta.status === 'received' && (
                <button
                  onClick={handleReverterRecebimento}
                  disabled={isReverting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`w-4 h-4 ${isReverting ? 'animate-spin' : ''}`} />
                  <span>{isReverting ? 'Revertendo...' : 'Reverter'}</span>
                </button>
              )}

              {/* Botão Editar */}
              <button
                onClick={() => onEditar(conta)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>

              {/* Botão Principal de Ação */}
              {conta.status === 'pending' && (
                <button
                  onClick={() => onReceber(conta)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg group"
                >
                  <DollarSign className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Receber</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}