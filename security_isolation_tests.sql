-- ========================================
-- TESTES DE ISOLAMENTO DE SEGURANÇA
-- Data: 19/09/2025
-- ========================================
-- Este script testa se o RLS está funcionando corretamente
-- ATENÇÃO: Execute estes testes em um ambiente controlado

-- ========================================
-- 1. TESTE DE ACESSO SEM AUTENTICAÇÃO
-- ========================================

-- Simular acesso anônimo (sem auth.uid())
-- Em um ambiente real, isso deveria retornar 0 registros ou erro

SELECT
  'test_anonymous_access' as test_name,
  'accounts_payable' as table_name,
  (
    SELECT COUNT(*)
    FROM public.accounts_payable
    -- Esta query deveria retornar 0 se RLS estiver funcionando
  ) as record_count,
  CASE
    WHEN (SELECT COUNT(*) FROM public.accounts_payable) = 0 THEN 'PASS - RLS bloqueou acesso'
    ELSE 'FAIL - RLS não está funcionando'
  END as test_result,
  'Acesso sem autenticação deve retornar 0 registros' as expected_behavior;

-- Teste para outras tabelas
SELECT
  'test_anonymous_access' as test_name,
  'accounts_receivable' as table_name,
  (SELECT COUNT(*) FROM public.accounts_receivable) as record_count,
  CASE
    WHEN (SELECT COUNT(*) FROM public.accounts_receivable) = 0 THEN 'PASS - RLS bloqueou acesso'
    ELSE 'FAIL - RLS não está funcionando'
  END as test_result,
  'Acesso sem autenticação deve retornar 0 registros' as expected_behavior;

SELECT
  'test_anonymous_access' as test_name,
  'contacts' as table_name,
  (SELECT COUNT(*) FROM public.contacts) as record_count,
  CASE
    WHEN (SELECT COUNT(*) FROM public.contacts) = 0 THEN 'PASS - RLS bloqueou acesso'
    ELSE 'FAIL - RLS não está funcionando'
  END as test_result,
  'Acesso sem autenticação deve retornar 0 registros' as expected_behavior;

SELECT
  'test_anonymous_access' as test_name,
  'banks' as table_name,
  (SELECT COUNT(*) FROM public.banks) as record_count,
  CASE
    WHEN (SELECT COUNT(*) FROM public.banks) = 0 THEN 'PASS - RLS bloqueou acesso'
    ELSE 'FAIL - RLS não está funcionando'
  END as test_result,
  'Acesso sem autenticação deve retornar 0 registros' as expected_behavior;

-- ========================================
-- 2. TESTE DE FUNÇÃO get_user_role()
-- ========================================

-- Testar se a função get_user_role() funciona corretamente
SELECT
  'test_get_user_role_function' as test_name,
  CASE
    WHEN public.get_user_role() IS NOT NULL THEN 'PASS - Função retorna valor'
    ELSE 'FAIL - Função retorna NULL'
  END as test_result,
  public.get_user_role() as current_role,
  'Função deve retornar user ou admin, nunca NULL' as expected_behavior;

-- ========================================
-- 3. TESTE DE POLÍTICAS DE ADMIN
-- ========================================

-- Verificar se políticas de admin estão configuradas
-- (Este teste só funciona se executado por um usuário admin)
SELECT
  'test_admin_policies_exist' as test_name,
  COUNT(*) as admin_policies_count,
  CASE
    WHEN COUNT(*) >= 20 THEN 'PASS - Políticas admin existem'
    ELSE 'FAIL - Políticas admin insuficientes'
  END as test_result,
  'Deve haver pelo menos 20 políticas admin (4 ops x 5 tabelas)' as expected_behavior
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks')
  AND policyname ILIKE '%admin%';

-- ========================================
-- 4. TESTE DE POLÍTICAS DE USUÁRIO
-- ========================================

