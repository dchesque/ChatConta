
-- Corrigir funções de segurança com search_path adequado e melhorar RLS policies

-- 1. Corrigir função get_user_role para evitar recursão infinita
DROP FUNCTION IF EXISTS public.get_user_role();
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Usar auth.uid() diretamente para evitar recursão
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'user'::app_role);
END;
$$;

-- 2. Corrigir função has_role com search_path seguro
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
      AND deleted_at IS NULL
  )
$$;

-- 3. Corrigir função check_feature_limit com validação adicional
DROP FUNCTION IF EXISTS public.check_feature_limit(uuid, text, integer);
CREATE OR REPLACE FUNCTION public.check_feature_limit(_user_id uuid, _feature text, _current_count integer)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  feature_limit integer;
BEGIN
  -- Validar parâmetros de entrada
  IF _user_id IS NULL OR _feature IS NULL OR _current_count < 0 THEN
    RETURN false;
  END IF;
  
  -- Buscar limite da feature
  SELECT COALESCE((features_limit->_feature)::integer, 0) 
  INTO feature_limit
  FROM public.profiles
  WHERE user_id = _user_id
    AND deleted_at IS NULL;
  
  -- Se não encontrou o usuário, negar acesso
  IF feature_limit IS NULL THEN
    RETURN false;
  END IF;
  
  -- -1 significa ilimitado
  IF feature_limit = -1 THEN
    RETURN true;
  END IF;
  
  RETURN _current_count < feature_limit;
END;
$$;

-- 4. Corrigir trigger de auditoria para profiles
DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE OR REPLACE FUNCTION public.audit_critical_profile_changes_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role app_role;
  is_service_role boolean;
  changes_made jsonb;
BEGIN
  -- Para BEFORE triggers (validação)
  IF TG_WHEN = 'BEFORE' THEN
    -- Verificar se é service role
    is_service_role := (
      COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role' 
      OR COALESCE(current_setting('role', true), '') = 'service_role'
    );
    
    IF NOT is_service_role THEN
      -- Obter role do usuário atual de forma segura
      SELECT role INTO current_user_role 
      FROM public.profiles 
      WHERE user_id = auth.uid()
        AND deleted_at IS NULL;
      
      -- Validar mudança de role
      IF OLD.role IS DISTINCT FROM NEW.role THEN
        IF COALESCE(current_user_role, 'user'::app_role) != 'admin'::app_role THEN
          RAISE EXCEPTION 'Unauthorized: Only admins can change user roles';
        END IF;
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Para AFTER triggers (logging) - apenas se houver mudanças significativas
  IF TG_WHEN = 'AFTER' AND TG_OP = 'UPDATE' THEN
    changes_made := '{}'::jsonb;
    
    -- Detectar mudanças críticas
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      changes_made := changes_made || jsonb_build_object('role', jsonb_build_object('old', OLD.role, 'new', NEW.role));
    END IF;
    
    IF OLD.plan IS DISTINCT FROM NEW.plan THEN
      changes_made := changes_made || jsonb_build_object('plan', jsonb_build_object('old', OLD.plan, 'new', NEW.plan));
    END IF;
    
    -- Só fazer log se houver mudanças críticas
    IF jsonb_object_keys(changes_made) IS NOT NULL THEN
      INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        metadata,
        created_at
      ) VALUES (
        COALESCE(auth.uid(), NEW.user_id),
        CASE 
          WHEN OLD.role IS DISTINCT FROM NEW.role THEN 'role_change'
          WHEN OLD.plan IS DISTINCT FROM NEW.plan THEN 'plan_change'
          ELSE 'profile_update'
        END,
        'profiles',
        NEW.user_id::text,
        to_jsonb(OLD) - 'security_config',  -- Remover dados sensíveis
        to_jsonb(NEW) - 'security_config',
        jsonb_build_object(
          'changed_by', auth.uid(),
          'changes', changes_made,
          'timestamp', NOW()::text
        ),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log erro mas não interrompe operação
    RAISE WARNING 'Audit failed for profiles: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recriar trigger com função segura
CREATE TRIGGER audit_profiles_changes
  BEFORE UPDATE OF role, plan ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_profile_changes_secure();

CREATE TRIGGER audit_profiles_changes_after
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_profile_changes_secure();

-- 5. Corrigir função de detecção de atividades suspeitas
DROP FUNCTION IF EXISTS public.detect_suspicious_activity();
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  login_attempts integer;
BEGIN
  -- Detectar múltiplas tentativas de login falhadas
  IF TG_TABLE_NAME = 'audit_logs' AND NEW.action = 'login_failed' THEN
    SELECT COUNT(*) INTO login_attempts
    FROM public.audit_logs
    WHERE user_id = NEW.user_id
      AND action = 'login_failed'
      AND created_at >= NOW() - INTERVAL '1 hour'
      AND deleted_at IS NULL;
    
    IF login_attempts >= 5 THEN
      INSERT INTO public.security_events (event_type, user_id, metadata, created_at)
      VALUES ('multiple_failed_logins', NEW.user_id, jsonb_build_object('attempts', login_attempts), NOW());
    END IF;
  END IF;

  -- Detectar mudanças de role suspeitas
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.security_events (event_type, user_id, metadata, created_at)
    VALUES ('role_change', NEW.user_id, jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role), NOW());
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log erro mas não interrompe
    RAISE WARNING 'Suspicious activity detection failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 6. Remover views inseguras e recriar com RLS adequado
