-- Criar enums para notificações
CREATE TYPE notification_type AS ENUM (
  'bill_due_soon', 
  'bill_overdue', 
  'trial_expiring', 
  'payment_failed', 
  'subscription_expired', 
  'info',
  'system'
);

CREATE TYPE notification_severity AS ENUM ('info', 'success', 'warning', 'error');

CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'read', 'dismissed', 'error');

-- Criar tabela notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type notification_type NOT NULL,
  severity notification_severity NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  channel TEXT NOT NULL DEFAULT 'in_app',
  status notification_status NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para admin
CREATE POLICY "Admins can view all notifications"
  ON public.notifications
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  ));

-- Service role pode inserir (para cron jobs futuros)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (current_setting('role') = 'service_role');

-- Índices
CREATE INDEX idx_notifications_user_status ON public.notifications (user_id, status);
CREATE INDEX idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_scheduled ON public.notifications (scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_notifications_type_user ON public.notifications (type, user_id, created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RPC para criar notificação com validações
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_scheduled_for TIMESTAMPTZ DEFAULT NULL,
  p_severity TEXT DEFAULT 'info'
)
RETURNS public.notifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- RPC para marcar notificação como lida
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS public.notifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- RPC para marcar todas as notificações como lidas
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- RPC para dispensar notificação
CREATE OR REPLACE FUNCTION public.dismiss_notification(p_notification_id UUID)
RETURNS public.notifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Habilitar realtime para a tabela
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;