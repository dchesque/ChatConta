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
import { createCheckoutSchema } from "../_shared/schemas.ts";
import { 
  handleCORS, 
  errorResponse, 
  successResponse, 
  logStep,
  validateEnvironment,
  sanitizeForLogging,
  validatePayloadSize
} from "../_shared/utils.ts";

const FUNCTION_NAME = "create-checkout";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    // Validar tamanho do payload
    const sizeValidation = await validatePayloadSize(req, 10 * 1024); // 10KB max
    if (!sizeValidation.valid) {
      return errorResponse(
        "Payload Too Large",
        sizeValidation.error!,
        "PAYLOAD_TOO_LARGE",
        413
      );
    }

    // Validar variáveis de ambiente obrigatórias
    validateEnvironment(["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY"]);
    logStep(FUNCTION_NAME, "Environment validated");

    // Aplicar middlewares de segurança
    const middlewareResult = await applyMiddleware(req, [
      // Rate limiting: 10 requests por minuto por IP
      rateLimit({
        windowMs: 60 * 1000, // 1 minuto
        maxRequests: 10,
        keyGenerator: (req) => `checkout:${req.clientIp}`
      }),
      // Rate limiting adicional por usuário: 20 requests por hora
      rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hora
        maxRequests: 20,
        keyGenerator: (req) => `checkout:user:${req.userId || "anonymous"}`
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

    // Função helper para parsear JSON de forma segura
    const safeParseJSON = async (req: Request) => {
      try {
        const text = await req.text();
        if (!text || text.trim() === '') {
          return { data: {}, error: null };
        }
        const data = JSON.parse(text);
        return { data, error: null };
      } catch (error) {
        return { data: null, error: 'Invalid JSON format' };
      }
    };

    // Validar input JSON
    const { data: requestData, error: parseError } = await safeParseJSON(req);
    if (parseError) {
      return errorResponse(
        "Invalid JSON",
        "Corpo da requisição deve ser um JSON válido",
        "INVALID_JSON",
        400
      );
    }

    const validationResult = await validateInput(createCheckoutSchema)(secureReq);
    if (!validationResult.valid) {
      return validationResult.response!;
    }

    const { planId = "premium" } = requestData || {};
    logStep(FUNCTION_NAME, "Processing checkout for plan", { planId });

    // Criar cliente Supabase para autenticação e buscar configurações
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Buscar configuração do plano no system_config
    const { data: systemConfig, error: configError } = await supabaseClient
      .from('system_config')
      .select('config')
      .eq('key', 'plans_configuration')
      .single();

    if (configError || !systemConfig) {
      logStep(FUNCTION_NAME, "Failed to load plans configuration", { error: configError?.message }, "error");
      return errorResponse(
        "Configuration Error",
        "Erro ao carregar configurações dos planos",
        "CONFIG_ERROR",
        500
      );
    }

    const plansConfig = systemConfig.config;
    const selectedPlan = plansConfig[planId];

    if (!selectedPlan) {
      logStep(FUNCTION_NAME, "Invalid plan ID", { planId }, "error");
      return errorResponse(
        "Invalid Plan",
        `Plano '${planId}' não encontrado`,
        "INVALID_PLAN",
        400
      );
    }

    logStep(FUNCTION_NAME, "Plan configuration loaded", { 
      planId, 
      planName: selectedPlan.displayName,
      price: selectedPlan.price,
      currency: selectedPlan.currency 
    });

    // Verificar se Stripe está habilitado
    const { data: stripeConfig, error: stripeConfigError } = await supabaseClient
      .from('system_config')
      .select('config')
      .eq('key', 'stripe_configuration')
      .single();

    if (stripeConfigError || !stripeConfig?.config?.enabled) {
      logStep(FUNCTION_NAME, "Stripe not enabled", { error: stripeConfigError?.message }, "warn");
      return errorResponse(
        "Payment System Disabled",
        "Sistema de pagamentos não configurado. Entre em contato pelo WhatsApp.",
        "STRIPE_DISABLED",
        503
      );
    }

    // Validações importantes do plano
    // 1. Verificar se o plano tem preço > 0 (não é free)
    if (selectedPlan.price <= 0) {
      logStep(FUNCTION_NAME, "Free plan cannot create checkout", { planId, price: selectedPlan.price }, "warn");
      return errorResponse(
        "Invalid Plan",
        "Não é possível criar checkout para planos gratuitos",
        "FREE_PLAN_CHECKOUT",
        400
      );
    }

    // 2. Para planos trial, verificar se usuário é elegível
    if (planId === 'trial') {
      // Buscar assinaturas anteriores do usuário
      const { data: userSubscriptions, error: subsError } = await supabaseClient
        .from('subscriptions')
        .select('status, trial_ends_at')
        .eq('user_id', user.id);

      if (subsError) {
        logStep(FUNCTION_NAME, "Error checking user eligibility", { error: subsError.message }, "error");
      } else if (userSubscriptions && userSubscriptions.length > 0) {
        // Usuário já teve assinatura/trial antes
        const hadTrial = userSubscriptions.some(sub => sub.trial_ends_at !== null);
        if (hadTrial) {
          logStep(FUNCTION_NAME, "User not eligible for trial", { userId: user.id }, "warn");
          return errorResponse(
            "Trial Not Available",
            "Você já utilizou o período de teste. Considere assinar o plano Premium.",
            "TRIAL_ALREADY_USED",
            400
          );
        }
      }
    }

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

    // Verificar se cliente já existe no Stripe
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep(FUNCTION_NAME, "Found existing customer", { customerId });
    } else {
      logStep(FUNCTION_NAME, "No existing customer found, will create during checkout");
    }

    // Validar URLs de sucesso e cancelamento
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const successUrl = `${origin}/assinatura?success=true&plan=${planId}`;
    const cancelUrl = `${origin}/assinatura?canceled=true&plan=${planId}`;

    logStep(FUNCTION_NAME, "Creating checkout session", {
      customerId,
      successUrl,
      cancelUrl
    });

    // Preparar line_items baseado na configuração do plano
    let lineItems;
    
    // Se o plano tem priceId configurado no Stripe, usar ele
    if (selectedPlan.stripe?.priceId && selectedPlan.stripe.priceId.trim() !== '') {
      logStep(FUNCTION_NAME, "Using configured Stripe priceId", { priceId: selectedPlan.stripe.priceId });
      lineItems = [{
        price: selectedPlan.stripe.priceId,
        quantity: 1
      }];
    } else {
      // Senão, criar price_data dinamicamente
      logStep(FUNCTION_NAME, "Creating dynamic price_data", { 
        price: selectedPlan.price, 
        currency: selectedPlan.currency, 
        interval: selectedPlan.interval 
      });
      
      lineItems = [{
        price_data: {
          currency: selectedPlan.currency.toLowerCase(),
          product_data: { 
            name: selectedPlan.displayName || selectedPlan.name,
            description: selectedPlan.description || "Acesso completo aos recursos do sistema",
            metadata: { plan_id: planId }
          },
          unit_amount: Math.round(selectedPlan.price * 100), // Converter para centavos
          recurring: selectedPlan.interval ? { 
            interval: selectedPlan.interval 
          } : undefined
        },
        quantity: 1
      }];
    }

    // Criar sessão de checkout com configuração dinâmica
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: requestData.allowPromotionCodes !== false,
      billing_address_collection: "auto",
      automatic_tax: { enabled: false },
      metadata: {
        user_id: user.id,
        function: FUNCTION_NAME,
        plan_id: planId,
        plan_name: selectedPlan.displayName || selectedPlan.name,
        ...(requestData.metadata || {})
      }
    });

    logStep(FUNCTION_NAME, "Checkout session created", { 
      sessionId: session.id,
      url: session.url 
    });

    return successResponse({
      url: session.url,
      session_id: session.id
    }, "Sessão de checkout criada com sucesso");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep(FUNCTION_NAME, "Unexpected error", { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, "error");

    // Tratamento específico para erros do Stripe
    if (error instanceof Error) {
      // Erro de configuração do Stripe (chave inválida, etc)
      if (errorMessage.includes("No such price") || errorMessage.includes("No such product")) {
        logStep(FUNCTION_NAME, "Stripe configuration error", { error: errorMessage }, "error");
        return errorResponse(
          "Configuration Error",
          "Erro na configuração do plano. Entre em contato pelo WhatsApp.",
          "STRIPE_CONFIG_ERROR",
          500
        );
      }

      // Erro de autenticação do Stripe
      if (errorMessage.includes("Invalid API Key") || errorMessage.includes("Unauthorized")) {
        logStep(FUNCTION_NAME, "Stripe authentication error", { error: errorMessage }, "error");
        return errorResponse(
          "Payment System Error",
          "Erro no sistema de pagamentos. Tente novamente ou entre em contato.",
          "STRIPE_AUTH_ERROR",
          503
        );
      }

      // Erro de limite de taxa do Stripe
      if (errorMessage.includes("Too Many Requests") || errorMessage.includes("rate_limit")) {
        logStep(FUNCTION_NAME, "Stripe rate limit error", { error: errorMessage }, "error");
        return errorResponse(
          "Rate Limit",
          "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
          "RATE_LIMIT_ERROR",
          429
        );
      }

      // Erro de validação de dados
      if (errorMessage.includes("Missing required param") || errorMessage.includes("Invalid")) {
        logStep(FUNCTION_NAME, "Stripe validation error", { error: errorMessage }, "error");
        return errorResponse(
          "Validation Error",
          "Dados inválidos para criação do checkout. Verifique as configurações.",
          "VALIDATION_ERROR",
          400
        );
      }
    }

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