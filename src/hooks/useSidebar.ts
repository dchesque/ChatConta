import { useState, useEffect } from 'react';
import { useResponsive } from './useResponsive';

export function useSidebar() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Apenas para controle do menu mobile overlay
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fechar menu mobile automaticamente quando muda para desktop
  useEffect(() => {
    if (isDesktop && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isDesktop, mobileMenuOpen]);

  // Fechar menu mobile ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Bloquear scroll do body quando menu mobile aberto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return {
    mobileMenuOpen,
    setMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    isMobile,
    isTablet,
    isDesktop
  };
}