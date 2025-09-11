import { corsHeaders } from "./middleware.ts";

/**
 * Utilitários compartilhados para Edge Functions
 */

/**
 * Manipulador de CORS
 */
export function handleCORS(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }
  return null;
}

/**
 * Resposta de erro padronizada
 */
export function errorResponse(
  error: string,
  message: string,
  code: string,
  status: number = 500,
  details?: any
): Response {
  const responseBody = {
    error,
    message,
    code,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };

  return new Response(JSON.stringify(responseBody), {
    status,
    headers: { 
      ...corsHeaders, 
      "Content-Type": "application/json" 
    }
  });
}

/**
 * Resposta de sucesso padronizada
 */
export function successResponse(
  data: any,
  message?: string,
  status: number = 200
): Response {
  const responseBody = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(message && { message })
  };

  return new Response(JSON.stringify(responseBody), {
    status,
    headers: { 
      ...corsHeaders, 
      "Content-Type": "application/json" 
    }
  });
}

/**
 * Logging estruturado
 */
export function logStep(
  functionName: string,
  step: string,
  details?: any,
  level: "info" | "warn" | "error" = "info"
) {
  const logData = {
    timestamp: new Date().toISOString(),
    function: functionName,
    step,
    level,
    ...(details && { details })
  };

  const logMessage = `[${functionName.toUpperCase()}] ${step}${
    details ? ` - ${JSON.stringify(details)}` : ""
  }`;

  switch (level) {
    case "error":
      console.error(logMessage, logData);
      break;
    case "warn":
      console.warn(logMessage, logData);
      break;
    default:
      console.log(logMessage, logData);
  }
}

/**
 * Validação de variáveis de ambiente
 */
export function validateEnvironment(requiredVars: string[]): void {
  const missing = requiredVars.filter(varName => !Deno.env.get(varName));
  
  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não configuradas: ${missing.join(", ")}`
    );
  }
}

/**
 * Sanitização de dados sensíveis para logs
 */
export function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  
  const sensitiveKeys = [
    "password", "token", "secret", "key", "authorization",
    "stripe_secret", "api_key", "private_key", "access_token"
  ];
  
  const sanitized = { ...obj };
  
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Validação de URL origin para segurança
 */
export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "https://localhost:3000",
    "https://localhost:8080",
    // Adicionar domínios de produção aqui
  ];
  
  // Em desenvolvimento, permitir qualquer localhost
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return true;
  }
  
  return allowedOrigins.includes(origin);
}

/**
 * Geração de hash simples para rate limiting
 */
export function generateRateLimitKey(
  ip: string,
  userId?: string,
  endpoint?: string
): string {
  const parts = [ip];
  if (userId) parts.push(userId);
  if (endpoint) parts.push(endpoint);
  return parts.join(":");
}

/**
 * Validação básica de JWT sem verificação de assinatura
 */
export function parseJWT(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Token JWT deve ter 3 partes" };
    }

    const payload = JSON.parse(atob(parts[1]));
    
    // Verificar expiração básica
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return { valid: false, error: "Token expirado" };
    }

    return { valid: true, payload };
  } catch (error) {
    return { 
      valid: false, 
      error: `Erro ao decodificar JWT: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Limitação de tamanho de payload
 */
export async function validatePayloadSize(
  req: Request,
  maxSize: number = 1024 * 1024 // 1MB por padrão
): Promise<{ valid: boolean; error?: string }> {
  const contentLength = req.headers.get("content-length");
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxSize) {
      return {
        valid: false,
        error: `Payload muito grande. Máximo: ${Math.floor(maxSize / 1024)}KB, Recebido: ${Math.floor(size / 1024)}KB`
      };
    }
  }
  
  return { valid: true };
}

/**
 * Headers de segurança adicionais
 */
export function getSecurityHeaders(functionName: string): Record<string, string> {
  return {
    "X-Function-Name": functionName,
    "X-Powered-By": "Supabase Edge Functions",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}