-- Modificar tabela categories para suportar categorias do sistema
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

-- Tornar user_id nullable para permitir categorias globais
ALTER TABLE public.categories 
ALTER COLUMN user_id DROP NOT NULL;

-- Remover todas as categorias existentes para começar limpo
DELETE FROM public.categories;

-- Inserir categorias padrão do sistema (10 receitas + 14 despesas)

-- CATEGORIAS DE RECEITA (income)
INSERT INTO public.categories (name, type, color, icon, is_system, user_id) VALUES
('Salário', 'income', '#10b981', 'Banknote', TRUE, NULL),
('Freelance', 'income', '#059669', 'Laptop', TRUE, NULL),
('Vendas', 'income', '#047857', 'ShoppingCart', TRUE, NULL),
('Comissões', 'income', '#065f46', 'TrendingUp', TRUE, NULL),
('Investimentos', 'income', '#3b82f6', 'PiggyBank', TRUE, NULL),
('Dividendos', 'income', '#1d4ed8', 'LineChart', TRUE, NULL),
('Aluguel', 'income', '#7c3aed', 'Home', TRUE, NULL),
('Pensão', 'income', '#a855f7', 'Users', TRUE, NULL),
('Prêmios', 'income', '#ec4899', 'Award', TRUE, NULL),
('Outros', 'income', '#6b7280', 'Plus', TRUE, NULL);

-- CATEGORIAS DE DESPESA (expense) 
INSERT INTO public.categories (name, type, color, icon, is_system, user_id) VALUES
-- Moradia
('Aluguel/Financiamento', 'expense', '#ef4444', 'Home', TRUE, NULL),
('Contas Básicas', 'expense', '#dc2626', 'Zap', TRUE, NULL),
('Manutenção', 'expense', '#b91c1c', 'Wrench', TRUE, NULL),
-- Transporte
('Combustível', 'expense', '#f97316', 'Fuel', TRUE, NULL),
('Transporte Público', 'expense', '#ea580c', 'Bus', TRUE, NULL),
('Manutenção Veículo', 'expense', '#c2410c', 'Car', TRUE, NULL),
-- Alimentação
('Supermercado', 'expense', '#84cc16', 'ShoppingBasket', TRUE, NULL),
('Restaurantes', 'expense', '#65a30d', 'UtensilsCrossed', TRUE, NULL),
-- Saúde
('Plano de Saúde', 'expense', '#06b6d4', 'Heart', TRUE, NULL),
('Medicamentos', 'expense', '#0891b2', 'Pill', TRUE, NULL),
-- Educação
('Cursos/Faculdade', 'expense', '#8b5cf6', 'GraduationCap', TRUE, NULL),
-- Lazer
('Entretenimento', 'expense', '#ec4899', 'Gamepad2', TRUE, NULL),
-- Cuidados Pessoais
('Beleza/Estética', 'expense', '#f59e0b', 'Sparkles', TRUE, NULL),
-- Outros
('Outros', 'expense', '#6b7280', 'MoreHorizontal', TRUE, NULL);

-- Atualizar políticas RLS para permitir acesso às categorias do sistema
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view categories" ON public.categories;

-- Política para visualização: usuários veem suas categorias + categorias do sistema
CREATE POLICY "Users can view categories" 
ON public.categories 
FOR SELECT 
USING (
  auth.uid() = user_id OR -- Suas próprias categorias
  is_system = TRUE OR     -- Categorias do sistema
  get_user_role() = 'admin'::app_role -- Admins veem tudo
);

-- Política para inserção: usuários só podem criar categorias pessoais
CREATE POLICY "Users can insert personal categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  (is_system = FALSE OR is_system IS NULL)
);

-- Política para atualização: usuários só podem atualizar suas categorias, admins podem atualizar categorias do sistema
CREATE POLICY "Users can update categories" 
ON public.categories 
FOR UPDATE 
USING (
  (auth.uid() = user_id AND (is_system = FALSE OR is_system IS NULL)) OR
  (get_user_role() = 'admin'::app_role AND is_system = TRUE)
);

-- Política para exclusão: usuários só podem excluir suas categorias, admins podem excluir categorias do sistema
CREATE POLICY "Users can delete categories" 
ON public.categories 
FOR DELETE 
USING (
  (auth.uid() = user_id AND (is_system = FALSE OR is_system IS NULL)) OR
  (get_user_role() = 'admin'::app_role AND is_system = TRUE)
);