-- ========================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA - CATEGORIES (VERSÃO FINAL)
-- Data: 19/09/2025
-- ========================================
-- Esta versão preserva os dados atribuindo-os ao primeiro admin encontrado

-- 1. PRIMEIRO: Atribuir dados órfãos ao primeiro usuário admin
DO $$
DECLARE
    admin_id UUID;
    orphan_count INTEGER;
BEGIN
    -- Contar registros órfãos
    SELECT COUNT(*) INTO orphan_count FROM public.categories WHERE user_id IS NULL;

    IF orphan_count > 0 THEN
        RAISE NOTICE 'Encontrados % registros órfãos em categories', orphan_count;

        -- Buscar o primeiro usuário admin
        SELECT user_id INTO admin_id
        FROM public.profiles
        WHERE role = 'admin'
        LIMIT 1;

        IF admin_id IS NOT NULL THEN
            -- Atribuir registros órfãos ao admin
            UPDATE public.categories
            SET user_id = admin_id,
                updated_at = NOW()
            WHERE user_id IS NULL;

            RAISE NOTICE 'Registros órfãos atribuídos ao admin: %', admin_id;
        ELSE
            -- Se não houver admin, buscar o primeiro usuário
            SELECT user_id INTO admin_id
            FROM public.profiles
            LIMIT 1;

            IF admin_id IS NOT NULL THEN
                UPDATE public.categories
                SET user_id = admin_id,
                    updated_at = NOW()
                WHERE user_id IS NULL;

                RAISE NOTICE 'Registros órfãos atribuídos ao usuário: %', admin_id;
            ELSE
                -- Se não houver nenhum usuário, deletar os registros
                DELETE FROM public.categories WHERE user_id IS NULL;
                RAISE WARNING 'Nenhum usuário encontrado. Registros órfãos foram deletados.';
            END IF;
        END IF;
    ELSE
        RAISE NOTICE 'Nenhum registro órfão encontrado';
    END IF;
END $$;

-- 2. ATIVAR RLS NA TABELA CATEGORIES (se ainda não estiver ativo)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER POLÍTICAS ANTIGAS (se existirem) para evitar conflitos
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete all categories" ON public.categories;

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
-- Agora é seguro adicionar a constraint pois todos os registros têm user_id
ALTER TABLE public.categories
ALTER COLUMN user_id SET NOT NULL;

-- 6. VERIFICAÇÃO DE SEGURANÇA
DO $$
DECLARE
    orphan_count INTEGER;
    total_count INTEGER;
    users_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count FROM public.categories WHERE user_id IS NULL;
    SELECT COUNT(*) INTO total_count FROM public.categories;
    SELECT COUNT(DISTINCT user_id) INTO users_count FROM public.categories;

    IF orphan_count = 0 THEN
        RAISE NOTICE '✅ Verificação OK: Nenhum registro órfão encontrado';
        RAISE NOTICE '✅ Total de categorias: %', total_count;
        RAISE NOTICE '✅ Usuários únicos com categorias: %', users_count;
    ELSE
        RAISE WARNING '❌ ATENÇÃO: Ainda existem % registros órfãos!', orphan_count;
    END IF;
END $$;

-- Mensagem de confirmação final
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CORREÇÃO DE SEGURANÇA APLICADA';
    RAISE NOTICE '✅ Registros órfãos foram tratados';
    RAISE NOTICE '✅ RLS está ativo com isolamento por usuário';
    RAISE NOTICE '✅ Constraint NOT NULL aplicada ao user_id';
    RAISE NOTICE '========================================';
END $$;