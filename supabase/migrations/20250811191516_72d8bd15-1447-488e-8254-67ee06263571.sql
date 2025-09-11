-- SECURITY FIX: Add search_path protection to all SECURITY DEFINER functions
-- This prevents privilege escalation attacks through search_path manipulation

-- Fix upsert_profile function
CREATE OR REPLACE FUNCTION public.upsert_profile(p_user_id uuid, p_phone text, p_name text DEFAULT NULL::text, p_email text DEFAULT NULL::text)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result public.profiles;
BEGIN
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
    SELECT * INTO result FROM public.profiles WHERE user_id = p_user_id;
    RETURN result;
END;
$function$;

-- Fix create_trial_subscription function
CREATE OR REPLACE FUNCTION public.create_trial_subscription(p_user_id uuid)
 RETURNS subscriptions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result public.subscriptions;
BEGIN
  -- Verificar se já existe assinatura
  SELECT * INTO result FROM public.subscriptions WHERE user_id = p_user_id;
  
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

-- Fix normalize_subscription_status function
CREATE OR REPLACE FUNCTION public.normalize_subscription_status(p_user_id uuid)
 RETURNS subscriptions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result public.subscriptions;
  today DATE := CURRENT_DATE;
BEGIN
  -- Buscar assinatura atual
  SELECT * INTO result FROM public.subscriptions WHERE user_id = p_user_id;
  
  IF result.id IS NULL THEN
    RETURN result;
  END IF;
  
  -- Verificar se trial expirou
  IF result.status = 'trial' AND result.trial_ends_at < today THEN
    UPDATE public.subscriptions 
    SET status = 'expired', updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO result;
  END IF;
  
  -- Verificar se assinatura ativa expirou
  IF result.status = 'active' AND result.subscription_ends_at < today THEN
    UPDATE public.subscriptions 
    SET status = 'expired', updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO result;
  END IF;
  
  RETURN result;
END;
$function$;

-- Fix update_security_config function
CREATE OR REPLACE FUNCTION public.update_security_config(p_config jsonb)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result public.profiles;
BEGIN
  UPDATE public.profiles
  SET 
    security_config = p_config,
    updated_at = NOW()
  WHERE user_id = auth.uid()
  RETURNING * INTO result;
  
  RETURN result;
END;
$function$;

-- Fix log_audit function
CREATE OR REPLACE FUNCTION public.log_audit(p_action audit_action, p_table_name text DEFAULT NULL::text, p_record_id text DEFAULT NULL::text, p_old_data jsonb DEFAULT NULL::jsonb, p_new_data jsonb DEFAULT NULL::jsonb, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  log_id UUID;
BEGIN
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
    auth.uid(),
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

-- Fix update_user_profile function
CREATE OR REPLACE FUNCTION public.update_user_profile(p_name text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_bio text DEFAULT NULL::text, p_avatar_url text DEFAULT NULL::text, p_endereco text DEFAULT NULL::text, p_cidade text DEFAULT NULL::text, p_estado text DEFAULT NULL::text, p_cep text DEFAULT NULL::text, p_whatsapp text DEFAULT NULL::text)
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

  -- Verificar se perfil existe, se não, criar
  SELECT * INTO result FROM public.profiles WHERE user_id = current_user_id;
  
  IF result.id IS NULL THEN
    -- Criar perfil se não existir
    INSERT INTO public.profiles (user_id, name, phone, bio, avatar_url, endereco, cidade, estado, cep, whatsapp)
    VALUES (current_user_id, p_name, p_phone, p_bio, p_avatar_url, p_endereco, p_cidade, p_estado, p_cep, p_whatsapp)
    RETURNING * INTO result;
  ELSE
    -- Atualizar perfil existente
    UPDATE public.profiles
    SET 
      name = COALESCE(p_name, name),
      phone = COALESCE(p_phone, phone),
      bio = COALESCE(p_bio, bio),
      avatar_url = COALESCE(p_avatar_url, avatar_url),
      endereco = COALESCE(p_endereco, endereco),
      cidade = COALESCE(p_cidade, cidade),
      estado = COALESCE(p_estado, estado),
      cep = COALESCE(p_cep, cep),
      whatsapp = COALESCE(p_whatsapp, whatsapp),
      updated_at = NOW()
    WHERE user_id = current_user_id
    RETURNING * INTO result;
  END IF;

  RETURN result;
END;
$function$;

-- Fix upsert_settings function
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

-- Fix create_notification function
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_data jsonb DEFAULT '{}'::jsonb, p_scheduled_for timestamp with time zone DEFAULT NULL::timestamp with time zone, p_severity text DEFAULT 'info'::text)
 RETURNS notifications
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result public.notifications;
  notification_count INTEGER;
  user_settings JSONB;
