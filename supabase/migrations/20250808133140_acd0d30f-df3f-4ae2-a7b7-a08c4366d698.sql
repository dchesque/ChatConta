-- Remover campos desnecessários da tabela profiles e adicionar campos para WhatsApp auth
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Atualizar a tabela profiles para WhatsApp auth
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Atualizar função handle_new_user para WhatsApp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    phone,
    name,
    plan,
    trial_ends_at,
    features_limit,
    phone_verified,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'trial',
    NOW() + INTERVAL '14 days',
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN '{
        "contas_pagar": -1,
        "fornecedores": -1,
        "categorias": -1,
        "relatorios": true,
        "exportacao": true,
        "backup": true
      }'::jsonb
      ELSE '{
        "contas_pagar": 50,
        "fornecedores": 20,
        "categorias": 10,
        "relatorios": true,
        "exportacao": false,
        "backup": false
      }'::jsonb
    END,
    FALSE,
    FALSE
  );
  RETURN NEW;
END;
$function$;