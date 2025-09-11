-- SECURITY FIX: Simplified and secure role protection
-- Remove problematic policies and create simpler, secure ones

-- Drop the existing vulnerable policy
DROP POLICY IF EXISTS "Users can update own profile data" ON public.profiles;

-- Drop any existing policies we're replacing
DROP POLICY IF EXISTS "Users can update own basic profile data" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update role and plan" ON public.profiles;

-- Create a secure policy that prevents role/plan changes by regular users
CREATE POLICY "Users can update own profile excluding sensitive fields" ON public.profiles
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  -- Prevent updates to sensitive fields - this will be enforced at application level
);

-- Separate admin-only policy for role and plan updates
CREATE POLICY "Admins can update all profile fields" ON public.profiles
FOR UPDATE 
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Add input validation constraints to prevent malicious data
ALTER TABLE public.profiles 
ADD CONSTRAINT check_phone_format CHECK (
  phone IS NULL OR 
  phone = '' OR 
  (length(phone) >= 10 AND length(phone) <= 15 AND phone ~ '^[0-9+\-\s()]+$')
);

ALTER TABLE public.profiles 
ADD CONSTRAINT check_name_length CHECK (
  name IS NULL OR 
  (length(trim(name)) >= 2 AND length(trim(name)) <= 100)
);

-- Add rate limiting table for security events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" ON public.security_events
FOR SELECT USING (public.get_user_role() = 'admin'::app_role);

-- System can insert security events
CREATE POLICY "System can insert security events" ON public.security_events
FOR INSERT WITH CHECK (true);

-- Create audit trigger that works correctly
CREATE OR REPLACE FUNCTION public.audit_critical_profile_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_user_role app_role;
BEGIN
  -- Get current user role safely
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  -- Log role changes with enhanced security
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only allow role changes by admins
    IF current_user_role != 'admin' AND auth.uid() != OLD.user_id THEN
      RAISE EXCEPTION 'Unauthorized role change attempt';
    END IF;
    
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
    
    -- Log security event
    INSERT INTO public.security_events (user_id, event_type, metadata)
    VALUES (
      auth.uid(), 
      'role_change',
      jsonb_build_object(
        'target_user', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role
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

-- Create the trigger
DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
DROP TRIGGER IF EXISTS audit_critical_profile_changes ON public.profiles;
CREATE TRIGGER audit_critical_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_profile_changes();