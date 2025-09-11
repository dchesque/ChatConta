import { z } from 'zod';

/**
 * Interface padrão para resultado de validações
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validações comuns utilizadas em todo o sistema
 * Inclui validações de documentos brasileiros, email, telefone e datas
 */

/**
 * Valida CPF brasileiro
 * Remove formatação e verifica dígitos verificadores
 */
export function validateCPF(cpf: string): ValidationResult {
  try {
    // Schema Zod para validação inicial
    const cpfSchema = z.string()
      .min(1, 'CPF é obrigatório')
      .transform(val => val.replace(/\D/g, '')) // Remove caracteres não numéricos
      .refine(val => val.length === 11, 'CPF deve ter 11 dígitos')
      .refine(val => !/^(\d)\1{10}$/.test(val), 'CPF não pode ter todos os dígitos iguais');

    const cleanCpf = cpfSchema.parse(cpf);

    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;

    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(9, 10))) {
      return { valid: false, errors: ['CPF inválido'] };
    }

    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.substring(10, 11))) {
      return { valid: false, errors: ['CPF inválido'] };
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação do CPF'] };
  }
}

/**
 * Valida CNPJ brasileiro  
 * Remove formatação e verifica dígitos verificadores
 */
export function validateCNPJ(cnpj: string): ValidationResult {
  try {
    // Schema Zod para validação inicial
    const cnpjSchema = z.string()
      .min(1, 'CNPJ é obrigatório')
      .transform(val => val.replace(/\D/g, '')) // Remove caracteres não numéricos
      .refine(val => val.length === 14, 'CNPJ deve ter 14 dígitos')
      .refine(val => !/^(\d)\1{13}$/.test(val), 'CNPJ não pode ter todos os dígitos iguais');

    const cleanCnpj = cnpjSchema.parse(cnpj);

    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];

    // Primeiro dígito verificador
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * weights1[i];
    }
    remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (digit1 !== parseInt(cleanCnpj.charAt(12))) {
      return { valid: false, errors: ['CNPJ inválido'] };
    }

    // Segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    if (digit2 !== parseInt(cleanCnpj.charAt(13))) {
      return { valid: false, errors: ['CNPJ inválido'] };
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação do CNPJ'] };
  }
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): ValidationResult {
  try {
    const emailSchema = z.string()
      .min(1, 'Email é obrigatório')
      .email('Formato de email inválido')
      .max(254, 'Email muito longo')
      .toLowerCase()
      .trim();

    emailSchema.parse(email);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação do email'] };
  }
}

/**
 * Valida telefone brasileiro
 * Aceita formatos: (11) 99999-9999, 11999999999, +5511999999999
 */
export function validatePhone(phone: string): ValidationResult {
  try {
    const phoneSchema = z.string()
      .min(1, 'Telefone é obrigatório')
      .transform(val => val.replace(/\D/g, '')) // Remove caracteres não numéricos
      .refine(val => {
        // Remove código do país se presente (+55)
        const cleanPhone = val.startsWith('55') && val.length === 13 ? val.substring(2) : val;
        return cleanPhone.length === 10 || cleanPhone.length === 11;
      }, 'Telefone deve ter 10 ou 11 dígitos')
      .refine(val => {
        const cleanPhone = val.startsWith('55') && val.length === 13 ? val.substring(2) : val;
        const ddd = cleanPhone.substring(0, 2);
        const validDDDs = [
          '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
          '21', '22', '24', // RJ
          '27', '28', // ES
          '31', '32', '33', '34', '35', '37', '38', // MG
          '41', '42', '43', '44', '45', '46', // PR
          '47', '48', '49', // SC
          '51', '53', '54', '55', // RS
          '61', // DF
          '62', '64', // GO
          '63', // TO
          '65', '66', // MT
          '67', // MS
          '68', // AC
          '69', // RO
          '71', '73', '74', '75', '77', // BA
          '79', // SE
          '81', '87', // PE
          '82', // AL
          '83', // PB
          '84', // RN
          '85', '88', // CE
          '86', '89', // PI
          '91', '93', '94', // PA
          '92', '97', // AM
          '95', // RR
          '96', // AP
          '98', '99' // MA
        ];
        return validDDDs.includes(ddd);
      }, 'DDD inválido')
      .refine(val => {
        const cleanPhone = val.startsWith('55') && val.length === 13 ? val.substring(2) : val;
        // Se tem 11 dígitos, o 3º dígito deve ser 9 (celular)
        if (cleanPhone.length === 11) {
          return cleanPhone.charAt(2) === '9';
        }
        // Se tem 10 dígitos, o 3º dígito não deve ser 9 (fixo)
        return cleanPhone.charAt(2) !== '9';
      }, 'Formato de telefone inválido');

    phoneSchema.parse(phone);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação do telefone'] };
  }
}

/**
 * Valida formato de data
 * Aceita formatos: YYYY-MM-DD, DD/MM/YYYY
 */
export function validateDate(dateString: string): ValidationResult {
  try {
    const dateSchema = z.string()
      .min(1, 'Data é obrigatória')
      .refine(val => {
        // Tenta parsear diferentes formatos de data
        const isoFormat = /^\d{4}-\d{2}-\d{2}$/.test(val);
        const brFormat = /^\d{2}\/\d{2}\/\d{4}$/.test(val);
        return isoFormat || brFormat;
      }, 'Formato de data inválido. Use YYYY-MM-DD ou DD/MM/YYYY')
      .transform(val => {
        // Converte formato brasileiro para ISO
        if (val.includes('/')) {
          const [day, month, year] = val.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return val;
      })
      .refine(val => {
        const date = new Date(val);
        return date instanceof Date && !isNaN(date.getTime());
      }, 'Data inválida')
      .refine(val => {
        const date = new Date(val);
        const minDate = new Date('1900-01-01');
        const maxDate = new Date('2100-12-31');
        return date >= minDate && date <= maxDate;
      }, 'Data deve estar entre 01/01/1900 e 31/12/2100');

    dateSchema.parse(dateString);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação da data'] };
  }
}

/**
 * Valida CEP brasileiro
 */
export function validateCEP(cep: string): ValidationResult {
  try {
    const cepSchema = z.string()
      .min(1, 'CEP é obrigatório')
      .transform(val => val.replace(/\D/g, ''))
      .refine(val => val.length === 8, 'CEP deve ter 8 dígitos')
      .refine(val => !/^0{8}$/.test(val), 'CEP inválido');

    cepSchema.parse(cep);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação do CEP'] };
  }
}

/**
 * Valida se uma string não está vazia e não contém apenas espaços
 */
export function validateRequired(value: string, fieldName = 'Campo'): ValidationResult {
  try {
    const requiredSchema = z.string()
      .min(1, `${fieldName} é obrigatório`)
      .trim()
      .min(1, `${fieldName} não pode estar vazio`);

    requiredSchema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: [`Erro na validação do campo ${fieldName}`] };
  }
}

/**
 * Valida comprimento mínimo e máximo de string
 */
export function validateLength(
  value: string, 
  min: number, 
  max: number, 
  fieldName = 'Campo'
): ValidationResult {
  try {
    const lengthSchema = z.string()
      .min(min, `${fieldName} deve ter pelo menos ${min} caracteres`)
      .max(max, `${fieldName} deve ter no máximo ${max} caracteres`);

    lengthSchema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: [`Erro na validação do comprimento do ${fieldName}`] };
  }
}