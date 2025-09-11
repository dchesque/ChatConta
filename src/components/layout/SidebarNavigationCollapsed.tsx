import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Eye,
  Plus,
  Package,
  Building2,
  Users,
  Tags,
  Building,
  FileText,
  TrendingUp,
  BarChart3,
  FileBarChart,
  Download,
  CreditCard,
  DollarSign,
  Database,
  Clipboard,
  BarChart,
  MoreHorizontal
} from 'lucide-react';

// Estrutura simplificada para sidebar recolhida (máximo 5 itens)
const collapsedMenuStructure = [
  // 1. Dashboard (item direto)
  { 
    type: 'item', 
    name: 'Dashboard', 
    path: '/', 
    icon: LayoutDashboard,
    color: 'text-blue-500'
  },
  
  // 2. Contas a Pagar (fly-out)
  { 
    type: 'flyout', 
    name: 'CONTAS A PAGAR', 
    icon: CreditCard,
    color: 'text-red-500',
    key: 'contas-a-pagar',
    items: [
      { name: 'Consultar Contas', path: '/contas-pagar', icon: Eye, color: 'text-blue-500' },
      { name: 'Nova Conta', path: '/conta-individual', icon: Plus, color: 'text-green-500' },
      { name: 'Lançamento em Lote', path: '/lancamento-lote', icon: Package, color: 'text-purple-500' }
    ]
  },
  
  // 3. Vendas (fly-out)
  { 
    type: 'flyout', 
    name: 'VENDAS E RECEITAS', 
    icon: DollarSign,
    color: 'text-green-500',
    key: 'vendas-receitas',
    items: [
      { name: 'Consultar Vendas', path: '/consultar-vendas', icon: Eye, color: 'text-blue-500' },
      { name: 'Nova Venda', path: '/nova-venda', icon: Plus, color: 'text-green-500' },
      { name: 'Importar Vendas', path: '/importar-vendas', icon: Download, color: 'text-indigo-500' }
    ]
  },
  
  // 4. Cadastros (fly-out)
  { 
    type: 'flyout', 
    name: 'CADASTROS', 
    icon: Database,
    color: 'text-blue-500',
    key: 'cadastros',
    items: [
      { name: 'Fornecedores', path: '/fornecedores', icon: Building2, color: 'text-orange-500' },
      { name: 'Clientes', path: '/clientes', icon: Users, color: 'text-teal-500' },
      { name: 'Categorias', path: '/categorias', icon: Tags, color: 'text-yellow-500' },
      { name: 'Bancos', path: '/bancos', icon: Building, color: 'text-blue-500' },
      { name: 'Cheques', path: '/cheques', icon: FileText, color: 'text-purple-500' }
    ]
  },
  
  // 5. Menu Mais (fly-out)
  { 
    type: 'flyout', 
    name: 'MAIS OPÇÕES', 
    icon: MoreHorizontal,
    color: 'text-gray-500',
    key: 'mais-opcoes',
    items: [
      { name: 'DRE', path: '/dre', icon: TrendingUp, color: 'text-green-600' },
      { name: 'Fluxo de Caixa', path: '/fluxo-caixa', icon: BarChart3, color: 'text-blue-600' },
      { name: 'Relatórios Gerais', path: '/relatorios', icon: FileBarChart, color: 'text-gray-600' }
    ]
  }
];

interface SidebarNavigationCollapsedProps {
  onItemClick?: () => void;
}

export function SidebarNavigationCollapsed({ onItemClick }: SidebarNavigationCollapsedProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const hasActiveItem = (items?: Array<{path: string}>) => {
    return items?.some(item => isActive(item.path)) || false;
  };

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  // Improved hover handlers with better timing
  const handleMouseEnter = (key: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveFlyout(key);
  };

  const handleMouseLeave = () => {
    // Reduced delay for better UX
    const timeout = setTimeout(() => {
      setActiveFlyout(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleFlyoutMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleFlyoutMouseLeave = () => {
    setActiveFlyout(null);
  };

  // Click handler for flyout groups - navigate to first item
  const handleFlyoutClick = (items?: Array<{path: string}>) => {
    if (items && items.length > 0) {
      navigate(items[0].path);
      handleItemClick();
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <nav className="flex-1 px-2 py-4 space-y-2 overflow-hidden h-full max-h-[calc(100vh-140px)]">
      {collapsedMenuStructure.map((item) => {
        // Item direto (Dashboard)
        if (item.type === 'item') {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <div key={item.name} className="relative">
              <NavLink 
                to={item.path} 
                onClick={handleItemClick}
                className={`sidebar-icon flex items-center justify-center w-16 h-12 rounded-lg transition-all duration-200 relative group mx-auto ${
                  active 
                    ? 'bg-blue-500/20 border-l-4 border-blue-400 text-blue-300' 
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : item.color}`} />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 border border-white/10 shadow-xl pointer-events-none">
                  {item.name}
                </div>
              </NavLink>
            </div>
          );
        }
        
        // Item com fly-out
        if (item.type === 'flyout') {
          const Icon = item.icon;
          const hasActive = hasActiveItem(item.items);
          const isFlyoutActive = activeFlyout === item.key;
          
          return (
            <div 
              key={item.name} 
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.key!)}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className={`sidebar-icon flex items-center justify-center w-16 h-12 rounded-lg transition-all duration-200 cursor-pointer mx-auto ${
                  hasActive 
                    ? 'bg-blue-500/20 border-l-4 border-blue-400 text-blue-300' 
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                } ${isFlyoutActive ? 'bg-white/10' : ''}`}
                onClick={() => handleFlyoutClick(item.items)}
              >
                <Icon className={`w-5 h-5 ${hasActive ? 'text-blue-400' : item.color}`} />
              </div>
              
              {/* Fly-out Menu */}
              {isFlyoutActive && (
                <div 
                  className="absolute left-full top-0 ml-1 min-w-[200px] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 animate-slide-in-right"
                  onMouseEnter={handleFlyoutMouseEnter}
                  onMouseLeave={handleFlyoutMouseLeave}
                >
                  {/* Header do fly-out */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-semibold text-white uppercase tracking-wide">
                        {item.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* Items do fly-out */}
                  <div className="py-2">
                    {item.items?.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const active = isActive(subItem.path);
                      
                      return (
                        <NavLink
                          key={subItem.name}
                          to={subItem.path}
                          onClick={handleItemClick}
                          className={`flyout-item flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                            active 
                              ? 'bg-blue-500/20 text-blue-300 font-medium border-r-4 border-blue-400' 
                              : 'hover:bg-white/10 text-gray-300 hover:text-white'
                          }`}
                        >
                          <SubIcon className={`w-4 h-4 ${active ? 'text-blue-400' : subItem.color}`} />
                          <span className="text-sm">{subItem.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        }
        
        return null;
      })}
    </nav>
  );
}