BEGIN
  -- Verificar se usuário existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Buscar preferências do usuário
  SELECT s.notifications INTO user_settings
  FROM public.settings s
  WHERE s.user_id = p_user_id;

  -- Se usuário desabilitou notificações in-app, não criar
  IF user_settings IS NOT NULL AND (user_settings->>'in_app')::boolean = false THEN
    RAISE EXCEPTION 'Usuário desabilitou notificações in-app';
  END IF;

  -- Throttling: máximo 10 notificações do mesmo tipo por usuário por dia
  SELECT COUNT(*) INTO notification_count
  FROM public.notifications
  WHERE user_id = p_user_id
    AND type = p_type::notification_type
    AND created_at >= CURRENT_DATE;

  IF notification_count >= 10 THEN
    RAISE EXCEPTION 'Limite de notificações do tipo % atingido para hoje', p_type;
  END IF;

  -- Evitar duplicatas para contas específicas (mesmo type + mesmo record_id no mesmo dia)
  IF p_data ? 'accounts_payable_id' OR p_data ? 'accounts_receivable_id' THEN
    IF EXISTS (
      SELECT 1 FROM public.notifications
      WHERE user_id = p_user_id
        AND type = p_type::notification_type
        AND (
          (p_data ? 'accounts_payable_id' AND data->>'accounts_payable_id' = p_data->>'accounts_payable_id') OR
          (p_data ? 'accounts_receivable_id' AND data->>'accounts_receivable_id' = p_data->>'accounts_receivable_id')
        )
        AND created_at >= CURRENT_DATE
    ) THEN
      RAISE EXCEPTION 'Notificação duplicada para o mesmo registro hoje';
    END IF;
  END IF;

  -- Inserir notificação
  INSERT INTO public.notifications (
    user_id,
    type,
    severity,
    title,
    message,
    data,
    status,
    scheduled_for,
    delivered_at
  )
  VALUES (
    p_user_id,
    p_type::notification_type,
    p_severity::notification_severity,
    p_title,
    p_message,
    COALESCE(p_data, '{}'),
    CASE WHEN p_scheduled_for IS NULL THEN 'sent' ELSE 'pending' END,
    CASE WHEN p_scheduled_for IS NULL THEN NOW() ELSE NULL END
  )
  RETURNING * INTO result;

  RETURN result;
END;
$function$;

-- Fix mark_notification_read function
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
 RETURNS notifications
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result public.notifications;
BEGIN
  UPDATE public.notifications
  SET 
    status = 'read',
    read_at = NOW(),
    updated_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid()
    AND status IN ('sent', 'pending')
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Notificação não encontrada ou não pode ser marcada como lida';
  END IF;

  RETURN result;
END;
$function$;

-- Fix mark_all_notifications_read function
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET 
    status = 'read',
    read_at = NOW(),
    updated_at = NOW()
  WHERE user_id = auth.uid()
    AND status IN ('sent', 'pending');

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$function$;

-- Fix dismiss_notification function
CREATE OR REPLACE FUNCTION public.dismiss_notification(p_notification_id uuid)
 RETURNS notifications
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result public.notifications;
BEGIN
  UPDATE public.notifications
  SET 
    status = 'dismissed',
    updated_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid()
  RETURNING * INTO result;

  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Notificação não encontrada';
  END IF;

  RETURN result;
END;
$function$;

-- Fix soft_delete_record function
CREATE OR REPLACE FUNCTION public.soft_delete_record(p_table_name text, p_record_id uuid, p_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  query_text TEXT;
  affected_rows INTEGER;
BEGIN
  IF p_table_name IS NULL OR p_record_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Parâmetros obrigatórios não fornecidos';
  END IF;
  
  query_text := FORMAT(
    'UPDATE %I SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    p_table_name
  );
  
  EXECUTE query_text USING p_record_id, p_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN affected_rows > 0;
END;
$function$;

-- Fix restore_deleted_record function
CREATE OR REPLACE FUNCTION public.restore_deleted_record(p_table_name text, p_record_id uuid, p_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  query_text TEXT;
  affected_rows INTEGER;
BEGIN
  IF p_table_name IS NULL OR p_record_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Parâmetros obrigatórios não fornecidos';
  END IF;
  
  query_text := FORMAT(
    'UPDATE %I SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
    p_table_name
  );
  
  EXECUTE query_text USING p_record_id, p_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN affected_rows > 0;
END;
$function$;

-- CRITICAL FIX: Strengthen role protection by separating role update policies
-- Remove the vulnerable "Users can update own profile data" policy and create specific ones

-- Drop the existing vulnerable policy
DROP POLICY IF EXISTS "Users can update own profile data" ON public.profiles;

-- Create separate policies for different types of updates
CREATE POLICY "Users can update own basic profile data" ON public.profiles
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow updating these fields but not role or plan
    OLD.role = NEW.role 
    AND OLD.plan = NEW.plan
    AND OLD.subscription_status = NEW.subscription_status
    AND OLD.trial_ends_at = NEW.trial_ends_at
    AND OLD.subscription_ends_at = NEW.subscription_ends_at
    AND OLD.features_limit = NEW.features_limit
  )
);

-- Only admins can update roles and plans
CREATE POLICY "Only admins can update role and plan" ON public.profiles
FOR UPDATE 
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Add trigger to audit role changes more strictly
CREATE OR REPLACE FUNCTION public.audit_critical_profile_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Log any role or plan changes with detailed metadata
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (
      user_id, action, table_name, record_id,
      old_data, new_data, metadata
    ) VALUES (
      COALESCE(auth.uid(), OLD.user_id), 'role_change', 'profiles', NEW.id::text,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role),
      jsonb_build_object(
        'changed_by', auth.uid(),
        'target_user', NEW.user_id,
        'timestamp', NOW(),
        'session_user', session_user,
        'current_user', current_user
      )
    );
  END IF;
  
  IF OLD.plan IS DISTINCT FROM NEW.plan THEN
    INSERT INTO public.audit_logs (
      user_id, action, table_name, record_id,
      old_data, new_data, metadata
    ) VALUES (
      COALESCE(auth.uid(), OLD.user_id), 'plan_change', 'profiles', NEW.id::text,
      jsonb_build_object('plan', OLD.plan),
      jsonb_build_object('plan', NEW.plan),
      jsonb_build_object(
        'changed_by', auth.uid(),
        'target_user', NEW.user_id,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop existing trigger and create new one
DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_critical_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_profile_changes();