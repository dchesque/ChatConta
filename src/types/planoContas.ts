export interface PlanoContas {
  id: number;
  codigo: string; // Ex: "3.2.1.001"
  nome: string;
  descricao?: string;
  cor: string;
  icone: string;
  plano_pai_id?: number; // Hierarquia
  plano_pai?: PlanoContas; // Relação com conta pai
  nivel: number; // 1=principal, 2=sub, 3=sub-sub
  tipo_dre: 'despesa_pessoal';
  aceita_lancamento: boolean; // Se pode receber lançamentos diretos
  ativo: boolean;
  total_contas: number; // Calculado
  valor_total: number; // Calculado
  created_at: string;
  updated_at: string;
}

// Interface para Supabase (snake_case)
export interface PlanoContasSupabase {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  cor: string;
  icone: string;
  plano_pai_id?: number;
  nivel: number;
  tipo_dre: 'despesa_pessoal';
  aceita_lancamento: boolean;
  total_contas: number;
  valor_total: number;
  created_at: string;
  updated_at: string;
  ativo: boolean;
}

export interface FiltrosPlanoContas {
  busca: string;
  status: 'todos' | 'ativo' | 'inativo';
  tipo_dre: 'todos' | 'despesa_pessoal';
  aceita_lancamento: 'todos' | 'sim' | 'nao';
  nivel: 'todos' | '1' | '2' | '3';
}

export const TIPOS_DRE = [
  { valor: 'despesa_pessoal', nome: 'Despesa Pessoal', cor: '#8B5CF6' }
];

export const GRUPOS_DESPESAS_PESSOAIS = [
  { valor: 'moradia', nome: 'Moradia', cor: '#8B5CF6', icone: 'Home' },
  { valor: 'transporte', nome: 'Transporte', cor: '#3B82F6', icone: 'Car' },
  { valor: 'alimentacao', nome: 'Alimentação', cor: '#10B981', icone: 'UtensilsCrossed' },
  { valor: 'saude', nome: 'Saúde e Bem-estar', cor: '#EF4444', icone: 'Heart' },
  { valor: 'educacao', nome: 'Educação e Cultura', cor: '#F59E0B', icone: 'GraduationCap' },
  { valor: 'lazer', nome: 'Lazer e Entretenimento', cor: '#EC4899', icone: 'Gamepad2' },
  { valor: 'cuidados', nome: 'Cuidados Pessoais', cor: '#06B6D4', icone: 'Sparkles' },
  { valor: 'outros', nome: 'Outros Gastos', cor: '#6B7280', icone: 'Package' }
];

export const CATEGORIAS_PESSOAIS = GRUPOS_DESPESAS_PESSOAIS;

export const CORES_PLANO_CONTAS = [
  { nome: 'Azul', valor: '#3B82F6', bg: 'bg-blue-500' },
  { nome: 'Verde', valor: '#10B981', bg: 'bg-green-500' },
  { nome: 'Roxo', valor: '#8B5CF6', bg: 'bg-purple-500' },
  { nome: 'Rosa', valor: '#EC4899', bg: 'bg-pink-500' },
  { nome: 'Laranja', valor: '#F59E0B', bg: 'bg-orange-500' },
  { nome: 'Vermelho', valor: '#EF4444', bg: 'bg-red-500' },
  { nome: 'Turquesa', valor: '#06B6D4', bg: 'bg-cyan-500' },
  { nome: 'Indigo', valor: '#6366F1', bg: 'bg-indigo-500' }
];

