-- Criação da tabela system_config para armazenar configurações do sistema
-- Incluindo configurações de planos de assinatura

-- Criação da tabela system_config
CREATE TABLE IF NOT EXISTS public.system_config (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON public.system_config(key);
CREATE INDEX IF NOT EXISTS idx_system_config_category ON public.system_config(category);
CREATE INDEX IF NOT EXISTS idx_system_config_updated_at ON public.system_config(updated_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_system_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER system_config_updated_at_trigger
  BEFORE UPDATE ON public.system_config
  FOR EACH ROW
  EXECUTE FUNCTION update_system_config_updated_at();

-- Habilitar RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Política para admins terem acesso completo
CREATE POLICY "Admins can manage system_config"
  ON public.system_config
  FOR ALL
  USING (get_user_role() = 'admin'::app_role);

-- Política para usuários normais apenas lerem configurações públicas
CREATE POLICY "Users can read public system_config"
  ON public.system_config
  FOR SELECT
  USING (category IN ('public', 'subscription', 'plans'));

-- Inserir configurações padrão dos planos
INSERT INTO public.system_config (key, value, description, category, created_by) 
VALUES (
  'plans_config',
  '{
    "free": {
      "id": "free",
      "name": "free",
      "displayName": "Grátis",
      "price": 0,
      "currency": "BRL",
      "interval": "month",
      "trialDays": 0,
      "features": {
        "contas_pagar": 10,
        "fornecedores": 5,
        "categorias": 3,
        "relatorios": false,
        "exportacao": false,
        "backup": false,
        "suporte_prioritario": false
      },
      "stripe": {
        "priceId": "",
        "productId": ""
      }
    },
    "trial": {
      "id": "trial",
      "name": "trial",
      "displayName": "Trial",
      "price": 0,
      "currency": "BRL",
      "interval": "month",
      "trialDays": 7,
      "features": {
        "contas_pagar": 50,
        "fornecedores": 20,
        "categorias": 10,
        "relatorios": true,
        "exportacao": false,
        "backup": false,
        "suporte_prioritario": false
      },
      "stripe": {
        "priceId": "",
        "productId": ""
      }
    },
    "premium": {
      "id": "premium",
      "name": "premium",
      "displayName": "Premium",
      "price": 29.90,
      "currency": "BRL",
      "interval": "month",
      "trialDays": 0,
      "features": {
        "contas_pagar": -1,
        "fornecedores": -1,
        "categorias": -1,
        "relatorios": true,
        "exportacao": true,
        "backup": true,
        "suporte_prioritario": true
      },
      "stripe": {
        "priceId": "",
        "productId": ""
      }
    }
  }'::jsonb,
  'Configuração dos planos de assinatura do sistema',
  'subscription',
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)
) ON CONFLICT (key) DO NOTHING;

-- Inserir configurações gerais do Stripe
INSERT INTO public.system_config (key, value, description, category, created_by)
VALUES (
  'stripe_config',
  '{
    "enabled": false,
    "environment": "test",
    "webhook_configured": false,
    "last_sync": null,
    "products_synced": false
  }'::jsonb,
  'Configurações de integração com Stripe',
  'payment',
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)
) ON CONFLICT (key) DO NOTHING;

-- Inserir configurações gerais do sistema
INSERT INTO public.system_config (key, value, description, category, created_by)
VALUES (
  'system_settings',
  '{
    "maintenance_mode": false,
    "registration_enabled": true,
    "trial_auto_creation": true,
    "default_trial_days": 7,
    "max_trial_extensions": 0
  }'::jsonb,
  'Configurações gerais do sistema',
  'system',
  (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)
) ON CONFLICT (key) DO NOTHING;

-- Função para buscar configuração por chave
CREATE OR REPLACE FUNCTION get_system_config(config_key TEXT)
RETURNS JSONB AS $$
DECLARE
  config_value JSONB;
BEGIN
  SELECT value INTO config_value
  FROM public.system_config
  WHERE key = config_key;
  
  RETURN config_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar configuração (apenas admins)
CREATE OR REPLACE FUNCTION update_system_config(
  config_key TEXT,
  config_value JSONB,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Verificar se é admin
  SELECT get_user_role() INTO user_role;
  
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar configurações do sistema';
  END IF;
  
  -- Atualizar ou inserir configuração
  INSERT INTO public.system_config (key, value, updated_by, updated_at)
  VALUES (config_key, config_value, user_id, NOW())
  ON CONFLICT (key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_by = EXCLUDED.updated_by,
    updated_at = EXCLUDED.updated_at;
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE public.system_config IS 'Tabela para armazenar configurações globais do sistema';
COMMENT ON COLUMN public.system_config.key IS 'Chave única da configuração';
COMMENT ON COLUMN public.system_config.value IS 'Valor da configuração em formato JSON';
COMMENT ON COLUMN public.system_config.category IS 'Categoria da configuração (subscription, payment, system, etc.)';
COMMENT ON FUNCTION get_system_config(TEXT) IS 'Busca uma configuração específica por chave';
COMMENT ON FUNCTION update_system_config(TEXT, JSONB, UUID) IS 'Atualiza uma configuração (apenas admins)';