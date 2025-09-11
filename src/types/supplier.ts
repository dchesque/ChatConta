export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplier {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  active?: boolean;
}

export interface UpdateSupplier extends Partial<CreateSupplier> {
  id: string;
}

export interface SupplierFilters {
  search?: string;
  active?: boolean | 'all';
}

export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
}

// Estados brasileiros
export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export type BrazilianState = typeof BRAZILIAN_STATES[number];