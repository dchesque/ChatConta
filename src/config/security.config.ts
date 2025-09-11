/**
 * Configuração consolidada de segurança do sistema
 */

export const SECURITY_CONFIG = {
  // Configurações de autenticação
  auth: {
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    sessionTimeoutMinutes: 60,
    requireStrongPasswords: true,
    enableTwoFactor: false // Para implementação futura
  },

  // Configurações de entrada de dados
  input: {
    maxStringLength: 1000,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    sanitizeHtml: true,
    validateUrls: true
  },

  // Configurações de API
  api: {
    rateLimitPerMinute: 60,
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    enableCors: false,
    requireApiKey: false // Para implementação futura
  },

  // Configurações de logs e auditoria
  logging: {
    enableAuditTrail: true,
    logSecurityEvents: true,
    maxLogRetentionDays: 90,
    sensitiveDataMask: true,
    enableConsoleInProduction: false
  },

  // Configurações de segurança do frontend
  frontend: {
    enableCSP: true,
    enableXSSProtection: true,
    enableClickjackingProtection: true,
    enableContentTypeSniffing: false,
    enableDOMSecurityMonitor: true
  }
};

/**
 * Headers de segurança para produção
 */
export const PRODUCTION_SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", 
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://*.lovable.dev https://*.netlify.app https://*.vercel.app",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};

/**
 * Validação de ambiente seguro
 */
export const validateSecureEnvironment = (): boolean => {
  // Verificar se está em HTTPS em produção
  if (import.meta.env.PROD && window.location.protocol !== 'https:') {
    return false;
  }

  // Verificar se a API crypto está disponível
  if (!window.crypto || !window.crypto.getRandomValues) {
    return false;
  }

  // Verificar se local storage está disponível
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
  } catch {
    return false;
  }

  return true;
};

/**
 * Configurações de sanitização
 */
export const SANITIZATION_RULES = {
  // Caracteres perigosos para remoção
  dangerousChars: /<|>|javascript:|on\w+=/gi,
  
  // Padrões de URL válidos
  validUrlPattern: /^https?:\/\/[^\s<>]+$/i,
  
  // Padrões de email válidos
  validEmailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Máximo de caracteres para diferentes tipos de input
  maxLengths: {
    name: 100,
    email: 254,
    phone: 15,
    description: 500,
    notes: 1000
  }
};