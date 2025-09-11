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
import { checkSubscriptionSchema } from "../_shared/schemas.ts";
import { 
  handleCORS, 
  errorResponse, 
  successResponse, 
  logStep,
  validateEnvironment,
  sanitizeForLogging
} from "../_shared/utils.ts";

const FUNCTION_NAME = "check-subscription";

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
      // Rate limiting: 100 requests por hora por usuário
      rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hora
        maxRequests: 100,
        keyGenerator: (req) => req.userId || req.clientIp || "unknown"
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

    // Validar entrada (query params para GET)
    const validationResult = await validateInput(checkSubscriptionSchema)(secureReq);
    if (!validationResult.valid) {
      logStep(FUNCTION_NAME, "Validation failed", { 
        errors: validationResult.errors 
      }, "warn");
      return validationResult.response!;
    }

    const input = validationResult.data;
    logStep(FUNCTION_NAME, "Input validated", sanitizeForLogging(input));

    // Usar o service role key para realizar operações no Supabase
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
      logStep(FUNCTION_NAME, "No customer found, updating unsubscribed state");
      
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      return successResponse({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
    }

    const customerId = customers.data[0].id;
    logStep(FUNCTION_NAME, "Found Stripe customer", { customerId });

    // Buscar assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep(FUNCTION_NAME, "Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd 
      });
      
      // Para assinatura fixa, sempre será Premium
      subscriptionTier = "Premium";
      logStep(FUNCTION_NAME, "Determined subscription tier", { subscriptionTier });
    } else {
      logStep(FUNCTION_NAME, "No active subscription found");
    }

    // Atualizar banco de dados
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep(FUNCTION_NAME, "Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier 
    });

    return successResponse({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    });

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