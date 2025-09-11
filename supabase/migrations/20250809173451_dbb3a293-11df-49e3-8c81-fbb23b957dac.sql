-- Criar tabela de customers (pagadores/clientes)
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document TEXT,
  document_type TEXT DEFAULT 'other',
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('pessoa_fisica', 'pessoa_juridica', 'other')),
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own customers" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" 
ON public.customers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all customers" 
ON public.customers 
FOR SELECT 
USING (get_user_role() = 'admin');

CREATE POLICY "Admins can update all customers" 
ON public.customers 
FOR UPDATE 
USING (get_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create active_customers view
CREATE VIEW public.active_customers AS
SELECT * FROM public.customers 
WHERE deleted_at IS NULL 
ORDER BY name;

-- Add customer_id to accounts_receivable table
ALTER TABLE public.accounts_receivable ADD COLUMN customer_id UUID REFERENCES public.customers(id);

-- Create index for better performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_active ON public.customers(user_id, active) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_receivable_customer_id ON public.accounts_receivable(customer_id);