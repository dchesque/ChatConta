import { useSuppliers } from './useSuppliers';
import type { Supplier } from '@/types/supplier';

// Tipo de compatibilidade para fornecedor/credor
export interface FornecedorCompat extends Omit<Supplier, 'id'> {
  id: string | number;
  nome?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cpf_cnpj?: string;
  documento?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  ativo?: boolean;
  total_pago?: number;
  quantidade_contas?: number;
  data_cadastro?: string;
  data_atualizacao?: string;
}

export interface UseFornecedoresReturn {
  fornecedores: FornecedorCompat[];
  loading: boolean;
  error: string | null;
  criarFornecedor: (fornecedor: Partial<FornecedorCompat>) => Promise<any>;
  atualizarFornecedor: (id: string, fornecedor: Partial<FornecedorCompat>) => Promise<any>;
  excluirFornecedor: (id: string) => Promise<void>;
  buscarPorDocumento: (documento: string) => FornecedorCompat | null;
  atualizarEstatisticas: (fornecedorId: string) => Promise<void>;
  recarregar: () => Promise<void>;
}

export const useFornecedores = (): UseFornecedoresReturn => {
  const {
    suppliers,
    loading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    loadSuppliers,
    getSupplierStats
  } = useSuppliers();

  // Converter suppliers para FornecedorCompat
  const fornecedores: FornecedorCompat[] = suppliers.map(supplier => ({
    ...supplier,
    nome: supplier.name,
    razao_social: supplier.name,
    nome_fantasia: supplier.tradeName,
    cpf_cnpj: supplier.document,
    documento: supplier.document,
    endereco: supplier.address,
    telefone: supplier.phone,
    email: supplier.email,
    observacoes: supplier.notes,
    ativo: supplier.active,
    total_pago: 0,
    quantidade_contas: 0,
    data_cadastro: supplier.createdAt,
    data_atualizacao: supplier.updatedAt
  }));

  const criarFornecedor = async (fornecedor: Partial<FornecedorCompat>) => {
    const supplierData = {
      name: fornecedor.nome || fornecedor.razao_social || '',
      tradeName: fornecedor.nome_fantasia,
      document: fornecedor.cpf_cnpj || fornecedor.documento,
      email: fornecedor.email,
      phone: fornecedor.telefone,
      address: fornecedor.endereco,
      notes: fornecedor.observacoes,
      active: fornecedor.ativo !== false
    };
    return createSupplier(supplierData);
  };

  const atualizarFornecedor = async (id: string, fornecedor: Partial<FornecedorCompat>) => {
    const updates = {
      name: fornecedor.nome || fornecedor.razao_social,
      tradeName: fornecedor.nome_fantasia,
      document: fornecedor.cpf_cnpj || fornecedor.documento,
      email: fornecedor.email,
      phone: fornecedor.telefone,
      address: fornecedor.endereco,
      notes: fornecedor.observacoes,
      active: fornecedor.ativo
    };
    // Remove undefined values
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    return updateSupplier(id, cleanedUpdates);
  };

  const excluirFornecedor = async (id: string) => {
    await deleteSupplier(id);
  };

  const buscarPorDocumento = (documento: string): FornecedorCompat | null => {
    return fornecedores.find(f => 
      f.cpf_cnpj === documento || 
      f.documento === documento
    ) || null;
  };

  const atualizarEstatisticas = async (fornecedorId: string) => {
    // This would normally update statistics
    // For now, just reload the data
    await loadSuppliers();
  };

  const recarregar = async () => {
    await loadSuppliers();
  };

  return {
    fornecedores,
    loading,
    error,
    criarFornecedor,
    atualizarFornecedor,
    excluirFornecedor,
    buscarPorDocumento,
    atualizarEstatisticas,
    recarregar
  };
};