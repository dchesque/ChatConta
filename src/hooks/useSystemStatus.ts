import { useState, useEffect } from 'react';
import { FEATURES } from '@/config/features';
import { DATABASE_CONFIG } from '@/config/database.config';

interface SystemStatus {
  isOnline: boolean;
  isDemoMode: boolean;
  lastSync: string | null;
  appVersion: string;
}

export function useSystemStatus() {
  // Detecta se está em modo demo baseado apenas na configuração de mock data
  // Em produção, nunca deve estar em modo demo
  const isDemoMode = !import.meta.env.PROD && DATABASE_CONFIG.USE_MOCK_DATA;
  
  const [status, setStatus] = useState<SystemStatus>({
    isOnline: navigator.onLine,
    isDemoMode,
    lastSync: localStorage.getItem('lastSync'),
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      updateLastSync();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateLastSync = () => {
    const now = new Date().toLocaleString('pt-BR');
    localStorage.setItem('lastSync', now);
    setStatus(prev => ({ ...prev, lastSync: now }));
  };

  const toggleDemoMode = () => {
    setStatus(prev => ({ ...prev, isDemoMode: !prev.isDemoMode }));
  };

  return {
    ...status,
    updateLastSync,
    toggleDemoMode
  };
}