-- Corrigir políticas RLS da tabela profiles para evitar recursão infinita
-- Remover políticas que causam recursão
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Criar políticas simples baseadas apenas em auth.uid()
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Política separada para admins sem recursão - usando função security definer existente
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (get_user_role() = 'admin'::app_role);