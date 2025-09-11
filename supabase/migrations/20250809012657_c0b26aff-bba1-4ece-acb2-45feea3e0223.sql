-- Criar enum para ações de auditoria
CREATE TYPE audit_action AS ENUM ('login', 'logout', 'create', 'update', 'delete', 'read', 'error', 'other');

-- Criar tabela audit_logs
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para admins
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Políticas para eventos de sistema (service role)
CREATE POLICY "Service role can insert system logs" ON public.audit_logs
  FOR INSERT 
  WITH CHECK (current_setting('role') = 'service_role');

-- Função RPC para log seguro
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action audit_action,
  p_table_name TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    metadata,
    created_at
  )
  VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    p_metadata,
    NOW()
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Índices para performance
CREATE INDEX idx_audit_logs_user_created ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_table_created ON public.audit_logs(table_name, created_at DESC);
CREATE INDEX idx_audit_logs_action_created ON public.audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);