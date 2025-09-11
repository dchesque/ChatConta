import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  document?: string;
  document_type?: string;
  type: 'pessoa_fisica' | 'pessoa_juridica' | 'other';
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateCustomerData {
  name: string;
  document?: string;
  document_type?: string;
  type?: 'pessoa_fisica' | 'pessoa_juridica' | 'other';
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  active?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface CustomerFilters {
  search?: string;
  type?: string;
  active?: boolean;
}

export const customersService = {
  async getCustomers(filters?: CustomerFilters): Promise<Customer[]> {
    let query = supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,document.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters?.type && filters.type !== 'todos') {
      query = query.eq('type', filters.type);
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        ...customerData,
        type: customerData.type || 'other',
        active: customerData.active ?? true,
        metadata: customerData.metadata || {}
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCustomer(id: string, updates: UpdateCustomerData): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async getCustomerStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  }> {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('type, active');

    if (error) throw error;

    const stats = {
      total: customers?.length || 0,
      active: customers?.filter(c => c.active).length || 0,
      inactive: customers?.filter(c => !c.active).length || 0,
      byType: {} as Record<string, number>
    };

    customers?.forEach(customer => {
      stats.byType[customer.type] = (stats.byType[customer.type] || 0) + 1;
    });

    return stats;
  }
};