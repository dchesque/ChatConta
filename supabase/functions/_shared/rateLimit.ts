interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Store rate limit records in memory
const rateLimitStore = new Map<string, RateLimitRecord>();

export function createRateLimiter(config: RateLimitConfig) {
  return async (key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> => {
    const now = Date.now();
    const fullKey = `${config.keyPrefix || 'default'}:${key}`;
    const record = rateLimitStore.get(fullKey);
    
    // Clean expired records periodically (basic cleanup)
    if (rateLimitStore.size > 10000) {
      for (const [k, r] of rateLimitStore.entries()) {
        if (r.resetAt < now) {
          rateLimitStore.delete(k);
        }
      }
    }
    
    if (!record || record.resetAt < now) {
      const newRecord: RateLimitRecord = { 
        count: 1, 
        resetAt: now + config.windowMs 
      };
      rateLimitStore.set(fullKey, newRecord);
      return { 
        allowed: true, 
        remaining: config.maxRequests - 1,
        resetAt: newRecord.resetAt
      };
    }
    
    if (record.count >= config.maxRequests) {
      return { 
        allowed: false, 
        remaining: 0,
        resetAt: record.resetAt
      };
    }
    
    record.count++;
    return { 
      allowed: true, 
      remaining: config.maxRequests - record.count,
      resetAt: record.resetAt
    };
  };
}

// Rate limiters específicos
export const apiRateLimiter = createRateLimiter({
  maxRequests: 60,
  windowMs: 60000, // 1 minuto
  keyPrefix: 'api'
});

export const authRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 900000, // 15 minutos
  keyPrefix: 'auth'
});

export const checkoutRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 300000, // 5 minutos
  keyPrefix: 'checkout'
});

// Helper para aplicar rate limiting em edge functions
export async function applyRateLimit(
  req: Request, 
  limiter: ReturnType<typeof createRateLimiter>
): Promise<Response | null> {
  const clientIp = req.headers.get('x-forwarded-for') || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown';
  
  const { allowed, remaining, resetAt } = await limiter(clientIp);
  
  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: 'Muitas tentativas. Tente novamente em alguns segundos.',
        retryAfter 
      }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(resetAt / 1000).toString(),
          'Retry-After': retryAfter.toString(),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      }
    );
  }
  
  return null; // No rate limit hit, continue
}