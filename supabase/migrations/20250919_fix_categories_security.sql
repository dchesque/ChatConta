-- ========================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA - CATEGORIES
-- Data: 19/09/2025
-- ========================================

-- 1. PRIMEIRO: Limpar dados órfãos (registros sem user_id)
-- ATENÇÃO: Isto vai DELETAR todos os registros de categories sem user_id
-- Se preferir mantê-los, comente esta linha e atribua a um usuário específico
DELETE FROM public.categories WHERE user_id IS NULL;

-- 2. ATIVAR RLS NA TABELA CATEGORIES (se ainda não estiver ativo)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER POLÍTICAS ANTIGAS (se existirem) para evitar conflitos
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;

-- 4. CRIAR POLÍTICAS DE SEGURANÇA PARA USUÁRIOS COMUNS

-- Política para SELECT (leitura)
CREATE POLICY "Users can view their own categories"
ON public.categories FOR SELECT
USING (auth.uid() = user_id);

-- Política para INSERT (criação)
CREATE POLICY "Users can insert their own categories"
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (atualização)
CREATE POLICY "Users can update their own categories"
ON public.categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para DELETE (exclusão)
CREATE POLICY "Users can delete their own categories"
ON public.categories FOR DELETE
USING (auth.uid() = user_id);

-- 5. ADICIONAR CONSTRAINT PARA GARANTIR QUE user_id NUNCA SEJA NULL
-- Isto previne futuros registros órfãos
ALTER TABLE public.categories
ALTER COLUMN user_id SET NOT NULL;

-- 6. VERIFICAÇÃO DE SEGURANÇA
-- Esta query deve retornar 0 registros após a correção
SELECT COUNT(*) as orphan_records FROM public.categories WHERE user_id IS NULL;

-- 7. LOG DA CORREÇÃO
INSERT INTO public.audit_logs (action, table_name, user_id, details, created_at)
VALUES (
    'security_fix',
    'categories',
    auth.uid(),
    'Fixed orphan records and enabled RLS with user isolation policies',
    NOW()
) ON CONFLICT DO NOTHING;

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Categories table security fix applied successfully';
END $$;