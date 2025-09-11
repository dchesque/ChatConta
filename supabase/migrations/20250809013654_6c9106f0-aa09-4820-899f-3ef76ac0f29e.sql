-- Criar enum para tema
CREATE TYPE theme_mode AS ENUM ('system', 'light', 'dark');

-- Criar tabela settings
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  theme theme_mode NOT NULL DEFAULT 'system',
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  currency TEXT NOT NULL DEFAULT 'BRL',
  date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
  number_format TEXT NOT NULL DEFAULT 'pt-BR',
  items_per_page INTEGER NOT NULL DEFAULT 25 CHECK (items_per_page >= 10 AND items_per_page <= 100),
  notifications JSONB NOT NULL DEFAULT '{"email": false, "in_app": true, "marketing": false}',
  start_page TEXT NOT NULL DEFAULT '/dashboard',
  extras JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Garantir um registro por usuário
  CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Habilitar RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policies para usuários
CREATE POLICY "Users can view their own settings"
  ON public.settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies para admin
CREATE POLICY "Admins can view all settings"
  ON public.settings
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  ));

-- Índices
CREATE INDEX idx_settings_user_id ON public.settings (user_id);

-- Trigger para updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RPC para upsert settings
CREATE OR REPLACE FUNCTION public.upsert_settings(p_patch jsonb)
RETURNS public.settings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    theme = COALESCE((p_patch->>'theme')::theme_mode, settings.theme),
    timezone = COALESCE(p_patch->>'timezone', settings.timezone),
    locale = COALESCE(p_patch->>'locale', settings.locale),
    currency = COALESCE(p_patch->>'currency', settings.currency),
    date_format = COALESCE(p_patch->>'date_format', settings.date_format),
    number_format = COALESCE(p_patch->>'number_format', settings.number_format),
    items_per_page = COALESCE((p_patch->>'items_per_page')::integer, settings.items_per_page),
    notifications = COALESCE(p_patch->'notifications', settings.notifications),
    start_page = COALESCE(p_patch->>'start_page', settings.start_page),
    extras = COALESCE(p_patch->'extras', settings.extras),
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$;