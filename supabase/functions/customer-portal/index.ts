import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Importar middlewares de segurança
import { 
  applyMiddleware, 
  rateLimit, 
  requireAuth,
  validateInput,
  logSuspiciousActivity 
} from "../_shared/middleware.ts";
import { customerPortalSchema } from "../_shared/schemas.ts";
import { 
  handleCORS, 
  errorResponse, 
  successResponse, 
  logStep,
  validateEnvironment,
  sanitizeForLogging
} from "../_shared/utils.ts";

const FUNCTION_NAME = "customer-portal";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    // Validar variáveis de ambiente obrigatórias
    validateEnvironment(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "STRIPE_SECRET_KEY"]);
    logStep(FUNCTION_NAME, "Environment validated");

    // Aplicar middlewares de segurança
    const middlewareResult = await applyMiddleware(req, [
      // Rate limiting: 5 requests por minuto por IP
      rateLimit({
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 5,
        keyGenerator: (req) => `portal:${req.clientIp}`
      }),
      // Rate limiting adicional por usuário: 10 requests por hora
      rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hora
        maxRequests: 10,
        keyGenerator: (req) => `portal:user:${req.userId || "anonymous"}`
      }),
      // Autenticação obrigatória
      async (req) => {
        const authResult = await requireAuth()(req);
        if (!authResult.authenticated) {
          return authResult.response!;
        }
        req.userId = authResult.userId;
        return null;
      }
    ]);

    if (!middlewareResult.success) {
      logSuspiciousActivity("MIDDLEWARE_BLOCKED", {
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        url: req.url,
        method: req.method,
        userAgent: req.headers.get("user-agent")
      });
      return middlewareResult.response!;
    }

    const secureReq = middlewareResult.request!;
    logStep(FUNCTION_NAME, "Middleware passed", { userId: secureReq.userId });

    // Para GET requests, usar schema vazio pois não há body
    const emptySchema = { safeParse: () => ({ success: true, data: {} }) };
    const validationResult = { valid: true, data: {} };

    logStep(FUNCTION_NAME, "Using default return URL");

    // Usar service role key para operações administrativas
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Obter token de autenticação e validar usuário
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep(FUNCTION_NAME, "Auth error", { error: userError.message }, "error");
      return errorResponse(
        "Authentication Error",
        `Erro de autenticação: ${userError.message}`,
        "AUTH_ERROR",
        401
      );
    }

    const user = userData.user;
    if (!user?.email) {
      logStep(FUNCTION_NAME, "Invalid user", { userId: user?.id }, "warn");
      return errorResponse(
        "Invalid User",
        "Usuário não autenticado ou email não disponível",
        "INVALID_USER",
        401
      );
    }

    logStep(FUNCTION_NAME, "User authenticated", { 
      userId: user.id, 
      email: user.email 
    });

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { 
      apiVersion: "2023-10-16" 
    });

    // Buscar cliente no Stripe
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    if (customers.data.length === 0) {
      logStep(FUNCTION_NAME, "No customer found", {}, "warn");
      return errorResponse(
        "Customer Not Found",
        "Nenhum cliente Stripe encontrado para este usuário. Crie uma assinatura primeiro.",
        "CUSTOMER_NOT_FOUND",
        404
      );
    }

    const customerId = customers.data[0].id;
    logStep(FUNCTION_NAME, "Found Stripe customer", { customerId });

    // Definir URL de retorno
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const returnUrl = `${origin}/assinatura`;

    // Criar sessão do portal do cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    logStep(FUNCTION_NAME, "Customer portal session created", { 
      sessionId: portalSession.id, 
      url: portalSession.url 
    });

    return successResponse({
      url: portalSession.url,
      session_id: portalSession.id
    }, "Portal do cliente criado com sucesso");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep(FUNCTION_NAME, "Unexpected error", { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, "error");

    logSuspiciousActivity("FUNCTION_ERROR", {
      function: FUNCTION_NAME,
      error: errorMessage,
      url: req.url,
      method: req.method
    });

    return errorResponse(
      "Internal Server Error",
      "Erro interno no servidor. Tente novamente.",
      "INTERNAL_ERROR",
      500,
      { timestamp: new Date().toISOString() }
    );
  }
});