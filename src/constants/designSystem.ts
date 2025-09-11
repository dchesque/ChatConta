/**
 * 🎨 DESIGN SYSTEM GLASSMORPHISM PREMIUM
 * Sistema centralizado de cores, gradientes e estilos para UI/UX premium
 */

// 🎯 GRADIENTES PRINCIPAIS
export const GRADIENTES = {
  // Gradientes de botões
  primary: 'from-blue-600 to-purple-600',
  primaryHover: 'from-blue-700 to-purple-700',
  
  empresa: 'from-pink-500 to-purple-600',
  empresaHover: 'from-pink-600 to-purple-700',
  
  sucesso: 'from-green-500 to-green-600',
  sucessoHover: 'from-green-600 to-green-700',
  
  erro: 'from-red-500 to-red-600',
  erroHover: 'from-red-600 to-red-700',
  
  aviso: 'from-orange-500 to-orange-600',
  avisoHover: 'from-orange-600 to-orange-700',
  
  // Gradiente secundário
  secundario: 'from-gray-100 to-gray-200',
  secundarioHover: 'from-gray-200 to-gray-300',
  
  // Gradientes de background
  pagina: 'from-gray-50 via-blue-50/30 to-purple-50/30'
} as const;

// 🏷️ STATUS BADGES
export const STATUS_BADGES = {
  ativo: {
    container: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100/80 text-green-700 border border-green-200/50',
    dot: 'w-2 h-2 rounded-full mr-2 bg-green-600'
  },
  inativo: {
    container: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100/80 text-red-700 border border-red-200/50',
    dot: 'w-2 h-2 rounded-full mr-2 bg-red-600'
  },
  pendente: {
    container: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100/80 text-blue-700 border border-blue-200/50',
    dot: 'w-2 h-2 rounded-full mr-2 bg-blue-600'
  },
  pago: {
    container: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100/80 text-green-700 border border-green-200/50',
    dot: 'w-2 h-2 rounded-full mr-2 bg-green-600'
  },
  vencido: {
    container: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100/80 text-red-700 border border-red-200/50',
    dot: 'w-2 h-2 rounded-full mr-2 bg-red-600'
  },
  processando: {
    container: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100/80 text-yellow-700 border border-yellow-200/50',
    dot: 'w-2 h-2 rounded-full mr-2 bg-yellow-600'
  },
  cancelado: {
    container: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100/80 text-gray-700 border border-gray-200/50',
    dot: 'w-2 h-2 rounded-full mr-2 bg-gray-600'
  }
} as const;

// 🎨 GLASSMORPHISM ELEMENTS
export const GLASSMORPHISM = {
  // Cards - efeitos balanceados
  card: 'bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg',
  cardHover: 'hover:shadow-xl hover:bg-white/90 hover:scale-[1.01] transition-all duration-300 ease-out',
  
  // Modais
  modalOverlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
  modalContent: 'bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl',
  overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
  modal: 'bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl',
  
  // Inputs
  input: 'bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
  
  // Sidebar
  sidebarDark: 'bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50',
  
  // Headers mobile
  headerMobile: 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50'
} as const;

// 📝 TYPOGRAPHY
export const TYPOGRAPHY = {
  // Títulos
  pageTitle: 'text-2xl font-bold text-gray-800',
  sectionTitle: 'text-lg font-semibold text-gray-800',
  cardTitle: 'text-base font-semibold text-gray-900',
  
  // Textos
  body: 'text-base text-gray-700',
  bodySmall: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  
  // Labels
  label: 'text-sm font-medium text-gray-700',
  labelRequired: 'text-sm font-medium text-gray-700 after:content-["*"] after:text-red-500 after:ml-1',
  
  // Status
  success: 'text-green-700 font-medium',
  error: 'text-red-700 font-medium',
  warning: 'text-orange-700 font-medium',
  info: 'text-blue-700 font-medium'
} as const;

// 📏 BORDER RADIUS
export const BORDER_RADIUS = {
  card: 'rounded-2xl',
  button: 'rounded-xl',
  input: 'rounded-xl',
  badge: 'rounded-full',
  modal: 'rounded-2xl',
  small: 'rounded-lg'
} as const;

