-- Secure active_* and user_summary_stats views/tables without breaking functionality
-- 1) For views: enforce SECURITY INVOKER and SECURITY BARRIER + restrict GRANTS
-- 2) For tables: enable RLS and add safe SELECT policies

-- Helper: apply security_invoker/barrier and grants to views if they exist
DO $$
DECLARE
  obj RECORD;
  objs TEXT[] := ARRAY[
    'active_accounts_payable',
    'active_accounts_receivable',
    'active_bank_accounts',
    'active_banks',
    'active_categories',
    'active_contacts',
    'active_customers',
    'active_suppliers',
    'user_summary_stats'
  ];
BEGIN
  FOR obj IN 
    SELECT n.nspname AS schema, c.relname AS name, c.relkind AS kind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = ANY(objs)
  LOOP
    -- If regular VIEW (relkind = 'v'), enforce invoker and barrier
    IF obj.kind = 'v' THEN
      BEGIN
        EXECUTE format('ALTER VIEW %I.%I SET (security_invoker = true)', obj.schema, obj.name);
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipping security_invoker on view % due to: %', obj.name, SQLERRM;
      END;
      BEGIN
        EXECUTE format('ALTER VIEW %I.%I SET (security_barrier = true)', obj.schema, obj.name);
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipping security_barrier on view % due to: %', obj.name, SQLERRM;
      END;
      -- Tighten grants (expose only to authenticated role)
      BEGIN
        EXECUTE format('REVOKE ALL ON %I.%I FROM PUBLIC', obj.schema, obj.name);
        EXECUTE format('REVOKE ALL ON %I.%I FROM anon', obj.schema, obj.name);
        EXECUTE format('REVOKE ALL ON %I.%I FROM authenticated', obj.schema, obj.name);
        EXECUTE format('GRANT SELECT ON %I.%I TO authenticated', obj.schema, obj.name);
      EXCEPTION WHEN UNDEFINED_OBJECT THEN
        RAISE NOTICE 'Role does not exist, skipping some GRANT/REVOKE steps';
      WHEN OTHERS THEN
        RAISE NOTICE 'Skipping grants update on % due to: %', obj.name, SQLERRM;
      END;
    ELSIF obj.kind = 'm' THEN
      -- Materialized view: cannot set security_invoker; restrict grants only
      BEGIN
        EXECUTE format('REVOKE ALL ON %I.%I FROM PUBLIC', obj.schema, obj.name);
        EXECUTE format('REVOKE ALL ON %I.%I FROM anon', obj.schema, obj.name);
        EXECUTE format('REVOKE ALL ON %I.%I FROM authenticated', obj.schema, obj.name);
        EXECUTE format('GRANT SELECT ON %I.%I TO authenticated', obj.schema, obj.name);
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipping grants update on materialized view % due to: %', obj.name, SQLERRM;
      END;
    END IF;
  END LOOP;
END$$;

-- Enable RLS on tables if any of the above objects are actual tables and add strict SELECT policies
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
      AND c.relkind = 'r' -- ordinary tables
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.name);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not enable RLS on table %: %', t.name, SQLERRM;
    END;
  END LOOP;
END$$;

-- Add per-table policies if they are tables (guarded with IF NOT EXISTS pattern via exception handling)
-- active_accounts_payable: user rows or admin
DO $$
BEGIN
  IF to_regclass('public.active_accounts_payable') IS NOT NULL AND (
    SELECT relkind FROM pg_class WHERE oid = to_regclass('public.active_accounts_payable')) = 'r' THEN
    BEGIN EXECUTE $$
      CREATE POLICY "Users can view own active_accounts_payable" ON public.active_accounts_payable
      FOR SELECT USING (auth.uid() = user_id)
    $$; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN EXECUTE $$
      CREATE POLICY "Admins can view all active_accounts_payable" ON public.active_accounts_payable
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$; EXCEPTION WHEN duplicate_object THEN END;
  END IF;
END$$;

-- active_accounts_receivable
DO $$
BEGIN
  IF to_regclass('public.active_accounts_receivable') IS NOT NULL AND (
    SELECT relkind FROM pg_class WHERE oid = to_regclass('public.active_accounts_receivable')) = 'r' THEN
    BEGIN EXECUTE $$
      CREATE POLICY "Users can view own active_accounts_receivable" ON public.active_accounts_receivable
      FOR SELECT USING (auth.uid() = user_id)
    $$; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN EXECUTE $$
      CREATE POLICY "Admins can view all active_accounts_receivable" ON public.active_accounts_receivable
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$; EXCEPTION WHEN duplicate_object THEN END;
  END IF;
