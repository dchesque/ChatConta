import { useState, useCallback } from 'react';

interface LoadingStates {
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
}

// Hook para gerenciar estados de loading de forma consistente
export function useLoadingStates(): LoadingStates & {
  setLoading: (key: 'loading' | 'saving' | 'deleting' | 'updating', value: boolean) => void;
} {
  const [states, setStates] = useState<LoadingStates>({
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    isUpdating: false
  });

  const setLoading = useCallback((key: 'loading' | 'saving' | 'deleting' | 'updating', value: boolean) => {
    setStates(prev => ({
      ...prev,
      [`is${key.charAt(0).toUpperCase() + key.slice(1)}`]: value
    }));
  }, []);

  return {
    ...states,
    setLoading
  };
}

// Hook original mantido para compatibilidade
export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  };
}

// Componente de loading overlay
export function LoadingOverlay({ 
  isLoading, 
  message = 'Carregando...', 
  children 
}: { 
  isLoading: boolean; 
  message?: string; 
  children: React.ReactNode; 
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600 font-medium">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}