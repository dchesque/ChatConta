-- Add RLS policies for tables that were identified as regular tables

-- Create policies for active_accounts_payable if it's a table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'active_accounts_payable' AND c.relkind = 'r'
  ) THEN
    -- Users can view own records
    EXECUTE $$
      CREATE POLICY "Users can view own active_accounts_payable" 
      ON public.active_accounts_payable
      FOR SELECT USING (auth.uid() = user_id)
    $$;
    -- Admins can view all
    EXECUTE $$
      CREATE POLICY "Admins can view all active_accounts_payable" 
      ON public.active_accounts_payable
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$;
    RAISE NOTICE 'Created policies for active_accounts_payable';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policies already exist for active_accounts_payable';
END$$;

-- Create policies for active_accounts_receivable if it's a table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'active_accounts_receivable' AND c.relkind = 'r'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view own active_accounts_receivable" 
      ON public.active_accounts_receivable
      FOR SELECT USING (auth.uid() = user_id)
    $$;
    EXECUTE $$
      CREATE POLICY "Admins can view all active_accounts_receivable" 
      ON public.active_accounts_receivable
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$;
    RAISE NOTICE 'Created policies for active_accounts_receivable';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policies already exist for active_accounts_receivable';
END$$;

-- Create policies for user_summary_stats if it's a table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'user_summary_stats' AND c.relkind = 'r'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view own user_summary_stats" 
      ON public.user_summary_stats
      FOR SELECT USING (auth.uid() = user_id)
    $$;
    EXECUTE $$
      CREATE POLICY "Admins can view all user_summary_stats" 
      ON public.user_summary_stats
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$;
    RAISE NOTICE 'Created policies for user_summary_stats';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policies already exist for user_summary_stats';
END$$;

-- Create policies for active_banks if it's a table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'active_banks' AND c.relkind = 'r'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view own active_banks" 
      ON public.active_banks
      FOR SELECT USING (auth.uid() = user_id)
    $$;
    EXECUTE $$
      CREATE POLICY "Admins can view all active_banks" 
      ON public.active_banks
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$;
    RAISE NOTICE 'Created policies for active_banks';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policies already exist for active_banks';
END$$;

-- Create policies for active_categories if it's a table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'active_categories' AND c.relkind = 'r'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view active_categories" 
      ON public.active_categories
      FOR SELECT USING ((auth.uid() = user_id) OR (is_system = true) OR (get_user_role() = 'admin'::app_role))
    $$;
    RAISE NOTICE 'Created policies for active_categories';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policies already exist for active_categories';
END$$;

-- Create policies for active_contacts if it's a table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'active_contacts' AND c.relkind = 'r'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view own active_contacts" 
      ON public.active_contacts
      FOR SELECT USING (auth.uid() = user_id)
    $$;
    EXECUTE $$
      CREATE POLICY "Admins can view all active_contacts" 
      ON public.active_contacts
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$;
    RAISE NOTICE 'Created policies for active_contacts';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policies already exist for active_contacts';
END$$;

-- Create policies for active_customers if it's a table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'active_customers' AND c.relkind = 'r'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view own active_customers" 
      ON public.active_customers
      FOR SELECT USING (auth.uid() = user_id)
    $$;
    EXECUTE $$
      CREATE POLICY "Admins can view all active_customers" 
      ON public.active_customers
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$;
    RAISE NOTICE 'Created policies for active_customers';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policies already exist for active_customers';
END$$;

-- Create policies for active_suppliers if it's a table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspename = 'public' AND c.relname = 'active_suppliers' AND c.relkind = 'r'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view own active_suppliers" 
      ON public.active_suppliers
      FOR SELECT USING (auth.uid() = user_id)
    $$;
    EXECUTE $$
      CREATE POLICY "Admins can view all active_suppliers" 
      ON public.active_suppliers
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$;
    RAISE NOTICE 'Created policies for active_suppliers';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policies already exist for active_suppliers';
END$$;

-- Create policies for active_bank_accounts if it's a table (special case - no direct user_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'active_bank_accounts' AND c.relkind = 'r'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view own active_bank_accounts" 
      ON public.active_bank_accounts
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.banks b
        WHERE b.id = active_bank_accounts.bank_id AND b.user_id = auth.uid()
      ))
    $$;
    EXECUTE $$
      CREATE POLICY "Admins can view all active_bank_accounts" 
      ON public.active_bank_accounts
      FOR SELECT USING (get_user_role() = 'admin'::app_role)
    $$;
    RAISE NOTICE 'Created policies for active_bank_accounts';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policies already exist for active_bank_accounts';
END$$;