
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.1';
import { validateAuth, logSecurityEvent } from '../_shared/security.ts';
import { applyRateLimit, apiRateLimiter } from '../_shared/rateLimit.ts';
import { withMonitoring } from '../_shared/monitoring.ts';
import { corsHeaders } from '../_shared/middleware.ts';
import { getSecurityHeaders, validateOrigin } from '../_shared/utils.ts';

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

Deno.serve(withMonitoring('security-metrics', async (monitor) => {
  return async (req: Request): Promise<Response> => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { ...corsHeaders, ...getSecurityHeaders('security-metrics') } });
    }

    // Origin validation (endurecimento contra CSRF/abuso)
    const origin = req.headers.get('origin');
    if (origin && !validateOrigin(origin)) {
      return new Response(
        JSON.stringify({ error: 'Origin não permitido' }),
        { status: 403, headers: { ...corsHeaders, ...getSecurityHeaders('security-metrics'), 'Content-Type': 'application/json' } }
      );
    }

    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    // Validate authentication
    const securityContext = await validateAuth(req);
    if (!securityContext) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, ...getSecurityHeaders('security-metrics'), 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    if (securityContext.userRole !== 'admin') {
      await logSecurityEvent({
        event_type: 'unauthorized_access_attempt',
        user_id: securityContext.userId,
        ip_address: securityContext.ipAddress,
        metadata: { endpoint: 'security-metrics', role: securityContext.userRole }
      });
      
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, ...getSecurityHeaders('security-metrics'), 'Content-Type': 'application/json' } }
      );
    }

    try {
      const supabase = getSupabaseClient();
      
      // Get security metrics for the last 24 hours
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Active users
      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('ativo', true)
        .gte('last_login', yesterday.toISOString());

      // Security events
      const { data: securityEvents } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false });

      // Login attempts (from security events)
      const loginAttempts = securityEvents?.filter(event => 
        event.event_type.includes('login') || event.event_type.includes('auth')
      ).length || 0;

      // Failed login attempts
      const failedLogins = securityEvents?.filter(event => 
        event.event_type.includes('invalid') || event.event_type.includes('failed')
      ).length || 0;

      // Critical events (unauthorized access, role changes, etc.)
      const criticalEvents = securityEvents?.filter(event => 
        event.event_type.includes('unauthorized') || 
        event.event_type.includes('role_change') ||
        event.event_type.includes('elevation')
      ).length || 0;

      // Error rate calculation
      const totalEvents = securityEvents?.length || 0;
      const errorEvents = securityEvents?.filter(event => 
        event.event_type.includes('error') || event.event_type.includes('failed')
      ).length || 0;
      
      const errorRate = totalEvents > 0 ? (errorEvents / totalEvents * 100).toFixed(1) : '0.0';

      // Recent suspicious activities
      const suspiciousActivities = securityEvents?.filter(event => 
        event.event_type.includes('unauthorized') ||
        event.event_type.includes('suspicious') ||
        event.event_type.includes('rate_limit') ||
        failedLogins > 5
      ).slice(0, 10) || [];

      const metrics = {
        active_users: activeUsers?.length || 0,
        login_attempts: loginAttempts,
        failed_logins: failedLogins,
        security_events: totalEvents,
        critical_events: criticalEvents,
        error_rate: errorRate,
        suspicious_activities: suspiciousActivities,
        last_updated: now.toISOString()
      };

      monitor.success(metrics);

      return new Response(
        JSON.stringify(metrics),
        { 
          headers: { 
            ...corsHeaders, 
            ...getSecurityHeaders('security-metrics'),
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          } 
        }
      );

    } catch (error) {
      monitor.error(error instanceof Error ? error : new Error(String(error)));
      
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: 'Erro ao buscar métricas de segurança'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, ...getSecurityHeaders('security-metrics'), 'Content-Type': 'application/json' } 
        }
      );
    }
  };
}));
