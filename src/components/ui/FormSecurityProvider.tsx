
import React, { createContext, useContext, useCallback, useState } from 'react';
import { sanitizeObject } from '@/utils/sanitization';
import { toast } from 'sonner';

interface FormSecurityContextType {
  sanitizeFormData: (data: any) => any;
  validateSecureSubmission: (data: any) => boolean;
  reportSecurityViolation: (violation: string, context?: any) => void;
  isSecureMode: boolean;
  setSecureMode: (secure: boolean) => void;
}

const FormSecurityContext = createContext<FormSecurityContextType | undefined>(undefined);

export const useFormSecurity = () => {
  const context = useContext(FormSecurityContext);
  if (!context) {
    throw new Error('useFormSecurity deve ser usado dentro de um FormSecurityProvider');
  }
  return context;
};

interface FormSecurityProviderProps {
  children: React.ReactNode;
  enableSecurityLogging?: boolean;
}

export const FormSecurityProvider: React.FC<FormSecurityProviderProps> = ({
  children,
  enableSecurityLogging = true
}) => {
  const [isSecureMode, setSecureMode] = useState(true);
  const [securityViolations, setSecurityViolations] = useState<string[]>([]);

  const sanitizeFormData = useCallback((data: any) => {
    if (!isSecureMode) {
      return data;
    }
    
    try {
      return sanitizeObject(data);
    } catch (error: any) {
      // Em produção não poluir o console
      if (import.meta.env.DEV) {
        console.error('Erro na sanitização de dados:', error);
      }
      reportSecurityViolation('sanitization_error', { error: error?.message });
      return data; // Retorna dados originais em caso de erro na sanitização
    }
  }, [isSecureMode]);

  const validateSecureSubmission = useCallback((data: any) => {
    if (!isSecureMode) {
      return true;
    }

    // Verificações básicas de segurança
    const checks = [
      {
        condition: () => {
          const serialized = JSON.stringify(data);
          return serialized.length < 100000; // Limite de 100KB
        },
        message: 'Dados muito grandes'
      },
      {
        condition: () => {
          const serialized = JSON.stringify(data);
          return !/<script|javascript:|on\w+=/i.test(serialized);
        },
        message: 'Conteúdo potencialmente perigoso detectado'
      },
      {
        condition: () => {
          const keys = Object.keys(data);
          return keys.length < 100; // Máximo 100 campos
        },
        message: 'Muitos campos no formulário'
      }
    ];

    for (const check of checks) {
      if (!check.condition()) {
        reportSecurityViolation('validation_failed', { 
          message: check.message,
          dataSize: JSON.stringify(data).length
        });
        return false;
      }
    }

    return true;
  }, [isSecureMode]);

  const reportSecurityViolation = useCallback((violation: string, context?: any) => {
    if (!enableSecurityLogging) {
      return;
    }

    const violationData = {
      violation,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log local para desenvolvimento
    if (import.meta.env.DEV) {
      console.warn('🔒 Security Violation:', violationData);
    }

    // Adicionar à lista de violações
    setSecurityViolations(prev => [...prev.slice(-9), violation]); // Manter últimas 10

    // Mostrar toast para desenvolvedores (apenas em desenvolvimento)
    if (import.meta.env.DEV) {
      toast.error(`Violação de segurança: ${violation}`);
    }

    // Em produção, aqui poderíamos enviar para um serviço de monitoramento (Sentry, etc)
    if (import.meta.env.PROD) {
      // Envio assíncrono opcional
    }
  }, [enableSecurityLogging]);

  const value: FormSecurityContextType = {
    sanitizeFormData,
    validateSecureSubmission,
    reportSecurityViolation,
    isSecureMode,
    setSecureMode
  };

  return (
    <FormSecurityContext.Provider value={value}>
      {children}
      {/* Indicador de modo seguro (apenas em desenvolvimento) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isSecureMode 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          }`}>
            🔒 {isSecureMode ? 'Modo Seguro' : 'Modo Inseguro'}
            {securityViolations.length > 0 && (
              <span className="ml-2 bg-red-500 text-white px-1 rounded">
                {securityViolations.length}
              </span>
            )}
          </div>
        </div>
      )}
    </FormSecurityContext.Provider>
  );
};
