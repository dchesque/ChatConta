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
WHERE type IS NULL OR group_name IS NULL OR icon IS NULL;

-- Inserir categorias padrão de receitas
INSERT INTO public.categories (name, type, group_name, color, icon, user_id) 
SELECT 'Salário', 'income', 'trabalho', '#22C55E', 'Briefcase', user_id
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = 'Salário' AND type = 'income' AND user_id = auth.users.id
);

INSERT INTO public.categories (name, type, group_name, color, icon, user_id) 
SELECT 'Freelances', 'income', 'trabalho', '#3B82F6', 'UserCheck', user_id
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = 'Freelances' AND type = 'income' AND user_id = auth.users.id
);

INSERT INTO public.categories (name, type, group_name, color, icon, user_id) 
SELECT 'Aluguel Recebido', 'income', 'investimentos', '#8B5CF6', 'Home', user_id
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = 'Aluguel Recebido' AND type = 'income' AND user_id = auth.users.id
);

INSERT INTO public.categories (name, type, group_name, color, icon, user_id) 
SELECT 'Dividendos', 'income', 'investimentos', '#EC4899', 'TrendingUp', user_id
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = 'Dividendos' AND type = 'income' AND user_id = auth.users.id
);

-- Inserir categorias padrão de despesas
INSERT INTO public.categories (name, type, group_name, color, icon, user_id) 
SELECT 'Aluguel', 'expense', 'moradia', '#EF4444', 'Home', user_id
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = 'Aluguel' AND type = 'expense' AND user_id = auth.users.id
);

INSERT INTO public.categories (name, type, group_name, color, icon, user_id) 
SELECT 'Transporte', 'expense', 'transporte', '#F97316', 'Car', user_id
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = 'Transporte' AND type = 'expense' AND user_id = auth.users.id
);

INSERT INTO public.categories (name, type, group_name, color, icon, user_id) 
SELECT 'Alimentação', 'expense', 'alimentacao', '#EAB308', 'UtensilsCrossed', user_id
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = 'Alimentação' AND type = 'expense' AND user_id = auth.users.id
);

INSERT INTO public.categories (name, type, group_name, color, icon, user_id) 
SELECT 'Educação', 'expense', 'educacao', '#06B6D4', 'GraduationCap', user_id
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = 'Educação' AND type = 'expense' AND user_id = auth.users.id
);

INSERT INTO public.categories (name, type, group_name, color, icon, user_id) 
SELECT 'Saúde', 'expense', 'saude', '#22C55E', 'Heart', user_id
FROM auth.users 
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories 
  WHERE name = 'Saúde' AND type = 'expense' AND user_id = auth.users.id
);