-- ========================================
-- CONFIGURAÇÃO DE RLS (ROW LEVEL SECURITY)
-- ========================================
-- Este script configura políticas de segurança para garantir
-- que cada usuário veja apenas seus próprios dados

-- ========================================
-- 1. ATIVAR RLS EM TODAS AS TABELAS
-- ========================================

-- Ativar RLS para contas a pagar
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;

-- Ativar RLS para contas a receber
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;

-- Ativar RLS para contatos
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Ativar RLS para categorias
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Ativar RLS para bancos
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

-- Ativar RLS para contas bancárias
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. POLÍTICAS PARA ACCOUNTS_PAYABLE
-- ========================================

-- Criar política para SELECT (leitura)
CREATE POLICY "Users can view their own accounts payable"
ON accounts_payable FOR SELECT
USING (auth.uid() = user_id);

-- Criar política para INSERT (criação)
CREATE POLICY "Users can insert their own accounts payable"
ON accounts_payable FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar política para UPDATE (atualização)
CREATE POLICY "Users can update their own accounts payable"
ON accounts_payable FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar política para DELETE (exclusão)
CREATE POLICY "Users can delete their own accounts payable"
ON accounts_payable FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 3. POLÍTICAS PARA ACCOUNTS_RECEIVABLE
-- ========================================

-- Criar política para SELECT (leitura)
CREATE POLICY "Users can view their own accounts receivable"
ON accounts_receivable FOR SELECT
USING (auth.uid() = user_id);

-- Criar política para INSERT (criação)
CREATE POLICY "Users can insert their own accounts receivable"
ON accounts_receivable FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar política para UPDATE (atualização)
CREATE POLICY "Users can update their own accounts receivable"
ON accounts_receivable FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar política para DELETE (exclusão)
CREATE POLICY "Users can delete their own accounts receivable"
ON accounts_receivable FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 4. POLÍTICAS PARA CONTACTS
-- ========================================

-- Criar política para SELECT (leitura)
CREATE POLICY "Users can view their own contacts"
ON contacts FOR SELECT
USING (auth.uid() = user_id);

-- Criar política para INSERT (criação)
CREATE POLICY "Users can insert their own contacts"
ON contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar política para UPDATE (atualização)
CREATE POLICY "Users can update their own contacts"
ON contacts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar política para DELETE (exclusão)
CREATE POLICY "Users can delete their own contacts"
ON contacts FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 5. POLÍTICAS PARA CATEGORIES
-- ========================================

-- Criar política para SELECT (leitura)
CREATE POLICY "Users can view their own categories"
ON categories FOR SELECT
USING (auth.uid() = user_id);

-- Criar política para INSERT (criação)
CREATE POLICY "Users can insert their own categories"
ON categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar política para UPDATE (atualização)
CREATE POLICY "Users can update their own categories"
ON categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar política para DELETE (exclusão)
CREATE POLICY "Users can delete their own categories"
ON categories FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 6. POLÍTICAS PARA BANKS
-- ========================================

-- Criar política para SELECT (leitura)
CREATE POLICY "Users can view their own banks"
ON banks FOR SELECT
USING (auth.uid() = user_id);

-- Criar política para INSERT (criação)
CREATE POLICY "Users can insert their own banks"
ON banks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar política para UPDATE (atualização)
CREATE POLICY "Users can update their own banks"
ON banks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar política para DELETE (exclusão)
CREATE POLICY "Users can delete their own banks"
ON banks FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- 7. POLÍTICAS PARA BANK_ACCOUNTS
-- ========================================

-- Política mais complexa: verifica se a conta bancária pertence a um banco do usuário
CREATE POLICY "Users can view their own bank accounts"
ON bank_accounts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
);

-- Criar política para INSERT (criação)
CREATE POLICY "Users can insert bank accounts for their own banks"
ON bank_accounts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
);

-- Criar política para UPDATE (atualização)
CREATE POLICY "Users can update their own bank accounts"
ON bank_accounts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
);

-- Criar política para DELETE (exclusão)
CREATE POLICY "Users can delete their own bank accounts"
ON bank_accounts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM banks
    WHERE banks.id = bank_accounts.bank_id
    AND banks.user_id = auth.uid()
  )
);

-- ========================================
-- 8. VERIFICAÇÃO DE CONFIGURAÇÃO
-- ========================================

-- Verificar se RLS está ativado em todas as tabelas
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'accounts_payable',
    'accounts_receivable',
    'contacts',
    'categories',
    'banks',
    'bank_accounts'
  );

-- Verificar políticas criadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'accounts_payable',
    'accounts_receivable',
    'contacts',
    'categories',
    'banks',
    'bank_accounts'
  )
ORDER BY tablename, cmd;

-- ========================================
-- 9. COMANDOS PARA REMOVER POLÍTICAS (SE NECESSÁRIO)
-- ========================================
/*
-- Use estes comandos apenas se precisar remover as políticas

-- Accounts Payable
DROP POLICY IF EXISTS "Users can view their own accounts payable" ON accounts_payable;
DROP POLICY IF EXISTS "Users can insert their own accounts payable" ON accounts_payable;
DROP POLICY IF EXISTS "Users can update their own accounts payable" ON accounts_payable;
DROP POLICY IF EXISTS "Users can delete their own accounts payable" ON accounts_payable;

-- Accounts Receivable
DROP POLICY IF EXISTS "Users can view their own accounts receivable" ON accounts_receivable;
DROP POLICY IF EXISTS "Users can insert their own accounts receivable" ON accounts_receivable;
DROP POLICY IF EXISTS "Users can update their own accounts receivable" ON accounts_receivable;
DROP POLICY IF EXISTS "Users can delete their own accounts receivable" ON accounts_receivable;

-- Contacts
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;

-- Categories
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

-- Banks
DROP POLICY IF EXISTS "Users can view their own banks" ON banks;
DROP POLICY IF EXISTS "Users can insert their own banks" ON banks;
DROP POLICY IF EXISTS "Users can update their own banks" ON banks;
DROP POLICY IF EXISTS "Users can delete their own banks" ON banks;

-- Bank Accounts
DROP POLICY IF EXISTS "Users can view their own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can insert bank accounts for their own banks" ON bank_accounts;
DROP POLICY IF EXISTS "Users can update their own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Users can delete their own bank accounts" ON bank_accounts;
*/