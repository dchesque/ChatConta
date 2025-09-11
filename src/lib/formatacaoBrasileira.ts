// Funções completas de formatação brasileira

/**
 * Formatar valor para moeda brasileira (R$)
 */
export const formatarMoeda = (valor: number | string): string => {
  const numeroValor = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  if (isNaN(numeroValor)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numeroValor);
};

/**
 * Formatar data para padrão brasileiro (DD/MM/YYYY)
 */
export const formatarData = (data: string | Date): string => {
  if (!data) return '';
  
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  
  if (isNaN(dataObj.getTime())) return '';
  
  return dataObj.toLocaleDateString('pt-BR');
};

/**
 * Formatar data e hora para padrão brasileiro (DD/MM/YYYY HH:mm)
 */
export const formatarDataHora = (data: string | Date): string => {
  if (!data) return '';
  
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  
  if (isNaN(dataObj.getTime())) return '';
  
  return dataObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Aplicar máscara de CPF (000.000.000-00)
 */
export const aplicarMascaraCPF = (valor: string): string => {
  if (!valor) return '';
  
  // Remove tudo que não é dígito
  const apenasNumeros = valor.replace(/\D/g, '');
  
  // Aplica a máscara progressivamente
  if (apenasNumeros.length <= 3) return apenasNumeros;
  if (apenasNumeros.length <= 6) return apenasNumeros.replace(/(\d{3})(\d+)/, '$1.$2');
  if (apenasNumeros.length <= 9) return apenasNumeros.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Aplicar máscara de CNPJ (00.000.000/0000-00)
 */
export const aplicarMascaraCNPJ = (valor: string): string => {
  if (!valor) return '';
  
  const apenasNumeros = valor.replace(/\D/g, '');
  
  if (apenasNumeros.length <= 2) return apenasNumeros;
  if (apenasNumeros.length <= 5) return apenasNumeros.replace(/(\d{2})(\d+)/, '$1.$2');
  if (apenasNumeros.length <= 8) return apenasNumeros.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  if (apenasNumeros.length <= 12) return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Aplicar máscara de telefone brasileiro ((00) 00000-0000)
 */
export const aplicarMascaraTelefone = (valor: string): string => {
  if (!valor) return '';
  
  const apenasNumeros = valor.replace(/\D/g, '');
  
  if (apenasNumeros.length <= 2) return `(${apenasNumeros}`;
  if (apenasNumeros.length <= 3) return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
  if (apenasNumeros.length <= 7) return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
  if (apenasNumeros.length <= 11) {
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
  }
  return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
};

/**
 * Aplicar máscara de CEP (00000-000)
 */
export const aplicarMascaraCEP = (valor: string): string => {
  if (!valor) return '';
  
  const apenasNumeros = valor.replace(/\D/g, '');
  
  if (apenasNumeros.length <= 5) return apenasNumeros;
  return apenasNumeros.replace(/(\d{5})(\d+)/, '$1-$2');
};

/**
 * Aplicar máscara de valor monetário (R$ 0.000,00)
 */
export const aplicarMascaraMoeda = (valor: string): string => {
  if (!valor) return '';
  
  // Remove tudo que não é dígito
  let apenasNumeros = valor.replace(/\D/g, '');
  
  // Se está vazio, retorna vazio
  if (!apenasNumeros) return '';
  
  // Converte para centavos
  const numeroConvertido = parseInt(apenasNumeros) / 100;
  
  return formatarMoeda(numeroConvertido);
};

/**
 * Converter valor com máscara para número
 */
export const converterMoedaParaNumero = (valorFormatado: string): number => {
  if (!valorFormatado) return 0;
  
  // Remove símbolos da moeda e converte vírgula para ponto
  const valorLimpo = valorFormatado
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(valorLimpo) || 0;
};

/**
 * Validar CPF
 */
export const validarCPF = (cpf: string): boolean => {
  const apenasNumeros = cpf.replace(/\D/g, '');
  
  if (apenasNumeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(apenasNumeros)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(apenasNumeros.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(apenasNumeros.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(apenasNumeros.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(apenasNumeros.charAt(10))) return false;
  
  return true;
};

/**
 * Validar CNPJ
 */
export const validarCNPJ = (cnpj: string): boolean => {
  const apenasNumeros = cnpj.replace(/\D/g, '');
  
  if (apenasNumeros.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(apenasNumeros)) return false;
  
  // Validação do primeiro dígito verificador
  let tamanho = apenasNumeros.length - 2;
  let numeros = apenasNumeros.substring(0, tamanho);
  let digitos = apenasNumeros.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = apenasNumeros.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
};

/**
 * Validar email
 */
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Formatar número para exibição brasileira
 */
export const formatarNumero = (numero: number): string => {
  return new Intl.NumberFormat('pt-BR').format(numero);
};

/**
 * Formatar porcentagem para padrão brasileiro
 */
export const formatarPorcentagem = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor / 100);
};

// Alias para compatibilidade
export const formatCurrency = formatarMoeda;