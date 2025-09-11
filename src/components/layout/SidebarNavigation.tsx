import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Eye,
  Plus,
  Package,
  Building2,
  Users,
  Tags,
  Building,
  Receipt,
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
  ChevronDown,
  Settings,
  Upload,
  Wallet,
  User,
  ArrowRightLeft
} from 'lucide-react';

// Estrutura do menu para Finanças Pessoais
const menuStructure = [
  // Dashboard (sem grupo)
  { 
    type: 'item', 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: LayoutDashboard,
    color: 'text-blue-500'
  },
  
  // Grupo: Contas a Pagar
  { 
    type: 'group', 
    name: 'CONTAS A PAGAR', 
    icon: Receipt,
    color: 'text-red-500',
    key: 'contas-pagar',
    items: [
      { name: 'Nova Conta', path: '/nova-conta', icon: Plus, color: 'text-red-500' },
      { name: 'Contas a Pagar', path: '/contas-pagar', icon: Receipt, color: 'text-red-500' }
    ]
  },
  
  // Grupo: Recebimentos
  { 
    type: 'group', 
    name: 'RECEBIMENTOS', 
    icon: DollarSign,
    color: 'text-green-500',
    key: 'recebimentos',
    items: [
      { name: 'Novo Recebimento', path: '/novo-recebimento', icon: Plus, color: 'text-green-500' },
      { name: 'Contas a Receber', path: '/contas-receber', icon: DollarSign, color: 'text-green-500' }
    ]
  },
  
  

  // Grupo: Cadastros (simplificado)
  { 
    type: 'group', 
    name: 'CADASTROS', 
    icon: Database,
    color: 'text-blue-500',
    key: 'cadastros',
    items: [
      { name: 'Categorias', path: '/categorias', icon: Tags, color: 'text-blue-500' },
      { name: 'Pessoas e Empresas', path: '/contatos', icon: Users, color: 'text-blue-500' },
      { name: 'Bancos', path: '/bancos', icon: Building, color: 'text-blue-500' }
    ]
  },


];

interface SidebarNavigationProps {
  expanded: boolean;
  mobile?: boolean;
  onItemClick?: () => void;
}

export function SidebarNavigation({ expanded, mobile = false, onItemClick }: SidebarNavigationProps) {
  const location = useLocation();

  // Estado dos grupos expandidos
  const [expandedGroups, setExpandedGroups] = useState({
    'contas-pagar': true,
    'recebimentos': true,
    'cadastros': false
  });

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey as keyof typeof prev]
    }));
  };

  return (
    <nav className={`flex-1 ${expanded || mobile ? 'px-4 py-6' : 'px-2 py-4'} space-y-1 overflow-y-auto`}>
      
      {menuStructure.map((item, index) => {
        // Renderizar Dashboard (item especial)
        if (item.type === 'item') {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <div key={item.name} className="mb-2">
              <NavLink 
                to={item.path} 
                onClick={handleItemClick}
                className={`flex items-center ${expanded || mobile ? 'space-x-3 px-6 py-4' : 'justify-center px-2 py-3'} rounded-xl transition-all duration-200 relative group ${
                  active 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-4 border-blue-400 text-blue-300 font-medium animate-fade-in' 
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-400' : item.color}`} />
                {(expanded || mobile) && <span className="text-sm font-medium">{item.name}</span>}
                {!expanded && !mobile && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                    {item.name}
                  </div>
                )}
              </NavLink>
            </div>
          );
        }
        
        // Renderizar grupo dropdown
        if (item.type === 'group') {
          const Icon = item.icon;
          const isExpanded = expandedGroups[item.key as keyof typeof expandedGroups];
          const hasActiveItem = item.items?.some(subItem => isActive(subItem.path));
          
          // Versão colapsada: mostrar apenas ícone do grupo como botão
          if (!expanded && !mobile) {
            return (
              <div key={item.name} className="mb-1">
                <div className={`flex items-center justify-center px-2 py-3 rounded-lg transition-all duration-200 relative group ${
                  hasActiveItem 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300' 
                    : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}>
                  <Icon className={`w-5 h-5 ${hasActiveItem ? 'text-blue-400' : item.color}`} />
                  
                  {/* Tooltip com subitens */}
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                    <div className="font-medium mb-2 text-xs uppercase tracking-wide text-gray-300">{item.name}</div>
                    <div className="space-y-1">
                      {item.items?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const active = isActive(subItem.path);
                        return (
                          <NavLink
                            key={subItem.name}
                            to={subItem.path}
                            onClick={handleItemClick}
                            className={`flex items-center space-x-2 px-2 py-1 rounded transition-colors ${
                              active ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-gray-700 text-gray-300'
                            }`}
                          >
                            <SubIcon className={`w-3 h-3 ${subItem.color}`} />
                            <span className="text-xs">{subItem.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          
          return (
            <div key={item.name} className={`${index > 0 ? 'mt-6' : 'mt-4'}`}>
              {/* Header do grupo clicável */}
              <button
                onClick={() => toggleGroup(item.key!)}
                className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold uppercase tracking-wide rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent group"
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 mr-3 ${item.color}`} />
                  <span className="text-gray-300 group-hover:text-white">{item.name}</span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  }`} 
                />
              </button>
              
              {/* Subitens do grupo */}
              <div className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-1 mt-1">
                  {item.items?.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const active = isActive(subItem.path);
                    
                    return (
                      <NavLink
                        key={subItem.name}
                        to={subItem.path}
                        onClick={handleItemClick}
                        className={`flex items-center space-x-3 px-6 py-3 mx-2 rounded-xl transition-all duration-200 relative group ${
                          active 
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-3 border-blue-400 text-blue-300 font-medium' 
                            : 'hover:bg-white/8 text-gray-300 hover:text-white hover:mx-1'
                        }`}
                      >
                        <SubIcon className={`w-4 h-4 flex-shrink-0 ${subItem.color}`} />
                        <span className="text-sm font-medium">{subItem.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }
        
        return null;
      })}
      
    </nav>
  );
}