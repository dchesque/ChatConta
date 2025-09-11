import { supabase } from '@/integrations/supabase/client';
import type { Category, CreateCategory, UpdateCategory, CategoryFilters } from '@/types/category';

export class CategoriesService {
  async list(filters?: CategoryFilters): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }


    const { data, error } = await query;

    if (error) {
      console.error('Erro ao listar categorias:', error);
      throw new Error('Erro ao carregar categorias');
    }

    return data || [];
  }

  async create(category: CreateCategory): Promise<Category> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon || 'Circle',
        user_id: userData.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria:', error);
      
      // Tratar erro de unicidade
      if (error.code === '23505') {
        throw new Error('Já existe uma categoria com este nome');
      }
      
      throw new Error('Erro ao criar categoria');
    }

    return data;
  }

  async update(id: string, updates: Partial<CreateCategory>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      
      // Tratar erro de unicidade
      if (error.code === '23505') {
        throw new Error('Já existe uma categoria com este nome');
      }
      
      throw new Error('Erro ao atualizar categoria');
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    // TODO: Verificar se há vínculos com contas a pagar/receber quando implementado
    // const { data: linkedAccounts } = await supabase
    //   .from('contas_pagar')
    //   .select('id')
    //   .eq('category_id', id)
    //   .limit(1);
    
    // if (linkedAccounts && linkedAccounts.length > 0) {
    //   throw new Error('Não é possível excluir categoria vinculada a contas');
    // }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir categoria:', error);
      throw new Error('Erro ao excluir categoria');
    }
  }

  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar categoria:', error);
      throw new Error('Erro ao buscar categoria');
    }

    return data;
  }
}

export const categoriesService = new CategoriesService();