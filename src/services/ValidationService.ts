// Sistema de validação padronizado para formulários
export const ValidationService = {
  
  // Validações básicas
  required(value: any, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} é obrigatório`;
    }
    return null;
  },

  minLength(value: string, min: number, fieldName: string): string | null {
    if (value && value.length < min) {
      return `${fieldName} deve ter pelo menos ${min} caracteres`;
    }
    return null;
  },

  maxLength(value: string, max: number, fieldName: string): string | null {
    if (value && value.length > max) {
      return `${fieldName} deve ter no máximo ${max} caracteres`;
    }
    return null;
  },

  // Validações de valores monetários
  valorPositivo(value: number, fieldName: string): string | null {
    if (value <= 0) {
      return `${fieldName} deve ser maior que zero`;
    }
    return null;
  },

  valorMaximo(value: number, max: number, fieldName: string): string | null {
    if (value > max) {
      return `${fieldName} não pode ser maior que ${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(max)}`;
    }
    return null;
  },

  // Validações de documentos brasileiros
  cpf(cpf: string): string | null {
    if (!cpf) return 'CPF é obrigatório';
    
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) {
      return 'CPF deve ter 11 dígitos';
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return 'CPF inválido';
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCpf.charAt(9)) !== digit1) {
      return 'CPF inválido';
    }

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCpf.charAt(10)) !== digit2) {
      return 'CPF inválido';
    }

    return null;
  },

  cnpj(cnpj: string): string | null {
    if (!cnpj) return 'CNPJ é obrigatório';
    
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      return 'CNPJ deve ter 14 dígitos';
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCnpj)) {
      return 'CNPJ inválido';
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCnpj.charAt(12)) !== digit1) {
      return 'CNPJ inválido';
    }

    // Validação do segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCnpj.charAt(13)) !== digit2) {
      return 'CNPJ inválido';
    }

    return null;
  },

  // Validação de email
  email(email: string): string | null {
    if (!email) return 'Email é obrigatório';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email inválido';
    }
    return null;
  },

  // Validação de telefone brasileiro
  telefone(telefone: string): string | null {
    if (!telefone) return null; // Telefone não é obrigatório
    
    const cleanTelefone = telefone.replace(/\D/g, '');
    
    if (cleanTelefone.length < 10 || cleanTelefone.length > 11) {
      return 'Telefone deve ter 10 ou 11 dígitos';
    }
    
    return null;
  },

  // Validação de CEP
  cep(cep: string): string | null {
    if (!cep) return null; // CEP não é obrigatório
    
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return 'CEP deve ter 8 dígitos';
    }
    
    return null;
  },

  // Validações de data
  dataFutura(data: string, fieldName: string): string | null {
    if (!data) return null;
    
    const inputDate = new Date(data);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (inputDate < today) {
      return `${fieldName} não pode ser no passado`;
    }
    
    return null;
  },

  dataPassada(data: string, fieldName: string): string | null {
    if (!data) return null;
    
    const inputDate = new Date(data);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (inputDate > today) {
      return `${fieldName} não pode ser no futuro`;
    }
    
    return null;
  },

  dataVencimentoMinima(data: string): string | null {
    if (!data) return null;
    
    const inputDate = new Date(data);
    inputDate.setHours(0, 0, 0, 0);
    
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    ontem.setHours(23, 59, 59, 999);
    
    if (inputDate <= ontem) {
      return 'Data de vencimento não pode ser anterior a hoje';
    }
    
    return null;
  },

  // Validador composto para formulários
  validateForm(data: Record<string, any>, rules: Record<string, Array<(value: any) => string | null>>): Record<string, string> {
    const errors: Record<string, string> = {};
    
    for (const [field, validators] of Object.entries(rules)) {
      const value = data[field];
      
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          errors[field] = error;
          break; // Para no primeiro erro encontrado
        }
      }
    }
    
    return errors;
  },

  // Validar datas com regras específicas para contas a pagar
  validarDatasContaPagar(conta: any): Record<string, string> {
    const erros: Record<string, string> = {};
    const hoje = new Date().toISOString().split('T')[0];
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemFormatado = ontem.toISOString().split('T')[0];
    
    if (conta.data_vencimento && conta.data_vencimento < ontemFormatado) {
      erros.data_vencimento = 'Data de vencimento não pode ser anterior a hoje';
    }
    
    if (conta.data_emissao && conta.data_emissao > hoje) {
      erros.data_emissao = 'Data de emissão não pode ser futura';
    }
    
    return erros;
  },

  // Proteção contra NaN nos cálculos
  calcularValorFinalSeguro(conta: any): number {
    const original = Number(conta.valor_original) || 0;
    const juros = Number(conta.valor_juros) || 0;
    const desconto = Number(conta.valor_desconto) || 0;
    
    if (isNaN(original) || isNaN(juros) || isNaN(desconto)) {
      throw new Error('Valores devem ser numéricos');
    }
    
    return Math.max(0, original + juros - desconto);
  },

  // Validações específicas para datas
  validarDataVencimento(data: string, dataEmissao?: string): string | null {
    if (!data) return 'Data de vencimento é obrigatória';
    
    const dataVencimento = new Date(data);
    dataVencimento.setHours(0, 0, 0, 0);
    
    // Se data de emissão foi fornecida, validar em relação a ela
    if (dataEmissao) {
      const emissao = new Date(dataEmissao);
      emissao.setHours(0, 0, 0, 0);
      
      if (dataVencimento < emissao) {
        return 'Data de vencimento não pode ser anterior à data de emissão';
      }
    } else {
      // Se não há data de emissão, validar que não seja anterior a hoje
      const ontem = new Date();
      ontem.setDate(ontem.getDate() - 1);
      ontem.setHours(23, 59, 59, 999);
      
      if (dataVencimento <= ontem) {
        return 'Data de vencimento não pode ser anterior a hoje';
      }
    }
    
    // Verificar se não está muito no futuro (mais de 5 anos)
    const cincoPanos = new Date();
    cincoPanos.setFullYear(cincoPanos.getFullYear() + 5);
    
    if (dataVencimento > cincoPanos) {
      return 'Data de vencimento muito distante (máximo 5 anos)';
    }
    
    return null;
  },

  // Validação de valores monetários
  validarValorMonetario(valor: number, nomeCampo: string = 'Valor'): string | null {
    if (valor === null || valor === undefined) {
      return `${nomeCampo} é obrigatório`;
    }
    
    if (isNaN(valor)) {
      return `${nomeCampo} deve ser um número válido`;
    }
    
    if (valor <= 0) {
      return `${nomeCampo} deve ser maior que zero`;
    }
    
    if (valor > 999999999.99) {
      return `${nomeCampo} muito alto (máximo R$ 999.999.999,99)`;
    }
    
    // Verificar casas decimais
    if (Number(valor.toFixed(2)) !== valor) {
      return `${nomeCampo} deve ter no máximo 2 casas decimais`;
    }
    
    return null;
  },

  // Validação completa de conta a pagar
  validarContaCompleta(dados: any): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    // Contato/Credor (novo formato ou legado)
    const contactId = dados.contact_id || dados.fornecedor_id;
    if (!contactId) {
      errors.contact_id = 'Credor é obrigatório';
      errors.fornecedor_id = 'Credor é obrigatório'; // Para compatibilidade
    }
    
    // Descrição
    if (!dados.descricao || dados.descricao.trim().length < 3) {
      errors.descricao = 'Descrição deve ter pelo menos 3 caracteres';
    }
    
    if (dados.descricao && dados.descricao.length > 500) {
      errors.descricao = 'Descrição muito longa (máximo 500 caracteres)';
    }
    
    // Valor
    const erroValor = ValidationService.validarValorMonetario(dados.valor_original, 'Valor original');
    if (erroValor) errors.valor_original = erroValor;
    
    // Data de vencimento
    const erroData = ValidationService.validarDataVencimento(dados.data_vencimento, dados.data_emissao);
    if (erroData) errors.data_vencimento = erroData;
    
    // Categoria (novo formato ou legado)
    const categoryId = dados.category_id || dados.plano_conta_id;
    if (!categoryId) {
      errors.category_id = 'Categoria é obrigatória';
      errors.plano_conta_id = 'Categoria é obrigatória'; // Para compatibilidade
    }
    
    // Validar desconto e juros se preenchidos
    if (dados.valor_desconto && dados.valor_desconto > dados.valor_original) {
      errors.valor_desconto = 'Desconto não pode ser maior que o valor original';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validações específicas para formulários de conta a pagar (mantido para compatibilidade)
  validarContaPagar(data: any) {
    const validacao = ValidationService.validarContaCompleta(data);
    return validacao.errors;
  },

  // Validação avançada de cheques
  async validarChequesAvancado(
    bancoId: number, 
    numerosCheques: string[],
    supabase: any
  ): Promise<{ valido: boolean; problemas: string[] }> {
    const problemas: string[] = [];
    
    // Validar formato
    numerosCheques.forEach(num => {
      if (!/^\d{1,8}$/.test(num)) {
        problemas.push(`Número ${num} tem formato inválido`);
      }
    });
    
    // Validar duplicatas no array
    const duplicatas = numerosCheques.filter((num, index) => 
      numerosCheques.indexOf(num) !== index
    );
    if (duplicatas.length > 0) {
      problemas.push(`Números duplicados: ${duplicatas.join(', ')}`);
    }
    
    // Verificar no banco
    try {
      const { data: existentes } = await supabase
        .from('cheques')
        .select('numero_cheque')
        .eq('banco_id', bancoId)
        .in('numero_cheque', numerosCheques.map(n => n.padStart(6, '0')));
      
      if (existentes && existentes.length > 0) {
        problemas.push(`Cheques já existem: ${existentes.map(e => e.numero_cheque).join(', ')}`);
      }
    } catch (error) {
      problemas.push('Erro ao verificar cheques no banco de dados');
    }
    
    return { valido: problemas.length === 0, problemas };
  },

  // Validação de lote com limites inteligentes
  validarLancamentoLote(parcelas: any[]): { valido: boolean; erros: string[] } {
    const erros: string[] = [];
    
    // Validação básica das parcelas
    if (!parcelas || parcelas.length === 0) {
      erros.push('Nenhuma parcela foi definida');
      return { valido: false, erros };
    }

    if (parcelas.length < 2) {
      erros.push('Lançamento em lote deve ter pelo menos 2 parcelas');
    }

    if (parcelas.length > 100) {
      erros.push('Máximo de 100 parcelas permitidas');
    }
    
    // Limite baseado no valor, não quantidade
    const valorTotal = parcelas.reduce((acc, p) => acc + (p.valor || 0), 0);
    if (valorTotal > 10000000) { // R$ 10M
      erros.push('Valor total do lote excede R$ 10.000.000,00');
    }
    
    // Validar valores negativos ou zero
    const parcelasInvalidas = parcelas.filter(p => (p.valor || 0) <= 0);
    if (parcelasInvalidas.length > 0) {
      erros.push('Todas as parcelas devem ter valor maior que zero');
    }
    
    // Validar datas de vencimento 
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    parcelas.forEach((parcela, index) => {
      if (!parcela.data_vencimento) {
        erros.push(`Parcela ${index + 1}: Data de vencimento é obrigatória`);
      } else {
        const dataVencimento = new Date(parcela.data_vencimento);
        
        if (dataVencimento < hoje) {
          erros.push(`Parcela ${index + 1}: Data de vencimento não pode ser no passado`);
        }
      }
    });

    // Verificar se as datas estão em ordem crescente
    for (let i = 1; i < parcelas.length; i++) {
      const dataAnterior = new Date(parcelas[i - 1].data_vencimento);
      const dataAtual = new Date(parcelas[i].data_vencimento);
      
      if (dataAtual <= dataAnterior) {
        erros.push(`Parcela ${i + 1}: Data deve ser posterior à parcela anterior`);
      }
    }
    
    return { valido: erros.length === 0, erros };
  },

  // Validar dados completos do lançamento
  validarDadosCompletos(
    formData: any,
    parcelas: any[],
    formaPagamento: any
  ): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    // Validar fornecedor
    if (!formData.fornecedor_id) {
      erros.push('Fornecedor é obrigatório');
    }

    // Validar categoria
    if (!formData.plano_conta_id) {
      erros.push('Categoria é obrigatória');
    }

    // Validar descrição
    if (!formData.descricao || formData.descricao.trim() === '') {
      erros.push('Descrição é obrigatória');
    }

    // Validar valor da parcela
    if (!formData.valor_parcela || formData.valor_parcela <= 0) {
      erros.push('Valor da parcela deve ser maior que zero');
    }

    // Validar quantidade de parcelas
    if (!formData.quantidade_parcelas || formData.quantidade_parcelas < 2) {
      erros.push('Quantidade de parcelas deve ser pelo menos 2');
    }

    if (formData.quantidade_parcelas > 100) {
      erros.push('Quantidade de parcelas não pode exceder 100');
    }

    // Validar data de vencimento
    if (!formData.primeira_data_vencimento) {
      erros.push('Data de vencimento é obrigatória');
    }

    // Validar parcelas
    const validacaoParcelas = this.validarLancamentoLote(parcelas);
    erros.push(...validacaoParcelas.erros);

    // Validações específicas para cheque
    if (formaPagamento?.tipo === 'cheque') {
      if (!formaPagamento.banco_id) {
        erros.push('Banco é obrigatório para pagamento via cheque');
      }

      // Verificar se todas as parcelas têm números de cheque
      const parcelasSemCheque = parcelas.filter(p => !p.numero_cheque || !p.numero_cheque.trim());
      if (parcelasSemCheque.length > 0) {
        erros.push('Todas as parcelas devem ter números de cheque preenchidos');
      }
    }

    return {
      valido: erros.length === 0,
      erros
    };
  },

  // Validações específicas para formulários de venda
  validarVenda(data: any) {
    return ValidationService.validateForm(data, {
      cliente_id: [
        (value) => ValidationService.required(value, 'Cliente')
      ],
      valor_total: [
        (value) => ValidationService.required(value, 'Valor total'),
        (value) => ValidationService.valorPositivo(value, 'Valor total')
      ],
      forma_pagamento: [
        (value) => ValidationService.required(value, 'Forma de pagamento')
      ],
      data_venda: [
        (value) => ValidationService.required(value, 'Data da venda')
      ]
    });
  },

  // Validações específicas para formulários de cheque
  validarCheque(data: any) {
    return ValidationService.validateForm(data, {
      numero_cheque: [
        (value) => ValidationService.required(value, 'Número do cheque'),
        (value) => ValidationService.minLength(value, 1, 'Número do cheque')
      ],
      valor: [
        (value) => ValidationService.required(value, 'Valor'),
        (value) => ValidationService.valorPositivo(value, 'Valor')
      ],
      beneficiario_nome: [
        (value) => ValidationService.required(value, 'Beneficiário'),
        (value) => ValidationService.minLength(value, 2, 'Beneficiário')
      ],
      banco_id: [
        (value) => ValidationService.required(value, 'Banco')
      ],
      data_emissao: [
        (value) => ValidationService.required(value, 'Data de emissão')
      ]
    });
  },

  // Validações específicas para formulários de cliente
  validarCliente(data: any) {
    const rules: Record<string, Array<(value: any) => string | null>> = {
      nome: [
        (value) => ValidationService.required(value, 'Nome'),
        (value) => ValidationService.minLength(value, 2, 'Nome')
      ],
      documento: [
        (value) => ValidationService.required(value, 'CPF/CNPJ'),
        (value) => {
          if (!value) return null;
          const cleanDoc = value.replace(/\D/g, '');
          return cleanDoc.length === 11 ? ValidationService.cpf(value) : ValidationService.cnpj(value);
        }
      ],
      tipo: [
        (value) => ValidationService.required(value, 'Tipo de pessoa')
      ]
    };

    if (data.email) {
      rules.email = [(value) => ValidationService.email(value)];
    }

    if (data.telefone) {
      rules.telefone = [(value) => ValidationService.telefone(value)];
    }

    if (data.cep) {
      rules.cep = [(value) => ValidationService.cep(value)];
    }

    return ValidationService.validateForm(data, rules);
  }
};

// ===== EXPORTAÇÃO INDIVIDUAL DAS FUNÇÕES =====
export const {
  required,
  minLength,
  maxLength,
  cpf,
  cnpj,
  valorPositivo,
  valorMaximo,
  email,
  telefone,
  cep,
  dataFutura,
  dataPassada,
  dataVencimentoMinima,
  validateForm,
  validarDatasContaPagar,
  validarContaCompleta,
  calcularValorFinalSeguro,
  validarDataVencimento,
  validarValorMonetario,
  validarContaPagar,
  validarVenda,
  validarCheque,
  validarCliente,
  validarChequesAvancado,
  validarLancamentoLote
} = ValidationService;