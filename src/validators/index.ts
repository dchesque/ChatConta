/**
 * Validadores Centralizados
 * 
 * Este módulo centraliza todas as validações do sistema usando a biblioteca Zod.
 * Fornece validações consistentes e reutilizáveis para diferentes domínios da aplicação.
 * 
 * Características:
 * - Validações usando Zod para type safety
 * - Retorno padronizado { valid: boolean, errors?: string[] }
 * - Validações específicas para documentos brasileiros
 * - Validações financeiras com regras de negócio
 * - Validações de dados bancários e PIX
 * 
 * Estrutura:
 * - common.validator.ts: Validações gerais (CPF, CNPJ, email, telefone, data)
 * - financial.validator.ts: Validações financeiras (contas, valores, vencimentos)
 */

// Exportar interface padrão
export type { ValidationResult } from './common.validator';

// Exportar validações comuns
export {
  validateCPF,
  validateCNPJ,
  validateEmail,
  validatePhone,
  validateDate,
  validateCEP,
  validateRequired,
  validateLength
} from './common.validator';

// Exportar validações financeiras
export {
  validatePayable,
  validateReceivable,
  validateAmount,
  validateDueDate,
  validateBankAccount,
  validatePercentage,
  validateDateRange,
  validateReference
} from './financial.validator';

// Exportar tipos e interfaces
export type {
  PayableData,
  ReceivableData,
  BankAccountData
} from './financial.validator';

// Importar tipos necessários para uso nos validators
import type { PayableData, ReceivableData, BankAccountData } from './financial.validator';

/**
 * Objeto unificado com todos os validadores
 * Para uso conveniente quando precisar de múltiplas validações
 */
export const validators = {
  // Validações comuns
  common: {
    cpf: (cpf: string) => validateCPF(cpf),
    cnpj: (cnpj: string) => validateCNPJ(cnpj),
    email: (email: string) => validateEmail(email),
    phone: (phone: string) => validatePhone(phone),
    date: (date: string) => validateDate(date),
    cep: (cep: string) => validateCEP(cep),
    required: (value: string, fieldName?: string) => validateRequired(value, fieldName),
    length: (value: string, min: number, max: number, fieldName?: string) => 
      validateLength(value, min, max, fieldName)
  },

  // Validações financeiras
  financial: {
    payable: (data: PayableData) => validatePayable(data),
    receivable: (data: ReceivableData) => validateReceivable(data),
    amount: (value: number) => validateAmount(value),
    dueDate: (date: string, isNewAccount?: boolean) => validateDueDate(date, isNewAccount),
    bankAccount: (data: BankAccountData) => validateBankAccount(data),
    percentage: (value: number, fieldName?: string) => validatePercentage(value, fieldName),
    dateRange: (date: string, startDate: string, endDate: string) => 
      validateDateRange(date, startDate, endDate),
    reference: (reference: string) => validateReference(reference)
  }
} as const;

/**
 * Utilitários auxiliares para trabalhar com validações
 */
export const validationUtils = {
  /**
   * Combina múltiplos resultados de validação
   */
  combineValidations: (...results: ReturnType<typeof validateCPF>[]): ReturnType<typeof validateCPF> => {
    const errors: string[] = [];
    let valid = true;

    for (const result of results) {
      if (!result.valid) {
        valid = false;
        if (result.errors) {
          errors.push(...result.errors);
        }
      }
    }

    return valid ? { valid: true } : { valid: false, errors };
  },

  /**
   * Valida um objeto completo usando múltiplos validadores
   */
  validateObject: (
    obj: Record<string, unknown>, 
    validationRules: Record<string, (value: unknown) => ReturnType<typeof validateCPF>>
  ): ReturnType<typeof validateCPF> => {
    const errors: string[] = [];
    let valid = true;

    for (const [key, validator] of Object.entries(validationRules)) {
      const value = obj[key];
      const result = validator(value);
      
      if (!result.valid) {
        valid = false;
        if (result.errors) {
          errors.push(...result.errors.map(error => `${key}: ${error}`));
        }
      }
    }

    return valid ? { valid: true } : { valid: false, errors };
  },

  /**
   * Limpa caracteres especiais de documentos (CPF, CNPJ, telefone, etc.)
   */
  cleanDocument: (value: string): string => {
    return value.replace(/\D/g, '');
  },

  /**
   * Formata CPF para exibição (xxx.xxx.xxx-xx)
   */
  formatCPF: (cpf: string): string => {
    const clean = validationUtils.cleanDocument(cpf);
    if (clean.length !== 11) return cpf;
    
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  /**
   * Formata CNPJ para exibição (xx.xxx.xxx/xxxx-xx)
   */
  formatCNPJ: (cnpj: string): string => {
    const clean = validationUtils.cleanDocument(cnpj);
    if (clean.length !== 14) return cnpj;
    
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },

  /**
   * Formata telefone para exibição ((xx) xxxxx-xxxx)
   */
  formatPhone: (phone: string): string => {
    const clean = validationUtils.cleanDocument(phone);
    
    if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (clean.length === 10) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  },

  /**
   * Formata CEP para exibição (xxxxx-xxx)
   */
  formatCEP: (cep: string): string => {
    const clean = validationUtils.cleanDocument(cep);
    if (clean.length !== 8) return cep;
    
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  },

  /**
   * Verifica se uma string está vazia ou contém apenas espaços
   */
  isEmpty: (value: string): boolean => {
    return !value || value.trim().length === 0;
  },

  /**
   * Converte data brasileira (DD/MM/YYYY) para formato ISO (YYYY-MM-DD)
   */
  convertBrDateToISO: (brDate: string): string => {
    if (brDate.includes('/')) {
      const [day, month, year] = brDate.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return brDate;
  },

  /**
   * Converte data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
   */
  convertISOToBrDate: (isoDate: string): string => {
    if (isoDate.includes('-')) {
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
    }
    return isoDate;
  },

  /**
   * Valida se um valor é um número válido para operações financeiras
   */
  isValidFinancialNumber: (value: unknown): value is number => {
    return typeof value === 'number' && 
           isFinite(value) && 
           !isNaN(value) && 
           value >= 0;
  }
} as const;

/**
 * Configurações globais para validações
 */
export const validationConfig = {
  // Limites para valores monetários
  money: {
    min: 0.01,
    max: 999999999.99,
    maxDecimals: 2
  },
  
  // Limites para strings
  string: {
    shortText: { min: 1, max: 100 },
    mediumText: { min: 1, max: 255 },
    longText: { min: 1, max: 1000 },
    description: { min: 3, max: 255 }
  },
  
  // Configurações de data
  date: {
    minYear: 1900,
    maxYear: 2100,
    maxFutureYears: 10
  },
  
  // Formatos aceitos
  formats: {
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    cep: /^\d{5}-\d{3}$/,
    phone: /^\(\d{2}\) \d{4,5}-\d{4}$/
  }
} as const;