END$$;

-- active_banks
DO $$
BEGIN
  IF to_regclass('public.active_banks') IS NOT NULL AND (
    SELECT relkind FROM pg_class WHERE oid = to_regclass('public.active_banks')) = 'r' THEN
    BEGIN EXECUTE $$
      CREATE POLICY "Users can view own active_banks" ON public.active_banks
      FOR SELECT USING (auth.uid() = user_id)
    $$; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN EXECUTE $$
      CREATE POLICY "Admins can view all active_banks" ON public.active_banks
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$; EXCEPTION WHEN duplicate_object THEN END;
  END IF;
END$$;

-- active_bank_accounts (no user_id, enforce via parent bank ownership)
DO $$
BEGIN
  IF to_regclass('public.active_bank_accounts') IS NOT NULL AND (
    SELECT relkind FROM pg_class WHERE oid = to_regclass('public.active_bank_accounts')) = 'r' THEN
    BEGIN EXECUTE $$
      CREATE POLICY "Users can view own active_bank_accounts" ON public.active_bank_accounts
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.banks b
        WHERE b.id = active_bank_accounts.bank_id AND b.user_id = auth.uid()
      ))
    $$; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN EXECUTE $$
      CREATE POLICY "Admins can view all active_bank_accounts" ON public.active_bank_accounts
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$; EXCEPTION WHEN duplicate_object THEN END;
  END IF;
END$$;

-- active_categories (allow system categories and own)
DO $$
BEGIN
  IF to_regclass('public.active_categories') IS NOT NULL AND (
    SELECT relkind FROM pg_class WHERE oid = to_regclass('public.active_categories')) = 'r' THEN
    BEGIN EXECUTE $$
      CREATE POLICY "Users can view active_categories" ON public.active_categories
      FOR SELECT USING ((auth.uid() = user_id) OR (is_system = true) OR (get_user_role() = 'admin'::app_role))
    $$; EXCEPTION WHEN duplicate_object THEN END;
  END IF;
END$$;

-- active_contacts
DO $$
BEGIN
  IF to_regclass('public.active_contacts') IS NOT NULL AND (
    SELECT relkind FROM pg_class WHERE oid = to_regclass('public.active_contacts')) = 'r' THEN
    BEGIN EXECUTE $$
      CREATE POLICY "Users can view own active_contacts" ON public.active_contacts
      FOR SELECT USING (auth.uid() = user_id)
    $$; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN EXECUTE $$
      CREATE POLICY "Admins can view all active_contacts" ON public.active_contacts
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$; EXCEPTION WHEN duplicate_object THEN END;
  END IF;
END$$;

-- active_customers
DO $$
BEGIN
  IF to_regclass('public.active_customers') IS NOT NULL AND (
    SELECT relkind FROM pg_class WHERE oid = to_regclass('public.active_customers')) = 'r' THEN
    BEGIN EXECUTE $$
      CREATE POLICY "Users can view own active_customers" ON public.active_customers
      FOR SELECT USING (auth.uid() = user_id)
    $$; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN EXECUTE $$
      CREATE POLICY "Admins can view all active_customers" ON public.active_customers
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$; EXCEPTION WHEN duplicate_object THEN END;
  END IF;
END$$;

-- active_suppliers
DO $$
BEGIN
  IF to_regclass('public.active_suppliers') IS NOT NULL AND (
    SELECT relkind FROM pg_class WHERE oid = to_regclass('public.active_suppliers')) = 'r' THEN
    BEGIN EXECUTE $$
      CREATE POLICY "Users can view own active_suppliers" ON public.active_suppliers
      FOR SELECT USING (auth.uid() = user_id)
    $$; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN EXECUTE $$
      CREATE POLICY "Admins can view all active_suppliers" ON public.active_suppliers
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$; EXCEPTION WHEN duplicate_object THEN END;
  END IF;
END$$;

-- user_summary_stats (often a view, but if table, enforce RLS)
DO $$
BEGIN
  IF to_regclass('public.user_summary_stats') IS NOT NULL AND (
    SELECT relkind FROM pg_class WHERE oid = to_regclass('public.user_summary_stats')) = 'r' THEN
    BEGIN EXECUTE $$
      CREATE POLICY "Users can view own user_summary_stats" ON public.user_summary_stats
      FOR SELECT USING (auth.uid() = user_id)
    $$; EXCEPTION WHEN duplicate_object THEN END;
    BEGIN EXECUTE $$
      CREATE POLICY "Admins can view all user_summary_stats" ON public.user_summary_stats
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$; EXCEPTION WHEN duplicate_object THEN END;
  END IF;
END$$;