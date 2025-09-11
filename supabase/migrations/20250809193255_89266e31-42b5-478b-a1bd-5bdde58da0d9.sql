-- Primeiro, remover TODAS as políticas existentes da tabela profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Criar políticas simples e corretas sem recursão
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Para admins, usar função security definer que já existe e não causa recursão
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (get_user_role() = 'admin'::app_role);