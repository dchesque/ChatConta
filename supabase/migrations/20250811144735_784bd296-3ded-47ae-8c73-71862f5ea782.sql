-- 1. Corrigir Foreign Key quebrada na tabela customers
-- Drop existing broken constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_user_id_fkey;

-- Add correct constraint referencing profiles.user_id
ALTER TABLE customers 
ADD CONSTRAINT customers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- 2. Criar índices de performance para melhorar queries críticas
-- Índice composto para queries de dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_dashboard 
ON accounts_payable(user_id, status, due_date) 
WHERE deleted_at IS NULL;

-- Índice para busca de contatos por tipo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_type_search 
ON contacts(user_id, type, name) 
WHERE deleted_at IS NULL;

-- Índice para queries de relatórios mensais
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_monthly 
ON transactions(user_id, date, type) 
WHERE deleted_at IS NULL;

-- 3. Melhorar policies RLS para categorias
-- Drop policy permissiva atual
DROP POLICY IF EXISTS "Users can delete categories" ON categories;

-- Policy específica para categorias pessoais
CREATE POLICY "Users can delete own categories" ON categories
FOR DELETE USING (
  auth.uid() = user_id 
  AND (is_system = false OR is_system IS NULL)
);

-- Policy separada para admins com system categories
CREATE POLICY "Admins can manage system categories" ON categories
FOR ALL USING (
  get_user_role() = 'admin'::app_role 
  AND is_system = true
);