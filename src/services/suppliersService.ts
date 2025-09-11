import { supabase } from '@/integrations/supabase/client';
import type { Supplier, CreateSupplier, UpdateSupplier, SupplierFilters } from '@/types/supplier';

export class SuppliersService {
  async list(filters?: SupplierFilters): Promise<Supplier[]> {
    let query = supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,document.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters?.active !== undefined && filters.active !== 'all') {
      query = query.eq('active', filters.active);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao listar fornecedores:', error);
      throw new Error('Erro ao carregar fornecedores');
    }

    return data || [];
  }

  async create(supplier: CreateSupplier): Promise<Supplier> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('Usuário não autenticado');
    }

    // Normalizar documento (remover caracteres especiais)
    const normalizedSupplier = {
      ...supplier,
      document: supplier.document ? supplier.document.replace(/[^\d]/g, '') : undefined,
      phone: supplier.phone ? supplier.phone.replace(/[^\d]/g, '') : undefined,
      user_id: userData.user.id,
    };

    const { data, error } = await supabase
      .from('suppliers')
      .insert(normalizedSupplier)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar fornecedor:', error);
      
      // Tratar erro de unicidade
      if (error.code === '23505') {
        throw new Error('Já existe um fornecedor com este documento');
      }
      
      throw new Error('Erro ao criar fornecedor');
    }

    return data;
  }

  async update(id: string, updates: Partial<CreateSupplier>): Promise<Supplier> {
    // Normalizar documento e telefone se estiverem sendo atualizados
    const normalizedUpdates = {
      ...updates,
      document: updates.document ? updates.document.replace(/[^\d]/g, '') : updates.document,
      phone: updates.phone ? updates.phone.replace(/[^\d]/g, '') : updates.phone,
    };

    const { data, error } = await supabase
      .from('suppliers')
      .update(normalizedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      
      // Tratar erro de unicidade
      if (error.code === '23505') {
        throw new Error('Já existe um fornecedor com este documento');
      }
      
      throw new Error('Erro ao atualizar fornecedor');
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    // TODO: Verificar se há vínculos com contas a pagar/receber quando implementado
    // const { data: linkedAccounts } = await supabase
    //   .from('contas_pagar')
    //   .select('id')
    //   .eq('supplier_id', id)
    //   .limit(1);
    
    // if (linkedAccounts && linkedAccounts.length > 0) {
    //   throw new Error('Não é possível excluir fornecedor vinculado a contas');
    // }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir fornecedor:', error);
      throw new Error('Erro ao excluir fornecedor');
    }
  }

  async getById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar fornecedor:', error);
      throw new Error('Erro ao buscar fornecedor');
    }

    return data;
  }

  async toggleActive(id: string): Promise<Supplier> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error('Fornecedor não encontrado');
    }

    return this.update(id, { active: !current.active });
  }
}

export const suppliersService = new SuppliersService();