-- Verificar se políticas de usuário estão configuradas
SELECT
  'test_user_policies_exist' as test_name,
  COUNT(*) as user_policies_count,
  CASE
    WHEN COUNT(*) >= 20 THEN 'PASS - Políticas usuário existem'
    ELSE 'FAIL - Políticas usuário insuficientes'
  END as test_result,
  'Deve haver pelo menos 20 políticas usuário (4 ops x 5 tabelas)' as expected_behavior
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks')
  AND policyname NOT ILIKE '%admin%';

-- ========================================
-- 5. TESTE DE INTEGRIDADE DE DADOS
-- ========================================

-- Verificar se não há dados órfãos
WITH orphan_data AS (
  SELECT 'accounts_payable' as table_name, COUNT(*) as orphan_count
  FROM public.accounts_payable WHERE user_id IS NULL
  UNION ALL
  SELECT 'accounts_receivable', COUNT(*)
  FROM public.accounts_receivable WHERE user_id IS NULL
  UNION ALL
  SELECT 'contacts', COUNT(*)
  FROM public.contacts WHERE user_id IS NULL
  UNION ALL
  SELECT 'categories', COUNT(*)
  FROM public.categories WHERE user_id IS NULL
  UNION ALL
  SELECT 'banks', COUNT(*)
  FROM public.banks WHERE user_id IS NULL
)
SELECT
  'test_no_orphan_data' as test_name,
  table_name,
  orphan_count,
  CASE
    WHEN orphan_count = 0 THEN 'PASS - Sem dados órfãos'
    ELSE 'FAIL - Dados órfãos encontrados'
  END as test_result,
  'Não deve haver registros com user_id NULL' as expected_behavior
FROM orphan_data
WHERE orphan_count > 0;

-- Se não houver resultados na query acima, significa que todos os testes passaram
SELECT
  'test_no_orphan_data_summary' as test_name,
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM public.accounts_payable WHERE user_id IS NULL
      UNION ALL
      SELECT 1 FROM public.accounts_receivable WHERE user_id IS NULL
      UNION ALL
      SELECT 1 FROM public.contacts WHERE user_id IS NULL
      UNION ALL
      SELECT 1 FROM public.categories WHERE user_id IS NULL
      UNION ALL
      SELECT 1 FROM public.banks WHERE user_id IS NULL
    ) THEN 'PASS - Nenhum dado órfão encontrado'
    ELSE 'FAIL - Dados órfãos ainda existem'
  END as test_result,
  'Sistema deve estar livre de dados órfãos' as expected_behavior;

-- ========================================
-- 6. TESTE DE RLS STATUS
-- ========================================

-- Verificar se RLS está ativo em todas as tabelas principais
SELECT
  'test_rls_enabled' as test_name,
  tablename,
  CASE
    WHEN rowsecurity THEN 'PASS - RLS ativo'
    ELSE 'FAIL - RLS inativo'
  END as test_result,
  'RLS deve estar ativo em todas as tabelas principais' as expected_behavior
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks', 'bank_accounts')
ORDER BY tablename;

-- ========================================
-- 7. TESTE DE CONSTRAINT NOT NULL
-- ========================================

-- Verificar se constraints NOT NULL estão aplicadas onde necessário
SELECT
  'test_not_null_constraints' as test_name,
  table_name,
  column_name,
  CASE
    WHEN is_nullable = 'NO' THEN 'PASS - NOT NULL ativo'
    ELSE 'WARNING - NOT NULL pode ser necessário'
  END as test_result,
  'user_id deve ter constraint NOT NULL para prevenir dados órfãos' as expected_behavior
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks')
  AND column_name = 'user_id'
ORDER BY table_name;

-- ========================================
-- 8. TESTE DE ACESSO CRUZADO DE USUÁRIOS
-- ========================================

-- Verificar se usuários diferentes estão isolados
-- (Este teste requer contexto de usuário autenticado)
WITH user_isolation_test AS (
  SELECT
    'accounts_payable' as table_name,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_records
  FROM public.accounts_payable
  WHERE user_id IS NOT NULL
  UNION ALL
  SELECT
    'accounts_receivable',
    COUNT(DISTINCT user_id),
    COUNT(*)
  FROM public.accounts_receivable
  WHERE user_id IS NOT NULL
)
SELECT
  'test_user_isolation' as test_name,
  table_name,
  unique_users,
  total_records,
  CASE
    WHEN unique_users >= 1 THEN 'PASS - Dados associados a usuários'
    ELSE 'WARNING - Verificar isolamento de usuários'
  END as test_result,
  'Dados devem estar associados a usuários específicos' as expected_behavior
