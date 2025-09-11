-- CRITICAL SECURITY FIXES - CORRECTED

-- 1. Fix Privilege Escalation: Prevent users from changing their own role
-- Drop existing permissive policy
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Restricted policy for user profile updates (excluding role changes)
CREATE POLICY "Users can update own profile data" ON profiles
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow updates if role hasn't changed
    (SELECT role FROM profiles WHERE user_id = auth.uid()) = role
  )
);

-- Admin-only policy for role management
CREATE POLICY "Only admins can manage user roles" ON profiles
FOR UPDATE 
USING (get_user_role() = 'admin'::app_role)
WITH CHECK (get_user_role() = 'admin'::app_role);

-- 2. Secure Database Views: Remove SECURITY DEFINER and add proper RLS
-- Replace active views with RLS-aware versions

-- Drop and recreate active_accounts_payable view
DROP VIEW IF EXISTS active_accounts_payable;
CREATE VIEW active_accounts_payable AS
SELECT * FROM accounts_payable 
WHERE deleted_at IS NULL
AND (auth.uid() = user_id OR get_user_role() = 'admin'::app_role);

-- Drop and recreate active_accounts_receivable view  
DROP VIEW IF EXISTS active_accounts_receivable;
CREATE VIEW active_accounts_receivable AS
SELECT * FROM accounts_receivable 
WHERE deleted_at IS NULL
AND (auth.uid() = user_id OR get_user_role() = 'admin'::app_role);

-- Drop and recreate active_banks view
DROP VIEW IF EXISTS active_banks;
CREATE VIEW active_banks AS
SELECT * FROM banks 
WHERE deleted_at IS NULL
AND (auth.uid() = user_id OR get_user_role() = 'admin'::app_role);

-- Drop and recreate active_categories view
DROP VIEW IF EXISTS active_categories;
CREATE VIEW active_categories AS
SELECT * FROM categories 
WHERE deleted_at IS NULL
AND (auth.uid() = user_id OR is_system = true OR get_user_role() = 'admin'::app_role);

-- Drop and recreate active_contacts view
DROP VIEW IF EXISTS active_contacts;
CREATE VIEW active_contacts AS
SELECT * FROM contacts 
WHERE deleted_at IS NULL
AND (auth.uid() = user_id OR get_user_role() = 'admin'::app_role);

-- Drop and recreate active_customers view
DROP VIEW IF EXISTS active_customers;
CREATE VIEW active_customers AS
SELECT * FROM customers 
WHERE deleted_at IS NULL
AND (auth.uid() = user_id OR get_user_role() = 'admin'::app_role);

-- 3. Add audit triggers for sensitive operations
CREATE OR REPLACE FUNCTION audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO audit_logs (
      user_id, action, table_name, record_id,
      old_data, new_data, metadata
    ) VALUES (
      auth.uid(), 'role_change', 'profiles', NEW.id::text,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role),
      jsonb_build_object(
        'changed_by', auth.uid(),
        'timestamp', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_profile_role_changes ON profiles;
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_role_changes();