import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { createBreadcrumb } from '@/utils/breadcrumbUtils';
import { ArrowLeft, Save, CreditCard, Calendar, AlertTriangle, FileText, CheckCircle, Repeat } from 'lucide-react';
import { AccountReceivable, ReceivableStatus } from '@/types/accounts';
import { Pagador } from '@/hooks/usePagadores';
import { Banco } from '@/types/banco';
import { FormaPagamento } from '@/types/formaPagamento';
import { useBanks } from '@/hooks/useBanks';
import { useContasReceber } from '@/hooks/useContasReceber';
import { usePagadores } from '@/hooks/usePagadores';
import { useCategories } from '@/hooks/useCategories';
import { PagadorSelector } from '@/components/contasPagar/PagadorSelector';
import { CategoriaSelectorNovo } from '@/components/contasPagar/CategoriaSelectorNovo';
import { RecebimentoPreview } from '@/components/contasPagar/RecebimentoPreview';
import { FormaRecebimentoSection } from '@/components/contasPagar/FormaRecebimentoSection';
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
import { aplicarMascaraMoeda, converterMoedaParaNumero, formatarMoedaExibicao } from '@/utils/masks';
import { useFormatacao } from '@/hooks/useFormatacao';

export default function NovoRecebimento() {
  const navigate = useNavigate();
  const { criarConta, loading: contaLoading } = useContasReceber();
  const { banks: bancos } = useBanks();
  const { pagadores } = usePagadores();
  const { categories, loading: categoriesLoading } = useCategories();
  const { isSaving, setLoading } = useLoadingStates();
  const { toast } = useToast();
  const { formatarMoedaInput, converterMoedaParaNumero: converterMoeda } = useFormatacao();

  // Estados do formulário
  const [conta, setConta] = useState<Partial<AccountReceivable>>({
    description: '',
    amount: 0,
    due_date: '',
    issue_date: new Date().toISOString().split('T')[0],
    status: 'pending' as ReceivableStatus,
    notes: ''
  });

  // Estados para controlar valores com máscara
  const [valorMask, setValorMask] = useState('');
  const [valorRecebidoMask, setValorRecebidoMask] = useState('');
  const [percentualJurosMask, setPercentualJurosMask] = useState('');
  const [percentualDescontoMask, setPercentualDescontoMask] = useState('');
  
  const [pagadorSelecionado, setPagadorSelecionado] = useState<Pagador | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<any>(null);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>({
    tipo: 'dinheiro_pix'
  });
  
  // Estados de validação em tempo real
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});
  
  // Estados do auto-save
  const [rascunhoSalvo, setRascunhoSalvo] = useState(false);
  const [temRascunho, setTemRascunho] = useState(false);
  
  // Estados para recorrência
  const [contaRecorrente, setContaRecorrente] = useState(false);
  const [periodicidade, setPeriodicidade] = useState<'semanal' | 'quinzenal' | 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'>('mensal');
  const [quantidadeParcelas, setQuantidadeParcelas] = useState(1);
  const [dataInicioRecorrencia, setDataInicioRecorrencia] = useState(new Date().toISOString().split('T')[0]);
  
  // Estados para juros e desconto (apenas quando status = received)
  const [percentualJuros, setPercentualJuros] = useState(0);
  const [percentualDesconto, setPercentualDesconto] = useState(0);
  const [valorRecebido, setValorRecebido] = useState<number | undefined>();
  const [diferenca, setDiferenca] = useState({ valor: 0, percentual: 0 });

  // Auto-save automático
  useEffect(() => {
    const timer = setTimeout(() => {
      if (conta.description || conta.amount || pagadorSelecionado || categoriaSelecionada) {
        const rascunho = {
          conta,
          pagador: pagadorSelecionado,
          categoria: categoriaSelecionada,
          formaPagamento,
          timestamp: Date.now(),
          versao: '1.0'
        };
        
        localStorage.setItem('rascunho_recebimento', JSON.stringify(rascunho));
        setRascunhoSalvo(true);
        setTimeout(() => setRascunhoSalvo(false), 2000);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [conta, pagadorSelecionado, categoriaSelecionada, formaPagamento]);

  // Recuperar rascunho ao carregar página
  useEffect(() => {
    const rascunhoSalvo = localStorage.getItem('rascunho_recebimento');
    if (rascunhoSalvo) {
      try {
        const dados = JSON.parse(rascunhoSalvo);
        const agora = Date.now();
        const horasPassadas = (agora - dados.timestamp) / (1000 * 60 * 60);
        
        if (horasPassadas < 24) {
          setTemRascunho(true);
        } else {
          localStorage.removeItem('rascunho_recebimento');
        }
      } catch (error) {
        console.error('Erro ao recuperar rascunho:', error);
        localStorage.removeItem('rascunho_recebimento');
      }
    }
  }, []);

  // Cálculo automático da diferença quando status = received
  useEffect(() => {
    if (conta.status === 'received' && valorRecebido !== undefined && conta.amount) {
      const diff = valorRecebido - conta.amount;
      const percent = conta.amount > 0 ? (diff / conta.amount) * 100 : 0;
      setDiferenca({ valor: diff, percentual: percent });
    }
  }, [valorRecebido, conta.amount, conta.status]);

  // Função para selecionar pagador e auto-preencher categoria
  const handlePagadorSelect = (pagador: Pagador) => {
    setPagadorSelecionado(pagador);
    setConta(prev => ({
      ...prev,
      customer_id: pagador.id?.toString()
    }));

    // Auto-carregar categoria do pagador se disponível
    if ((pagador as any).category_id && categories.length > 0) {
      const categoria = categories.find(cat => cat.id === (pagador as any).category_id);
      if (categoria) {
        setCategoriaSelecionada(categoria);
        setConta(prev => ({
          ...prev,
          category_id: categoria.id
        }));
      }
    }
  };

  // Handler para valor principal
  const handleValor = (valor: string) => {
    const mascarado = formatarMoedaInput(valor);
    const numero = converterMoeda(mascarado);
    setValorMask(mascarado);
    setConta(prev => ({
      ...prev,
      amount: numero
    }));
  };

  // Handler para valor recebido (quando status = received)
  const handleValorRecebido = (valor: string) => {
    const mascarado = formatarMoedaInput(valor);
    const numero = converterMoeda(mascarado);
    setValorRecebidoMask(mascarado);
    setValorRecebido(numero);
  };

  // Função para preencher valor original no campo recebido
  const preencherValorOriginal = () => {
    if (conta.amount) {
      // Converte o valor numérico diretamente para a máscara de moeda
      const valorCentavos = Math.round(conta.amount * 100).toString();
      const valorFormatado = formatarMoedaInput(valorCentavos);
      setValorRecebidoMask(valorFormatado);
      setValorRecebido(conta.amount);
    }
  };

  const validarFormulario = (): boolean => {
    const errors: string[] = [];
    
    if (!pagadorSelecionado) {
      errors.push('Selecione um pagador');
    }
    
    if (!conta.description?.trim()) {
      errors.push('Descrição é obrigatória');
    }
    
    if (!conta.issue_date) {
      errors.push('Data de emissão é obrigatória');
    }
    
    if (!conta.amount || conta.amount <= 0) {
      errors.push('Valor deve ser maior que zero');
    }
    
    
    if (!conta.due_date) {
      errors.push('Data de vencimento é obrigatória');
    }
    
    if (!categoriaSelecionada) {
      errors.push('Selecione uma categoria');
    }
    
    if (conta.status === 'received' && !formaPagamento.tipo) {
      errors.push('Defina a forma de recebimento');
    }
    
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
    const rascunhoSalvo = localStorage.getItem('rascunho_recebimento');
    if (rascunhoSalvo) {
      const dados = JSON.parse(rascunhoSalvo);
      setConta(dados.conta);
      setPagadorSelecionado(dados.pagador);
      setCategoriaSelecionada(dados.categoria);
      setFormaPagamento(dados.formaPagamento);
      setTemRascunho(false);
      
      toast({ title: 'Sucesso', description: 'Rascunho aplicado - dados restaurados com sucesso' });
    }
  };

  // Função para descartar rascunho
  const descartarRascunho = () => {
    localStorage.removeItem('rascunho_recebimento');
    setTemRascunho(false);
    toast({ title: 'Sucesso', description: 'Rascunho descartado' });
  };

  const salvarConta = async (marcarComoRecebido = false) => {
    if (!validarFormulario()) return;
    
    try {
      setLoading('saving', true);

      const contaParaSalvar: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
        description: conta.description!,
        amount: conta.amount!,
        due_date: conta.due_date!,
        issue_date: conta.issue_date!,
        status: marcarComoRecebido ? 'received' : conta.status!,
        category_id: categoriaSelecionada?.id,
        contact_id: pagadorSelecionado?.id?.toString(),
        customer_name: pagadorSelecionado?.nome,
        bank_account_id: (marcarComoRecebido || conta.status === 'received') && formaPagamento.banco_id ? formaPagamento.banco_id.toString() : undefined,
        received_at: marcarComoRecebido ? new Date().toISOString().split('T')[0] : (conta.status === 'received' ? conta.received_at || new Date().toISOString().split('T')[0] : undefined),
        original_amount: conta.amount,
        received_amount: (marcarComoRecebido || conta.status === 'received') ? valorRecebido || conta.amount : undefined,
        final_amount: (marcarComoRecebido || conta.status === 'received') ? valorRecebido || conta.amount : undefined,
        notes: conta.notes
      };

      await criarConta(contaParaSalvar);
      
      localStorage.removeItem('rascunho_recebimento');
      setRascunhoSalvo(false);
      
      toast({ title: 'Sucesso', description: `Recebimento "${conta.description}" criado com sucesso!` });
      navigate('/contas-receber');
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Erro ao salvar recebimento. Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading('saving', false);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb={createBreadcrumb('/novo-recebimento')}
        title="Novo Recebimento"
        subtitle="Lançamento individual de recebimentos • Cadastro detalhado"
        actions={
          <Button
            variant="outline" 
            onClick={() => navigate('/contas-receber')}
            className="bg-white/80 hover:bg-white/90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="relative p-4 sm:p-6 lg:p-8">
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
                <Button size="sm" variant="destructive" onClick={descartarRascunho}>
                  Descartar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 lg:gap-8">
          <div className="xl:col-span-3 space-y-6 lg:space-y-8">
            {/* Seção 1: Dados do Pagador */}
            <Card className="card-base">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dados do Pagador</h3>
                    <p className="text-sm text-gray-600">Selecione quem pagará esta conta</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Pagador <span className="text-red-500">*</span>
                    </Label>
                    <PagadorSelector
                      value={pagadorSelecionado}
                      onSelect={handlePagadorSelect}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Categoria <span className="text-red-500">*</span>
                    </label>
                    <CategoriaSelectorNovo
                      value={categoriaSelecionada}
                      onSelect={(categoria) => {
                        setCategoriaSelecionada(categoria);
                        setConta(prev => ({
                          ...prev,
                          category_id: categoria?.id
                        }));
                      }}
                      tipo="income"
                      placeholder="Selecione uma categoria"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Seção 2: Dados do Recebimento */}
            <Card className="card-base">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dados do Recebimento</h3>
                    <p className="text-sm text-gray-600">Informações básicas e descrição</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição do Recebimento *</Label>
                    <Input
                      id="descricao"
                      value={conta.description || ''}
                      onChange={(e) => setConta(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o recebimento..."
                      className="input-base"
                      maxLength={255}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor *</Label>
                      <Input
                        id="valor"
                        value={valorMask}
                        onChange={(e) => handleValor(e.target.value)}
                        placeholder="R$ 0,00"
                        className="input-base"
                        maxLength={15}
                        required
                      />
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="data_emissao">Data de Emissão *</Label>
                      <Input
                        id="data_emissao"
                        type="date"
                        value={conta.issue_date || ''}
                        onChange={(e) => setConta(prev => ({ ...prev, issue_date: e.target.value }))}
                        className="input-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                      <Input
                        id="data_vencimento"
                        type="date"
                        value={conta.due_date || ''}
                        onChange={(e) => setConta(prev => ({ ...prev, due_date: e.target.value }))}
                        className="input-base"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Seção 3: Status do Recebimento */}
            <Card className="card-base">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Status do Recebimento</h3>
                    <p className="text-sm text-gray-600">Defina o status atual</p>
                  </div>
                </div>

                <RadioGroup
                  value={conta.status}
                  onValueChange={(value) => {
                    const newStatus = value as ReceivableStatus;
                    setConta(prev => ({ 
                      ...prev, 
                      status: newStatus,
                      received_at: newStatus === 'received' ? (prev.received_at || new Date().toISOString().split('T')[0]) : undefined
                    }));
                    
                    // Quando marca como recebido, preenche automaticamente o valor recebido com o valor original
                    if (newStatus === 'received' && !valorRecebido && conta.amount) {
                      setValorRecebido(conta.amount);
                      const valorFormatado = formatarMoedaInput((conta.amount * 100).toString());
                      setValorRecebidoMask(valorFormatado);
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label htmlFor="pending" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Pendente</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Aguardando recebimento</p>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="received" id="received" />
                    <Label htmlFor="received" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Recebido</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Já foi recebido</p>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Campos específicos quando status = received */}
                {conta.status === 'received' && (
                  <div className="space-y-4 p-4 bg-green-50/50 border border-green-200/50 rounded-xl">
                    <div className="space-y-2">
                      <Label htmlFor="valor_recebido">Valor Recebido</Label>
                      <div className="flex gap-2">
                        <Input
                          id="valor_recebido"
                          value={valorRecebidoMask}
                          onChange={(e) => handleValorRecebido(e.target.value)}
                          placeholder="R$ 0,00"
                          className="input-base flex-1"
                          maxLength={15}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={preencherValorOriginal}
                          className="px-3"
                        >
                          Valor Original
                        </Button>
                      </div>
                      {valorRecebido !== undefined && conta.amount && (
                        <div className="text-sm">
                          <p className="text-gray-600">
                            Valor original: {formatarMoedaExibicao(conta.amount)}
                          </p>
                          {diferenca.valor !== 0 && (
                            <p className={`font-medium ${diferenca.valor > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Diferença: {formatarMoedaExibicao(Math.abs(diferenca.valor))} 
                              ({diferenca.valor > 0 ? '+' : '-'}{Math.abs(diferenca.percentual).toFixed(2)}%)
                              {diferenca.valor > 0 ? ' (Juros)' : ' (Desconto)'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data_recebimento">Data do Recebimento</Label>
                      <Input
                        id="data_recebimento"
                        type="date"
                        value={conta.received_at || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setConta(prev => ({ ...prev, received_at: e.target.value }))}
                        className="input-base"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Seção 4: Forma de Recebimento */}
            {(conta.status === 'received' || !conta.status) && (
              <Card className="card-base">
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Forma de Recebimento</h3>
                      <p className="text-sm text-gray-600">Como será recebido</p>
                    </div>
                  </div>

                  <FormaRecebimentoSection
                    value={formaPagamento}
                    onChange={setFormaPagamento}
                  />
                </div>
              </Card>
            )}

            {/* Seção 5: Observações */}
            <Card className="card-base">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Observações</h3>
                    <p className="text-sm text-gray-600">Informações adicionais</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={conta.notes || ''}
                    onChange={(e) => setConta(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações adicionais sobre o recebimento..."
                    className="input-base"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Botões de Ação */}
            <Card className="card-base">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => salvarConta(false)}
                    disabled={isSaving}
                    className="btn-primary flex-1"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Recebimento
                      </>
                    )}
                  </Button>

                  {conta.status !== 'received' && (
                    <Button
                      onClick={() => salvarConta(true)}
                      disabled={isSaving}
                      variant="outline"
                      className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Salvar e Marcar como Recebido
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar direita - Preview */}
          <div className="xl:col-span-2">
            <div className="sticky top-4 lg:top-8">
              <RecebimentoPreview
                conta={conta}
                pagador={pagadorSelecionado}
                categoria={categoriaSelecionada}
              />
            </div>
          </div>
        </div>

        {/* Indicador de auto-save */}
        {rascunhoSalvo && (
          <div className="fixed bottom-6 right-6 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow-lg text-sm">
            ✓ Rascunho salvo automaticamente
          </div>
        )}
      </div>
    </>
  );
}