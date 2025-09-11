-- Teste e correção da função update_user_profile
-- Primeiro, vamos verificar se existe e corrigi-la

DROP FUNCTION IF EXISTS public.update_user_profile(text, text, text, text, text, text, text, text, text);

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