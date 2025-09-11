
-- 1) Habilitar RLS e políticas em security_events_archive (ponto crítico)
ALTER TABLE public.security_events_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security events archive" ON public.security_events_archive;
CREATE POLICY "Admins can view security events archive"
  ON public.security_events_archive
  FOR SELECT
  USING (get_user_role() = 'admin'::app_role);

DROP POLICY IF EXISTS "System can insert security events archive" ON public.security_events_archive;
CREATE POLICY "System can insert security events archive"
  ON public.security_events_archive
  FOR INSERT
  WITH CHECK (
    current_setting('role', true) = 'service_role'
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
  );



-- 2) Garantir unicidade de profiles.user_id (integridade forte)
-- Obs.: Caso existam duplicidades, esta operação vai falhar; me avise que eu preparo um script seguro de deduplicação.
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);



-- 3) Indexes para auditoria e notificações (melhoram consultas e reduzem carga)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
  ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_user_created
  ON public.security_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_status_created
  ON public.notifications(user_id, status, created_at DESC);



-- 4) Padronizar search_path em função crítica remanescente
ALTER FUNCTION public.audit_critical_profile_changes() SET search_path TO 'public';



-- 5) Proteger user_summary_stats com RLS
ALTER TABLE public.user_summary_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own summary stats" ON public.user_summary_stats;
CREATE POLICY "Users can view own summary stats"
  ON public.user_summary_stats
  FOR SELECT
  USING (auth.uid() = user_id OR get_user_role() = 'admin'::app_role);
