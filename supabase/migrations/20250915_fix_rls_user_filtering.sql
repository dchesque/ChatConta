-- Migration para garantir que RLS está habilitado e filtrando corretamente por usuário
-- Data: 2025-09-15
-- Descrição: Corrige o problema de dados de todos os usuários aparecendo para todos

-- Verificar e garantir que RLS está habilitado em todas as tabelas principais
ALTER TABLE IF EXISTS public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;

-- Verificar se as políticas existem e estão corretas para accounts_payable
DO $$
BEGIN
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own accounts payable" ON public.accounts_payable;
    DROP POLICY IF EXISTS "Users can insert own accounts payable" ON public.accounts_payable;
    DROP POLICY IF EXISTS "Users can update own accounts payable" ON public.accounts_payable;
    DROP POLICY IF EXISTS "Users can delete own accounts payable" ON public.accounts_payable;

    -- Recriar políticas com verificação explícita de user_id
    CREATE POLICY "Users can view own accounts payable" ON public.accounts_payable
        FOR SELECT
        USING (user_id = auth.uid());

    CREATE POLICY "Users can insert own accounts payable" ON public.accounts_payable
        FOR INSERT
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update own accounts payable" ON public.accounts_payable
        FOR UPDATE
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can delete own accounts payable" ON public.accounts_payable
        FOR DELETE
        USING (user_id = auth.uid());
END $$;

-- Verificar se as políticas existem e estão corretas para accounts_receivable
DO $$
BEGIN
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own accounts receivable" ON public.accounts_receivable;
    DROP POLICY IF EXISTS "Users can insert own accounts receivable" ON public.accounts_receivable;
    DROP POLICY IF EXISTS "Users can update own accounts receivable" ON public.accounts_receivable;
    DROP POLICY IF EXISTS "Users can delete own accounts receivable" ON public.accounts_receivable;

    -- Recriar políticas com verificação explícita de user_id
    CREATE POLICY "Users can view own accounts receivable" ON public.accounts_receivable
        FOR SELECT
        USING (user_id = auth.uid());

    CREATE POLICY "Users can insert own accounts receivable" ON public.accounts_receivable
        FOR INSERT
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update own accounts receivable" ON public.accounts_receivable
        FOR UPDATE
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can delete own accounts receivable" ON public.accounts_receivable
        FOR DELETE
        USING (user_id = auth.uid());
END $$;

-- Verificar se as políticas existem e estão corretas para transactions
DO $$
BEGIN
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

    -- Recriar políticas com verificação explícita de user_id
    CREATE POLICY "Users can view own transactions" ON public.transactions
        FOR SELECT
        USING (user_id = auth.uid());

    CREATE POLICY "Users can insert own transactions" ON public.transactions
        FOR INSERT
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update own transactions" ON public.transactions
        FOR UPDATE
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can delete own transactions" ON public.transactions
        FOR DELETE
        USING (user_id = auth.uid());
END $$;

-- Verificar se as políticas existem e estão corretas para categories
DO $$
BEGIN
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
    DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
    DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
    DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

    -- Recriar políticas com verificação explícita de user_id
    CREATE POLICY "Users can view own categories" ON public.categories
        FOR SELECT
        USING (user_id = auth.uid());

    CREATE POLICY "Users can insert own categories" ON public.categories
        FOR INSERT
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update own categories" ON public.categories
        FOR UPDATE
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can delete own categories" ON public.categories
        FOR DELETE
        USING (user_id = auth.uid());
END $$;

-- Verificar se as políticas existem e estão corretas para suppliers
DO $$
BEGIN
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own suppliers" ON public.suppliers;
    DROP POLICY IF EXISTS "Users can insert own suppliers" ON public.suppliers;
    DROP POLICY IF EXISTS "Users can update own suppliers" ON public.suppliers;
    DROP POLICY IF EXISTS "Users can delete own suppliers" ON public.suppliers;

    -- Recriar políticas com verificação explícita de user_id
    CREATE POLICY "Users can view own suppliers" ON public.suppliers
        FOR SELECT
        USING (user_id = auth.uid());

    CREATE POLICY "Users can insert own suppliers" ON public.suppliers
        FOR INSERT
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update own suppliers" ON public.suppliers
        FOR UPDATE
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can delete own suppliers" ON public.suppliers
        FOR DELETE
        USING (user_id = auth.uid());
END $$;

-- Verificar se as políticas existem e estão corretas para banks
DO $$
BEGIN
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own banks" ON public.banks;
    DROP POLICY IF EXISTS "Users can insert own banks" ON public.banks;
    DROP POLICY IF EXISTS "Users can update own banks" ON public.banks;
    DROP POLICY IF EXISTS "Users can delete own banks" ON public.banks;

    -- Recriar políticas com verificação explícita de user_id
    CREATE POLICY "Users can view own banks" ON public.banks
        FOR SELECT
        USING (user_id = auth.uid());

    CREATE POLICY "Users can insert own banks" ON public.banks
        FOR INSERT
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update own banks" ON public.banks
        FOR UPDATE
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can delete own banks" ON public.banks
        FOR DELETE
        USING (user_id = auth.uid());
END $$;

-- Verificar se as políticas existem e estão corretas para contacts
DO $$
BEGIN
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
    DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
    DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
    DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;

    -- Recriar políticas com verificação explícita de user_id
    CREATE POLICY "Users can view own contacts" ON public.contacts
        FOR SELECT
        USING (user_id = auth.uid());

    CREATE POLICY "Users can insert own contacts" ON public.contacts
        FOR INSERT
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update own contacts" ON public.contacts
        FOR UPDATE
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can delete own contacts" ON public.contacts
        FOR DELETE
        USING (user_id = auth.uid());
END $$;

-- Adicionar comentário para documentação
COMMENT ON POLICY "Users can view own accounts payable" ON public.accounts_payable IS 'Usuários só podem visualizar suas próprias contas a pagar';
COMMENT ON POLICY "Users can view own accounts receivable" ON public.accounts_receivable IS 'Usuários só podem visualizar suas próprias contas a receber';
COMMENT ON POLICY "Users can view own transactions" ON public.transactions IS 'Usuários só podem visualizar suas próprias transações';
COMMENT ON POLICY "Users can view own categories" ON public.categories IS 'Usuários só podem visualizar suas próprias categorias';
COMMENT ON POLICY "Users can view own suppliers" ON public.suppliers IS 'Usuários só podem visualizar seus próprios fornecedores';
COMMENT ON POLICY "Users can view own banks" ON public.banks IS 'Usuários só podem visualizar seus próprios bancos';
COMMENT ON POLICY "Users can view own contacts" ON public.contacts IS 'Usuários só podem visualizar seus próprios contatos';