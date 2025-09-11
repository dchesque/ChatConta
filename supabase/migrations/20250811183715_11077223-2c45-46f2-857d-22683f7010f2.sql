-- CRITICAL SECURITY FIXES - Remove SECURITY DEFINER from views and secure functions

-- Drop existing views with SECURITY DEFINER
DROP VIEW IF EXISTS public.active_accounts_payable;
DROP VIEW IF EXISTS public.active_accounts_receivable;
DROP VIEW IF EXISTS public.active_suppliers;
DROP VIEW IF EXISTS public.active_categories;
DROP VIEW IF EXISTS public.active_banks;
DROP VIEW IF EXISTS public.active_contacts;
DROP VIEW IF EXISTS public.user_summary_stats;

-- Recreate views WITHOUT SECURITY DEFINER - they will respect RLS
CREATE VIEW public.active_accounts_payable AS
SELECT * FROM public.accounts_payable
WHERE deleted_at IS NULL;

CREATE VIEW public.active_accounts_receivable AS
SELECT * FROM public.accounts_receivable
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

CREATE VIEW public.active_contacts AS
SELECT * FROM public.contacts
WHERE deleted_at IS NULL;

-- User summary stats view (respects RLS)
CREATE VIEW public.user_summary_stats AS
SELECT 
  user_id,
  (SELECT COUNT(*) FROM public.accounts_payable WHERE user_id = p.user_id AND deleted_at IS NULL) as total_accounts_payable,
  (SELECT COUNT(*) FROM public.accounts_receivable WHERE user_id = p.user_id AND deleted_at IS NULL) as total_accounts_receivable,
  (SELECT COUNT(*) FROM public.suppliers WHERE user_id = p.user_id AND deleted_at IS NULL) as total_suppliers,
  (SELECT COUNT(*) FROM public.categories WHERE user_id = p.user_id AND deleted_at IS NULL) as total_categories
FROM public.profiles p;

-- Add SET search_path = '' to all existing functions for SQL injection protection
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  result public.profiles;
BEGIN
  SELECT * INTO result 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_feature_limit(_user_id uuid, _feature text, _current_count integer)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT 
    CASE 
      WHEN (features_limit->_feature)::integer = -1 THEN TRUE
      ELSE _current_count < (features_limit->_feature)::integer
    END
  FROM public.profiles
  WHERE user_id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    phone,
    name,
    plan,
    trial_ends_at,
    features_limit,
    phone_verified,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'trial',
    NOW() + INTERVAL '14 days',
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN '{
        "contas_pagar": -1,
        "fornecedores": -1,
        "categorias": -1,
        "relatorios": true,
        "exportacao": true,
        "backup": true
      }'::jsonb
      ELSE '{
        "contas_pagar": 50,
        "fornecedores": 20,
        "categorias": 10,
        "relatorios": true,
        "exportacao": false,
        "backup": false
      }'::jsonb
    END,
    FALSE,
    FALSE
  );
  RETURN NEW;
END;
$function$;

-- Add audit trail for profile changes (already exists but ensuring it's secured)
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- Create trigger for profile changes audit
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();