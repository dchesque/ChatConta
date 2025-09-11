import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// Validadores comuns
const urlSchema = z.string().url("URL deve ser válida").max(500, "URL muito longa");
const priceIdSchema = z.string()
  .min(1, "Price ID é obrigatório")
  .max(100, "Price ID muito longo")
  .regex(/^price_[a-zA-Z0-9]+$/, "Formato de Price ID inválido");

const uuidSchema = z.string().uuid("UUID inválido");

const metadataSchema = z.record(z.string(), z.any())
  .refine(
    (obj) => Object.keys(obj).length <= 10,
    "Máximo 10 chaves permitidas no metadata"
  )
  .refine(
    (obj) => Object.keys(obj).every(key => key.length <= 50),
    "Chaves do metadata muito longas (máximo 50 caracteres)"
  )
  .optional();

// Schema para create-checkout
export const createCheckoutSchema = z.object({
  planId: z.enum(['trial', 'premium'], "Plano deve ser 'trial' ou 'premium'"),
  successUrl: urlSchema.optional(),
  cancelUrl: urlSchema.optional(),
  metadata: metadataSchema,
  // Campos opcionais para customização
  trialPeriodDays: z.number().min(0).max(365).optional(),
  allowPromotionCodes: z.boolean().optional(),
  customerEmail: z.string().email("Email inválido").optional(),
}).strict(); // strict() impede propriedades extras

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

// Schema para customer-portal
export const customerPortalSchema = z.object({
  returnUrl: urlSchema.optional(),
}).strict();

export type CustomerPortalInput = z.infer<typeof customerPortalSchema>;

// Schema para check-subscription (aceita parâmetros opcionais)
export const checkSubscriptionSchema = z.object({
  userId: uuidSchema.optional(),
  forceRefresh: z.boolean().optional(),
}).strict();

export type CheckSubscriptionInput = z.infer<typeof checkSubscriptionSchema>;

// Schema vazio para endpoints que não precisam de input
export const emptySchema = z.object({}).strict();

// Validadores para headers específicos
export const authHeaderSchema = z.object({
  authorization: z.string()
    .min(1, "Authorization header é obrigatório")
    .regex(/^Bearer .+/, "Authorization deve ser no formato 'Bearer <token>'"),
});

// Schema para validação de parâmetros de query string
export const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).max(1000).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  filter: z.string().max(100).optional(),
}).strict();

// Validação de IP address
export const ipSchema = z.string().ip("IP inválido");

// Validação para webhooks do Stripe (se necessário)
export const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.literal("event"),
  api_version: z.string(),
  created: z.number(),
  data: z.object({
    object: z.any(),
  }),
  livemode: z.boolean(),
  pending_webhooks: z.number(),
  request: z.object({
    id: z.string().nullable(),
    idempotency_key: z.string().nullable(),
  }),
  type: z.string(),
});

export type StripeWebhookEvent = z.infer<typeof stripeWebhookSchema>;

// Validação para dados de usuário
export const userDataSchema = z.object({
  id: uuidSchema,
  email: z.string().email("Email inválido"),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  metadata: metadataSchema,
});

export type UserData = z.infer<typeof userDataSchema>;

// Validação para respostas de erro padronizadas
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string(),
  details: z.any().optional(),
  timestamp: z.string().datetime().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Validação para respostas de sucesso padronizadas
export const successResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;