-- SECURITY FIX: Fix the trigger function with correct OLD reference
-- and complete the security fixes

-- Fix the trigger function with proper OLD reference
CREATE OR REPLACE FUNCTION public.audit_critical_profile_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Log any role or plan changes with detailed metadata
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
        'timestamp', NOW(),
        'session_user', session_user,
        'current_user', current_user
      )
    );
  END IF;
  
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

-- CRITICAL FIX: Strengthen role protection by separating role update policies
-- Remove the vulnerable "Users can update own profile data" policy and create specific ones

-- Drop the existing vulnerable policy
DROP POLICY IF EXISTS "Users can update own profile data" ON public.profiles;

-- Create separate policies for different types of updates
CREATE POLICY "Users can update own basic profile data" ON public.profiles
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow updating these fields but not role or plan
    OLD.role = NEW.role 
    AND OLD.plan = NEW.plan
    AND OLD.subscription_status = NEW.subscription_status
    AND OLD.trial_ends_at = NEW.trial_ends_at
    AND OLD.subscription_ends_at = NEW.subscription_ends_at
    AND OLD.features_limit = NEW.features_limit
  )
);

-- Only admins can update roles and plans
CREATE POLICY "Only admins can update role and plan" ON public.profiles
FOR UPDATE 
USING (public.get_user_role() = 'admin'::app_role)
WITH CHECK (public.get_user_role() = 'admin'::app_role);

-- Create trigger for audit
DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_critical_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_profile_changes();