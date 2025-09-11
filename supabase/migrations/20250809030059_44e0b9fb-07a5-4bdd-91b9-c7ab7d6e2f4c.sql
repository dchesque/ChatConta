-- FASE 1: Configuração Base + Autenticação Email + Schema Fixes (CORRIGIDO)
-- Migração criada em 2025-01-09

-- ============================================================================
-- TAREFA 1: Adicionar soft delete em TODAS as tabelas existentes
-- ============================================================================

-- 1.1) Adicionar coluna deleted_at em todas as tabelas
ALTER TABLE accounts_payable ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE accounts_receivable ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE suppliers ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE categories ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE banks ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE bank_accounts ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE settings ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE subscriptions ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE notifications ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE audit_logs ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 1.2) Criar índices parciais para performance (apenas registros ativos)
CREATE INDEX idx_accounts_payable_active ON accounts_payable (user_id, due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_receivable_active ON accounts_receivable (user_id, due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_suppliers_active ON suppliers (user_id, name) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_active ON categories (user_id, name) WHERE deleted_at IS NULL;
CREATE INDEX idx_banks_active ON banks (user_id, name) WHERE deleted_at IS NULL;
CREATE INDEX idx_bank_accounts_active ON bank_accounts (bank_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_active ON transactions (user_id, date) WHERE deleted_at IS NULL;

-- ============================================================================
-- TAREFA 2: Criar tabela contacts (substitui suppliers)
-- ============================================================================

CREATE TABLE contacts (
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

-- Índices para performance
CREATE INDEX idx_contacts_user_id ON contacts (user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_type ON contacts (user_id, type) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_document ON contacts (document) WHERE deleted_at IS NULL AND document IS NOT NULL;
CREATE INDEX idx_contacts_name ON contacts (user_id, name) WHERE deleted_at IS NULL;

-- Trigger para updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TAREFA 3: Alterar tabelas de relacionamento
-- ============================================================================

-- Adicionar contact_id nas tabelas de contas (manter compatibilidade)
ALTER TABLE accounts_payable ADD COLUMN contact_id UUID REFERENCES contacts(id);
ALTER TABLE accounts_receivable ADD COLUMN contact_id UUID REFERENCES contacts(id);

-- Índices para as novas relações
CREATE INDEX idx_accounts_payable_contact ON accounts_payable (contact_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_receivable_contact ON accounts_receivable (contact_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- TAREFA 4: RLS Policies para contacts
-- ============================================================================

-- Habilitar RLS na tabela contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT (usuários veem apenas seus contatos ativos)
CREATE POLICY "Users can view own active contacts" 
ON contacts 
FOR SELECT 
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Policy para INSERT (usuários criam apenas para si)
CREATE POLICY "Users can insert own contacts" 
ON contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy para UPDATE (usuários editam apenas seus contatos)
CREATE POLICY "Users can update own contacts" 
ON contacts 
FOR UPDATE 
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

-- Policy para DELETE (soft delete - apenas marcar deleted_at)
CREATE POLICY "Users can soft delete own contacts" 
ON contacts 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins podem ver tudo
CREATE POLICY "Admins can view all contacts" 
ON contacts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() AND p.role = 'admin'
));

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

-- View para contatos ativos
CREATE OR REPLACE VIEW active_contacts AS
SELECT * FROM contacts WHERE deleted_at IS NULL;

-- View para contas a pagar ativas
CREATE OR REPLACE VIEW active_accounts_payable AS
SELECT * FROM accounts_payable WHERE deleted_at IS NULL;

-- View para contas a receber ativas  
CREATE OR REPLACE VIEW active_accounts_receivable AS
SELECT * FROM accounts_receivable WHERE deleted_at IS NULL;

-- View para fornecedores ativos (compatibilidade)
CREATE OR REPLACE VIEW active_suppliers AS
SELECT * FROM suppliers WHERE deleted_at IS NULL;

-- View para categorias ativas
CREATE OR REPLACE VIEW active_categories AS
SELECT * FROM categories WHERE deleted_at IS NULL;

-- View para bancos ativos
CREATE OR REPLACE VIEW active_banks AS
SELECT * FROM banks WHERE deleted_at IS NULL;

-- ============================================================================
-- TAREFA 6: Funções auxiliares para soft delete
-- ============================================================================

-- Função para soft delete genérico
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
  -- Validar parâmetros
  IF p_table_name IS NULL OR p_record_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Parâmetros obrigatórios não fornecidos';
  END IF;
  
  -- Construir query segura
  query_text := FORMAT(
    'UPDATE %I SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    p_table_name
  );
  
  -- Executar soft delete
  EXECUTE query_text USING p_record_id, p_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log da operação
  INSERT INTO audit_logs (user_id, action, table_name, record_id, metadata)
  VALUES (p_user_id, 'soft_delete', p_table_name, p_record_id::TEXT, 
          jsonb_build_object('affected_rows', affected_rows));
  
  RETURN affected_rows > 0;
END;
$$;

-- Função para restaurar registro deletado
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
  -- Validar parâmetros
  IF p_table_name IS NULL OR p_record_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Parâmetros obrigatórios não fornecidos';
  END IF;
  
  -- Construir query segura
  query_text := FORMAT(
    'UPDATE %I SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
    p_table_name
  );
  
  -- Executar restore
  EXECUTE query_text USING p_record_id, p_user_id;
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log da operação
  INSERT INTO audit_logs (user_id, action, table_name, record_id, metadata)
  VALUES (p_user_id, 'restore', p_table_name, p_record_id::TEXT, 
          jsonb_build_object('affected_rows', affected_rows));
  
  RETURN affected_rows > 0;
END;
$$;