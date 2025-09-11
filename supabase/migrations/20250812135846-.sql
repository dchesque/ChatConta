-- Adicionar colunas faltantes na tabela accounts_receivable para compatibilidade com funcionalidades da página novo-recebimento

ALTER TABLE public.accounts_receivable 
ADD COLUMN IF NOT EXISTS issue_date DATE,
ADD COLUMN IF NOT EXISTS original_amount NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS received_amount NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS final_amount NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS reference_document TEXT;

-- Comentários das colunas para documentação
COMMENT ON COLUMN public.accounts_receivable.issue_date IS 'Data de emissão do recebimento';
COMMENT ON COLUMN public.accounts_receivable.original_amount IS 'Valor original antes de juros/desconto';
COMMENT ON COLUMN public.accounts_receivable.received_amount IS 'Valor efetivamente recebido';
COMMENT ON COLUMN public.accounts_receivable.final_amount IS 'Valor final após aplicação de juros/desconto';
COMMENT ON COLUMN public.accounts_receivable.reference_document IS 'Documento de referência (nota fiscal, recibo, etc.)';

-- Atualizar registros existentes com valores padrão apropriados
UPDATE public.accounts_receivable 
SET 
  original_amount = amount,
  received_amount = CASE WHEN status = 'received' THEN amount ELSE NULL END,
  final_amount = CASE WHEN status = 'received' THEN amount ELSE NULL END
WHERE original_amount IS NULL;