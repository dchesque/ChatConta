import { X } from 'lucide-react';
import { useState } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarFooter } from './SidebarFooter';

interface SidebarProps {
  expanded: boolean;
  toggleSidebar?: () => void; // Opcional - não usado em desktop híbrido
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ expanded, toggleSidebar, mobileOpen, setMobileOpen }: SidebarProps) {
  const { isMobile, isTablet, isDesktop } = useSidebar();

  // Configurações da empresa (preparado para personalização futura)
  const [companySettings] = useState({
    showLogo: true,         // true = mostrar logo JC obrigatório
    logoUrl: null,          // URL do logo personalizado
    companyName: 'ChatConta',
    companySubtitle: 'Seu financeiro, mais inteligente'
  });

  // Desktop: Sidebar sempre aberta fixa
  if (isDesktop) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 flex flex-col h-screen fixed left-0 top-0 z-30 w-72">
        {/* Blur background da sidebar */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
        </div>
        
        {/* Conteúdo da sidebar desktop */}
        <div className="relative z-10 flex flex-col h-full">
          
          {/* Header desktop - sem botão de toggle */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">CC</span>
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">{companySettings.companyName}</h1>
                <p className="text-xs text-gray-300">{companySettings.companySubtitle}</p>
              </div>
            </div>
          </div>
          
          {/* Navegação desktop */}
          <SidebarNavigation expanded={true} />
          
          {/* Footer desktop */}
          <SidebarFooter expanded={true} />
          
        </div>
      </div>
    );
  }

  // Mobile/Tablet: Sidebar overlay
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 transform transition-transform duration-300 ease-in-out ${
      mobileOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      
      {/* Blur background mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header mobile */}
        <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">CC</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">{companySettings.companyName}</h1>
              <p className="text-xs text-gray-300">{companySettings.companySubtitle}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors ml-4"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>
        
        {/* Navegação mobile */}
        <SidebarNavigation expanded={true} mobile={true} onItemClick={() => setMobileOpen(false)} />
        
        {/* Footer mobile */}
        <SidebarFooter expanded={true} mobile={true} />
        
      </div>
    </div>
  );
}