-- Adicionar novas colunas à tabela categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
ADD COLUMN IF NOT EXISTS group_name TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Circle';

-- Atualizar categorias existentes com valores padrão
UPDATE public.categories 
SET type = 'expense', 
    group_name = 'outros',
    icon = 'Circle' 
WHERE group_name IS NULL OR icon IS NULL;