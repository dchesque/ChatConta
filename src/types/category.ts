export interface Category {
  id: string;
  user_id?: string | null; // Nullable para categorias do sistema
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  is_system?: boolean; // Indica se é categoria do sistema
  created_at: string;
  updated_at: string;
}

export interface CreateCategory {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export interface UpdateCategory extends Partial<CreateCategory> {
  id: string;
}

export interface CategoryFilters {
  search?: string;
  type?: 'income' | 'expense' | 'all';
}

export interface CategoryStats {
  total: number;
  income: number;
  expense: number;
  system: number; // Categorias do sistema
  personal: number; // Categorias pessoais
}

// Grupos de receitas
export const INCOME_GROUPS = {
  trabalho: 'Trabalho / Salário',
  freelance: 'Freelance e Serviços Prestados',
  investimentos: 'Investimentos (renda fixa, variável, cripto)',
  alugueis: 'Aluguéis e Arrendamentos',
  royalties: 'Royalties e Direitos Autorais',
  vendas: 'Vendas de Bens',
  dividendos: 'Dividendos e Juros',
  reembolsos: 'Reembolsos e Restituições',
  premios: 'Prêmios e Apostas',
  outros: 'Outros'
} as const;

// Grupos de despesas
export const EXPENSE_GROUPS = {
  moradia: 'Moradia',
  transporte: 'Transporte',
  alimentacao: 'Alimentação',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer e Entretenimento',
  cuidados: 'Cuidados Pessoais',
  servicos: 'Serviços e Assinaturas',
  impostos: 'Impostos e Taxas',
  compras: 'Compras e Vestuário',
  viagens: 'Viagens e Passeios',
  doacoes: 'Doações e Caridade',
  manutencao: 'Manutenção e Reparos',
  seguros: 'Seguros',
  dividas: 'Dívidas e Empréstimos',
  animais: 'Animais de Estimação',
  presentes: 'Presentes e Festas',
  emergencias: 'Emergências',
  outros: 'Outros'
} as const;

// Ícones disponíveis por grupo
export const GROUP_ICONS = {
  // Receitas
  trabalho: ['Briefcase', 'UserCheck', 'Building', 'Monitor'],
  freelance: ['Laptop', 'Code', 'Palette', 'Camera'],
  investimentos: ['TrendingUp', 'PiggyBank', 'DollarSign', 'Target'],
  alugueis: ['Home', 'Building2', 'MapPin', 'Key'],
  royalties: ['Crown', 'Award', 'Trophy', 'Star'],
  vendas: ['ShoppingCart', 'Package', 'Tag', 'Receipt'],
  dividendos: ['DollarSign', 'Coins', 'Banknote', 'Calculator'],
  reembolsos: ['ArrowLeft', 'RefreshCw', 'Undo', 'RotateCcw'],
  premios: ['Gift', 'Trophy', 'Award', 'Ticket'],
  
  // Despesas
  moradia: ['Home', 'Zap', 'Wifi', 'Phone'],
  transporte: ['Car', 'Bus', 'Bike', 'Fuel'],
  alimentacao: ['UtensilsCrossed', 'Coffee', 'Pizza', 'Apple'],
  saude: ['Heart', 'Pill', 'Stethoscope', 'Hospital'],
  educacao: ['GraduationCap', 'BookOpen', 'School', 'Laptop'],
  lazer: ['Gamepad2', 'Music', 'Film', 'Camera'],
  cuidados: ['Scissors', 'Shirt', 'ShoppingBag', 'Crown'],
  servicos: ['Wifi', 'Phone', 'Tv', 'Cloud'],
  impostos: ['Receipt', 'FileText', 'Calculator', 'Building'],
  compras: ['ShoppingBag', 'Shirt', 'Watch', 'Gift'],
  viagens: ['Plane', 'MapPin', 'Camera', 'Luggage'],
  doacoes: ['Heart', 'HandHeart', 'Gift', 'Users'],
  manutencao: ['Wrench', 'Settings', 'Tool', 'Hammer'],
  seguros: ['Shield', 'ShieldCheck', 'Lock', 'FileText'],
  dividas: ['CreditCard', 'Receipt', 'Calculator', 'FileText'],
  animais: ['PawPrint', 'Heart', 'Home', 'Stethoscope'],
  presentes: ['Gift', 'PartyPopper', 'Cake', 'Star'],
  emergencias: ['AlertTriangle', 'Shield', 'Phone', 'Cross'],
  outros: ['Circle', 'Package', 'Tag', 'Star']
} as const;

// Cores padrão para categorias
export const CATEGORY_COLORS = [
  '#EF4444', // red-500 - para despesas
  '#22C55E', // green-500 - para receitas
  '#F97316', // orange-500
  '#EAB308', // yellow-500
  '#06B6D4', // cyan-500
  '#3B82F6', // blue-500
  '#6366F1', // indigo-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#64748B', // slate-500
] as const;

// Cores padrão por tipo
export const getDefaultColorByType = (type: 'income' | 'expense') => {
  return type === 'income' ? '#22C55E' : '#EF4444';
};

// Função para obter grupos baseado no tipo
export const getGroupsByType = (type: 'income' | 'expense') => {
  return type === 'income' ? INCOME_GROUPS : EXPENSE_GROUPS;
};

// Função para obter ícones por grupo
export const getIconsByGroup = (group: string) => {
  return GROUP_ICONS[group as keyof typeof GROUP_ICONS] || GROUP_ICONS.outros;
};

// Função para obter ícone padrão por grupo
export const getDefaultIconByGroup = (group: string): string => {
  const icons = GROUP_ICONS[group as keyof typeof GROUP_ICONS];
  return icons ? icons[0] : 'Circle';
};