-- Verificar se as colunas necessárias existem, senão adicionar
DO $$
BEGIN
  -- Adicionar coluna phone se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT NOT NULL DEFAULT '';
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);
  END IF;
  
  -- Adicionar coluna name se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
  END IF;
  
  -- Verificar se role já existe, senão usar a coluna existente ou criar
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role' AND data_type = 'text') THEN
    -- Se existir como enum, manter, senão criar como text
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
      ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
    END IF;
  END IF;
END
$$;

-- Criar a função upsert_profile se não existir
CREATE OR REPLACE FUNCTION public.upsert_profile(
  p_user_id UUID,
  p_phone TEXT,
  p_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;