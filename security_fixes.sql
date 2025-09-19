-- ========================================
-- CORREÇÕES CRÍTICAS DE SEGURANÇA
-- Data: 19/09/2025
-- ========================================
-- Este script corrige os problemas de segurança identificados na auditoria

-- ========================================
-- 1. CRIAR TIPO app_role (SE NÃO EXISTIR)
-- ========================================
-- Este é um problema crítico que estava causando falhas nas políticas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('user', 'admin');
    RAISE NOTICE '✅ Tipo app_role criado com sucesso';
  ELSE
    RAISE NOTICE 'ℹ️ Tipo app_role já existe';
  END IF;
END $$;

-- ========================================
-- 2. VERIFICAR E CORRIGIR FUNÇÃO get_user_role()
-- ========================================
-- Garantir que a função existe e funciona corretamente
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Usar auth.uid() diretamente para evitar recursão
  SELECT role::app_role INTO user_role
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- Retornar 'user' como padrão se não encontrar o usuário
  RETURN COALESCE(user_role, 'user'::app_role);
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar 'user' como padrão seguro
    RETURN 'user'::app_role;
END;
$$;

-- ========================================
-- 3. GARANTIR QUE RLS ESTÁ ATIVO EM TODAS AS TABELAS
-- ========================================

-- Ativar RLS em todas as tabelas principais
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verificar se transactions existe e ativar RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS ativado na tabela transactions';
  ELSE
    RAISE NOTICE 'ℹ️ Tabela transactions não existe';
  END IF;
END $$;

-- ========================================
-- 4. CORRIGIR DADOS ÓRFÃOS
-- ========================================

-- Função para atribuir dados órfãos ao primeiro admin ou deletar se não houver usuários
DO $$
DECLARE
  admin_id UUID;
  first_user_id UUID;
  orphan_count INTEGER;
BEGIN
  -- Buscar o primeiro usuário admin
  SELECT user_id INTO admin_id
  FROM public.profiles
  WHERE role = 'admin'
  LIMIT 1;

  -- Se não houver admin, buscar o primeiro usuário
  IF admin_id IS NULL THEN
    SELECT user_id INTO first_user_id
    FROM public.profiles
    LIMIT 1;
  END IF;

  -- Usar admin_id se disponível, senão first_user_id
  admin_id := COALESCE(admin_id, first_user_id);

  IF admin_id IS NOT NULL THEN
    -- Corrigir accounts_payable órfãos
    SELECT COUNT(*) INTO orphan_count FROM public.accounts_payable WHERE user_id IS NULL;
    IF orphan_count > 0 THEN
      UPDATE public.accounts_payable SET user_id = admin_id, updated_at = NOW() WHERE user_id IS NULL;
      RAISE NOTICE '✅ % registros órfãos corrigidos em accounts_payable', orphan_count;
    END IF;

    -- Corrigir accounts_receivable órfãos
    SELECT COUNT(*) INTO orphan_count FROM public.accounts_receivable WHERE user_id IS NULL;
    IF orphan_count > 0 THEN
      UPDATE public.accounts_receivable SET user_id = admin_id, updated_at = NOW() WHERE user_id IS NULL;
      RAISE NOTICE '✅ % registros órfãos corrigidos em accounts_receivable', orphan_count;
    END IF;

    -- Corrigir contacts órfãos
    SELECT COUNT(*) INTO orphan_count FROM public.contacts WHERE user_id IS NULL;
    IF orphan_count > 0 THEN
      UPDATE public.contacts SET user_id = admin_id, updated_at = NOW() WHERE user_id IS NULL;
      RAISE NOTICE '✅ % registros órfãos corrigidos em contacts', orphan_count;
    END IF;

    -- Corrigir categories órfãos
    SELECT COUNT(*) INTO orphan_count FROM public.categories WHERE user_id IS NULL;
    IF orphan_count > 0 THEN
      UPDATE public.categories SET user_id = admin_id, updated_at = NOW() WHERE user_id IS NULL;
      RAISE NOTICE '✅ % registros órfãos corrigidos em categories', orphan_count;
    END IF;

    -- Corrigir banks órfãos
    SELECT COUNT(*) INTO orphan_count FROM public.banks WHERE user_id IS NULL;
    IF orphan_count > 0 THEN
      UPDATE public.banks SET user_id = admin_id, updated_at = NOW() WHERE user_id IS NULL;
      RAISE NOTICE '✅ % registros órfãos corrigidos em banks', orphan_count;
    END IF;

  ELSE
    -- Se não houver nenhum usuário, deletar dados órfãos
    DELETE FROM public.accounts_payable WHERE user_id IS NULL;
    DELETE FROM public.accounts_receivable WHERE user_id IS NULL;
    DELETE FROM public.contacts WHERE user_id IS NULL;
    DELETE FROM public.categories WHERE user_id IS NULL;
    DELETE FROM public.banks WHERE user_id IS NULL;
    RAISE WARNING '⚠️ Nenhum usuário encontrado. Dados órfãos foram deletados.';
  END IF;
