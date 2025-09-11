-- FASE 1: Schema Fixes + Soft Delete + Contacts System (Corrigido)
-- Migration: 20250109_phase1_schema_fixes_v2.sql

-- 1. Adicionar soft delete em todas as tabelas existentes
ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE accounts_receivable ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE banks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Criar índices parciais para performance (apenas registros ativos)
CREATE INDEX IF NOT EXISTS idx_accounts_payable_active ON accounts_payable(user_id, due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_active ON accounts_receivable(user_id, due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_banks_active ON banks(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_active ON transactions(user_id, date) WHERE deleted_at IS NULL;

-- 3. Criar tabela contacts unificada
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
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
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Adicionar colunas de relacionamento com contacts
ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE accounts_receivable ADD COLUMN IF NOT EXISTS contact_id UUID;

-- 5. Criar RLS policies para contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own active contacts" ON contacts;
CREATE POLICY "Users can view own active contacts" ON contacts
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert own contacts" ON contacts;
CREATE POLICY "Users can insert own contacts" ON contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
CREATE POLICY "Users can update own contacts" ON contacts
    FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os contatos
DROP POLICY IF EXISTS "Admins can view all contacts" ON contacts;
CREATE POLICY "Admins can view all contacts" ON contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all contacts" ON contacts;
CREATE POLICY "Admins can update all contacts" ON contacts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() AND p.role = 'admin'
        )
    );

-- 6. Criar views para dados ativos (sem soft delete)
CREATE OR REPLACE VIEW active_contacts AS
    SELECT * FROM contacts WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_accounts_payable AS
    SELECT * FROM accounts_payable WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_accounts_receivable AS
    SELECT * FROM accounts_receivable WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_banks AS
    SELECT * FROM banks WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_categories AS
    SELECT * FROM categories WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_suppliers AS
    SELECT * FROM suppliers WHERE deleted_at IS NULL;

-- 7. Criar trigger para updated_at em contacts
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Criar índices para contacts
CREATE INDEX IF NOT EXISTS idx_contacts_user_active ON contacts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_document ON contacts(document) WHERE deleted_at IS NULL AND document IS NOT NULL;