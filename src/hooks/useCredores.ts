// Hook para credores com terminologia de finanças pessoais
import { useFornecedores } from './useFornecedores';
import type { FornecedorCompat } from './useFornecedoresAlias';

export interface UseCredoresReturn {
  credores: FornecedorCompat[];
  loading: boolean;
  error: string | null;
  criarCredor: (credor: Partial<FornecedorCompat>) => Promise<any>;
  atualizarCredor: (id: string, credor: Partial<FornecedorCompat>) => Promise<any>;
  excluirCredor: (id: string) => Promise<void>;
  buscarPorDocumento: (documento: string) => FornecedorCompat | null;
  atualizarEstatisticas: (credorId: string) => Promise<void>;
  recarregar: () => Promise<void>;
}

export const useCredores = (): UseCredoresReturn => {
  const {
    fornecedores: credores,
    loading,
    error,
    criarFornecedor: criarCredor,
    atualizarFornecedor: atualizarCredor,
    excluirFornecedor: excluirCredor,
    buscarPorDocumento,
    atualizarEstatisticas,
    recarregar
  } = useFornecedores();

  return {
    credores,
    loading,
    error,
    criarCredor,
    atualizarCredor,
    excluirCredor,
    buscarPorDocumento,
    atualizarEstatisticas,
    recarregar
  };
};