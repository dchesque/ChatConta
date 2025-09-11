-- Adicionar campo category_id à tabela contacts para vincular contatos a categorias
ALTER TABLE public.contacts 
ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Criar índice para melhor performance
CREATE INDEX idx_contacts_category_id ON public.contacts(category_id);