import { useState, useEffect } from 'react';

export function useModalResponsive() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return {
    isMobile,
    getModalSize: (defaultSize: string) => {
      if (isMobile) {
        return 'full'; // Em mobile, usar tela cheia
      }
      return defaultSize;
    },
    getModalMaxHeight: () => {
      return isMobile ? '100vh' : '90vh';
    },
    getModalClasses: (baseClasses: string = '') => {
      if (isMobile) {
        return `${baseClasses} h-full max-h-[100vh] m-0 rounded-none`.trim();
      }
      return `${baseClasses} max-h-[90vh] m-4 rounded-2xl`.trim();
    }
  };
}