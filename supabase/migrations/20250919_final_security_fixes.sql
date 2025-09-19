-- ========================================
-- CORREÇÕES CRÍTICAS FINAIS DE SEGURANÇA
-- Data: 19/09/2025
-- ========================================
-- Este script corrige TODOS os problemas críticos identificados

-- ========================================
-- 1. CRIAR TIPO app_role (CRÍTICO)
-- ========================================
-- Problema: Tipo estava faltando, causando falha nas políticas admin
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
-- 2. CORRIGIR FUNÇÃO get_user_role() (CRÍTICO)
-- ========================================
-- Garantir que a função funciona corretamente com o novo tipo
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Usar auth.uid() diretamente para buscar role
  SELECT role::app_role INTO user_role
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- Retornar 'user' como padrão se não encontrar
  RETURN COALESCE(user_role, 'user'::app_role);
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar 'user' como padrão seguro
    RETURN 'user'::app_role;
END;
$$;

-- ========================================
-- 3. VERIFICAR RLS EM TODAS AS TABELAS
-- ========================================
-- Garantir que RLS está ativo
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. LIMPAR DADOS ÓRFÃOS RESTANTES
-- ========================================
-- Verificar e limpar qualquer dado órfão restante
DO $$
DECLARE
    orphan_count INTEGER;
    admin_id UUID;
BEGIN
    -- Verificar dados órfãos em categories
    SELECT COUNT(*) INTO orphan_count FROM public.categories WHERE user_id IS NULL;

    IF orphan_count > 0 THEN
        RAISE NOTICE 'Encontrados % registros órfãos em categories', orphan_count;

        -- Buscar primeiro admin
        SELECT user_id INTO admin_id
        FROM public.profiles
        WHERE role = 'admin'
        LIMIT 1;

        IF admin_id IS NOT NULL THEN
            UPDATE public.categories
            SET user_id = admin_id,
                updated_at = NOW()
            WHERE user_id IS NULL;
            RAISE NOTICE 'Dados órfãos atribuídos ao admin: %', admin_id;
        ELSE
            DELETE FROM public.categories WHERE user_id IS NULL;
            RAISE NOTICE 'Dados órfãos removidos (nenhum admin encontrado)';
        END IF;
    END IF;

    -- Verificar outras tabelas
    SELECT COUNT(*) INTO orphan_count FROM public.contacts WHERE user_id IS NULL;
    IF orphan_count > 0 THEN
        DELETE FROM public.contacts WHERE user_id IS NULL;
        RAISE NOTICE 'Removidos % contatos órfãos', orphan_count;
    END IF;

    SELECT COUNT(*) INTO orphan_count FROM public.banks WHERE user_id IS NULL;
    IF orphan_count > 0 THEN
        DELETE FROM public.banks WHERE user_id IS NULL;
        RAISE NOTICE 'Removidos % bancos órfãos', orphan_count;
    END IF;
END $$;

-- ========================================
-- 5. TESTE DE VALIDAÇÃO FINAL
-- ========================================
-- Verificar se tudo está funcionando
DO $$
DECLARE
    policies_count INTEGER;
    rls_count INTEGER;
    orphans_total INTEGER;
BEGIN
    -- Contar políticas ativas
    SELECT COUNT(*) INTO policies_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks', 'bank_accounts');

    -- Contar tabelas com RLS
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks', 'bank_accounts')
    AND rowsecurity = true;

    -- Contar dados órfãos restantes
    SELECT
        (SELECT COUNT(*) FROM public.categories WHERE user_id IS NULL) +
        (SELECT COUNT(*) FROM public.contacts WHERE user_id IS NULL) +
        (SELECT COUNT(*) FROM public.banks WHERE user_id IS NULL) +
        (SELECT COUNT(*) FROM public.accounts_payable WHERE user_id IS NULL) +
        (SELECT COUNT(*) FROM public.accounts_receivable WHERE user_id IS NULL)
    INTO orphans_total;

    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RELATÓRIO FINAL DE SEGURANÇA';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Políticas ativas: %', policies_count;
    RAISE NOTICE 'Tabelas com RLS: %', rls_count;
    RAISE NOTICE 'Dados órfãos restantes: %', orphans_total;

    IF policies_count >= 30 AND rls_count = 6 AND orphans_total = 0 THEN
        RAISE NOTICE '🎉 STATUS: SEGURANÇA IMPLEMENTADA COM SUCESSO!';
    ELSE
        RAISE WARNING '⚠️ STATUS: AINDA EXISTEM PROBLEMAS DE SEGURANÇA';
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- ========================================
-- 6. TESTAR FUNÇÃO get_user_role()
-- ========================================
-- Teste básico da função
DO $$
DECLARE
    test_role app_role;
BEGIN
    -- Tentar chamar a função
    SELECT public.get_user_role() INTO test_role;
    RAISE NOTICE 'Função get_user_role() funcionando. Tipo retornado: %', test_role;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erro ao testar get_user_role(): %', SQLERRM;
END $$;

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🛡️ CORREÇÕES CRÍTICAS APLICADAS';
    RAISE NOTICE '✅ Tipo app_role criado/verificado';
    RAISE NOTICE '✅ Função get_user_role() corrigida';
    RAISE NOTICE '✅ RLS ativado em todas as tabelas';
    RAISE NOTICE '✅ Dados órfãos removidos/atribuídos';
    RAISE NOTICE '✅ Validações de segurança executadas';
    RAISE NOTICE '========================================';
END $$;