export const ICONES_PLANO_CONTAS = [
  // Moradia
  { nome: 'Casa', icone: 'Home' },
  { nome: 'Prédio', icone: 'Building2' },
  { nome: 'Energia', icone: 'Zap' },
  { nome: 'Água', icone: 'Droplets' },
  { nome: 'Gás', icone: 'Flame' },
  { nome: 'Internet', icone: 'Wifi' },
  { nome: 'Telefone', icone: 'Phone' },
  { nome: 'Documento', icone: 'FileText' },
  { nome: 'Ferramentas', icone: 'Wrench' },
  { nome: 'Móveis', icone: 'Sofa' },
  
  // Transporte
  { nome: 'Carro', icone: 'Car' },
  { nome: 'Combustível', icone: 'Fuel' },
  { nome: 'Segurança', icone: 'Shield' },
  { nome: 'Ônibus', icone: 'Bus' },
  { nome: 'Estacionamento', icone: 'ParkingCircle' },
  { nome: 'Aviso', icone: 'AlertTriangle' },
  
  // Alimentação
  { nome: 'Carrinho', icone: 'ShoppingCart' },
  { nome: 'Restaurante', icone: 'UtensilsCrossed' },
  { nome: 'Delivery', icone: 'Bike' },
  { nome: 'Padaria', icone: 'Cookie' },
  { nome: 'Café', icone: 'Coffee' },
  { nome: 'Bebida', icone: 'Wine' },
  
  // Saúde
  { nome: 'Coração', icone: 'Heart' },
  { nome: 'Médico', icone: 'Stethoscope' },
  { nome: 'Exame', icone: 'TestTube' },
  { nome: 'Remédio', icone: 'Pill' },
  { nome: 'Dente', icone: 'SmilePlus' },
  { nome: 'Exercício', icone: 'Dumbbell' },
  { nome: 'Cérebro', icone: 'Brain' },
  
  // Educação
  { nome: 'Formatura', icone: 'GraduationCap' },
  { nome: 'Livro', icone: 'Book' },
  { nome: 'Caneta', icone: 'PenTool' },
  { nome: 'Escola', icone: 'School' },
  { nome: 'Música', icone: 'Music' },
  
  // Lazer
  { nome: 'Filme', icone: 'Film' },
  { nome: 'Avião', icone: 'Plane' },
  { nome: 'TV', icone: 'Tv' },
  { nome: 'Game', icone: 'Gamepad2' },
  { nome: 'Arte', icone: 'Palette' },
  { nome: 'Festa', icone: 'PartyPopper' },
  
  // Cuidados Pessoais
  { nome: 'Camisa', icone: 'Shirt' },
  { nome: 'Pegadas', icone: 'FootPrints' },
  { nome: 'Tesoura', icone: 'Scissors' },
  { nome: 'Estrela', icone: 'Sparkles' },
  { nome: 'Flor', icone: 'Flower' },
  { nome: 'Relógio', icone: 'Watch' },
  
  // Outros
  { nome: 'Presente', icone: 'Gift' },
  { nome: 'Recibo', icone: 'Receipt' },
  { nome: 'Pacote', icone: 'Package' }
];

// Funções de conversão entre formatos
export const planoContasToSupabase = (plano: PlanoContas): PlanoContasSupabase => {
  return {
    id: plano.id,
    codigo: plano.codigo,
    nome: plano.nome,
    descricao: plano.descricao,
    cor: plano.cor,
    icone: plano.icone,
    plano_pai_id: plano.plano_pai_id,
    nivel: plano.nivel,
    tipo_dre: plano.tipo_dre,
    aceita_lancamento: plano.aceita_lancamento,
    total_contas: plano.total_contas,
    valor_total: plano.valor_total,
    created_at: plano.created_at,
    updated_at: plano.updated_at,
    ativo: plano.ativo
  };
};

export const supabaseToPlanoContas = (data: PlanoContasSupabase): PlanoContas => {
  return {
    id: data.id,
    codigo: data.codigo,
    nome: data.nome,
    descricao: data.descricao,
    cor: data.cor,
    icone: data.icone,
    plano_pai_id: data.plano_pai_id,
    nivel: data.nivel,
    tipo_dre: data.tipo_dre,
    aceita_lancamento: data.aceita_lancamento,
    total_contas: data.total_contas,
    valor_total: data.valor_total,
    created_at: data.created_at,
    updated_at: data.updated_at,
    ativo: data.ativo
  };
};