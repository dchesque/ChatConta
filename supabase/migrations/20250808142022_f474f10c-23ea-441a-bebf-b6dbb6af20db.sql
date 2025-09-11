-- Criar tabela subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  trial_ends_at DATE,
  subscription_ends_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (id),
  UNIQUE (user_id)
);

-- Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários verem apenas suas próprias assinaturas
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscription" ON public.subscriptions
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para admins verem e editarem todas as assinaturas
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_trial_ends ON public.subscriptions(trial_ends_at) WHERE status = 'trial';
CREATE INDEX idx_subscriptions_active_ends ON public.subscriptions(subscription_ends_at) WHERE status = 'active';

-- Função para criar trial automático
CREATE OR REPLACE FUNCTION public.create_trial_subscription(p_user_id UUID)
RETURNS public.subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Função para normalizar status (expirar trials/assinaturas)
CREATE OR REPLACE FUNCTION public.normalize_subscription_status(p_user_id UUID)
RETURNS public.subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;