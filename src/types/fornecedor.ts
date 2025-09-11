export interface Fornecedor {
  id: number;
  nome: string;
  nome_fantasia?: string; // Nome fantasia para PJ
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  documento: string; // CPF ou CNPJ
  email?: string;
  telefone?: string;
  endereco?: string; // Será mapeado para logradouro
  numero?: string;
  bairro?: string; // Novo campo adicionado
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  categoria_padrao_id?: number; // ID da conta padrão do plano de contas
  tipo_fornecedor: 'receita' | 'despesa'; // Classificação contábil
  ativo: boolean;
  totalCompras: number;
  valorTotal: number;
  ultimaCompra?: string;
  dataCadastro: string;
}

// Interface para Supabase (snake_case) - ATUALIZADA
export interface FornecedorSupabase {
  id: number;
  nome: string;
  nome_fantasia?: string;
  documento: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  categoria_padrao_id?: number;
  tipo_fornecedor: 'receita' | 'despesa';
  email?: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
  total_compras: number;
  valor_total: number;
  ultima_compra?: string;
  created_at: string;
  updated_at: string;
  ativo: boolean;
}

export interface FiltrosFornecedor {
  busca: string;
  status: 'todos' | 'ativo' | 'inativo';
  tipo: 'todos' | 'pessoa_fisica' | 'pessoa_juridica';
  tipo_fornecedor: 'todos' | 'receita' | 'despesa';
}

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Funções de conversão entre formatos - CORRIGIDAS
export const fornecedorToSupabase = (fornecedor: Fornecedor): Omit<FornecedorSupabase, 'id' | 'created_at' | 'updated_at'> => {
  return {
    nome: fornecedor.nome,
    nome_fantasia: fornecedor.nome_fantasia,
    documento: fornecedor.documento,
    tipo: fornecedor.tipo,
    categoria_padrao_id: fornecedor.categoria_padrao_id,
    tipo_fornecedor: fornecedor.tipo_fornecedor,
    email: fornecedor.email,
    telefone: fornecedor.telefone,
    logradouro: fornecedor.endereco, // Mapear endereco para logradouro
    numero: fornecedor.numero,
    bairro: fornecedor.bairro,
    cidade: fornecedor.cidade,
    estado: fornecedor.estado,
    cep: fornecedor.cep,
    observacoes: fornecedor.observacoes,
    total_compras: fornecedor.totalCompras,
    valor_total: fornecedor.valorTotal,
    ultima_compra: fornecedor.ultimaCompra,
    ativo: fornecedor.ativo
  };
};

export const supabaseToFornecedor = (data: FornecedorSupabase): Fornecedor => {
  return {
    id: data.id,
    nome: data.nome,
    nome_fantasia: data.nome_fantasia,
    documento: data.documento,
    tipo: data.tipo,
    categoria_padrao_id: data.categoria_padrao_id,
    tipo_fornecedor: data.tipo_fornecedor,
    email: data.email,
    telefone: data.telefone,
    endereco: data.logradouro, // Mapear logradouro para endereco
    numero: data.numero,
    bairro: data.bairro,
    cidade: data.cidade,
    estado: data.estado,
    cep: data.cep,
    observacoes: data.observacoes,
    totalCompras: data.total_compras,
    valorTotal: data.valor_total,
    ultimaCompra: data.ultima_compra,
    dataCadastro: data.created_at.split('T')[0], // Converte para YYYY-MM-DD
    ativo: data.ativo
  };
};