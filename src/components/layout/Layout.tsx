import { ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { BlurBackground } from '@/components/ui/BlurBackground';
import { StatusIndicators } from './StatusIndicators';
import { NotificationBell } from './NotificationBell';
import { useSEO } from '@/hooks/useSEO';


interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu, isMobile, isTablet, isDesktop } = useSidebar();
  useSEO(); // Aplicar SEO dinâmico

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      
      {/* Background blur abstrato */}
      <BlurBackground variant="page" />
      
      {/* Sidebar: Híbrida Desktop/Mobile */}
      <Sidebar 
        expanded={isDesktop ? true : false}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={closeMobileMenu}
      />
      
      {/* Overlay mobile/tablet apenas */}
      {(isMobile || isTablet) && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={closeMobileMenu}
        />
      )}
      
      {/* Área principal */}
      <div className={`flex-1 min-h-screen relative z-10 ${
        isDesktop ? 'ml-72' : 'ml-0'
      }`}>
        
        {/* Header mobile/tablet */}
        {(isMobile || isTablet) && (
          <div className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              {/* Logo mobile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CC</span>
                </div>
                <div>
                  <h1 className="font-bold text-base text-white">ChatConta</h1>
                  <p className="text-xs text-gray-300">Seu financeiro, mais inteligente</p>
                </div>
              </div>
              
              {/* Notificações e Botão hambúrguer */}
              <div className="flex items-center gap-2">
                <NotificationBell />
                
                <button 
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Indicadores de status - apenas mobile */}
            <div className="mt-2 flex justify-center">
              <StatusIndicators />
            </div>
          </div>
        )}
        
        {/* Indicadores e notificações desktop - posição fixa */}
        {isDesktop && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
            <NotificationBell />
            <StatusIndicators />
          </div>
        )}
        
        {/* Conteúdo */}
        <main>
          {children}
        </main>
        
        </div>
        
      </div>
  );
}