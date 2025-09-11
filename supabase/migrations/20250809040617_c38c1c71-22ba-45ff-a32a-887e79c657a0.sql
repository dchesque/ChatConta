-- Corrigir políticas restantes que ainda causam recursão infinita
-- Principalmente na tabela notifications

-- Remover políticas problemáticas de notifications
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;

-- Recriar políticas de notifications usando a função security definer
CREATE POLICY "Admins can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can view all notifications" ON public.notifications
FOR SELECT USING (public.get_user_role() = 'admin');

-- Verificar se há outras políticas problemáticas em outras tabelas
-- Remover e recriar políticas de accounts_receivable 
DROP POLICY IF EXISTS "Admins can view all accounts receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Admins can update all accounts receivable" ON public.accounts_receivable;

CREATE POLICY "Admins can view all accounts receivable" ON public.accounts_receivable
FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all accounts receivable" ON public.accounts_receivable
FOR UPDATE USING (public.get_user_role() = 'admin');

-- Remover e recriar políticas de transactions se existirem
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON public.transactions;

CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all transactions" ON public.transactions
FOR UPDATE USING (public.get_user_role() = 'admin');

-- Remover e recriar políticas de bank_accounts
DROP POLICY IF EXISTS "Admins can view all bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Admins can update all bank accounts" ON public.bank_accounts;

CREATE POLICY "Admins can view all bank accounts" ON public.bank_accounts
FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all bank accounts" ON public.bank_accounts
FOR UPDATE USING (public.get_user_role() = 'admin');

-- Remover e recriar políticas de audit_logs
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
FOR SELECT USING (public.get_user_role() = 'admin');

-- Remover e recriar políticas de settings
DROP POLICY IF EXISTS "Admins can view all settings" ON public.settings;

CREATE POLICY "Admins can view all settings" ON public.settings
FOR SELECT USING (public.get_user_role() = 'admin');

-- Remover e recriar políticas de subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscriptions;

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
FOR UPDATE USING (public.get_user_role() = 'admin');