// ✨ ANIMATIONS & TRANSITIONS
export const ANIMATIONS = {
  // Transições padrão - com ease-out
  smooth: 'transition-all duration-300 ease-out',
  fast: 'transition-all duration-200 ease-out',
  slow: 'transition-all duration-500 ease-out',
  
  // Hover effects - balanceados e perceptíveis
  hoverCard: 'hover:shadow-xl hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 ease-out',
  hoverButton: 'hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-out',
  hoverScale: 'hover:scale-[1.02] transition-transform duration-300 ease-out',
  
  // Loading
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  fadeIn: 'animate-fade-in',
  scaleIn: 'animate-scale-in'
} as const;

// 🎯 BLUR BACKGROUNDS ABSTRATOS
export const BLUR_BACKGROUNDS = {
  page: [
    'absolute top-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl',
    'absolute top-40 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl',
    'absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl'
  ],
  modal: [
    'absolute top-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl',
    'absolute bottom-10 left-10 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl'
  ],
  card: [
    'absolute top-0 right-0 w-20 h-20 bg-blue-400/5 rounded-full blur-xl'
  ]
} as const;

// 🔧 UTILIDADES
export const UTILS = {
  // Estados
  disabled: 'opacity-50 cursor-not-allowed',
  loading: 'cursor-wait',
  
  // Z-index
  zIndex: {
    background: 'z-0',
    content: 'z-10',
    overlay: 'z-40',
    modal: 'z-50',
    tooltip: 'z-60'
  },
  
  // Spacing responsivo
  padding: {
    page: 'p-4 lg:p-8',
    card: 'p-6',
    modal: 'p-6 lg:p-8',
    section: 'py-6 px-4'
  }
} as const;

// 📱 RESPONSIVE BREAKPOINTS
export const BREAKPOINTS = {
  mobile: 'max-lg',
  tablet: 'lg:max-xl',
  desktop: 'xl:'
} as const;

// 🎨 HELPER FUNCTIONS
export const getStatusBadge = (status: keyof typeof STATUS_BADGES) => {
  return STATUS_BADGES[status] || STATUS_BADGES.pendente;
};

export const getGradientClasses = (variant: keyof typeof GRADIENTES) => {
  const baseGradient = GRADIENTES[variant];
  const hoverGradient = GRADIENTES[`${variant}Hover` as keyof typeof GRADIENTES] || baseGradient;
  
  return `bg-gradient-to-r ${baseGradient} hover:${hoverGradient}`;
};

export const getCardClasses = (variant: 'default' | 'hover' | 'premium' = 'default') => {
  const base = GLASSMORPHISM.card;
  
  switch (variant) {
    case 'hover':
      return `${base} ${GLASSMORPHISM.cardHover}`;
    case 'premium':
      return `${base} ${GLASSMORPHISM.cardHover} ${ANIMATIONS.hoverScale}`;
    default:
      return base;
  }
};

// Backward compatibility with existing design system
export const DESIGN_SYSTEM = {
  gradients: GRADIENTES,
  glassmorphism: GLASSMORPHISM,
  status: STATUS_BADGES,
  statusDots: Object.fromEntries(
    Object.entries(STATUS_BADGES).map(([key, value]) => [key, value.dot.replace('w-2 h-2 rounded-full mr-2 ', '')])
  ),
  typography: TYPOGRAPHY,
  animations: ANIMATIONS
} as const;

// Mensagens do sistema
export const MENSAGENS = {
  SUCESSO_SALVAR: "Dados salvos com sucesso!",
  SUCESSO_EXCLUIR: "Item excluído com sucesso!",
  ERRO_SALVAR: "Erro ao salvar. Tente novamente.",
  ERRO_CARREGAR: "Erro ao carregar dados.",
  CAMPO_OBRIGATORIO: "Este campo é obrigatório",
  VALOR_INVALIDO: "Valor inválido",
  DATA_INVALIDA: "Data inválida",
  EMAIL_INVALIDO: "Email inválido",
  CPF_INVALIDO: "CPF inválido",
  CNPJ_INVALIDO: "CNPJ inválido"
} as const;

export type StatusType = keyof typeof STATUS_BADGES;