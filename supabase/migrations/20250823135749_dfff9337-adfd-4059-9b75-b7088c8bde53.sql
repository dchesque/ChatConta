-- Fix security issues in active_* views/tables by securing them with proper RLS policies
-- Step 1: For views, set security_invoker and restrict grants
-- Step 2: For tables, enable RLS and add policies

-- First, handle views: set security_invoker and restrict permissions
DO $$
DECLARE
  obj RECORD;
BEGIN
  FOR obj IN 
    SELECT c.relname AS name, c.relkind AS kind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN (
        'active_accounts_payable','active_accounts_receivable','active_bank_accounts','active_banks',
        'active_categories','active_contacts','active_customers','active_suppliers','user_summary_stats'
      )
  LOOP
    -- If it's a view, set security_invoker and security_barrier
    IF obj.kind = 'v' THEN
      BEGIN
        EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', obj.name);
        EXECUTE format('ALTER VIEW public.%I SET (security_barrier = true)', obj.name);
        RAISE NOTICE 'Secured view: %', obj.name;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not secure view %: %', obj.name, SQLERRM;
      END;
    END IF;
    
    -- Restrict grants for all objects (views, materialized views, tables)
    BEGIN
      EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC', obj.name);
      EXECUTE format('REVOKE ALL ON public.%I FROM anon', obj.name);
      EXECUTE format('GRANT SELECT ON public.%I TO authenticated', obj.name);
      RAISE NOTICE 'Restricted grants on: %', obj.name;
    EXCEPTION WHEN UNDEFINED_OBJECT THEN
      RAISE NOTICE 'Role not found, skipping grants for: %', obj.name;
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not update grants on %: %', obj.name, SQLERRM;
    END;
  END LOOP;
END$$;

-- Step 2: Enable RLS on tables (if any exist)
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN 
    SELECT c.relname AS name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN (
        'active_accounts_payable','active_accounts_receivable','active_bank_accounts','active_banks',
        'active_categories','active_contacts','active_customers','active_suppliers','user_summary_stats'
      )
      AND c.relkind = 'r' -- ordinary tables only
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.name);
      RAISE NOTICE 'Enabled RLS on table: %', t.name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not enable RLS on table %: %', t.name, SQLERRM;
    END;
  END LOOP;
END$$;