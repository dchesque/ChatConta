-- SECURITY FIX: Remove SECURITY DEFINER from views and replace with RLS-aware views
-- This prevents privilege escalation and ensures proper row-level security

-- Drop existing security definer views that bypass RLS
DROP VIEW IF EXISTS public.active_accounts_payable;
DROP VIEW IF EXISTS public.active_suppliers;
DROP VIEW IF EXISTS public.active_categories;
DROP VIEW IF EXISTS public.active_banks;
DROP VIEW IF EXISTS public.active_bank_accounts;

-- Create new RLS-aware views that respect user permissions (without ativo column where it doesn't exist)
CREATE VIEW public.active_accounts_payable AS
SELECT * FROM public.accounts_payable 
WHERE deleted_at IS NULL;

CREATE VIEW public.active_suppliers AS  
SELECT * FROM public.suppliers
WHERE deleted_at IS NULL;

CREATE VIEW public.active_categories AS
SELECT * FROM public.categories
WHERE deleted_at IS NULL;

CREATE VIEW public.active_banks AS
SELECT * FROM public.banks
WHERE deleted_at IS NULL;

CREATE VIEW public.active_bank_accounts AS
SELECT * FROM public.bank_accounts
WHERE deleted_at IS NULL;

-- Add search_path security to existing functions to prevent SQL injection
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Add audit trail for sensitive profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (
      user_id, action, table_name, record_id,
      old_data, new_data, metadata
    ) VALUES (
      COALESCE(auth.uid(), OLD.user_id), 'role_change', 'profiles', NEW.id::text,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role),
      jsonb_build_object(
        'changed_by', auth.uid(),
        'target_user', NEW.user_id,
        'timestamp', NOW()
      )
    );
  END IF;
  
  -- Log plan changes
  IF OLD.plan IS DISTINCT FROM NEW.plan THEN
    INSERT INTO public.audit_logs (
      user_id, action, table_name, record_id,
      old_data, new_data, metadata
    ) VALUES (
      COALESCE(auth.uid(), OLD.user_id), 'plan_change', 'profiles', NEW.id::text,
      jsonb_build_object('plan', OLD.plan),
      jsonb_build_object('plan', NEW.plan),
      jsonb_build_object(
        'changed_by', auth.uid(),
        'target_user', NEW.user_id,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for audit trail
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();