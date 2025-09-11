import React from 'react';
import { X, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './button';

interface CancelButtonProps {
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'lg' | 'default';
  variant?: 'ghost' | 'outline' | 'destructive';
  className?: string;
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  onCancel,
  isLoading = false,
  disabled = false,
  label = 'Cancelar',
  size = 'default',
  variant = 'ghost',
  className = ''
}) => {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onCancel}
      disabled={disabled || isLoading}
      className={`flex items-center space-x-2 ${className}`}
    >
      <X className="w-4 h-4" />
      <span>{label}</span>
    </Button>
  );
};

interface OperationStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'timeout';
  message?: string;
  onCancel?: () => void;
  showCancelButton?: boolean;
  className?: string;
}

export const OperationStatus: React.FC<OperationStatusProps> = ({
  status,
  message,
  onCancel,
  showCancelButton = true,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Clock className="w-4 h-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
      case 'timeout':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'loading':
        return 'Processando...';
      case 'success':
        return 'Operação concluída com sucesso!';
      case 'error':
        return 'Erro na operação';
      case 'timeout':
        return 'Operação demorou muito para responder';
      default:
        return '';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={`flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl ${className}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <span className="text-sm text-gray-700">{getStatusMessage()}</span>
      </div>
      
      {status === 'loading' && showCancelButton && onCancel && (
        <CancelButton
          onCancel={onCancel}
          size="sm"
          variant="outline"
          label="Cancelar"
        />
      )}
    </div>
  );
};

interface LongOperationWrapperProps {
  children: React.ReactNode;
  isRunning: boolean;
  onCancel?: () => void;
  operationName?: string;
  timeout?: number;
  className?: string;
}

export const LongOperationWrapper: React.FC<LongOperationWrapperProps> = ({
  children,
  isRunning,
  onCancel,
  operationName = 'operação',
  timeout = 30000,
  className = ''
}) => {
  const [showTimeout, setShowTimeout] = React.useState(false);

  React.useEffect(() => {
    if (isRunning && timeout > 0) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, timeout);

      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [isRunning, timeout]);

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {isRunning && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Clock className="w-8 h-8 animate-spin text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Processando {operationName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {showTimeout 
                    ? 'A operação está demorando mais que o esperado...' 
                    : 'Aguarde enquanto processamos sua solicitação'
                  }
                </p>
              </div>
              
              {onCancel && (
                <CancelButton
                  onCancel={onCancel}
                  label={showTimeout ? 'Forçar Cancelamento' : 'Cancelar'}
                  variant={showTimeout ? 'destructive' : 'outline'}
                  className="w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};