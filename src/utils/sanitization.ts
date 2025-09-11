/**
 * Utilitários de sanitização e segurança para entradas do usuário
 */

/**
 * Remove caracteres perigosos de strings
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limita tamanho
};

/**
 * Sanitiza valores monetários
 */
export const sanitizeMonetaryValue = (value: string | number): number => {
  if (typeof value === 'number') {
    return Math.max(0, Math.min(value, 9999999.99));
  }
  
  const cleaned = String(value)
    .replace(/[^\d,.-]/g, '')
    .replace(',', '.');
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.max(0, Math.min(num, 9999999.99));
};

/**
 * Sanitiza documentos (CPF/CNPJ)
 */
export const sanitizeDocument = (doc: string): string => {
  if (!doc) return '';
  return doc.replace(/\D/g, '').substring(0, 14);
};

/**
 * Sanitiza email
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .substring(0, 254); // RFC 5321 limit
};

/**
 * Sanitiza telefone
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '').substring(0, 11);
};

/**
 * Sanitiza datas
 */
export const sanitizeDate = (date: string): string => {
  if (!date) return '';
  
  // Verifica se é formato ISO válido
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(date)) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  // Limita entre 1900 e 2100
  const year = dateObj.getFullYear();
  if (year < 1900 || year > 2100) return '';
  
  return date;
};

/**
 * Sanitiza objeto completo recursivamente
 */
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') return sanitizeString(obj);
  
  if (typeof obj === 'number') return isFinite(obj) ? obj : 0;
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanKey = sanitizeString(key);
      if (cleanKey) {
        sanitized[cleanKey] = sanitizeObject(value);
      }
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Valida se string contém apenas caracteres seguros
 */
export const isSafeString = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  // Verifica caracteres perigosos
  const dangerousChars = /<|>|javascript:|on\w+=/i;
  return !dangerousChars.test(input);
};

/**
 * Escapa HTML entities
 */
export const escapeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return input.replace(/[&<>"']/g, (char) => map[char]);
};