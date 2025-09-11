
-- Correções críticas de segurança para funções do banco de dados
-- Adicionar search_path seguro e melhorar validações

-- 1. Corrigir função get_user_role com search_path seguro
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN (
    SELECT public.profiles.role 
    FROM public.profiles 
    WHERE public.profiles.user_id = auth.uid()
    LIMIT 1
  );
END;
$function$;

-- 2. Corrigir função has_role com search_path seguro
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE public.profiles.user_id = _user_id
      AND public.profiles.role = _role
  )
$function$;

-- 3. Corrigir função update_user_profile com validações aprimoradas
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_name text DEFAULT NULL::text,
  p_phone text DEFAULT NULL::text, 
  p_bio text DEFAULT NULL::text,
  p_avatar_url text DEFAULT NULL::text,
  p_endereco text DEFAULT NULL::text,
  p_cidade text DEFAULT NULL::text,
  p_estado text DEFAULT NULL::text,
  p_cep text DEFAULT NULL::text,
  p_whatsapp text DEFAULT NULL::text
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result public.profiles;
  current_user_id UUID := auth.uid();
BEGIN
  -- Verificar se usuário está autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Validar entrada para prevenir ataques
  IF p_name IS NOT NULL AND length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Nome não pode estar vazio';
  END IF;
  
  IF p_phone IS NOT NULL AND length(regexp_replace(p_phone, '[^0-9]', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'Telefone deve ter pelo menos 10 dígitos';
  END IF;

  -- Verificar se perfil existe
  SELECT * INTO result FROM public.profiles WHERE public.profiles.user_id = current_user_id;
  
  IF result.id IS NULL THEN
    -- Criar perfil se não existir
    INSERT INTO public.profiles (user_id, name, phone, bio, avatar_url, endereco, cidade, estado, cep, whatsapp)
    VALUES (current_user_id, p_name, p_phone, p_bio, p_avatar_url, p_endereco, p_cidade, p_estado, p_cep, p_whatsapp)
    RETURNING * INTO result;
  ELSE
    -- Atualizar perfil existente
    UPDATE public.profiles
    SET 
      name = COALESCE(p_name, public.profiles.name),
      phone = COALESCE(p_phone, public.profiles.phone),
      bio = COALESCE(p_bio, public.profiles.bio),
      avatar_url = COALESCE(p_avatar_url, public.profiles.avatar_url),
      endereco = COALESCE(p_endereco, public.profiles.endereco),
      cidade = COALESCE(p_cidade, public.profiles.cidade),
      estado = COALESCE(p_estado, public.profiles.estado),
      cep = COALESCE(p_cep, public.profiles.cep),
      whatsapp = COALESCE(p_whatsapp, public.profiles.whatsapp),
      updated_at = NOW()
    WHERE public.profiles.user_id = current_user_id
    RETURNING * INTO result;
  END IF;

  RETURN result;
END;
$function$;

-- 4. Corrigir função upsert_settings com validações
CREATE OR REPLACE FUNCTION public.upsert_settings(p_patch jsonb)
RETURNS settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result public.settings;
  current_user_id UUID := auth.uid();
BEGIN
  -- Verificar se usuário está autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Validar entrada JSON
  IF p_patch IS NULL THEN
    RAISE EXCEPTION 'Dados de configuração não podem ser nulos';
  END IF;

  -- Fazer upsert com merge de campos permitidos
  INSERT INTO public.settings (
    user_id,
    theme,
    timezone,
    locale,
    currency,
    date_format,
    number_format,
    items_per_page,
    notifications,
    start_page,
    extras
  )
  VALUES (
    current_user_id,
    COALESCE((p_patch->>'theme')::theme_mode, 'system'),
    COALESCE(p_patch->>'timezone', 'America/Sao_Paulo'),
    COALESCE(p_patch->>'locale', 'pt-BR'),
    COALESCE(p_patch->>'currency', 'BRL'),
    COALESCE(p_patch->>'date_format', 'DD/MM/YYYY'),
    COALESCE(p_patch->>'number_format', 'pt-BR'),
    COALESCE((p_patch->>'items_per_page')::integer, 25),
    COALESCE(p_patch->'notifications', '{"email": false, "in_app": true, "marketing": false}'::jsonb),
    COALESCE(p_patch->>'start_page', '/dashboard'),
    COALESCE(p_patch->'extras', '{}'::jsonb)
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    theme = COALESCE((p_patch->>'theme')::theme_mode, public.settings.theme),
    timezone = COALESCE(p_patch->>'timezone', public.settings.timezone),
    locale = COALESCE(p_patch->>'locale', public.settings.locale),
    currency = COALESCE(p_patch->>'currency', public.settings.currency),
    date_format = COALESCE(p_patch->>'date_format', public.settings.date_format),
    number_format = COALESCE(p_patch->>'number_format', public.settings.number_format),
    items_per_page = COALESCE((p_patch->>'items_per_page')::integer, public.settings.items_per_page),
    notifications = COALESCE(p_patch->'notifications', public.settings.notifications),
    start_page = COALESCE(p_patch->>'start_page', public.settings.start_page),
    extras = COALESCE(p_patch->'extras', public.settings.extras),
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$function$;

-- 5. Corrigir função upsert_profile com validações aprimoradas
CREATE OR REPLACE FUNCTION public.upsert_profile(
  p_user_id uuid,
  p_phone text,
  p_name text DEFAULT NULL::text,
  p_email text DEFAULT NULL::text
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result public.profiles;
BEGIN
  -- Validar parâmetros obrigatórios
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id é obrigatório';
  END IF;
  
  IF p_phone IS NULL OR length(trim(p_phone)) = 0 THEN
    RAISE EXCEPTION 'phone é obrigatório';
  END IF;

  -- Validar formato do telefone
  IF length(regexp_replace(p_phone, '[^0-9]', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'Telefone deve ter pelo menos 10 dígitos';
  END IF;

  -- Usar a função RPC para fazer upsert seguro
  INSERT INTO public.profiles (user_id, phone, name)
  VALUES (p_user_id, p_phone, p_name)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    phone = EXCLUDED.phone,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
EXCEPTION
  WHEN others THEN
    -- Se falhar, tentar buscar o perfil existente
    SELECT * INTO result FROM public.profiles WHERE public.profiles.user_id = p_user_id;
    RETURN result;
END;
$function$;

-- 6. Corrigir outras funções críticas
CREATE OR REPLACE FUNCTION public.create_trial_subscription(p_user_id uuid)
RETURNS subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result public.subscriptions;
BEGIN
  -- Validar parâmetro
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id é obrigatório';
  END IF;

  -- Verificar se já existe assinatura
  SELECT * INTO result FROM public.subscriptions WHERE public.subscriptions.user_id = p_user_id;
  
  IF result.id IS NOT NULL THEN
    RETURN result;
  END IF;
  
  -- Criar trial de 7 dias
  INSERT INTO public.subscriptions (user_id, status, trial_ends_at)
  VALUES (p_user_id, 'trial', CURRENT_DATE + INTERVAL '7 days')
  RETURNING * INTO result;
  
  RETURN result;
END;
$function$;

-- 7. Melhorar função de log de auditoria
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action audit_action,
  p_table_name text DEFAULT NULL::text,
  p_record_id text DEFAULT NULL::text,
  p_old_data jsonb DEFAULT NULL::jsonb,
  p_new_data jsonb DEFAULT NULL::jsonb,
  p_metadata jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  log_id UUID;
  current_user_id UUID := auth.uid();
BEGIN
  -- Sanitizar dados sensíveis antes do log
  IF p_old_data IS NOT NULL THEN
    p_old_data := p_old_data - 'password' - 'token' - 'key' - 'secret';
  END IF;
  
  IF p_new_data IS NOT NULL THEN
    p_new_data := p_new_data - 'password' - 'token' - 'key' - 'secret';
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    metadata,
    created_at
  )
  VALUES (
    current_user_id,
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    p_metadata,
    NOW()
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- 8. Criar função para detecção de atividades suspeitas
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  login_attempts INTEGER;
  recent_changes INTEGER;
BEGIN
  -- Detectar múltiplas tentativas de login falhadas
  IF TG_TABLE_NAME = 'audit_logs' AND NEW.action = 'login_failed' THEN
    SELECT COUNT(*) INTO login_attempts
    FROM public.audit_logs
    WHERE public.audit_logs.user_id = NEW.user_id
      AND public.audit_logs.action = 'login_failed'
      AND public.audit_logs.created_at >= NOW() - INTERVAL '1 hour';
    
    IF login_attempts >= 5 THEN
      INSERT INTO public.security_events (event_type, user_id, metadata)
      VALUES ('multiple_failed_logins', NEW.user_id, jsonb_build_object('attempts', login_attempts));
    END IF;
  END IF;

  -- Detectar mudanças de perfil suspeitas
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'UPDATE' THEN
    IF OLD.role != NEW.role THEN
      INSERT INTO public.security_events (event_type, user_id, metadata)
      VALUES ('role_change', NEW.user_id, jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role));
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
