-- Criar enum para tipo de banco
CREATE TYPE bank_type AS ENUM ('banco', 'carteira', 'outro');

-- Criar tabela banks
CREATE TABLE public.banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type bank_type NOT NULL DEFAULT 'banco',
  initial_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS para banks
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para banks
CREATE POLICY "Users can view own banks" ON public.banks
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own banks" ON public.banks
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banks" ON public.banks
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own banks" ON public.banks
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para admins
CREATE POLICY "Admins can view all banks" ON public.banks
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all banks" ON public.banks
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at em banks
CREATE TRIGGER update_banks_updated_at
  BEFORE UPDATE ON public.banks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela bank_accounts
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
  agency TEXT,
  account_number TEXT,
  pix_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS para bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para bank_accounts (baseadas no user_id do banco)
CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.banks b 
      WHERE b.id = bank_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own bank accounts" ON public.bank_accounts
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.banks b 
      WHERE b.id = bank_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own bank accounts" ON public.bank_accounts
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.banks b 
      WHERE b.id = bank_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own bank accounts" ON public.bank_accounts
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.banks b 
      WHERE b.id = bank_id AND b.user_id = auth.uid()
    )
  );

-- Políticas para admins
CREATE POLICY "Admins can view all bank accounts" ON public.bank_accounts
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all bank accounts" ON public.bank_accounts
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at em bank_accounts
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_banks_user ON public.banks(user_id);
CREATE INDEX idx_banks_type ON public.banks(type);
CREATE INDEX idx_bank_accounts_bank ON public.bank_accounts(bank_id);