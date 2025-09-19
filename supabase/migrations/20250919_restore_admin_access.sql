-- ========================================
-- RESTAURAÇÃO DO ACESSO ADMINISTRATIVO
-- Data: 19/09/2025
-- ========================================
-- Esta migração restaura as políticas de acesso para usuários admin
-- permitindo que vejam e gerenciem dados de todos os usuários

-- ========================================
-- 1. POLÍTICAS ADMIN PARA ACCOUNTS_PAYABLE
-- ========================================

-- Admin pode ver todas as contas a pagar
CREATE POLICY "Admins can view all accounts payable"
ON public.accounts_payable FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

-- Admin pode inserir contas para qualquer usuário
CREATE POLICY "Admins can insert all accounts payable"
ON public.accounts_payable FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode atualizar qualquer conta
CREATE POLICY "Admins can update all accounts payable"
ON public.accounts_payable FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode deletar qualquer conta
CREATE POLICY "Admins can delete all accounts payable"
ON public.accounts_payable FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- ========================================
-- 2. POLÍTICAS ADMIN PARA ACCOUNTS_RECEIVABLE
-- ========================================

-- Admin pode ver todas as contas a receber
CREATE POLICY "Admins can view all accounts receivable"
ON public.accounts_receivable FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

-- Admin pode inserir contas para qualquer usuário
CREATE POLICY "Admins can insert all accounts receivable"
ON public.accounts_receivable FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode atualizar qualquer conta
CREATE POLICY "Admins can update all accounts receivable"
ON public.accounts_receivable FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode deletar qualquer conta
CREATE POLICY "Admins can delete all accounts receivable"
ON public.accounts_receivable FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- ========================================
-- 3. POLÍTICAS ADMIN PARA CONTACTS
-- ========================================

-- Admin pode ver todos os contatos
CREATE POLICY "Admins can view all contacts"
ON public.contacts FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

-- Admin pode inserir contatos para qualquer usuário
CREATE POLICY "Admins can insert all contacts"
ON public.contacts FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode atualizar qualquer contato
CREATE POLICY "Admins can update all contacts"
ON public.contacts FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode deletar qualquer contato
CREATE POLICY "Admins can delete all contacts"
ON public.contacts FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- ========================================
-- 4. POLÍTICAS ADMIN PARA CATEGORIES
-- ========================================

-- Admin pode ver todas as categorias
CREATE POLICY "Admins can view all categories"
ON public.categories FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

-- Admin pode inserir categorias para qualquer usuário
CREATE POLICY "Admins can insert all categories"
ON public.categories FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode atualizar qualquer categoria
CREATE POLICY "Admins can update all categories"
ON public.categories FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode deletar qualquer categoria
CREATE POLICY "Admins can delete all categories"
ON public.categories FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- ========================================
-- 5. POLÍTICAS ADMIN PARA BANKS
-- ========================================

-- Admin pode ver todos os bancos
CREATE POLICY "Admins can view all banks"
ON public.banks FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

-- Admin pode inserir bancos para qualquer usuário
CREATE POLICY "Admins can insert all banks"
ON public.banks FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode atualizar qualquer banco
CREATE POLICY "Admins can update all banks"
ON public.banks FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode deletar qualquer banco
CREATE POLICY "Admins can delete all banks"
ON public.banks FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- ========================================
-- 6. POLÍTICAS ADMIN PARA BANK_ACCOUNTS
-- ========================================

-- Admin pode ver todas as contas bancárias
CREATE POLICY "Admins can view all bank accounts"
ON public.bank_accounts FOR SELECT
USING (public.get_user_role() = 'admin'::app_role);

-- Admin pode inserir contas bancárias
CREATE POLICY "Admins can insert all bank accounts"
ON public.bank_accounts FOR INSERT
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode atualizar qualquer conta bancária
CREATE POLICY "Admins can update all bank accounts"
ON public.bank_accounts FOR UPDATE
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Admin pode deletar qualquer conta bancária
CREATE POLICY "Admins can delete all bank accounts"
ON public.bank_accounts FOR DELETE
USING (public.get_user_role() = 'admin'::app_role);

-- ========================================
-- 7. POLÍTICAS ADMIN PARA TRANSACTIONS (se existir)
-- ========================================

-- Verificar se a tabela transactions existe antes de criar políticas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
        -- Admin pode ver todas as transações
        EXECUTE 'CREATE POLICY "Admins can view all transactions"
        ON public.transactions FOR SELECT
        USING (public.get_user_role() = ''admin''::app_role)';

        -- Admin pode inserir transações
        EXECUTE 'CREATE POLICY "Admins can insert all transactions"
        ON public.transactions FOR INSERT
        WITH CHECK (public.get_user_role() = ''admin''::app_role)';

        -- Admin pode atualizar transações
        EXECUTE 'CREATE POLICY "Admins can update all transactions"
        ON public.transactions FOR UPDATE
        USING (public.get_user_role() = ''admin''::app_role)
        WITH CHECK (public.get_user_role() = ''admin''::app_role)';

        -- Admin pode deletar transações
        EXECUTE 'CREATE POLICY "Admins can delete all transactions"
        ON public.transactions FOR DELETE
        USING (public.get_user_role() = ''admin''::app_role)';
    END IF;
END $$;

-- ========================================
-- 8. VERIFICAÇÃO DE POLÍTICAS ADMIN
-- ========================================

-- Verificar se as políticas foram criadas corretamente
SELECT
    tablename,
    policyname,
    cmd as operation,
    CASE
        WHEN qual LIKE '%get_user_role()%admin%' THEN 'Admin Policy'
        ELSE 'User Policy'
    END as policy_type
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'accounts_payable',
        'accounts_receivable',
        'contacts',
        'categories',
        'banks',
        'bank_accounts',
        'transactions'
    )
    AND policyname LIKE '%Admin%'
ORDER BY tablename, cmd;

-- ========================================
-- 9. LOG DA RESTAURAÇÃO
-- ========================================

INSERT INTO public.audit_logs (action, table_name, user_id, details, created_at)
VALUES (
    'admin_access_restored',
    'all_tables',
    auth.uid(),
    'Restored admin access policies for all main tables',
    NOW()
) ON CONFLICT DO NOTHING;

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Admin access policies restored successfully';
    RAISE NOTICE 'Admins can now view and manage all user data';
END $$;