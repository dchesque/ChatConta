-- Corrigir problemas de RLS que estão causando recursão infinita
-- Substituir políticas recursivas por uma função security definer

-- 1. Criar função security definer para verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Recriar políticas problemáticas sem recursão

-- Remover políticas existentes que causam recursão
DROP POLICY IF EXISTS "Admins can view all accounts payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Admins can update all accounts payable" ON public.accounts_payable;
DROP POLICY IF EXISTS "Admins can view all banks" ON public.banks;
DROP POLICY IF EXISTS "Admins can update all banks" ON public.banks;
DROP POLICY IF EXISTS "Admins can view all suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admins can update all suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can update all contacts" ON public.contacts;

-- Recriar políticas usando a função security definer
CREATE POLICY "Admins can view all accounts payable" ON public.accounts_payable
FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all accounts payable" ON public.accounts_payable
FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can view all banks" ON public.banks
FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all banks" ON public.banks
FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can view all suppliers" ON public.suppliers
FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all suppliers" ON public.suppliers
FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can view all categories" ON public.categories
FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all categories" ON public.categories
FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can view all contacts" ON public.contacts
FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all contacts" ON public.contacts
FOR UPDATE USING (public.get_user_role() = 'admin');