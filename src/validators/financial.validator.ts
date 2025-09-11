import { z } from 'zod';
import { ValidationResult, validateDate } from './common.validator';

/**
 * Validações específicas para o domínio financeiro
 * Inclui validações de contas a pagar/receber, valores monetários, datas de vencimento e dados bancários
 */

/**
 * Interface para dados de conta a pagar
 */
export interface PayableData {
  description: string;
  amount: number;
  due_date: string;
  contact_id?: string;
  category_id?: string;
  bank_account_id?: string;
  issue_date?: string;
  notes?: string;
  reference_document?: string;
  dda_enabled?: boolean;
}

/**
 * Interface para dados de conta a receber
 */
export interface ReceivableData {
  description: string;
  amount: number;
  due_date: string;
  contact_id?: string;
  customer_id?: string;
  customer_name?: string;
  category_id?: string;
  bank_account_id?: string;
  issue_date?: string;
  notes?: string;
  reference_document?: string;
}

/**
 * Interface para dados de conta bancária
 */
export interface BankAccountData {
  bank_id: string;
  account_number: string;
  agency: string;
  pix_key?: string;
}

/**
 * Valida dados de conta a pagar
 */
export function validatePayable(data: PayableData): ValidationResult {
  try {
    const payableSchema = z.object({
      description: z.string()
        .min(1, 'Descrição é obrigatória')
        .trim()
        .min(3, 'Descrição deve ter pelo menos 3 caracteres')
        .max(255, 'Descrição deve ter no máximo 255 caracteres'),
      
      amount: z.number()
        .positive('Valor deve ser maior que zero')
        .max(999999999.99, 'Valor muito alto')
        .refine(val => {
          // Verifica se tem no máximo 2 casas decimais
          const decimals = val.toString().split('.')[1];
          return !decimals || decimals.length <= 2;
        }, 'Valor deve ter no máximo 2 casas decimais'),
      
      due_date: z.string()
        .min(1, 'Data de vencimento é obrigatória'),
      
      contact_id: z.string()
        .uuid('ID do contato inválido')
        .optional(),
      
      category_id: z.string()
        .uuid('ID da categoria inválido')
        .optional(),
      
      bank_account_id: z.string()
        .uuid('ID da conta bancária inválido')
        .optional(),
      
      issue_date: z.string()
        .optional(),
      
      notes: z.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres')
        .optional(),
      
      reference_document: z.string()
        .max(100, 'Documento de referência deve ter no máximo 100 caracteres')
        .optional(),
      
      dda_enabled: z.boolean()
        .optional()
    });

    const validatedData = payableSchema.parse(data);

    // Validações adicionais usando funções personalizadas
    const dueDateValidation = validateDate(validatedData.due_date);
    if (!dueDateValidation.valid) {
      return dueDateValidation;
    }

    // Valida data de emissão se fornecida
    if (validatedData.issue_date) {
      const issueDateValidation = validateDate(validatedData.issue_date);
      if (!issueDateValidation.valid) {
        return {
          valid: false,
          errors: issueDateValidation.errors?.map(e => `Data de emissão: ${e}`)
        };
      }
      
      // Data de emissão não pode ser posterior à data de vencimento
      const issueDate = new Date(validatedData.issue_date);
      const dueDate = new Date(validatedData.due_date);
      if (issueDate > dueDate) {
        return {
          valid: false,
          errors: ['Data de emissão não pode ser posterior à data de vencimento']
        };
      }
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação da conta a pagar'] };
  }
}

/**
 * Valida dados de conta a receber
 */
export function validateReceivable(data: ReceivableData): ValidationResult {
  try {
    const receivableSchema = z.object({
      description: z.string()
        .min(1, 'Descrição é obrigatória')
        .trim()
        .min(3, 'Descrição deve ter pelo menos 3 caracteres')
        .max(255, 'Descrição deve ter no máximo 255 caracteres'),
      
      amount: z.number()
        .positive('Valor deve ser maior que zero')
        .max(999999999.99, 'Valor muito alto')
        .refine(val => {
          const decimals = val.toString().split('.')[1];
          return !decimals || decimals.length <= 2;
        }, 'Valor deve ter no máximo 2 casas decimais'),
      
      due_date: z.string()
        .min(1, 'Data de vencimento é obrigatória'),
      
      contact_id: z.string()
        .uuid('ID do contato inválido')
        .optional(),
      
      customer_id: z.string()
        .uuid('ID do cliente inválido')
        .optional(),
      
      customer_name: z.string()
        .trim()
        .min(2, 'Nome do cliente deve ter pelo menos 2 caracteres')
        .max(255, 'Nome do cliente deve ter no máximo 255 caracteres')
        .optional(),
      
      category_id: z.string()
        .uuid('ID da categoria inválido')
        .optional(),
      
      bank_account_id: z.string()
        .uuid('ID da conta bancária inválido')
        .optional(),
      
      issue_date: z.string()
        .optional(),
      
      notes: z.string()
        .max(1000, 'Observações devem ter no máximo 1000 caracteres')
        .optional(),
      
      reference_document: z.string()
        .max(100, 'Documento de referência deve ter no máximo 100 caracteres')
        .optional()
    })
    .refine(data => data.contact_id || data.customer_id || data.customer_name, {
      message: 'É necessário informar um contato, cliente ou nome do cliente'
    });

    const validatedData = receivableSchema.parse(data);

    // Validações adicionais
    const dueDateValidation = validateDate(validatedData.due_date);
    if (!dueDateValidation.valid) {
      return dueDateValidation;
    }

    // Valida data de emissão se fornecida
    if (validatedData.issue_date) {
      const issueDateValidation = validateDate(validatedData.issue_date);
      if (!issueDateValidation.valid) {
        return {
          valid: false,
          errors: issueDateValidation.errors?.map(e => `Data de emissão: ${e}`)
        };
      }
      
      const issueDate = new Date(validatedData.issue_date);
      const dueDate = new Date(validatedData.due_date);
      if (issueDate > dueDate) {
        return {
          valid: false,
          errors: ['Data de emissão não pode ser posterior à data de vencimento']
        };
      }
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação da conta a receber'] };
  }
}

/**
 * Valida valores monetários
 * Verifica se é positivo e tem no máximo 2 casas decimais
 */
export function validateAmount(value: number): ValidationResult {
  try {
    const amountSchema = z.number()
      .positive('Valor deve ser maior que zero')
      .max(999999999.99, 'Valor muito alto (máximo: R$ 999.999.999,99)')
      .min(0.01, 'Valor muito baixo (mínimo: R$ 0,01)')
      .refine(val => {
        // Verifica se tem no máximo 2 casas decimais
        const decimals = val.toString().split('.')[1];
        return !decimals || decimals.length <= 2;
      }, 'Valor deve ter no máximo 2 casas decimais')
      .refine(val => {
        // Verifica se não é NaN ou Infinity
        return isFinite(val) && !isNaN(val);
      }, 'Valor numérico inválido');

    amountSchema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação do valor'] };
  }
}

/**
 * Valida data de vencimento
 * Para novas contas, não permite datas passadas
 */
export function validateDueDate(date: string, isNewAccount = true): ValidationResult {
  try {
    // Validação básica de formato de data
    const dateValidation = validateDate(date);
    if (!dateValidation.valid) {
      return dateValidation;
    }

    const dueDateSchema = z.string()
      .refine(val => {
        if (!isNewAccount) return true; // Para edição, permite datas passadas
        
        const dueDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove horário para comparar apenas a data
        
        return dueDate >= today;
      }, 'Data de vencimento não pode ser anterior à data atual para novas contas')
      .refine(val => {
        const dueDate = new Date(val);
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 10); // Máximo 10 anos no futuro
        
        return dueDate <= maxDate;
      }, 'Data de vencimento muito distante (máximo 10 anos)');

    dueDateSchema.parse(date);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação da data de vencimento'] };
  }
}

/**
 * Valida dados de conta bancária
 */
export function validateBankAccount(data: BankAccountData): ValidationResult {
  try {
    const bankAccountSchema = z.object({
      bank_id: z.string()
        .uuid('ID do banco inválido')
        .min(1, 'Banco é obrigatório'),
      
      account_number: z.string()
        .min(1, 'Número da conta é obrigatório')
        .trim()
        .regex(/^[0-9-]+$/, 'Número da conta deve conter apenas números e hífen')
        .min(4, 'Número da conta deve ter pelo menos 4 caracteres')
        .max(20, 'Número da conta deve ter no máximo 20 caracteres'),
      
      agency: z.string()
        .min(1, 'Agência é obrigatória')
        .trim()
        .regex(/^[0-9-]+$/, 'Agência deve conter apenas números e hífen')
        .min(3, 'Agência deve ter pelo menos 3 caracteres')
        .max(10, 'Agência deve ter no máximo 10 caracteres'),
      
      pix_key: z.string()
        .trim()
        .max(77, 'Chave PIX deve ter no máximo 77 caracteres')
        .optional()
        .refine(val => {
          if (!val) return true; // Opcional
          
          // Validações básicas para diferentes tipos de chave PIX
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          const isPhone = /^\+?55\d{10,11}$/.test(val.replace(/\D/g, ''));
          const isCPF = /^\d{11}$/.test(val.replace(/\D/g, ''));
          const isCNPJ = /^\d{14}$/.test(val.replace(/\D/g, ''));
          const isRandomKey = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(val);
          
          return isEmail || isPhone || isCPF || isCNPJ || isRandomKey;
        }, 'Formato de chave PIX inválido')
    });

    bankAccountSchema.parse(data);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação da conta bancária'] };
  }
}

/**
 * Valida percentual (0-100)
 */
export function validatePercentage(value: number, fieldName = 'Percentual'): ValidationResult {
  try {
    const percentageSchema = z.number()
      .min(0, `${fieldName} deve ser maior ou igual a zero`)
      .max(100, `${fieldName} deve ser menor ou igual a 100`)
      .refine(val => {
        const decimals = val.toString().split('.')[1];
        return !decimals || decimals.length <= 4;
      }, `${fieldName} deve ter no máximo 4 casas decimais`);

    percentageSchema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: [`Erro na validação do ${fieldName.toLowerCase()}`] };
  }
}

/**
 * Valida se a data está dentro de um período específico
 */
export function validateDateRange(date: string, startDate: string, endDate: string): ValidationResult {
  try {
    const dateValidation = validateDate(date);
    if (!dateValidation.valid) {
      return dateValidation;
    }

    const targetDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (targetDate < start || targetDate > end) {
      return {
        valid: false,
        errors: [`Data deve estar entre ${start.toLocaleDateString('pt-BR')} e ${end.toLocaleDateString('pt-BR')}`]
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, errors: ['Erro na validação do período de data'] };
  }
}

/**
 * Valida código de referência/documento
 */
export function validateReference(reference: string): ValidationResult {
  try {
    const referenceSchema = z.string()
      .trim()
      .max(100, 'Código de referência deve ter no máximo 100 caracteres')
      .regex(/^[A-Za-z0-9\-_./\s]*$/, 'Código de referência contém caracteres inválidos')
      .optional();

    referenceSchema.parse(reference);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors.map(e => e.message) };
    }
    return { valid: false, errors: ['Erro na validação do código de referência'] };
  }
}