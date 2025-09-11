import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface MiddlewareRequest extends Request {
  clientIp?: string;
  userId?: string;
  validatedBody?: any;
}

// Rate limiting store (in-memory)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset",
  ...securityHeaders,
};

/**
 * Extrai IP do cliente considerando proxies
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  
  // Priorizar CF-Connecting-IP (Cloudflare)
  if (cfConnectingIp) return cfConnectingIp;
  // Depois X-Real-IP
  if (realIp) return realIp;
  // Primeiro IP da lista X-Forwarded-For
  if (forwarded) return forwarded.split(",")[0].trim();
  
  // Fallback para IP fictício em desenvolvimento
  return "127.0.0.1";
}

/**
 * Rate limiting implementation
 */
export function rateLimit(options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: MiddlewareRequest) => string;
}) {
  const { windowMs, maxRequests, keyGenerator } = options;

  return async (req: MiddlewareRequest): Promise<Response | null> => {
    const key = keyGenerator ? keyGenerator(req) : getClientIp(req);
    const now = Date.now();
    
    // Limpar entradas expiradas
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }

    const entry = rateLimitStore.get(key);
    const resetTime = Math.floor((now + windowMs) / 1000);

    if (!entry) {
      // Primeira requisição
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return null;
    }

    if (entry.resetTime < now) {
      // Janela expirou, resetar
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return null;
    }

    if (entry.count >= maxRequests) {
      // Rate limit atingido
      const headers = {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Limit": maxRequests.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": resetTime.toString(),
        "Retry-After": Math.ceil((entry.resetTime - now) / 1000).toString(),
      };

      console.warn(`🚫 Rate limit exceeded for key: ${key}`, {
        limit: maxRequests,
        window: windowMs,
        key,
        ip: req.clientIp
      });

      return new Response(
        JSON.stringify({
          error: "Too Many Requests",
          message: `Limite de ${maxRequests} requisições por ${Math.floor(windowMs / 60000)} minutos excedido. Tente novamente em ${Math.ceil((entry.resetTime - now) / 1000)} segundos.`,
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        }),
        { status: 429, headers }
      );
    }

    // Incrementar contador
    entry.count++;
    rateLimitStore.set(key, entry);

    return null;
  };
}

/**
 * Validação de entrada com Zod
 */
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return async (req: MiddlewareRequest): Promise<{ valid: boolean; data?: T; errors?: ValidationError[]; response?: Response }> => {
    try {
      const contentType = req.headers.get("content-type");
      
      // Para métodos que não têm body
      if (req.method === "GET" || req.method === "DELETE") {
        const url = new URL(req.url);
        const params = Object.fromEntries(url.searchParams.entries());
        const result = schema.safeParse(params);
        
        if (!result.success) {
          const errors = result.error.errors.map(err => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code
          }));
          
          const response = new Response(
            JSON.stringify({
              error: "Validation Error",
              message: "Parâmetros de consulta inválidos",
              details: errors,
              code: "VALIDATION_ERROR"
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
          
          return { valid: false, errors, response };
        }
        
        return { valid: true, data: result.data };
      }

      // Para métodos com body
      if (!contentType?.includes("application/json")) {
        const response = new Response(
          JSON.stringify({
            error: "Invalid Content Type",
            message: "Content-Type deve ser application/json",
            code: "INVALID_CONTENT_TYPE"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
        
        return { valid: false, response };
      }

      let body;
      try {
        body = await req.json();
      } catch {
        const response = new Response(
          JSON.stringify({
            error: "Invalid JSON",
            message: "Body deve conter JSON válido",
            code: "INVALID_JSON"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
        
        return { valid: false, response };
      }

      const result = schema.safeParse(body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code
        }));
        
        console.warn("🚫 Validation failed:", {
          url: req.url,
          method: req.method,
          errors,
          body
        });
        
        const response = new Response(
          JSON.stringify({
            error: "Validation Error",
            message: "Dados de entrada inválidos",
            details: errors,
            code: "VALIDATION_ERROR"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
        
        return { valid: false, errors, response };
      }

      return { valid: true, data: result.data };
    } catch (error) {
      console.error("🚫 Validation middleware error:", error);
      
      const response = new Response(
        JSON.stringify({
          error: "Internal Validation Error",
          message: "Erro interno na validação",
          code: "VALIDATION_INTERNAL_ERROR"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
      
      return { valid: false, response };
    }
  };
}

/**
 * Middleware de autenticação
 */
export function requireAuth() {
  return async (req: MiddlewareRequest): Promise<{ authenticated: boolean; userId?: string; response?: Response }> => {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const response = new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Token de autenticação obrigatório. Use: Authorization: Bearer <token>",
          code: "MISSING_AUTH_TOKEN"
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
      
      return { authenticated: false, response };
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Validação básica do token JWT
    if (!token || token.split(".").length !== 3) {
      const response = new Response(
        JSON.stringify({
          error: "Invalid Token",
          message: "Token JWT inválido",
          code: "INVALID_AUTH_TOKEN"
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
      
      return { authenticated: false, response };
    }

    try {
      // Decodificar payload do JWT para extrair user ID
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload?.sub;
      
      if (!userId) {
        const response = new Response(
          JSON.stringify({
            error: "Invalid Token Payload",
            message: "Token não contém ID do usuário válido",
            code: "INVALID_TOKEN_PAYLOAD"
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
        
        return { authenticated: false, response };
      }

      return { authenticated: true, userId };
    } catch {
      const response = new Response(
        JSON.stringify({
          error: "Token Decode Error",
          message: "Não foi possível decodificar o token",
          code: "TOKEN_DECODE_ERROR"
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
      
      return { authenticated: false, response };
    }
  };
}

/**
 * Middleware composer - aplica múltiplos middlewares
 */
export async function applyMiddleware(
  req: Request,
  middlewares: Array<(req: MiddlewareRequest) => Promise<Response | null>>
): Promise<{ success: boolean; request?: MiddlewareRequest; response?: Response }> {
  const extendedReq: MiddlewareRequest = req as MiddlewareRequest;
  extendedReq.clientIp = getClientIp(req);

  for (const middleware of middlewares) {
    const result = await middleware(extendedReq);
    if (result) {
      // Middleware retornou um response (erro)
      return { success: false, response: result };
    }
  }

  return { success: true, request: extendedReq };
}

/**
 * Logging de tentativas suspeitas
 */
export function logSuspiciousActivity(
  type: string,
  details: {
    ip?: string;
    userId?: string;
    url?: string;
    method?: string;
    userAgent?: string;
    error?: string;
  }
) {
  console.warn(`🚨 SUSPICIOUS ACTIVITY - ${type}:`, {
    timestamp: new Date().toISOString(),
    type,
    ...details
  });
}