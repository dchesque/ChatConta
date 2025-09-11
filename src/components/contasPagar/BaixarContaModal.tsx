import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Calculator, CheckCircle, Info, MessageSquare, ArrowDown, Loader2 } from 'lucide-react';
import { ContaPagar } from '@/types/contaPagar';
import { Banco } from '@/types/banco';
import { formatarMoeda, formatarData } from '@/utils/formatters';
import { aplicarMascaraMoeda, converterMoedaParaNumero, numeroParaMascaraMoeda } from '@/utils/masks';
import { SectionHeader, FieldDisplay, LoadingSpinner } from './ModalComponents';
import { useBanks } from '@/hooks/useBanks';
import { TipoPagamento, TIPOS_PAGAMENTO_LABELS } from '@/types/formaPagamento';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResponsive } from '@/hooks/useResponsive';

interface BaixarContaModalProps {
  isOpen: boolean;
  onClose: () => void;
  conta: ContaPagar | null;
  onConfirm: (dadosBaixa: any) => void;
}

export default function BaixarContaModal({ isOpen, onClose, conta, onConfirm }: BaixarContaModalProps) {
  const { isMobile } = useResponsive();
  const { banks: bancos } = useBanks();
  
  const [formData, setFormData] = useState({
    data_pagamento: new Date().toISOString().split('T')[0],
    banco_id: '',
    valor_pago: '',
    percentual_juros: 0,
    valor_juros: 0,
    percentual_desconto: 0,
    valor_desconto: 0,
    observacoes: '',
    forma_pagamento: 'dinheiro_pix' as TipoPagamento,
    numero_cheque: ''
  });

  const [valorFinal, setValorFinal] = useState(0);
  const [valorPagoPreenchido, setValorPagoPreenchido] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [validandoCheque, setValidandoCheque] = useState(false);

  // Inicializar quando a conta muda
  useEffect(() => {
    if (conta) {
      const valorInicialFormatado = numeroParaMascaraMoeda(conta.valor_original);
      setFormData(prev => ({
        ...prev,
        valor_pago: valorInicialFormatado,
        percentual_juros: 0,
        valor_juros: 0,
        percentual_desconto: 0,
        valor_desconto: 0
      }));
      setValorFinal(conta.valor_original);
      setValorPagoPreenchido(true);
      setMensagemFeedback('Valor original da conta');
    }
  }, [conta]);

  // Função para usar valor original
  const usarValorOriginal = () => {
    if (!conta) return;
    
    const valorOriginalFormatado = numeroParaMascaraMoeda(conta.valor_original);
    setFormData(prev => ({
      ...prev,
      valor_pago: valorOriginalFormatado,
      percentual_juros: 0,
      valor_juros: 0,
      percentual_desconto: 0,
      valor_desconto: 0
    }));
    setValorFinal(conta.valor_original);
    setValorPagoPreenchido(true);
    setMensagemFeedback('Valor original da conta');
  };

  // Manipular mudança do valor pago com cálculo automático
  const handleValorPagoChange = (valor: string) => {
    if (!conta) return;
    
    // Aplicar máscara de moeda usando a função correta do projeto
    const valorComMascara = aplicarMascaraMoeda(valor);
    const valorNumerico = converterMoedaParaNumero(valorComMascara);
    
    // Atualizar o estado com o valor mascarado
    setFormData(prev => ({ ...prev, valor_pago: valorComMascara }));
    
    if (valorNumerico > 0) {
      setValorPagoPreenchido(true);
      setValorFinal(valorNumerico);
      
      const valorOriginal = conta.valor_original;
      
      if (valorNumerico === valorOriginal) {
        // Valor igual ao original
        setFormData(prev => ({
          ...prev,
          valor_pago: valorComMascara,
          percentual_juros: 0,
          valor_juros: 0,
          percentual_desconto: 0,
          valor_desconto: 0
        }));
        setMensagemFeedback('Valor original da conta');
      } else if (valorNumerico < valorOriginal) {
        // Valor menor = desconto
        const percentualDesconto = ((valorOriginal - valorNumerico) / valorOriginal) * 100;
        const valorDesconto = valorOriginal - valorNumerico;
        
        setFormData(prev => ({
          ...prev,
          valor_pago: valorComMascara,
          percentual_juros: 0,
          valor_juros: 0,
          percentual_desconto: percentualDesconto,
          valor_desconto: valorDesconto
        }));
        setMensagemFeedback(`Desconto de ${percentualDesconto.toFixed(2)}% aplicado automaticamente`);
      } else {
        // Valor maior = juros
        const percentualJuros = ((valorNumerico - valorOriginal) / valorOriginal) * 100;
        const valorJuros = valorNumerico - valorOriginal;
        
        setFormData(prev => ({
          ...prev,
          valor_pago: valorComMascara,
          percentual_juros: percentualJuros,
          valor_juros: valorJuros,
          percentual_desconto: 0,
          valor_desconto: 0
        }));
        setMensagemFeedback(`Juros de ${percentualJuros.toFixed(2)}% aplicado automaticamente`);
      }
    } else {
      setValorPagoPreenchido(false);
      setMensagemFeedback('');
      setValorFinal(0);
    }
  };

  // Manipuladores para quando o valor pago NÃO está preenchido (modo manual)
  const handlePercentualJurosChange = (value: string) => {
    if (valorPagoPreenchido) return;
    
    const percentual = parseFloat(value) || 0;
    const valorJuros = conta ? conta.valor_original * percentual / 100 : 0;
    
    setFormData(prev => ({
      ...prev,
      percentual_juros: percentual,
      valor_juros: valorJuros
    }));
  };

  const handlePercentualDescontoChange = (value: string) => {
    if (valorPagoPreenchido) return;
    
    const percentual = parseFloat(value) || 0;
    const valorDesconto = conta ? conta.valor_original * percentual / 100 : 0;
    
    setFormData(prev => ({
      ...prev,
      percentual_desconto: percentual,
      valor_desconto: valorDesconto
    }));
  };

  const handleConfirmarBaixa = async () => {
    try {
      setErro('');
      setLoading(true);

      if (!formData.banco_id) {
        setErro('Por favor, selecione um banco');
        return;
      }

      if (!valorFinal || valorFinal <= 0) {
        setErro('Por favor, informe um valor pago válido');
        return;
      }

      const dadosBaixa = {
        ...formData,
        valor_pago: valorFinal,
        conta_id: conta?.id
      };

      await onConfirm(dadosBaixa);
      onClose();
      
      // Reset form
      setFormData({
        data_pagamento: new Date().toISOString().split('T')[0],
        banco_id: '',
        valor_pago: '',
        percentual_juros: 0,
        valor_juros: 0,
        percentual_desconto: 0,
        valor_desconto: 0,
        observacoes: '',
        forma_pagamento: 'dinheiro_pix' as TipoPagamento,
        numero_cheque: ''
      });
      setValorPagoPreenchido(false);
      setMensagemFeedback('');
    } catch (error) {
      setErro('Erro ao processar baixa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!conta || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Baixar Conta a Pagar
                </h2>
                <p className="text-sm text-gray-500">Marcar como pago</p>
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
          <div className="flex-shrink-0 mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm">{erro}</p>
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            
            {/* Dados da Conta (Resumo) */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
              <SectionHeader icon={Info} title="Dados da Conta" color="blue" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldDisplay label="Descrição" value={conta.descricao} />
                <FieldDisplay label="Valor Original" value={formatarMoeda(conta.valor_original)} />
                <FieldDisplay label="Valor a Pagar" value={formatarMoeda(conta.valor_final)} valueClass="text-blue-600 font-bold" />
                <FieldDisplay label="Vencimento" value={formatarData(conta.data_vencimento)} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Coluna 1: Dados do Pagamento */}
              <div className="space-y-8">
                <SectionHeader icon={CreditCard} title="Dados do Pagamento" color="green" />
                
                <div className="space-y-4">
                  {/* Data de Pagamento */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Data de Pagamento *
                    </label>
                    <input
                      type="date"
                      value={formData.data_pagamento}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_pagamento: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  {/* Banco */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Banco *
                    </label>
                    <select
                      value={formData.banco_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, banco_id: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Selecione o banco</option>
                      {bancos.filter(banco => banco.ativo).map((banco) => (
                        <option key={banco.id} value={banco.id.toString()}>
                          {banco.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Valor Pago - NOVO CAMPO INTELIGENTE */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Valor Pago *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.valor_pago}
                        onChange={(e) => handleValorPagoChange(e.target.value)}
                        className={`w-full h-11 bg-white border-2 rounded-xl px-4 pr-12 text-right text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                          valorFinal > 0 
                            ? 'border-green-200 focus:border-green-500 focus:ring-green-200' 
                            : 'border-red-200 focus:border-red-500 focus:ring-red-200'
                        }`}
                        placeholder="R$ 0,00"
                      />
                      <button
                        type="button"
                        onClick={usarValorOriginal}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors duration-200"
                        title={`Usar valor original (${numeroParaMascaraMoeda(conta?.valor_original || 0)})`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    {mensagemFeedback && (
                      <p className={`text-xs mt-1 ${
                        mensagemFeedback.includes('Desconto') ? 'text-green-600' :
                        mensagemFeedback.includes('Juros') ? 'text-orange-600' :
                        'text-blue-600'
                      }`}>
                        {mensagemFeedback}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna 2: Ajustes Financeiros */}
              <div className="space-y-8">
                <SectionHeader icon={Calculator} title="Ajustes Financeiros" color="purple" />
                
                <div className="space-y-4">
                  {/* Juros */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Juros/Multa
                      {valorPagoPreenchido && (
                        <span className="text-xs text-gray-500 ml-2">(calculado automaticamente)</span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.percentual_juros ? formData.percentual_juros.toFixed(2) : ''}
                          onChange={(e) => handlePercentualJurosChange(e.target.value)}
                          readOnly={valorPagoPreenchido}
                          className={`w-full border rounded-xl px-3 py-2 text-right transition-colors ${
                            valorPagoPreenchido
                              ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed'
                              : 'bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          }`}
                          placeholder="0,00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Percentual (%)</p>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={formatarMoeda(formData.valor_juros || 0)}
                          readOnly
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-right text-gray-600 font-medium"
                        />
                        <p className="text-xs text-gray-500 mt-1">Valor (R$)</p>
                      </div>
                    </div>
                  </div>

                  {/* Desconto */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Desconto
                      {valorPagoPreenchido && (
                        <span className="text-xs text-gray-500 ml-2">(calculado automaticamente)</span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.percentual_desconto ? formData.percentual_desconto.toFixed(2) : ''}
                          onChange={(e) => handlePercentualDescontoChange(e.target.value)}
                          readOnly={valorPagoPreenchido}
                          className={`w-full border rounded-xl px-3 py-2 text-right transition-colors ${
                            valorPagoPreenchido
                              ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed'
                              : 'bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          }`}
                          placeholder="0,00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Percentual (%)</p>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={formatarMoeda(formData.valor_desconto || 0)}
                          readOnly
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-right text-gray-600 font-medium"
                        />
                        <p className="text-xs text-gray-500 mt-1">Valor (R$)</p>
                      </div>
                    </div>
                  </div>

                  {/* Valor Final */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Valor Final a Pagar:</span>
                      <span className="text-3xl font-bold text-green-600">
                        {formatarMoeda(valorFinal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="mt-10">
              <SectionHeader icon={MessageSquare} title="Observações sobre o Pagamento" color="gray" />
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                placeholder="Observações sobre este pagamento..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirmarBaixa}
              disabled={loading}
              className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading && <LoadingSpinner size="sm" />}
              <CheckCircle className="w-5 h-5" />
              <span>{loading ? 'Processando...' : 'Confirmar Baixa'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}