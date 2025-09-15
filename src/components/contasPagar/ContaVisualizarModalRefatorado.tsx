import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ContaPagar } from '@/types/contaPagar';
import { formatarMoeda, formatarData, formatarDataHora } from '@/utils/formatters';
import type { Database } from '@/integrations/supabase/types';
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
  XCircle,
  Receipt
} from 'lucide-react';
import { accountsPayableService } from '@/services/accountsPayableService';
import { useToast } from '@/components/ui/use-toast';

type Contact = Database['public']['Tables']['contacts']['Row'];
type Category = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
};

interface ContaVisualizarModalRefatoradoProps {
  isOpen: boolean;
  onClose: () => void;
  conta: (ContaPagar & {
    contact?: Contact;
    category?: Category;
    dias_para_vencimento?: number;
    dias_em_atraso?: number;
  }) | null;
  onEditar: (conta: any) => void;
  onBaixar: (conta: any) => void;
  onDuplicar: (conta: any) => void;
  onExcluir: (conta: any) => void;
  onReload?: () => void;
}

export default function ContaVisualizarModalRefatorado({
  isOpen,
  onClose,
  conta,
  onEditar,
  onBaixar,
  onDuplicar,
  onExcluir,
  onReload
}: ContaVisualizarModalRefatoradoProps) {
  const [isReverting, setIsReverting] = useState(false);
  const { toast } = useToast();

  if (!conta) return null;

  const getStatusConfig = (status: string) => {
    const configs = {
      pendente: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        label: 'Pendente',
        icon: Clock
      },
      pago: {
        color: 'bg-green-100 text-green-700 border-green-200',
        label: 'Pago',
        icon: CheckCircle
      },
      vencido: {
        color: 'bg-red-100 text-red-700 border-red-200',
        label: 'Vencido',
        icon: AlertCircle
      },
      cancelado: {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: 'Cancelado',
        icon: XCircle
      }
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const statusConfig = getStatusConfig(conta.status);
  const StatusIcon = statusConfig.icon;

  const calcularDiasVencimento = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(conta.data_vencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasVencimento = calcularDiasVencimento();

  const handleReverterPagamento = async () => {
    if (!conta) return;

    setIsReverting(true);
    try {
      await accountsPayableService.revertPayment(conta.id);
      toast({
        title: "Sucesso",
        description: "Pagamento revertido com sucesso!",
      });
      onReload?.();
      onClose();
    } catch (error) {
      console.error('Erro ao reverter pagamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao reverter pagamento. Tente novamente.",
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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Conta a Pagar
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Detalhes completos da despesa
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
            <span className="text-sm text-blue-100 font-mono">
              ID: {conta.id.substring(0, 8).toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig.color} border px-3 py-1`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusConfig.label}
              </Badge>
              {conta.dda && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 border px-3 py-1">
                  DDA
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Card de Descrição */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
            <p className="text-gray-700 leading-relaxed">{conta.descricao}</p>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Coluna Esquerda */}
            <div className="space-y-6">

              {/* Card de Contato/Credor */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Credor/Fornecedor</h4>
                </div>
                <p className="text-gray-700 font-medium text-lg">
                  {conta.contact?.name || 'Não informado'}
                </p>
                {conta.contact?.document && (
                  <p className="text-gray-500 text-sm mt-2 font-mono">
                    {conta.contact.document}
                  </p>
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
              {conta.documento_referencia && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-green-100 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Documento de Referência</h4>
                  </div>
                  <p className="text-gray-700 font-medium font-mono">
                    {conta.documento_referencia}
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
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Valor Original:</span>
                    <span className="font-medium text-gray-700">
                      {formatarMoeda(conta.valor_original)}
                    </span>
                  </div>

                  {conta.valor_juros && conta.valor_juros > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Juros/Multa:</span>
                      <span className="font-medium text-red-600">
                        +{formatarMoeda(conta.valor_juros)}
                      </span>
                    </div>
                  )}

                  {conta.valor_desconto && conta.valor_desconto > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Desconto:</span>
                      <span className="font-medium text-green-600">
                        -{formatarMoeda(conta.valor_desconto)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 border-t border-gray-100">
                    <span className="text-lg font-semibold text-gray-900">Valor Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatarMoeda(conta.valor_final)}
                    </span>
                  </div>

                  {conta.status === 'pago' && conta.valor_pago && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-800 font-medium">Pago:</span>
                        </div>
                        <span className="font-bold text-green-700">
                          {formatarMoeda(conta.valor_pago)}
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
                  {conta.data_emissao && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Emissão:</span>
                      <span className="font-medium text-gray-700">
                        {formatarData(conta.data_emissao)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Vencimento:</span>
                    <span className={`font-medium ${
                      conta.status !== 'pago' && diasVencimento < 0
                        ? 'text-red-600 font-semibold'
                        : 'text-gray-700'
                    }`}>
                      {formatarData(conta.data_vencimento)}
                    </span>
                  </div>

                  {/* Indicador de Prazo */}
                  {conta.status === 'pendente' && (
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

                  {conta.status === 'pago' && conta.data_pagamento && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-green-800 font-medium">Pago em:</span>
                        <span className="font-bold text-green-700">
                          {formatarData(conta.data_pagamento)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card de Forma de Pagamento */}
              {conta.status === 'pago' && conta.forma_pagamento && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Forma de Pagamento</h4>
                  </div>
                  <p className="text-gray-700 font-medium capitalize">
                    {conta.forma_pagamento.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {conta.observacoes && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gray-200 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Observações</h4>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {conta.observacoes}
              </p>
            </div>
          )}

          {/* Metadados */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium text-gray-600">Criado em:</span>{' '}
                {formatarDataHora(conta.created_at || '')}
              </div>
              <div>
                <span className="font-medium text-gray-600">Atualizado em:</span>{' '}
                {formatarDataHora(conta.updated_at || '')}
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
              {/* Botão de Reverter (só aparece se estiver pago) */}
              {conta.status === 'pago' && (
                <button
                  onClick={handleReverterPagamento}
                  disabled={isReverting}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isReverting ? 'Revertendo...' : 'Reverter Pagamento'}</span>
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

              {/* Botão de Baixar/Pagar (só aparece se estiver pendente) */}
              {conta.status === 'pendente' && (
                <button
                  onClick={() => onBaixar(conta)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Baixar Conta</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}