import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { 
  CategoriaReceita, 
  CriarCategoriaReceita, 
  AtualizarCategoriaReceita, 
  FiltrosCategoriaReceita, 
  EstatisticasCategoriaReceita 
} from '@/types/categoriaReceita';

export function useCategoriasReceitas() {
  const [categorias, setCategorias] = useState<CategoriaReceita[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const carregarCategorias = async (filtros?: FiltrosCategoriaReceita) => {
    if (!user) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let categoriasFiltered: any[] = [];

      if (filtros?.busca) {
        categoriasFiltered = categoriasFiltered.filter(cat =>
          cat.nome.toLowerCase().includes(filtros.busca!.toLowerCase())
        );
      }

      if (filtros?.grupo) {
        categoriasFiltered = categoriasFiltered.filter(cat =>
          cat.grupo === filtros.grupo
        );
      }

      categoriasFiltered.sort((a, b) => {
        if (a.grupo !== b.grupo) {
          return a.grupo.localeCompare(b.grupo);
        }
        return a.nome.localeCompare(b.nome);
      });

      setCategorias(categoriasFiltered);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias de receitas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const criarCategoria = async (dados: CriarCategoriaReceita): Promise<boolean> => {
    if (!user) return false;

    try {
      const novaCategoria: CategoriaReceita = {
        id: Date.now(),
        ...dados,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      setCategorias(prev => [...prev, novaCategoria]);
      toast({ title: 'Sucesso', description: 'Categoria criada com sucesso' });
      return true;
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível criar a categoria', variant: 'destructive' });
      return false;
    }
  };

  const atualizarCategoria = async (dados: AtualizarCategoriaReceita): Promise<boolean> => {
    try {
      const { id, ...dadosAtualizacao } = dados;
      setCategorias(prev => prev.map(cat => cat.id === id ? { ...cat, ...dadosAtualizacao } : cat));
      toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso' });
      return true;
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar a categoria', variant: 'destructive' });
      return false;
    }
  };

  const excluirCategoria = async (id: number): Promise<boolean> => {
    try {
      setCategorias(prev => prev.filter(cat => cat.id !== id));
      toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso' });
      return true;
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir a categoria', variant: 'destructive' });
      return false;
    }
  };

  const obterEstatisticas = (): EstatisticasCategoriaReceita => {
    const total_categorias = categorias.length;
    const por_grupo: Record<string, number> = {};
    categorias.forEach(categoria => {
      por_grupo[categoria.grupo] = (por_grupo[categoria.grupo] || 0) + 1;
    });
    return { total_categorias, por_grupo };
  };

  useEffect(() => {
    if (user) {
      carregarCategorias();
    }
  }, [user]);

  return {
    categorias,
    loading,
    carregarCategorias,
    criarCategoria,
    atualizarCategoria,
    excluirCategoria,
    obterEstatisticas,
  };
}