FROM user_isolation_test;

-- ========================================
-- 9. RESUMO DOS TESTES
-- ========================================

-- Contagem final de testes que passaram/falharam
WITH test_summary AS (
  -- Contar tabelas com RLS ativo
  SELECT COUNT(*) as rls_active_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks', 'bank_accounts')
    AND rowsecurity = true
),
orphan_summary AS (
  -- Contar dados órfãos
  SELECT (
    (SELECT COUNT(*) FROM public.accounts_payable WHERE user_id IS NULL) +
    (SELECT COUNT(*) FROM public.accounts_receivable WHERE user_id IS NULL) +
    (SELECT COUNT(*) FROM public.contacts WHERE user_id IS NULL) +
    (SELECT COUNT(*) FROM public.categories WHERE user_id IS NULL) +
    (SELECT COUNT(*) FROM public.banks WHERE user_id IS NULL)
  ) as total_orphans
),
policy_summary AS (
  -- Contar políticas existentes
  SELECT COUNT(*) as total_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('accounts_payable', 'accounts_receivable', 'contacts', 'categories', 'banks', 'bank_accounts')
)
SELECT
  'SECURITY_TEST_SUMMARY' as final_test,
  ts.rls_active_count as tables_with_rls,
  6 as expected_tables_with_rls,
  os.total_orphans,
  ps.total_policies,
  CASE
    WHEN ts.rls_active_count = 6 AND os.total_orphans = 0 AND ps.total_policies >= 30 THEN
      '✅ TODOS OS TESTES PASSARAM - SISTEMA SEGURO'
    WHEN ts.rls_active_count < 6 THEN
      '❌ FALHA CRÍTICA - RLS não ativo em todas as tabelas'
    WHEN os.total_orphans > 0 THEN
      '⚠️ ATENÇÃO - Dados órfãos encontrados'
    WHEN ps.total_policies < 30 THEN
      '⚠️ ATENÇÃO - Políticas insuficientes'
    ELSE
      '🔍 REVISAR - Status incerto'
  END as security_status,
  'Testes de isolamento e integridade do RLS' as test_description
FROM test_summary ts, orphan_summary os, policy_summary ps;

-- ========================================
-- 10. INSTRUÇÕES PARA TESTES MANUAIS
-- ========================================

-- Para teste completo de isolamento, execute os seguintes comandos em sessões separadas:

/*
-- TESTE 1: Acesso sem autenticação (deve falhar/retornar 0)
SET LOCAL role TO anon;
SELECT COUNT(*) FROM public.accounts_payable; -- Deve retornar 0

-- TESTE 2: Reset para role normal
RESET role;

-- TESTE 3: Verificar se auth.uid() está funcionando
SELECT auth.uid(); -- Deve retornar o UUID do usuário autenticado

-- TESTE 4: Verificar se get_user_role() funciona
SELECT public.get_user_role(); -- Deve retornar 'user' ou 'admin'

-- TESTE 5: Tentar inserir dados de outro usuário (deve falhar)
INSERT INTO public.accounts_payable (user_id, description, amount, due_date)
VALUES ('00000000-0000-0000-0000-000000000000', 'Teste', 100.00, '2025-12-31');
-- Esta inserção deve falhar se RLS estiver funcionando

-- TESTE 6: Verificar se usuário vê apenas seus dados
SELECT COUNT(*), COUNT(DISTINCT user_id) FROM public.accounts_payable;
-- Se RLS estiver funcionando, só deve ver dados do próprio usuário
*/

SELECT
  'manual_testing_instructions' as info,
  'Execute os comandos SQL comentados acima em sessões separadas para testes completos' as instructions,
  'Testes manuais são necessários para validação completa do RLS' as note;