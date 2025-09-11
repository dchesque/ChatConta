import { useState, useEffect } from 'react';
import { categoriesService } from '@/services/categoriesService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logService } from '@/services/logService';
import { auditService } from '@/services/auditService';
import { toast } from 'sonner';
import type { Category, CreateCategory, UpdateCategory, CategoryFilters, CategoryStats } from '@/types/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const loadCategories = async (filters?: CategoryFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesService.list(filters);
      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      handleError(err, 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: CreateCategory): Promise<Category | null> => {
    try {
      const newCategory = await categoriesService.create(categoryData);
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Log e auditoria
      logService.logInfo('Category created', { categoryId: newCategory.id, name: newCategory.name }, 'categories');
      
      toast.success('Categoria criada com sucesso');
      return newCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria';
      toast.error(errorMessage);
      handleError(err, 'Erro ao criar categoria');
      return null;
    }
  };

  const updateCategory = async (id: string, updates: Partial<CreateCategory>): Promise<Category | null> => {
    try {
      const updatedCategory = await categoriesService.update(id, updates);
      setCategories(prev => 
        prev.map(cat => cat.id === id ? updatedCategory : cat)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      
      // Log e auditoria
      logService.logInfo('Category updated', { categoryId: id, updates }, 'categories');
      
      toast.success('Categoria atualizada com sucesso');
      return updatedCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria';
      toast.error(errorMessage);
      handleError(err, 'Erro ao atualizar categoria');
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === id);
      await categoriesService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      // Log e auditoria
      logService.logInfo('Category deleted', { categoryId: id, name: categoryToDelete?.name }, 'categories');
      
      toast.success('Categoria excluída com sucesso');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir categoria';
      toast.error(errorMessage);
      handleError(err, 'Erro ao excluir categoria');
      return false;
    }
  };

  const getStats = (): CategoryStats => {
    const total = categories.length;
    const income = categories.filter(cat => cat.type === 'income').length;
    const expense = categories.filter(cat => cat.type === 'expense').length;
    const system = categories.filter(cat => cat.is_system === true || cat.user_id === null).length;
    const personal = categories.filter(cat => cat.is_system !== true && cat.user_id !== null).length;

    return { total, income, expense, system, personal };
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  };

  const refresh = () => {
    loadCategories();
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getStats,
    getCategoryById,
    refresh,
  };
}