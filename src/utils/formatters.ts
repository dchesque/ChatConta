import { formatarDataBrasilia, formatarDataHoraBrasilia } from './timezone';

// Formatação de moeda brasileira
export const formatarMoeda = (valor: number): string => {
  const valorAbsoluto = Math.abs(valor);
  const moedaFormatada = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valorAbsoluto);
  
  return valor < 0 ? `-${moedaFormatada}` : moedaFormatada;
};

// Formatação de data brasileira (com timezone de Brasília)
export const formatarData = (data: string): string => {
  if (!data) return '-';
  
  try {
    // Usa as funções centralizadas de timezone
    return formatarDataBrasilia(data);
  } catch (error) {
    // Fallback para método anterior se houver erro
    console.warn('Fallback para formatação de data:', error);
    const [ano, mes, dia] = data.split('T')[0].split('-');
    const dataLocal = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return dataLocal.toLocaleDateString('pt-BR');
  }
};

// Máscara para CPF: 000.000.000-00
export const aplicarMascaraCPF = (cpf: string): string => {
  return cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Máscara para CNPJ: 00.000.000/0000-00
export const aplicarMascaraCNPJ = (cnpj: string): string => {
  return cnpj
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Máscara para telefone: (00) 00000-0000
export const aplicarMascaraTelefone = (telefone: string): string => {
  return telefone
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

// Máscara para CEP: 00000-000
export const aplicarMascaraCEP = (cep: string): string => {
  return cep
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d{1,3})/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

// Aplicar máscara automática baseada no tipo
export const aplicarMascaraDocumento = (documento: string, tipo: 'pessoa_fisica' | 'pessoa_juridica'): string => {
  if (tipo === 'pessoa_fisica') {
    return aplicarMascaraCPF(documento);
  } else {
    return aplicarMascaraCNPJ(documento);
  }
};

// Validar CPF
export const validarCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleanCPF.charAt(9)) !== digit) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleanCPF.charAt(10)) !== digit) return false;
  
  return true;
};

// Validar CNPJ
export const validarCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleanCNPJ.charAt(12)) !== digit) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleanCNPJ.charAt(13)) !== digit) return false;
  
  return true;
};

// Validar documento baseado no tipo
export const validarDocumento = (documento: string, tipo: 'pessoa_fisica' | 'pessoa_juridica'): boolean => {
  if (tipo === 'pessoa_fisica') {
    return validarCPF(documento);
  } else {
    return validarCNPJ(documento);
  }
};

// Conversão de string monetária para número
export const parseMoeda = (valorString: string): number => {
  if (!valorString) return 0;
  return parseFloat(valorString.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
};

// Formatação de data e hora brasileira (com timezone de Brasília)
export const formatarDataHora = (data: string): string => {
  if (!data) return '-';
  
  try {
    // Usa as funções centralizadas de timezone
    return formatarDataHoraBrasilia(data);
  } catch (error) {
    // Fallback para método anterior se houver erro
    console.warn('Fallback para formatação de data e hora:', error);
    return new Date(data).toLocaleString('pt-BR');
  }
};

// Validar email
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Obter classe CSS para valores monetários baseada no valor
export const getClasseValorMonetario = (valor: number): string => {
  if (valor < 0) {
    return 'text-red-600 font-medium';
  } else if (valor > 0) {
    return 'text-green-600 font-medium';
  }
  return 'text-gray-700';
};

// Obter classe CSS para valores monetários neutros
export const getClasseValorNeutro = (valor: number): string => {
  return valor < 0 ? 'text-red-600 font-medium' : 'text-gray-900 font-medium';
};

// Formatação de percentual
export const formatarPercentual = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(valor / 100);
};