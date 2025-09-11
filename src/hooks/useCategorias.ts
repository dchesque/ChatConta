import { useState, useEffect } from 'react';
import { dataService } from '@/services/DataServiceFactory';
import { useAuth } from './useAuth';
import { useErrorHandler } from './useErrorHandler';
import { showMessage } from '@/utils/messages';

// Usando tipos do Supabase diretamente
import type { Database } from '@/integrations/supabase/types';

type Categoria = Database['public']['Tables']['categories']['Row'];
type CategoriaInsert = Database['public']['Tables']['categories']['Insert'];
type CategoriaUpdate = Database['public']['Tables']['categories']['Update'];

export interface UseCategoriastReturn {
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  criarCategoria: (categoria: Omit<CategoriaInsert, 'user_id'>) => Promise<Categoria>;
  atualizarCategoria: (id: string, categoria: CategoriaUpdate) => Promise<Categoria | null>;
  excluirCategoria: (id: string) => Promise<void>;
  recarregar: () => Promise<void>;
}

export function useCategorias(): UseCategoriastReturn {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError, withRetry, withTimeout, cancelAll } = useErrorHandler('categorias');

  const carregarCategorias = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    const loadingToast = showMessage.loading('Carregando categorias...');
    
    try {
      const data = await withRetry(() => 
        withTimeout(dataService.categorias.getAll(), 15000)
      );
      setCategorias(data);
      showMessage.dismiss();
    } catch (err) {
      showMessage.dismiss();
      const appErr = handleError(err, 'carregar-categorias');
      setError(appErr.message);
    } finally {
      setLoading(false);
    }
  };

  const criarCategoria = async (dadosCategoria: Omit<CategoriaInsert, 'user_id'>): Promise<Categoria> => {
    // Verificar se já existe categoria com o mesmo nome
    const existente = categorias.find(cat => 
      cat.name.toLowerCase() === dadosCategoria.name.toLowerCase()
    );
    
    if (existente) {
      showMessage.saveError('Já existe uma categoria com este nome');
      throw new Error('Categoria duplicada');
    }

    try {
      const novaCategoria = await showMessage.promise(
        withRetry(() => dataService.categorias.create(dadosCategoria)),
        {
          loading: 'Salvando categoria...',
          success: 'Categoria criada com sucesso!',
          error: 'Erro ao criar categoria'
        }
      );
      
      setCategorias(prev => [...prev, novaCategoria]);
      return novaCategoria;
    } catch (err) {
      handleError(err, 'criar-categoria');
      throw err;
    }
  };

  const atualizarCategoria = async (id: string, dadosAtualizacao: CategoriaUpdate): Promise<Categoria | null> => {
    // Verificar se novo nome já existe (se nome estiver sendo alterado)
    if (dadosAtualizacao.name) {
      const categoriaAtual = categorias.find(cat => cat.id === id);
      if (categoriaAtual) {
        const existente = categorias.find(cat => 
          cat.id !== id &&
          cat.name.toLowerCase() === dadosAtualizacao.name!.toLowerCase()
        );
        
        if (existente) {
          showMessage.saveError('Já existe uma categoria com este nome');
          throw new Error('Categoria duplicada');
        }
      }
    }

    try {
      const categoriaAtualizada = await showMessage.promise(
        withRetry(() => dataService.categorias.update(id, dadosAtualizacao)),
        {
          loading: 'Atualizando categoria...',
          success: 'Categoria atualizada com sucesso!',
          error: 'Erro ao atualizar categoria'
        }
      );
      
      if (categoriaAtualizada) {
        setCategorias(prev => 
          prev.map(cat => cat.id === id ? categoriaAtualizada : cat)
        );
      }
      
      return categoriaAtualizada;
    } catch (err) {
      handleError(err, 'atualizar-categoria');
      throw err;
    }
  };

  const excluirCategoria = async (id: string): Promise<void> => {
    const categoriaAExcluir = categorias.find(cat => cat.id === id);
    
    try {
      await showMessage.promise(
        withRetry(() => dataService.categorias.delete(id)),
        {
          loading: 'Excluindo categoria...',
          success: 'Categoria excluída com sucesso!',
          error: 'Erro ao excluir categoria'
        }
      );
      
      setCategorias(prev => prev.filter(cat => cat.id !== id));

      // Oferecer ação de desfazer
      if (categoriaAExcluir) {
        showMessage.withUndo('Categoria excluída', () => {
          setCategorias(prev => [...prev, categoriaAExcluir]);
        });
      }
    } catch (err) {
      handleError(err, 'excluir-categoria');
      throw err;
    }
  };

  const recarregar = async (): Promise<void> => {
    await carregarCategorias();
  };

  useEffect(() => {
    if (user) {
      carregarCategorias();
    } else {
      setCategorias([]);
    }

    return () => {
      cancelAll();
    };
  }, [user, cancelAll]);

  return {
    categorias,
    loading,
    error,
    criarCategoria,
    atualizarCategoria,
    excluirCategoria,
    recarregar
  };
}