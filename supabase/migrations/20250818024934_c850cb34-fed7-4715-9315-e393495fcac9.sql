
-- 1) Restringir INSERT apenas ao service_role em audit_logs e security_events

-- audit_logs: manter a política de usuário (já existente) e restringir a de sistema
DROP POLICY IF EXISTS "System can insert any logs" ON public.audit_logs;

CREATE POLICY "System can insert any logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (
    current_setting('role', true) = 'service_role'
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
  );

-- security_events: restringir a política existente somente ao service_role
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;

CREATE POLICY "System can insert security events"
  ON public.security_events
  FOR INSERT
  WITH CHECK (
    current_setting('role', true) = 'service_role'
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
  );



-- 2) Padronizar search_path = 'public' em funções críticas

-- Funções de papéis e permissões
ALTER FUNCTION public.get_user_role() SET search_path TO 'public';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path TO 'public';

-- Funções de perfil/assinatura/segurança
ALTER FUNCTION public.upsert_profile(uuid, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.update_user_profile(text, text, text, text, text, text, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.create_trial_subscription(uuid) SET search_path TO 'public';
ALTER FUNCTION public.normalize_subscription_status(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_profile() SET search_path TO 'public';

-- Funções de settings e auditoria
ALTER FUNCTION public.upsert_settings(jsonb) SET search_path TO 'public';
ALTER FUNCTION public.log_audit(audit_action, text, text, jsonb, jsonb, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.simple_audit_profiles() SET search_path TO 'public';

-- Funções utilitárias/infra
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_old_deleted_records() SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.detect_suspicious_activity() SET search_path TO 'public';