END $$;

-- ========================================
-- 5. GARANTIR POLÍTICAS DE SEGURANÇA CORRETAS
-- ========================================

-- Remover todas as políticas existentes para recriar corretamente
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks', 'bank_accounts')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
  RAISE NOTICE '✅ Políticas antigas removidas para recriação';
END $$;

-- ACCOUNTS_PAYABLE - Políticas de usuário
CREATE POLICY "Users can view their own accounts payable"
ON public.accounts_payable FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts payable"
ON public.accounts_payable FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts payable"
ON public.accounts_payable FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts payable"
ON public.accounts_payable FOR DELETE
USING (auth.uid() = user_id);

-- ACCOUNTS_PAYABLE - Políticas de admin
CREATE POLICY "Admins can view all accounts payable"
ON public.accounts_payable FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can insert all accounts payable"
ON public.accounts_payable FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update all accounts payable"
ON public.accounts_payable FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can delete all accounts payable"
ON public.accounts_payable FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- ACCOUNTS_RECEIVABLE - Políticas de usuário
CREATE POLICY "Users can view their own accounts receivable"
ON public.accounts_receivable FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts receivable"
ON public.accounts_receivable FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts receivable"
ON public.accounts_receivable FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts receivable"
ON public.accounts_receivable FOR DELETE
USING (auth.uid() = user_id);

-- ACCOUNTS_RECEIVABLE - Políticas de admin
CREATE POLICY "Admins can view all accounts receivable"
ON public.accounts_receivable FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can insert all accounts receivable"
ON public.accounts_receivable FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update all accounts receivable"
ON public.accounts_receivable FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can delete all accounts receivable"
ON public.accounts_receivable FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- CONTACTS - Políticas de usuário
CREATE POLICY "Users can view their own contacts"
ON public.contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
ON public.contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.contacts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.contacts FOR DELETE
USING (auth.uid() = user_id);

-- CONTACTS - Políticas de admin
CREATE POLICY "Admins can view all contacts"
ON public.contacts FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can insert all contacts"
ON public.contacts FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update all contacts"
ON public.contacts FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can delete all contacts"
ON public.contacts FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- CATEGORIES - Políticas especiais (incluindo categorias sistema)
CREATE POLICY "Users can view their own categories"
ON public.categories FOR SELECT
USING (
  auth.uid() = user_id
  OR is_system = true
  OR public.get_user_role() = 'admin'::app_role
);

CREATE POLICY "Users can insert their own categories"
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON public.categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON public.categories FOR DELETE
USING (auth.uid() = user_id AND (is_system IS NULL OR is_system = false));

-- CATEGORIES - Políticas de admin
CREATE POLICY "Admins can view all categories"
ON public.categories FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can insert all categories"
ON public.categories FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update all categories"
ON public.categories FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can delete all categories"
ON public.categories FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- BANKS - Políticas de usuário
CREATE POLICY "Users can view their own banks"
ON public.banks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own banks"
ON public.banks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own banks"
ON public.banks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own banks"
ON public.banks FOR DELETE
USING (auth.uid() = user_id);

