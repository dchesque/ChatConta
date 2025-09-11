
-- Corrigir erro 42601 na função de criação de notificações
-- Motivo: 9 colunas na lista, mas apenas 8 valores; além disso scheduled_for/delivered_at estavam invertidos.

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb,
  p_scheduled_for timestamptz DEFAULT NULL::timestamptz,
  p_severity text DEFAULT 'info'::text
)
RETURNS public.notifications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result public.notifications;
  notification_count INTEGER;
  user_settings JSONB;
  v_status public.notification_status;
  v_scheduled_for timestamptz;
  v_delivered_at timestamptz;
BEGIN
  -- Verificar se usuário existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Buscar preferências do usuário (podem não existir)
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
    AND type = p_type::public.notification_type
    AND created_at >= CURRENT_DATE;

  IF notification_count >= 10 THEN
    RAISE EXCEPTION 'Limite de notificações do tipo % atingido para hoje', p_type;
  END IF;

  -- Evitar duplicatas para contas específicas (mesmo type + mesmo record_id no mesmo dia)
  IF p_data ? 'accounts_payable_id' OR p_data ? 'accounts_receivable_id' THEN
    IF EXISTS (
      SELECT 1 FROM public.notifications
      WHERE user_id = p_user_id
        AND type = p_type::public.notification_type
        AND (
          (p_data ? 'accounts_payable_id' AND data->>'accounts_payable_id' = p_data->>'accounts_payable_id') OR
          (p_data ? 'accounts_receivable_id' AND data->>'accounts_receivable_id' = p_data->>'accounts_receivable_id')
        )
        AND created_at >= CURRENT_DATE
    ) THEN
      RAISE EXCEPTION 'Notificação duplicada para o mesmo registro hoje';
    END IF;
  END IF;

  -- Definir status e datas corretas
  v_status := CASE 
    WHEN p_scheduled_for IS NULL THEN 'sent'::public.notification_status
    ELSE 'pending'::public.notification_status
  END;

  v_scheduled_for := p_scheduled_for;
  v_delivered_at := CASE 
    WHEN p_scheduled_for IS NULL THEN NOW() 
    ELSE NULL 
  END;

  -- Inserir notificação com a quantidade de valores correta
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
    p_type::public.notification_type,
    p_severity::public.notification_severity,
    p_title,
    p_message,
    COALESCE(p_data, '{}'::jsonb),
    v_status,
    v_scheduled_for,
    v_delivered_at
  )
  RETURNING * INTO result;

  RETURN result;
END;
$function$;

-- Garantir search_path seguro em funções relacionadas (idempotente)
ALTER FUNCTION public.mark_notification_read(uuid) SET search_path TO 'public';
ALTER FUNCTION public.mark_all_notifications_read() SET search_path TO 'public';
ALTER FUNCTION public.dismiss_notification(uuid) SET search_path TO 'public';
