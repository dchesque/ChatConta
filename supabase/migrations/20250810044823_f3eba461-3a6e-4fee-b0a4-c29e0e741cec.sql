-- Migração para remover supplier_id e consolidar sistema de contacts/categories

-- 1. Remover supplier_id da tabela accounts_payable se ainda existir
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts_payable' 
        AND column_name = 'supplier_id'
    ) THEN
        ALTER TABLE accounts_payable DROP COLUMN supplier_id;
    END IF;
END $$;

-- 2. Garantir que contact_id existe em accounts_payable
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts_payable' 
        AND column_name = 'contact_id'
    ) THEN
        ALTER TABLE accounts_payable ADD COLUMN contact_id uuid;
    END IF;
END $$;

-- 3. Remover supplier_id da tabela accounts_receivable se ainda existir
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts_receivable' 
        AND column_name = 'supplier_id'
    ) THEN
        ALTER TABLE accounts_receivable DROP COLUMN supplier_id;
    END IF;
END $$;

-- 4. Criar tabela suppliers se não existir (para compatibilidade durante migração)
CREATE TABLE IF NOT EXISTS suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    document text,
    document_type text DEFAULT 'other',
    type text DEFAULT 'company',
    email text,
    phone text,
    address text,
    city text,
    state text,
    zip text,
    notes text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

-- 5. Habilitar RLS na tabela suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para suppliers
DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admins can view all suppliers" ON suppliers;

CREATE POLICY "Users can view own suppliers" ON suppliers
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own suppliers" ON suppliers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers" ON suppliers
    FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers" ON suppliers
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all suppliers" ON suppliers
    FOR SELECT USING (get_user_role() = 'admin'::app_role);

-- 7. Trigger para updated_at na tabela suppliers
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();