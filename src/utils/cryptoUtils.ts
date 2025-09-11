/**
 * Utilitários de criptografia seguros para o sistema
 */

/**
 * Gera uma string aleatória criptograficamente segura
 */
export const generateSecureRandomString = (length: number = 36): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(36)).join('').slice(0, length);
  }
  
  // SECURITY FIX: Remove insecure Math.random() fallback in production
  if (import.meta.env.PROD) {
    throw new Error('Crypto API não disponível em produção - não é possível gerar valores seguros');
  }
  
  // Fallback apenas para desenvolvimento/testes
  if (typeof require !== 'undefined') {
    try {
      const crypto = require('crypto');
      return crypto.randomBytes(length).toString('hex').slice(0, length);
    } catch (e) {
      throw new Error('Crypto não disponível');
    }
  }
  
  throw new Error('Crypto não disponível');
};

/**
 * Gera um ID único criptograficamente seguro
 */
export const generateSecureId = (prefix: string = ''): string => {
  const timestamp = Date.now();
  const randomPart = generateSecureRandomString(9);
  return `${prefix}${timestamp}_${randomPart}`;
};

/**
 * Gera um session ID seguro
 */
export const generateSecureSessionId = (): string => {
  return generateSecureId('session_');
};

/**
 * Gera uma senha temporária segura
 */
export const generateSecurePassword = (length: number = 12): string => {
  // SECURITY FIX: Add crypto availability check
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error('Crypto API não disponível - não é possível gerar senha segura');
  }
  
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => charset[byte % charset.length]).join('');
};