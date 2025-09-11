/**
 * Validar CPF brasileiro
 */
export const validarCPF = (cpf: string): boolean => {
  // Remove formatação
  const numeros = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (numeros.length !== 11) return false;
  
  // Verifica sequências inválidas
  if (/^(\d)\1+$/.test(numeros)) return false;
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numeros[i]) * (10 - i);
  }
  let resto = soma % 11;
  let primeiroDigito = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(numeros[9]) !== primeiroDigito) return false;
  
  // Calcula segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numeros[i]) * (11 - i);
  }
  resto = soma % 11;
  let segundoDigito = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(numeros[10]) === segundoDigito;
};

/**
 * Validar CNPJ brasileiro
 */
export const validarCNPJ = (cnpj: string): boolean => {
  // Remove formatação
  const numeros = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (numeros.length !== 14) return false;
  
  // Verifica sequências inválidas
  if (/^(\d)\1+$/.test(numeros)) return false;
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  let peso = 2;
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(numeros[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  let resto = soma % 11;
  let primeiroDigito = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(numeros[12]) !== primeiroDigito) return false;
  
  // Calcula segundo dígito verificador
  soma = 0;
  peso = 2;
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(numeros[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  resto = soma % 11;
  let segundoDigito = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(numeros[13]) === segundoDigito;
};

/**
 * Validar email
 */
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validar telefone brasileiro
 */
export const validarTelefone = (telefone: string): boolean => {
  const numeros = telefone.replace(/\D/g, '');
  // Aceita telefone fixo (10 dígitos) ou celular (11 dígitos)
  return numeros.length === 10 || numeros.length === 11;
};

/**
 * Validar CEP brasileiro
 */
export const validarCEP = (cep: string): boolean => {
  const numeros = cep.replace(/\D/g, '');
  return numeros.length === 8;
};

/**
 * Validar se string não está vazia
 */
export const validarObrigatorio = (valor: string): boolean => {
  return valor.trim().length > 0;
};

/**
 * Validar comprimento mínimo
 */
export const validarComprimentoMinimo = (valor: string, minimo: number): boolean => {
  return valor.trim().length >= minimo;
};

/**
 * Validar comprimento máximo
 */
export const validarComprimentoMaximo = (valor: string, maximo: number): boolean => {
  return valor.trim().length <= maximo;
};

/**
 * Validar valor numérico positivo
 */
export const validarValorPositivo = (valor: number): boolean => {
  return !isNaN(valor) && valor > 0;
};

/**
 * Validar data futura
 */
export const validarDataFutura = (data: string): boolean => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataInformada = new Date(data);
  return dataInformada >= hoje;
};

/**
 * Validar data passada
 */
export const validarDataPassada = (data: string): boolean => {
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  const dataInformada = new Date(data);
  return dataInformada <= hoje;
};

/**
 * Mensagens de validação em português
 */
export const MENSAGENS_VALIDACAO = {
  CAMPO_OBRIGATORIO: "Este campo é obrigatório",
  CPF_INVALIDO: "CPF inválido",
  CNPJ_INVALIDO: "CNPJ inválido",
  EMAIL_INVALIDO: "Email inválido",
  TELEFONE_INVALIDO: "Telefone inválido",
  CEP_INVALIDO: "CEP inválido",
  VALOR_INVALIDO: "Valor inválido",
  VALOR_POSITIVO: "Valor deve ser maior que zero",
  DATA_FUTURA: "Data deve ser futura",
  DATA_PASSADA: "Data deve ser passada",
  COMPRIMENTO_MINIMO: (min: number) => `Mínimo ${min} caracteres`,
  COMPRIMENTO_MAXIMO: (max: number) => `Máximo ${max} caracteres`,
  VALOR_MINIMO: (min: number) => `Valor mínimo: ${min}`,
  VALOR_MAXIMO: (max: number) => `Valor máximo: ${max}`
};

/**
 * Tipo para regras de validação
 */
export type ValidacaoRegra = {
  validador: (valor: string) => string;
  mensagem: string;
};

/**
 * Tipo para esquema de validação
 */
export type EsquemaValidacao = Record<string, ValidacaoRegra[]>;

/**
 * Validações pré-configuradas comuns
 */
export const VALIDACOES_COMUNS = {
  NOME: (valor: string): string => {
    if (!validarObrigatorio(valor)) return MENSAGENS_VALIDACAO.CAMPO_OBRIGATORIO;
    if (!validarComprimentoMinimo(valor, 2)) return MENSAGENS_VALIDACAO.COMPRIMENTO_MINIMO(2);
    if (!validarComprimentoMaximo(valor, 100)) return MENSAGENS_VALIDACAO.COMPRIMENTO_MAXIMO(100);
    return '';
  },
  
  EMAIL: (valor: string): string => {
    if (valor && !validarEmail(valor)) return MENSAGENS_VALIDACAO.EMAIL_INVALIDO;
    return '';
  },
  
  CPF: (valor: string): string => {
    if (!validarObrigatorio(valor)) return MENSAGENS_VALIDACAO.CAMPO_OBRIGATORIO;
    if (!validarCPF(valor)) return MENSAGENS_VALIDACAO.CPF_INVALIDO;
    return '';
  },
  
  CNPJ: (valor: string): string => {
    if (!validarObrigatorio(valor)) return MENSAGENS_VALIDACAO.CAMPO_OBRIGATORIO;
    if (!validarCNPJ(valor)) return MENSAGENS_VALIDACAO.CNPJ_INVALIDO;
    return '';
  },
  
  TELEFONE: (valor: string): string => {
    if (valor && !validarTelefone(valor)) return MENSAGENS_VALIDACAO.TELEFONE_INVALIDO;
    return '';
  },
  
  CEP: (valor: string): string => {
    if (valor && !validarCEP(valor)) return MENSAGENS_VALIDACAO.CEP_INVALIDO;
    return '';
  }
};