-- Adicionar campos faltantes na tabela accounts_payable
ALTER TABLE public.accounts_payable 
ADD COLUMN dda_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN issue_date DATE,
ADD COLUMN reference_document TEXT,
ADD COLUMN original_amount NUMERIC(15,2),
ADD COLUMN final_amount NUMERIC(15,2),
ADD COLUMN paid_amount NUMERIC(15,2);

-- Comentários para documentação
COMMENT ON COLUMN public.accounts_payable.dda_enabled IS 'Indica se o Débito Direto Autorizado está habilitado';
COMMENT ON COLUMN public.accounts_payable.issue_date IS 'Data de emissão da conta a pagar';
COMMENT ON COLUMN public.accounts_payable.reference_document IS 'Documento de referência (nota fiscal, recibo, etc.)';
COMMENT ON COLUMN public.accounts_payable.original_amount IS 'Valor original antes de descontos/juros';
COMMENT ON COLUMN public.accounts_payable.final_amount IS 'Valor final após aplicação de descontos/juros';
COMMENT ON COLUMN public.accounts_payable.paid_amount IS 'Valor efetivamente pago';