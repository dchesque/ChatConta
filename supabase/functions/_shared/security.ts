import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.1';

export interface SecurityContext {
  userId: string;
  userRole: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
}

export interface SecurityEventData {
  event_type: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

// Initialize Supabase client for security logging
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Log security events
export async function logSecurityEvent(data: SecurityEventData): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    await supabase.from('security_events').insert({
      event_type: data.event_type,
      user_id: data.user_id || null,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent || null,
      metadata: data.metadata || {}
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - security logging should not break the main flow
  }
}

// Extract security context from request
export function extractSecurityContext(req: Request, userId?: string): SecurityContext {
  const ipAddress = req.headers.get('x-forwarded-for') || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown';
  
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return {
    userId: userId || 'anonymous',
    userRole: 'user', // Will be populated by auth middleware
    ipAddress,
    userAgent
  };
}

// Validate JWT and extract user info
export async function validateAuth(req: Request): Promise<SecurityContext | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      await logSecurityEvent({
        event_type: 'invalid_token',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        metadata: { error: error?.message }
      });
      return null;
    }

    // Get user role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const context = extractSecurityContext(req, user.id);
    context.userRole = profile?.role || 'user';
    
    return context;
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

// Sanitize data for logging (remove sensitive info)
export function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveKeys = [
    'password', 'token', 'key', 'secret', 'auth', 'authorization',
    'credit_card', 'ssn', 'cpf', 'cnpj'
  ];
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => keyLower.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Check if user has required role
export function hasRole(context: SecurityContext, requiredRole: string): boolean {
  const roleHierarchy = {
    'user': 0,
    'admin': 1
  };
  
  const userLevel = roleHierarchy[context.userRole as keyof typeof roleHierarchy] ?? -1;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 999;
  
  return userLevel >= requiredLevel;
}

// Validate request origin
export function validateOrigin(req: Request, allowedOrigins: string[] = []): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // Allow requests without origin (mobile apps, etc)
  
  const defaultAllowed = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://lovableproject.com',
    'https://wrxosfdirgdlvfkzvcuh.supabase.co'
  ];
  
  const allowed = [...defaultAllowed, ...allowedOrigins];
  return allowed.some(allowedOrigin => 
    origin === allowedOrigin || origin.endsWith('.lovableproject.com')
  );
}