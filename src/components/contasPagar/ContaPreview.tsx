import { ContaPagar } from '@/types/contaPagar';
import { FornecedorCompat } from '@/hooks/useFornecedoresAlias';
import { PlanoContas } from '@/types/planoContas';
import { Category } from '@/types/category';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Building2, FolderTree, CreditCard, AlertTriangle } from 'lucide-react';
import { FormaPagamento, TIPOS_PAGAMENTO_LABELS, TIPOS_PAGAMENTO_ICONS } from '@/types/formaPagamento';
import { useFornecedores } from '@/hooks/useFornecedores';
import { usePlanoContas } from '@/hooks/usePlanoContas';
import { useBanks } from '@/hooks/useBanks';
import { formatarMoedaExibicao } from '@/utils/masks';

interface ContaPreviewProps {
  conta: Partial<ContaPagar>;
  formaPagamento?: FormaPagamento;
  credorSelecionado?: FornecedorCompat | null;
  contaSelecionada?: Category | null;
  className?: string;
}

export function ContaPreview({ conta, formaPagamento, credorSelecionado, contaSelecionada, className = "" }: ContaPreviewProps) {
  // Buscar dados relacionados via hooks
  const { fornecedores } = useFornecedores();
  const { planoContas } = usePlanoContas();
  const { banks: bancos } = useBanks();
  
  // Dados recebidos para preview da conta
  
  // Usar os objetos passados diretamente ao invés de buscar pelos IDs
  const fornecedor = credorSelecionado || (conta.fornecedor_id 
    ? fornecedores.find(f => f.id.toString() === conta.fornecedor_id?.toString())
    : null);

  const planoContasItem = contaSelecionada || (conta.plano_conta_id
    ? planoContas.find(p => p.id.toString() === conta.plano_conta_id?.toString())
    : null);

  const banco = conta.banco_id
    ? bancos.find(b => b.id === conta.banco_id)
    : null;

  const formatarMoeda = (valor?: number) => {
    return formatarMoedaExibicao(valor || 0);
  };

  const formatarData = (data?: string) => {
    if (!data) return '-';
    
    // Parse manual da data para evitar problemas de timezone
    const [ano, mes, dia] = data.split('-').map(num => parseInt(num));
    const dataLocal = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
    
    return dataLocal.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string) => {
    const colors = {
      'pendente': 'bg-blue-100/80 text-blue-700',
      'pago': 'bg-green-100/80 text-green-700',
      'vencido': 'bg-red-100/80 text-red-700',
      'cancelado': 'bg-gray-100/80 text-gray-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100/80 text-gray-700';
  };

  const isVencimentoProximo = () => {
    if (!conta.data_vencimento) return false;
    
    // Normalizar ambas as datas para evitar problemas de timezone
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Parse da data de vencimento no formato YYYY-MM-DD
    const dataVencimento = conta.data_vencimento;
    const [ano, mes, dia] = dataVencimento.split('-').map(num => parseInt(num));
    const vencimento = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
    
    const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
    return diffDias <= 3 && diffDias > 0; // Vencimento hoje não é "próximo"
  };

  const isVencido = () => {
    if (!conta.data_vencimento) return false;
    
    // Normalizar ambas as datas para evitar problemas de timezone
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Parse da data de vencimento no formato YYYY-MM-DD
    const dataVencimento = conta.data_vencimento;
    const [ano, mes, dia] = dataVencimento.split('-').map(num => parseInt(num));
    const vencimento = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
    
    
    return vencimento < hoje;
  };

  return (
    <Card className={`bg-white/90 backdrop-blur-xl border border-white/20 shadow-lg sticky top-6 ${className}`}>
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview da Conta</h3>
          <p className="text-sm text-gray-500">Resumo do lançamento</p>
        </div>

        {/* Status e alertas */}
        <div className="space-y-2">
          {conta.status && (
            <Badge className={`w-full justify-center ${getStatusColor(conta.status)}`}>
              {conta.status.charAt(0).toUpperCase() + conta.status.slice(1)}
            </Badge>
          )}
          
          {isVencido() && (
            <div className="flex items-center space-x-2 p-2 bg-red-50/80 rounded-lg border border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">Conta vencida</span>
            </div>
          )}
          
          {isVencimentoProximo() && !isVencido() && (
            <div className="flex items-center space-x-2 p-2 bg-orange-50/80 rounded-lg border border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-700">Vence em breve</span>
            </div>
          )}
        </div>

        {/* Informações principais */}
        <div className="space-y-4">
          {/* Credor */}
          {fornecedor ? (
            <div className="flex items-start space-x-3">
              <Building2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{fornecedor.nome}</div>
                <div className="text-xs text-gray-500">{fornecedor.documento}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3 text-gray-400">
              <Building2 className="h-5 w-5 mt-0.5" />
              <span className="text-sm">Nenhum credor selecionado</span>
            </div>
          )}

          {/* Categoria */}
          {planoContasItem ? (
            <div className="flex items-start space-x-3">
              <FolderTree className="h-5 w-5 text-success mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {planoContasItem.name || planoContasItem.nome}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3 text-gray-400">
              <FolderTree className="h-5 w-5 mt-0.5" />
              <span className="text-sm">Nenhuma categoria selecionada</span>
            </div>
          )}

          {/* Valores */}
          <div className="space-y-3 p-3 bg-gray-50/80 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor Original:</span>
              <span className="font-medium">{formatarMoeda(conta.valor_original)}</span>
            </div>
            
            {(conta.valor_juros || 0) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">+ Juros:</span>
                <span className="font-medium text-red-600">{formatarMoeda(conta.valor_juros)}</span>
              </div>
            )}
            
            {(conta.valor_desconto || 0) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">- Desconto:</span>
                <span className="font-medium text-green-600">{formatarMoeda(conta.valor_desconto)}</span>
              </div>
            )}
            
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Valor Final:</span>
                <span className="text-lg font-bold text-gray-900">{formatarMoeda(conta.valor_final)}</span>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Vencimento:</span>
              </div>
              <span className="text-sm font-medium">{formatarData(conta.data_vencimento)}</span>
            </div>
            
            {conta.data_emissao && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 ml-6">Emissão:</span>
                <span className="text-sm">{formatarData(conta.data_emissao)}</span>
              </div>
            )}
          </div>

          {/* Banco (se pago) */}
          {banco && conta.status === 'pago' && (
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{banco.nome}</div>
                <div className="text-xs text-gray-500">
                  Pago em {formatarData(conta.data_pagamento)} - {formatarMoeda(conta.valor_pago)}
                </div>
              </div>
            </div>
          )}

          {/* DDA */}
          {conta.dda && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50/80 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">Débito Direto Autorizado</span>
            </div>
          )}

          {/* Forma de Pagamento */}
          {formaPagamento && (
            <div className="space-y-3 p-3 bg-green-50/80 rounded-lg border border-green-200/50">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Forma de Pagamento</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{TIPOS_PAGAMENTO_ICONS[formaPagamento.tipo]}</span>
                    <span className="text-sm font-medium">{TIPOS_PAGAMENTO_LABELS[formaPagamento.tipo]}</span>
                  </div>
                </div>
                
                {/* Tipo de Cartão */}
                {formaPagamento.tipo === 'cartao' && formaPagamento.tipo_cartao && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {formaPagamento.tipo_cartao}
                    </Badge>
                  </div>
                )}
                
                
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-gray-600">DDA:</span>
                   <Badge variant={conta.dda ? 'default' : 'outline'} className="text-xs">
                     {conta.dda ? '✓ Ativo' : '✗ Inativo'}
                   </Badge>
                 </div>
                
                {/* Tipo de Cartão */}
                {formaPagamento.tipo === 'cartao' && formaPagamento.tipo_cartao && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <Badge variant="outline" className="text-xs">
                      {formaPagamento.tipo_cartao === 'debito' ? 'Débito' : 'Crédito'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descrição */}
          {conta.descricao && (
            <div className="p-3 bg-gray-50/80 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Descrição:</div>
              <div className="text-sm text-gray-900">{conta.descricao}</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}