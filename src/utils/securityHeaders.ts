
/**
 * Configurações de segurança para headers HTTP
 * Para uso em produção com Vite/Vercel/Netlify
 */

// Detecta se está no ambiente Lovable ou desenvolvimento
const isLovableEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('lovable.dev') || 
         hostname.includes('lovable.app') ||
         hostname.includes('localhost') || 
         hostname.includes('127.0.0.1');
};

// Headers para desenvolvimento/Lovable (mais permissivos)
const DEVELOPMENT_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:",
    "style-src 'self' 'unsafe-inline' https:",
    "font-src 'self' https: data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss: ws:",
    "frame-src 'self' https: data:",
    "frame-ancestors 'self' https://*.lovable.app https://*.lovable.dev http://localhost:* http://127.0.0.1:*",
    "object-src 'self'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Headers para produção (mais restritivos)
const PRODUCTION_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.whatsapp.com`,
    "frame-src 'self' https://*.lovable.dev https://*.lovable.app https://*.netlify.app https://*.vercel.app",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'X-Frame-Options': 'SAMEORIGIN',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()'
  ].join(', ')
};

// Exporta headers baseado no ambiente
export const SECURITY_HEADERS = isLovableEnvironment() ? DEVELOPMENT_HEADERS : PRODUCTION_HEADERS;

/**
 * Configuração para meta tags de segurança no HTML
 */
export const SECURITY_META_TAGS = isLovableEnvironment() ? [
  { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
  { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
  { name: 'referrer', content: 'strict-origin-when-cross-origin' }
] : [
  { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
  { httpEquiv: 'X-Frame-Options', content: 'SAMEORIGIN' },
  { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
  { name: 'referrer', content: 'strict-origin-when-cross-origin' }
];

/**
 * Configuração Vite para headers de segurança
 */
export const VITE_SECURITY_CONFIG = {
  server: {
    headers: DEVELOPMENT_HEADERS // Sempre usar headers de desenvolvimento no server
  },
  preview: {
    headers: DEVELOPMENT_HEADERS // Sempre usar headers de desenvolvimento no preview
  }
};
