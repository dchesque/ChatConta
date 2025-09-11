-- Criar enum para tipo de transação
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');

-- Criar tabela transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  description TEXT,
  from_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  accounts_payable_id UUID REFERENCES public.accounts_payable(id) ON DELETE SET NULL,
  accounts_receivable_id UUID REFERENCES public.accounts_receivable(id) ON DELETE SET NULL,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para admins
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all transactions" ON public.transactions
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_from_account ON public.transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON public.transactions(to_account_id);
CREATE INDEX idx_transactions_ap ON public.transactions(accounts_payable_id);
CREATE INDEX idx_transactions_ar ON public.transactions(accounts_receivable_id);

-- Constraint para garantir que transferências tenham contas diferentes
ALTER TABLE public.transactions 
ADD CONSTRAINT check_transfer_accounts 
CHECK (
  type != 'transfer' OR 
  (from_account_id IS NOT NULL AND to_account_id IS NOT NULL AND from_account_id != to_account_id)
);