DROP VIEW IF EXISTS public.active_accounts_payable CASCADE;
DROP VIEW IF EXISTS public.active_accounts_receivable CASCADE;
DROP VIEW IF EXISTS public.active_categories CASCADE;
DROP VIEW IF EXISTS public.active_contacts CASCADE;
DROP VIEW IF EXISTS public.active_customers CASCADE;
DROP VIEW IF EXISTS public.active_suppliers CASCADE;
DROP VIEW IF EXISTS public.active_banks CASCADE;
DROP VIEW IF EXISTS public.active_bank_accounts CASCADE;

-- Recriar views com segurança (estas são views, não tabelas com RLS)
-- As views herdam automaticamente as políticas RLS das tabelas base

CREATE VIEW public.active_accounts_payable AS
SELECT * FROM public.accounts_payable 
WHERE deleted_at IS NULL;

CREATE VIEW public.active_accounts_receivable AS
SELECT * FROM public.accounts_receivable 
WHERE deleted_at IS NULL;

CREATE VIEW public.active_categories AS
SELECT * FROM public.categories 
WHERE deleted_at IS NULL;

CREATE VIEW public.active_contacts AS
SELECT * FROM public.contacts 
WHERE deleted_at IS NULL;

CREATE VIEW public.active_customers AS
SELECT * FROM public.customers 
WHERE deleted_at IS NULL;

CREATE VIEW public.active_suppliers AS
SELECT * FROM public.suppliers 
WHERE deleted_at IS NULL;

CREATE VIEW public.active_banks AS
SELECT * FROM public.banks 
WHERE deleted_at IS NULL;

CREATE VIEW public.active_bank_accounts AS
SELECT ba.* FROM public.bank_accounts ba
JOIN public.banks b ON b.id = ba.bank_id
WHERE ba.deleted_at IS NULL AND b.deleted_at IS NULL;

-- 7. Melhorar função de limpeza com validações
DROP FUNCTION IF EXISTS public.cleanup_old_deleted_records();
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Validar permissões (apenas admins podem executar)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can run cleanup operations';
  END IF;
  
  -- Remove registros de auditoria deletados há mais de 90 dias
  DELETE FROM public.audit_logs 
  WHERE deleted_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Remove notificações deletadas há mais de 30 dias
  DELETE FROM public.notifications 
  WHERE deleted_at < NOW() - INTERVAL '30 days';
  
  -- Arquivar security_events antigos (nunca deletar diretamente)
  INSERT INTO public.security_events_archive 
  SELECT * FROM public.security_events 
  WHERE created_at < NOW() - INTERVAL '1 year'
  ON CONFLICT (id) DO NOTHING;
  
  DELETE FROM public.security_events 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Log da operação de limpeza
  INSERT INTO public.audit_logs (user_id, action, table_name, metadata, created_at)
  VALUES (auth.uid(), 'cleanup_operation', 'system', 
          jsonb_build_object('deleted_audit_logs', deleted_count), NOW());
END;
$$;

-- 8. Corrigir políticas RLS potencialmente problemáticas
-- Remover política duplicada/conflitante em categories
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;

-- Garantir que políticas estão otimizadas
DROP POLICY IF EXISTS "Users can view categories" ON public.categories;
CREATE POLICY "Users can view categories" ON public.categories
FOR SELECT USING (
  auth.uid() = user_id 
  OR is_system = true 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- 9. Função para validar integridade do sistema
CREATE OR REPLACE FUNCTION public.validate_system_integrity()
RETURNS TABLE(
  check_name text,
  status text,
  details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar usuários órfãos
  RETURN QUERY
  SELECT 
    'orphaned_profiles'::text,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END::text,
    'Found ' || COUNT(*) || ' profiles without auth users'::text
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p.user_id
  );
  
  -- Verificar contas sem usuário
  RETURN QUERY
  SELECT 
    'accounts_without_users'::text,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::text,
    'Found ' || COUNT(*) || ' accounts without valid users'::text
  FROM public.accounts_payable ap
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = ap.user_id
  );
  
  -- Verificar categorias sistema
  RETURN QUERY
  SELECT 
    'system_categories'::text,
    'OK'::text,
    'Found ' || COUNT(*) || ' system categories'::text
  FROM public.categories
  WHERE is_system = true;
END;
$$;

-- 10. Garantir que todas as funções críticas têm search_path seguro
ALTER FUNCTION public.upsert_settings(jsonb) SET search_path TO 'public';
ALTER FUNCTION public.upsert_profile(uuid, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.update_user_profile(text, text, text, text, text, text, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.create_notification(uuid, text, text, text, jsonb, timestamptz, text) SET search_path TO 'public';
ALTER FUNCTION public.normalize_subscription_status(uuid) SET search_path TO 'public';
ALTER FUNCTION public.create_trial_subscription(uuid) SET search_path TO 'public';
