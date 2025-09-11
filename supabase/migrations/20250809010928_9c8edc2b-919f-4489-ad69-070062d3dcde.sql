-- Criar enums para status
CREATE TYPE account_status AS ENUM ('pending', 'paid', 'overdue', 'canceled');
CREATE TYPE receivable_status AS ENUM ('pending', 'received', 'overdue', 'canceled');

-- Criar tabela accounts_payable (Contas a Pagar)
CREATE TABLE public.accounts_payable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status account_status NOT NULL DEFAULT 'pending',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  paid_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS para accounts_payable
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para accounts_payable
CREATE POLICY "Users can view own accounts payable" ON public.accounts_payable
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts payable" ON public.accounts_payable
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts payable" ON public.accounts_payable
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts payable" ON public.accounts_payable
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para admins
CREATE POLICY "Admins can view all accounts payable" ON public.accounts_payable
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all accounts payable" ON public.accounts_payable
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_accounts_payable_updated_at
  BEFORE UPDATE ON public.accounts_payable
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_accounts_payable_user ON public.accounts_payable(user_id);
CREATE INDEX idx_accounts_payable_due_date ON public.accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_status ON public.accounts_payable(status);
CREATE INDEX idx_accounts_payable_category ON public.accounts_payable(category_id);
CREATE INDEX idx_accounts_payable_supplier ON public.accounts_payable(supplier_id);

-- Criar tabela accounts_receivable (Contas a Receber)
CREATE TABLE public.accounts_receivable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status receivable_status NOT NULL DEFAULT 'pending',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  customer_name TEXT,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  received_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS para accounts_receivable
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para accounts_receivable
CREATE POLICY "Users can view own accounts receivable" ON public.accounts_receivable
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts receivable" ON public.accounts_receivable
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts receivable" ON public.accounts_receivable
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts receivable" ON public.accounts_receivable
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para admins
CREATE POLICY "Admins can view all accounts receivable" ON public.accounts_receivable
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all accounts receivable" ON public.accounts_receivable
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_accounts_receivable_updated_at
  BEFORE UPDATE ON public.accounts_receivable
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_accounts_receivable_user ON public.accounts_receivable(user_id);
CREATE INDEX idx_accounts_receivable_due_date ON public.accounts_receivable(due_date);
CREATE INDEX idx_accounts_receivable_status ON public.accounts_receivable(status);
CREATE INDEX idx_accounts_receivable_category ON public.accounts_receivable(category_id);