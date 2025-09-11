-- FASE 1: Configuração Base + Schema Fixes (SEGURA)
-- Migração criada em 2025-01-09

-- ============================================================================
-- TAREFA 1: Adicionar soft delete com IF NOT EXISTS
-- ============================================================================

DO $$
BEGIN
  -- Adicionar colunas deleted_at se não existirem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts_payable' AND column_name='deleted_at') THEN
    ALTER TABLE accounts_payable ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts_receivable' AND column_name='deleted_at') THEN
    ALTER TABLE accounts_receivable ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='deleted_at') THEN
    ALTER TABLE suppliers ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='deleted_at') THEN
    ALTER TABLE categories ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='banks' AND column_name='deleted_at') THEN
    ALTER TABLE banks ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bank_accounts' AND column_name='deleted_at') THEN
    ALTER TABLE bank_accounts ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='deleted_at') THEN
    ALTER TABLE transactions ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='deleted_at') THEN
    ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='deleted_at') THEN
    ALTER TABLE settings ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='deleted_at') THEN
    ALTER TABLE subscriptions ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='deleted_at') THEN
    ALTER TABLE notifications ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='deleted_at') THEN
    ALTER TABLE audit_logs ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

-- ============================================================================
-- TAREFA 2: Criar tabela contacts (substitui suppliers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('customer', 'supplier', 'both', 'other')),
  document_type TEXT CHECK (document_type IN ('cpf', 'cnpj', 'other')),
  document TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TAREFA 3: Alterar tabelas de relacionamento
-- ============================================================================

DO $$
BEGIN
  -- Adicionar contact_id se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts_payable' AND column_name='contact_id') THEN
    ALTER TABLE accounts_payable ADD COLUMN contact_id UUID REFERENCES contacts(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts_receivable' AND column_name='contact_id') THEN
    ALTER TABLE accounts_receivable ADD COLUMN contact_id UUID REFERENCES contacts(id);
  END IF;
END $$;

-- ============================================================================
-- TAREFA 4: RLS Policies para contacts
-- ============================================================================

-- Habilitar RLS na tabela contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Políticas para contacts
DROP POLICY IF EXISTS "Users can view own active contacts" ON contacts;
CREATE POLICY "Users can view own active contacts" 
ON contacts 
FOR SELECT 
USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert own contacts" ON contacts;
CREATE POLICY "Users can insert own contacts" 
ON contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
CREATE POLICY "Users can update own contacts" 
ON contacts 
FOR UPDATE 
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all contacts" ON contacts;
CREATE POLICY "Admins can view all contacts" 
ON contacts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() AND p.role = 'admin'
));

DROP POLICY IF EXISTS "Admins can update all contacts" ON contacts;
CREATE POLICY "Admins can update all contacts" 
ON contacts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() AND p.role = 'admin'
));

-- ============================================================================
-- TAREFA 5: Criar views para dados ativos
-- ============================================================================

CREATE OR REPLACE VIEW active_contacts AS
SELECT * FROM contacts WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_accounts_payable AS
SELECT * FROM accounts_payable WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_accounts_receivable AS
SELECT * FROM accounts_receivable WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_suppliers AS
SELECT * FROM suppliers WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_categories AS
SELECT * FROM categories WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_banks AS
SELECT * FROM banks WHERE deleted_at IS NULL;

-- ============================================================================
-- TAREFA 6: Funções auxiliares para soft delete
-- ============================================================================

CREATE OR REPLACE FUNCTION soft_delete_record(
  p_table_name TEXT,
  p_record_id UUID,
  p_user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_text TEXT;
  affected_rows INTEGER;
BEGIN
  IF p_table_name IS NULL OR p_record_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Parâmetros obrigatórios não fornecidos';
  END IF;
  
  query_text := FORMAT(
    'UPDATE %I SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    p_table_name
  );
  
  EXECUTE query_text USING p_record_id, p_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN affected_rows > 0;
END;
$$;

CREATE OR REPLACE FUNCTION restore_deleted_record(
  p_table_name TEXT,
  p_record_id UUID,
  p_user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_text TEXT;
  affected_rows INTEGER;
BEGIN
  IF p_table_name IS NULL OR p_record_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Parâmetros obrigatórios não fornecidos';
  END IF;
  
  query_text := FORMAT(
    'UPDATE %I SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
    p_table_name
  );
  
  EXECUTE query_text USING p_record_id, p_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN affected_rows > 0;
END;
$$;