-- BANKS - Políticas de admin
CREATE POLICY "Admins can view all banks"
ON public.banks FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can insert all banks"
ON public.banks FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update all banks"
ON public.banks FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can delete all banks"
ON public.banks FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- BANK_ACCOUNTS - Políticas complexas baseadas na propriedade do banco
CREATE POLICY "Users can view their own bank accounts"
ON public.bank_accounts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert bank accounts for their own banks"
ON public.bank_accounts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own bank accounts"
ON public.bank_accounts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own bank accounts"
ON public.bank_accounts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
);

-- BANK_ACCOUNTS - Políticas de admin
CREATE POLICY "Admins can view all bank accounts"
ON public.bank_accounts FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can insert all bank accounts"
ON public.bank_accounts FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update all bank accounts"
ON public.bank_accounts FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can delete all bank accounts"
ON public.bank_accounts FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- ========================================
-- 6. ADICIONAR CONSTRAINTS NOT NULL ONDE NECESSÁRIO
-- ========================================

-- Adicionar constraint NOT NULL em user_id para prevenir futuros dados órfãos
-- (apenas se todos os dados órfãos já foram corrigidos)
DO $$
DECLARE
  orphan_count INTEGER;
  table_name TEXT;
  tables_to_fix TEXT[] := ARRAY['accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks'];
BEGIN
  FOREACH table_name IN ARRAY tables_to_fix
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE user_id IS NULL', table_name) INTO orphan_count;

    IF orphan_count = 0 THEN
      BEGIN
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN user_id SET NOT NULL', table_name);
        RAISE NOTICE '✅ Constraint NOT NULL adicionada em %.user_id', table_name;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING '⚠️ Não foi possível adicionar constraint NOT NULL em %.user_id: %', table_name, SQLERRM;
      END;
    ELSE
      RAISE WARNING '⚠️ Tabela % ainda tem % registros órfãos. Constraint NOT NULL não aplicada.', table_name, orphan_count;
    END IF;
  END LOOP;
END $$;

-- ========================================
-- 7. VERIFICAÇÃO FINAL
-- ========================================

-- Executar uma verificação rápida dos resultados
DO $$
DECLARE
  total_orphans INTEGER := 0;
  temp_count INTEGER;
  rls_enabled_count INTEGER;
  tables_count INTEGER := 6; -- number of main tables
BEGIN
  -- Contar dados órfãos restantes
  SELECT COUNT(*) INTO temp_count FROM public.accounts_payable WHERE user_id IS NULL;
  total_orphans := total_orphans + temp_count;

  SELECT COUNT(*) INTO temp_count FROM public.accounts_receivable WHERE user_id IS NULL;
  total_orphans := total_orphans + temp_count;

  SELECT COUNT(*) INTO temp_count FROM public.contacts WHERE user_id IS NULL;
  total_orphans := total_orphans + temp_count;

  SELECT COUNT(*) INTO temp_count FROM public.categories WHERE user_id IS NULL;
  total_orphans := total_orphans + temp_count;

  SELECT COUNT(*) INTO temp_count FROM public.banks WHERE user_id IS NULL;
  total_orphans := total_orphans + temp_count;

  -- Contar tabelas com RLS ativo
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks', 'bank_accounts')
    AND rowsecurity = true;

  -- Relatório final
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RELATÓRIO DE CORREÇÕES APLICADAS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Tipo app_role: Criado/Verificado';
  RAISE NOTICE '✅ Função get_user_role(): Corrigida';
  RAISE NOTICE '✅ Dados órfãos restantes: %', total_orphans;
  RAISE NOTICE '✅ Tabelas com RLS ativo: %/%', rls_enabled_count, tables_count;
  RAISE NOTICE '✅ Políticas de segurança: Recriadas';

  IF total_orphans = 0 AND rls_enabled_count = tables_count THEN
    RAISE NOTICE '🎉 SISTEMA SEGURO - Todas as correções aplicadas com sucesso!';
  ELSE
    RAISE WARNING '⚠️ REVISAR - Algumas correções podem precisar de atenção manual';
  END IF;

  RAISE NOTICE '========================================';
END $$;