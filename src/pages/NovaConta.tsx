import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { createBreadcrumb } from '@/utils/breadcrumbUtils';
import { ArrowLeft, Save, CreditCard, Calendar, AlertTriangle, FileText, CheckCircle, Repeat, Building2 } from 'lucide-react';
import { ContaPagar } from '@/types/contaPagar';
import { FornecedorCompat } from '@/hooks/useFornecedoresAlias';
import { Category } from '@/types/category';
import { Banco } from '@/types/banco';
import { FormaPagamento } from '@/types/formaPagamento';
import { useBanks } from '@/hooks/useBanks';
import { useContasPagar } from '@/hooks/useContasPagar';
import { useContatos } from '@/hooks/useContatos';
import { useAuth } from '@/hooks/useAuth';
import { FornecedorSelector as CredorSelector } from '@/components/contasPagar/FornecedorSelector';
import { CategoriaSelectorNovo } from '@/components/contasPagar/CategoriaSelectorNovo';
import { ContaPreview } from '@/components/contasPagar/ContaPreview';
import { FormaPagamentoSection } from '@/components/contasPagar/FormaPagamentoSection';
import { RecorrenciaSection, RecorrenciaData } from '@/components/contasPagar/RecorrenciaSection';
import { BankAccountSelector } from '@/components/contasPagar/BankAccountSelector';
import { useBankAccountsAll } from '@/hooks/useBankAccountsAll';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import { aplicarMascaraMoeda, aplicarMascaraPercentual, converterMoedaParaNumero, converterPercentualParaNumero, numeroParaMascaraMoeda, numeroParaMascaraPercentual, validarValorMonetario, validarPercentual, formatarMoedaExibicao } from '@/utils/masks';
import { ValidationService } from '@/services/ValidationService';
import { categoriesService } from '@/services/categoriesService';
// Supabase removido - usando dados mock
import { CampoComValidacao } from '@/components/ui/CampoComValidacao';
import { validarValor, validarDescricao, validarDocumento, validarDataVencimento, validarObservacoes } from '@/utils/validacoesTempoReal';
import { toast } from '@/hooks/use-toast';
export default function NovaConta() {
  const navigate = useNavigate();
  const { criarConta, loading } = useContasPagar();
  const { banks: bancos } = useBanks();
  const { contatos } = useContatos();
  const { user } = useAuth();
  const { isSaving, setLoading } = useLoadingStates();
  
  // Hook para contas bancárias
  const { accounts: allBankAccounts = [] } = useBankAccountsAll();

  // Filtrar apenas credores (suppliers)
  const credores = contatos.filter(contato => contato.type === 'supplier');

  // Estados do formulário
  const [conta, setConta] = useState<Partial<ContaPagar>>({
    documento_referencia: '',
    descricao: '',
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: '',
    valor_original: 0,
    percentual_juros: 0,
    valor_juros: 0,
    percentual_desconto: 0,
    valor_desconto: 0,
    valor_final: 0,
    status: 'pendente',
    dda: false,
    observacoes: ''
  });

  // Estados para controlar valores com máscara
  const [valorOriginalMask, setValorOriginalMask] = useState('');
  const [percentualJurosMask, setPercentualJurosMask] = useState('');
  const [valorJurosMask, setValorJurosMask] = useState('');
  const [percentualDescontoMask, setPercentualDescontoMask] = useState('');
  const [valorDescontoMask, setValorDescontoMask] = useState('');
  const [valorPagoMask, setValorPagoMask] = useState('');
  const [credorSelecionado, setCredorSelecionado] = useState<FornecedorCompat | null>(null);
  const [contaSelecionada, setContaSelecionada] = useState<Category | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>({
    tipo: 'dinheiro_pix'
  });
  const [contaBancaria, setContaBancaria] = useState<{ banco_id?: string; conta_id?: string }>({});
  
  // Estados de validação em tempo real
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});
  
  // Estados do auto-save
  const [rascunhoSalvo, setRascunhoSalvo] = useState(false);
  const [temRascunho, setTemRascunho] = useState(false);
  
  // Estados para recorrência
  const [recorrencia, setRecorrencia] = useState<RecorrenciaData>({
    ativo: false,
    tipo: 'mensal',
    quantidade_parcelas: 1,
    data_inicio: new Date().toISOString().split('T')[0],
    valor_parcela: 0
  });

  // Função de validação em tempo real
  const validarCampoTempoReal = async (campo: string, valor: any) => {
    const { ValidationService } = await import('@/services/ValidationService');
    const erro = ValidationService.validarContaPagar({ 
      [campo]: valor,
      // Passar contexto completo para validações mais precisas
      fornecedor_id: credorSelecionado?.id,
      plano_conta_id: contaSelecionada?.id,
      data_emissao: conta.data_emissao  // 🔥 CORREÇÃO: Passar data de emissão para validação correta
    });
    
    setErrosValidacao(prev => ({ 
      ...prev, 
      [campo]: erro[campo] || '' 
    }));
  };

  // Auto-save automático
  useEffect(() => {
    const timer = setTimeout(() => {
      // Só salva se há dados preenchidos
      if (conta.descricao || conta.valor_original > 0 || credorSelecionado || contaSelecionada) {
        const rascunho = {
          conta,
          credor: credorSelecionado,
          categoria: contaSelecionada,
          formaPagamento,
          timestamp: Date.now(),
          versao: '1.0'
        };
        
        localStorage.setItem('rascunho_conta_individual', JSON.stringify(rascunho));
        setRascunhoSalvo(true);
        
        // Mostrar feedback sutil
        setTimeout(() => setRascunhoSalvo(false), 2000);
      }
    }, 3000); // Salva após 3 segundos de inatividade
    
    return () => clearTimeout(timer);
  }, [conta, credorSelecionado, contaSelecionada, formaPagamento]);

  // Recuperar rascunho ao carregar página
  useEffect(() => {
    const rascunhoSalvo = localStorage.getItem('rascunho_conta_individual');
    if (rascunhoSalvo) {
      try {
        const dados = JSON.parse(rascunhoSalvo);
        
        // Verificar se não é muito antigo (24 horas)
        const agora = Date.now();
        const horasPassadas = (agora - dados.timestamp) / (1000 * 60 * 60);
        
        if (horasPassadas < 24) {
          setTemRascunho(true);
          // Não aplicar automaticamente, perguntar ao usuário
        } else {
          // Rascunho muito antigo, remover
          localStorage.removeItem('rascunho_conta_individual');
        }
      } catch (error) {
        console.error('Erro ao recuperar rascunho:', error);
        localStorage.removeItem('rascunho_conta_individual');
      }
    }
  }, []);

  // Cálculo automático do valor final (simplificado, sem juros/desconto)
  useEffect(() => {
    const final = conta.valor_original || 0;
    setConta(prev => ({
      ...prev,
      valor_final: final
    }));
    
    // Atualizar valor da parcela na recorrência (CADA parcela tem o valor integral)
    if (recorrencia.ativo && final > 0) {
      setRecorrencia(prev => ({
        ...prev,
        valor_parcela: final // Cada parcela mantém o valor integral, não dividido
      }));
    }
  }, [conta.valor_original, recorrencia.ativo]);

  // Função para selecionar credor e auto-preencher categoria
  const handleCredorSelect = async (credor: any) => {
    setCredorSelecionado(credor);
    setConta(prev => ({
      ...prev,
      fornecedor_id: credor.id
    }));

    // Auto-preencher categoria padrão do credor se existir
    if (credor.category_id) {
      try {
        // Buscar categoria do credor via API para auto-preencher
        const categoria = await categoriesService.getById(credor.category_id);
        if (categoria) {
          setContaSelecionada(categoria);
          setConta(prev => ({
            ...prev,
            plano_conta_id: categoria.id
          }));
        }
      } catch (error) {
        console.warn('Erro ao buscar categoria do credor:', error);
        // Se der erro, deixar para o usuário selecionar manualmente
      }
    }
  };

  // Handlers para campos com máscara
  const handleValorOriginal = (valor: string) => {
    const mascarado = aplicarMascaraMoeda(valor);
    const numero = converterMoedaParaNumero(mascarado);
    setValorOriginalMask(mascarado);
    setConta(prev => ({
      ...prev,
      valor_original: numero
    }));
  };
  const handleValorPago = (valor: string) => {
    const mascarado = aplicarMascaraMoeda(valor);
    const numero = converterMoedaParaNumero(mascarado);
    setValorPagoMask(mascarado);
    setConta(prev => ({
      ...prev,
      valor_pago: numero
    }));
  };

  // Botão para preencher valor original
  const preencherValorOriginal = () => {
    const valorOriginal = conta.valor_original || 0;
    const mascarado = numeroParaMascaraMoeda(valorOriginal);
    setValorPagoMask(mascarado);
    setConta(prev => ({
      ...prev,
      valor_pago: valorOriginal
    }));
  };
  const validarFormulario = (): boolean => {
    const errors: string[] = [];
    
    // Validações obrigatórias
    if (!credorSelecionado || !credorSelecionado.id) {
      errors.push('Selecione um credor');
    }
    
    if (!conta.descricao || conta.descricao.trim() === '') {
      errors.push('Descrição é obrigatória');
    } else if (conta.descricao.length < 3) {
      errors.push('Descrição deve ter pelo menos 3 caracteres');
    } else if (conta.descricao.length > 500) {
      errors.push('Descrição deve ter no máximo 500 caracteres');
    }
    
    if (!conta.valor_original || conta.valor_original <= 0) {
      errors.push('Valor deve ser maior que zero');
    } else if (conta.valor_original > 999999.99) {
      errors.push('Valor máximo excedido (R$ 999.999,99)');
    }
    
    if (!conta.data_emissao) {
      errors.push('Data de emissão é obrigatória');
    }
    
    if (!conta.data_vencimento) {
      errors.push('Data de vencimento é obrigatória');
    }
    
    // Validações de lógica de negócio
    if (conta.data_emissao && conta.data_vencimento) {
      const emissao = new Date(conta.data_emissao);
      const vencimento = new Date(conta.data_vencimento);
      
      if (vencimento < emissao) {
        errors.push('Data de vencimento não pode ser anterior à emissão');
      }
      
      // Validar se não é muito no futuro (ex: máximo 5 anos)
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 5);
      if (vencimento > maxFutureDate) {
        errors.push('Data de vencimento não pode ser superior a 5 anos');
      }
    }
    
    if (!contaSelecionada || !contaSelecionada.id) {
      errors.push('Selecione uma categoria');
    }
    
    // Validações específicas de status
    if (conta.status === 'pago' && !conta.banco_id) {
      errors.push('Selecione o banco para contas pagas');
    }
    
    // Mostrar erros se houver
    if (errors.length > 0) {
      errors.forEach(error => {
        toast({ title: 'Atenção', description: error });
      });
      return false;
    }
    
    return true;
  };
  // Função para aplicar rascunho
  const aplicarRascunho = () => {
    const rascunhoSalvo = localStorage.getItem('rascunho_conta_individual');
    if (rascunhoSalvo) {
      const dados = JSON.parse(rascunhoSalvo);
      setConta(dados.conta);
      setCredorSelecionado(dados.credor || dados.fornecedor); // Retrocompatibilidade
      setContaSelecionada(dados.categoria);
      setFormaPagamento(dados.formaPagamento);
      setTemRascunho(false);
      
      toast({ title: 'Sucesso', description: 'Rascunho aplicado - dados restaurados com sucesso' });
    }
  };

  // Função para descartar rascunho
  const descartarRascunho = () => {
    localStorage.removeItem('rascunho_conta_individual');
    setTemRascunho(false);
    
    toast({ title: 'Sucesso', description: 'Rascunho descartado' });
  };

  const salvarConta = async (marcarComoPago = false) => {
    if (!validarFormulario()) return;
    
    setLoading('saving', true);
    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Se recorrência está ativa, criar múltiplas contas
      if (recorrencia.ativo && recorrencia.quantidade_parcelas > 1) {
        await criarContasRecorrentes(marcarComoPago);
      } else {
        await criarContaSimples(marcarComoPago);
      }
      
      // Após salvar com sucesso, limpar rascunho
      localStorage.removeItem('rascunho_conta_individual');
      setRascunhoSalvo(false);
      
      toast({ title: 'Sucesso', description: `Conta "${conta.descricao}" criada com sucesso!` });
      navigate('/contas-pagar');
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Erro ao salvar conta. Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading('saving', false);
    }
  };

  const criarContaSimples = async (marcarComoPago: boolean) => {
    // Validação simplificada - dados obrigatórios
    if (!contaSelecionada || !conta.descricao || !conta.valor_original || !conta.data_vencimento) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const contaParaSalvar = {
      user_id: user!.id,
      fornecedor_id: credorSelecionado?.id || null,
      plano_conta_id: contaSelecionada.id,
      documento_referencia: conta.documento_referencia || null,
      descricao: conta.descricao,
      data_emissao: conta.data_emissao,
      data_vencimento: conta.data_vencimento,
      valor_original: conta.valor_original,
      valor_final: conta.valor_final || conta.valor_original,
      status: marcarComoPago ? 'pago' : conta.status,
      data_pagamento: marcarComoPago ? new Date().toISOString().split('T')[0] : (conta.status === 'pago' ? conta.data_pagamento || new Date().toISOString().split('T')[0] : null),
      valor_pago: marcarComoPago ? conta.valor_final || conta.valor_original : (conta.status === 'pago' ? conta.valor_pago || conta.valor_final || conta.valor_original : null),
      dda: conta.dda || false,
      observacoes: conta.observacoes || '',
      // Campos obrigatórios da interface ContaPagar
      parcela_atual: 1,
      total_parcelas: 1,
      forma_pagamento: formaPagamento.tipo
    } as any;

    // Salvar a conta
    await criarConta(contaParaSalvar);
  };

  const criarContasRecorrentes = async (marcarComoPago: boolean) => {
    const contasParaCriar = [];
    let dataAtual = new Date(recorrencia.data_inicio);
    
    for (let i = 0; i < recorrencia.quantidade_parcelas; i++) {
      const contaParaSalvar = {
        user_id: user!.id,
        fornecedor_id: credorSelecionado!.id.toString(),
        plano_conta_id: contaSelecionada!.id.toString(),
        banco_id: marcarComoPago && i === 0 && contaBancaria.conta_id ? contaBancaria.conta_id : undefined,
        documento_referencia: conta.documento_referencia ? `${conta.documento_referencia} (${i + 1}/${recorrencia.quantidade_parcelas})` : undefined,
        descricao: `${conta.descricao} - Parcela ${i + 1}/${recorrencia.quantidade_parcelas}`,
        data_emissao: conta.data_emissao,
        data_vencimento: dataAtual.toISOString().split('T')[0],
        valor_original: conta.valor_original!, // Valor integral de cada parcela
        valor_final: conta.valor_final!, // Valor integral de cada parcela
        status: marcarComoPago && i === 0 ? 'pago' : 'pendente',
        data_pagamento: marcarComoPago && i === 0 ? new Date().toISOString().split('T')[0] : undefined,
        valor_pago: marcarComoPago && i === 0 ? conta.valor_final : undefined,
        dda: conta.dda || false,
        observacoes: conta.observacoes,
        // Campos obrigatórios da interface ContaPagar
        parcela_atual: i + 1,
        total_parcelas: recorrencia.quantidade_parcelas,
        forma_pagamento: formaPagamento.tipo
      } as any;
      
      await criarConta(contaParaSalvar);

      // Calcular próxima data
      switch (recorrencia.tipo) {
        case 'semanal':
          dataAtual.setDate(dataAtual.getDate() + 7);
          break;
        case 'quinzenal':
          dataAtual.setDate(dataAtual.getDate() + 15);
          break;
        case 'mensal':
          dataAtual.setMonth(dataAtual.getMonth() + 1);
          break;
        case 'bimestral':
          dataAtual.setMonth(dataAtual.getMonth() + 2);
          break;
        case 'trimestral':
          dataAtual.setMonth(dataAtual.getMonth() + 3);
          break;
        case 'semestral':
          dataAtual.setMonth(dataAtual.getMonth() + 6);
          break;
        case 'anual':
          dataAtual.setFullYear(dataAtual.getFullYear() + 1);
          break;
      }
    }
  };
  return (
    <>
      <PageHeader
        breadcrumb={createBreadcrumb('/conta-individual')}
        title="Nova Conta a Pagar"
        subtitle="Lançamento individual de contas • Cadastro detalhado"
        actions={
          <Button 
            variant="outline" 
            onClick={() => navigate('/contas-pagar')}
            className="bg-white/80 hover:bg-white/90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="relative p-4 lg:p-8 cursor-auto">
        {/* Banner de rascunho encontrado */}
        {temRascunho && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Rascunho encontrado</p>
                  <p className="text-xs text-blue-600">Dados salvos automaticamente foram encontrados</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={aplicarRascunho}>
                  Restaurar
                </Button>
                <Button size="sm" variant="ghost" onClick={descartarRascunho}>
                  Descartar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Formulário principal */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl">
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
                {/* Seção: Dados do Fornecedor */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Dados do Credor</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Credor <span className="text-red-500">*</span>
                      </Label>
                      <CredorSelector 
                        value={credorSelecionado} 
                        onSelect={handleCredorSelect} 
                        placeholder="Selecionar credor..." 
                        className="w-full" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Categoria/Plano de Contas <span className="text-red-500">*</span>
                      </Label>
                       <CategoriaSelectorNovo 
                         value={contaSelecionada} 
                         onSelect={(categoria) => {
                           setContaSelecionada(categoria);
                           setConta(prev => ({
                             ...prev,
                             plano_conta_id: categoria.id
                           }));
                         }} 
                         placeholder="Selecionar categoria..."
                        className="w-full" 
                        tipo="expense"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Seção: Dados da Conta */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Dados da Conta</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Data de Emissão
                      </Label>
                      <Input 
                        type="date" 
                        value={conta.data_emissao || ''} 
                         onChange={e => {
                           setConta(prev => ({ ...prev, data_emissao: e.target.value }));
                           validarCampoTempoReal('data_emissao', e.target.value);
                         }}
                        className={`bg-white/80 backdrop-blur-sm ${
                          errosValidacao.data_emissao ? 'border-red-300' : 'border-green-300'
                        }`}
                      />
                      {errosValidacao.data_emissao && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errosValidacao.data_emissao}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Descrição <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        placeholder="Descrição da compra ou serviço" 
                        value={conta.descricao || ''} 
                         onChange={e => {
                           setConta(prev => ({ ...prev, descricao: e.target.value }));
                           validarCampoTempoReal('descricao', e.target.value);
                         }}
                        className={`bg-white/80 backdrop-blur-sm ${
                          errosValidacao.descricao ? 'border-red-300 focus:border-red-500' : 'border-green-300 focus:border-green-500'
                        }`}
                      />
                      {errosValidacao.descricao && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errosValidacao.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Seção: Valores e Vencimento */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Valores e Vencimento</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Valor Original <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        type="text" 
                        placeholder="R$ 0,00" 
                        value={valorOriginalMask} 
                         onChange={e => {
                           handleValorOriginal(e.target.value);
                           validarCampoTempoReal('valor_original', converterMoedaParaNumero(e.target.value));
                         }}
                        className={`bg-white/80 backdrop-blur-sm text-right text-lg font-medium ${
                          errosValidacao.valor_original ? 'border-red-300' : 'border-green-300'
                        }`}
                      />
                      {errosValidacao.valor_original && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errosValidacao.valor_original}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Data de Vencimento <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        type="date" 
                        value={conta.data_vencimento || ''} 
                         onChange={e => {
                           setConta(prev => ({ ...prev, data_vencimento: e.target.value }));
                           validarCampoTempoReal('data_vencimento', e.target.value);
                         }}
                        className={`bg-white/80 backdrop-blur-sm ${
                          errosValidacao.data_vencimento ? 'border-red-300' : 'border-green-300'
                        }`}
                      />
                      {errosValidacao.data_vencimento && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errosValidacao.data_vencimento}
                        </p>
                      )}
                    </div>


                    <div className="md:col-span-2 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-700">Valor Final:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatarMoedaExibicao(conta.valor_final || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Seção: Recorrência */}
                <RecorrenciaSection
                  value={recorrencia}
                  onChange={setRecorrencia}
                  valorTotal={conta.valor_final || 0}
                />

                <Separator />

                {/* Seção: DDA */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="dda" checked={conta.dda} onCheckedChange={checked => setConta(prev => ({
                      ...prev,
                      dda: checked as boolean
                    }))} />
                    <Label htmlFor="dda" className="text-sm font-medium text-gray-700">
                      Esta conta é paga via DDA (Débito Direto Autorizado)
                    </Label>
                  </div>
                </div>

                <Separator />

                {/* Seção: Status da Conta */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Status da Conta</h2>
                  </div>

                  <RadioGroup value={conta.status} onValueChange={value => {
                    const newStatus = value as any;
                    setConta(prev => ({
                      ...prev,
                      status: newStatus,
                      data_pagamento: newStatus === 'pago' ? (prev.data_pagamento || new Date().toISOString().split('T')[0]) : prev.data_pagamento,
                      valor_pago: newStatus === 'pago' ? (prev.valor_pago || prev.valor_final || prev.valor_original) : prev.valor_pago
                    }));
                    
                    // Quando marca como pago, preenche automaticamente o valor pago com o valor final
                    if (newStatus === 'pago' && !valorPagoMask && conta.valor_final) {
                      const valorFormatado = numeroParaMascaraMoeda(conta.valor_final);
                      setValorPagoMask(valorFormatado);
                    }
                  }} className="flex space-x-8">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pendente" id="pendente" />
                      <Label htmlFor="pendente" className="text-sm font-medium text-gray-700">
                        🟡 Pendente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pago" id="pago" />
                      <Label htmlFor="pago" className="text-sm font-medium text-gray-700">
                        🟢 Pago
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Campos expandidos quando pago */}
                  {conta.status === 'pago' && (
                    <div className="space-y-6 p-6 bg-green-50/50 rounded-xl border border-green-200/50">
                      {/* Banco e Conta */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">Dados do Pagamento</span>
                        </div>
                        
                        <BankAccountSelector
                          value={contaBancaria}
                          onChange={(value) => {
                            setContaBancaria(value);
                            if (value.banco_id) {
                              setConta(prev => ({ ...prev, banco_id: value.banco_id }));
                            }
                          }}
                          className="w-full"
                        />
                      </div>

                      {/* Forma de Pagamento */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">Forma de Pagamento</span>
                        </div>
                        
                        <RadioGroup value={formaPagamento.tipo} onValueChange={tipo => setFormaPagamento(prev => ({
                          ...prev,
                          tipo: tipo as any
                        }))} className="flex space-x-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dinheiro_pix" id="dinheiro_pix" />
                            <Label htmlFor="dinheiro_pix" className="text-sm font-medium text-gray-700">
                              💰 Dinheiro/PIX
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cartao" id="cartao" />
                            <Label htmlFor="cartao" className="text-sm font-medium text-gray-700">
                              💳 Cartão
                            </Label>
                          </div>
                        </RadioGroup>

                        {/* Tipo de cartão se for cartão */}
                        {formaPagamento.tipo === 'cartao' && (
                          <div className="pl-6 space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Tipo de Cartão</Label>
                            <RadioGroup value={formaPagamento.tipo_cartao} onValueChange={tipo => setFormaPagamento(prev => ({
                              ...prev,
                              tipo_cartao: tipo as any
                            }))} className="flex space-x-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="debito" id="debito" />
                                <Label htmlFor="debito" className="text-sm text-gray-600">Débito</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="credito" id="credito" />
                                <Label htmlFor="credito" className="text-sm text-gray-600">Crédito</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </div>

                      {/* Data e Valor do Pagamento */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Data de Pagamento
                          </Label>
                          <Input 
                            type="date" 
                            value={conta.data_pagamento || new Date().toISOString().split('T')[0]} 
                            onChange={e => setConta(prev => ({
                              ...prev,
                              data_pagamento: e.target.value
                            }))} 
                            className="bg-white/80 backdrop-blur-sm border-gray-300/50" 
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                            Valor Pago <span className="text-red-500">*</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={preencherValorOriginal}
                              className="text-xs h-6 px-2 bg-blue-50/80 hover:bg-blue-100/80 text-blue-700"
                            >
                              Preencher Valor Original
                            </Button>
                          </Label>
                          <Input 
                            type="text" 
                            placeholder="R$ 0,00" 
                            value={valorPagoMask} 
                            onChange={e => handleValorPago(e.target.value)} 
                            className="bg-white/80 backdrop-blur-sm border-gray-300/50 text-right" 
                          />
                        </div>
                      </div>

                      {/* Juros/Multa Calculados */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Juros/Multa Calculados
                        </Label>
                        <div className={`border rounded-lg p-3 ${
                          (conta.valor_pago || 0) > (conta.valor_original || 0) 
                            ? 'bg-red-50/80 border-red-200' 
                            : (conta.valor_pago || 0) < (conta.valor_original || 0)
                              ? 'bg-green-50/80 border-green-200'
                              : 'bg-gray-50/80 border-gray-200'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-lg font-bold ${
                              (conta.valor_pago || 0) > (conta.valor_original || 0) 
                                ? 'text-red-600' 
                                : (conta.valor_pago || 0) < (conta.valor_original || 0)
                                  ? 'text-green-600'
                                  : 'text-gray-600'
                            }`}>
                              {((conta.valor_pago || 0) - (conta.valor_original || 0)) >= 0 
                                ? `+ ${numeroParaMascaraMoeda((conta.valor_pago || 0) - (conta.valor_original || 0))}`
                                : `- ${numeroParaMascaraMoeda(Math.abs((conta.valor_pago || 0) - (conta.valor_original || 0)))}`
                              }
                            </span>
                            {(conta.valor_original || 0) > 0 && (
                              <span className={`text-sm font-medium ${
                                (conta.valor_pago || 0) > (conta.valor_original || 0) 
                                  ? 'text-red-600' 
                                  : (conta.valor_pago || 0) < (conta.valor_original || 0)
                                    ? 'text-green-600'
                                    : 'text-gray-600'
                              }`}>
                                {(((conta.valor_pago || 0) - (conta.valor_original || 0)) / (conta.valor_original || 1) * 100).toFixed(2)}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-1 text-gray-600">
                            Diferença entre valor pago e valor original
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Seção: Forma de Pagamento (apenas se pendente) */}
                {conta.status === 'pendente' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">5</span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Forma de Pagamento</h2>
                    </div>

                    <div className="space-y-4">
                      <RadioGroup value={formaPagamento.tipo} onValueChange={tipo => setFormaPagamento(prev => ({
                        ...prev,
                        tipo: tipo as any
                      }))} className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dinheiro_pix" id="forma_dinheiro_pix" />
                          <Label htmlFor="forma_dinheiro_pix" className="text-sm font-medium text-gray-700">
                            💰 Dinheiro/PIX
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cartao" id="forma_cartao" />
                          <Label htmlFor="forma_cartao" className="text-sm font-medium text-gray-700">
                            💳 Cartão
                          </Label>
                        </div>
                      </RadioGroup>

                      {/* Tipo de cartão se for cartão */}
                      {formaPagamento.tipo === 'cartao' && (
                        <div className="pl-6 space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Tipo de Cartão</Label>
                          <RadioGroup value={formaPagamento.tipo_cartao} onValueChange={tipo => setFormaPagamento(prev => ({
                            ...prev,
                            tipo_cartao: tipo as any
                          }))} className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="debito" id="tipo_debito" />
                              <Label htmlFor="tipo_debito" className="text-sm text-gray-600">Débito</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="credito" id="tipo_credito" />
                              <Label htmlFor="tipo_credito" className="text-sm text-gray-600">Crédito</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Seletor de Banco e Conta (apenas para DDA) */}
                {conta.dda && (
                  <>
                    <Separator />
                    <div className="space-y-4 p-4 bg-blue-50/80 border border-blue-200 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Conta para Débito Automático (DDA)
                        </span>
                      </div>
                      
                      <BankAccountSelector
                        value={contaBancaria}
                        onChange={(value) => {
                          setContaBancaria(value);
                        }}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                <Separator />

                {/* Seção: Observações */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{conta.status === 'pendente' ? '6' : '5'}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Observações</h2>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Observações</Label>
                    <Textarea 
                      placeholder="Observações adicionais sobre esta conta..." 
                      value={conta.observacoes || ''} 
                      onChange={e => setConta(prev => ({
                        ...prev,
                        observacoes: e.target.value
                      }))} 
                      className="bg-white/80 backdrop-blur-sm border-gray-300/50 min-h-[100px]" 
                    />
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Button variant="outline" onClick={() => navigate('/dashboard')} className="bg-white/80 backdrop-blur-sm border-white/20">
                    Cancelar
                  </Button>
                  
                  <LoadingButton 
                    onClick={() => salvarConta(false)} 
                    loading={isSaving} 
                    loadingText="Salvando..."
                    icon={<Save className="h-4 w-4" />}
                    className="btn-primary flex-1"
                  >
                    Salvar
                  </LoadingButton>
                  
                  <LoadingButton 
                    onClick={() => salvarConta(true)} 
                    loading={isSaving}
                    loadingText="Salvando..."
                    icon={<CreditCard className="h-4 w-4" />}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                  >
                    Salvar e Pagar
                  </LoadingButton>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar de Preview */}
          <div className="lg:col-span-1">
            <ContaPreview 
              conta={conta} 
              formaPagamento={formaPagamento} 
              credorSelecionado={credorSelecionado}
              contaSelecionada={contaSelecionada}
            />
          </div>
        </div>
      </div>
      
      {/* Indicador sutil de auto-save */}
      {rascunhoSalvo && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 rounded-lg px-3 py-2 flex items-center space-x-2 animate-fade-in-out z-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800">Rascunho salvo</span>
        </div>
      )}
    </>
  );
}