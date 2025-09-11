import { useState, useCallback, useEffect } from 'react';
import { useFormSecurity } from '@/components/ui/FormSecurityProvider';
import { toast } from 'sonner';

interface UseSecureFormOptions<T> {
  initialData: T;
  validationSchema?: (data: T) => string[];
  onSubmit?: (sanitizedData: T) => Promise<void> | void;
  enableRealTimeValidation?: boolean;
}

export function useSecureForm<T extends Record<string, any>>({
  initialData,
  validationSchema,
  onSubmit,
  enableRealTimeValidation = true
}: UseSecureFormOptions<T>) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBeenModified, setHasBeenModified] = useState(false);
  
  const { 
    sanitizeFormData, 
    validateSecureSubmission, 
    reportSecurityViolation 
  } = useFormSecurity();

  // Validação em tempo real
  useEffect(() => {
    if (!enableRealTimeValidation || !hasBeenModified) {
      return;
    }

    const validateData = () => {
      const newErrors: string[] = [];
      
      // Validação customizada
      if (validationSchema) {
        newErrors.push(...validationSchema(data));
      }
      
      // Validação de segurança
      if (!validateSecureSubmission(data)) {
        newErrors.push('Dados contêm conteúdo inseguro');
      }
      
      setErrors(newErrors);
    };

    const debounceTimer = setTimeout(validateData, 300);
    return () => clearTimeout(debounceTimer);
  }, [data, enableRealTimeValidation, hasBeenModified, validationSchema, validateSecureSubmission]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setHasBeenModified(true);
    
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Sanitizar o valor imediatamente
      try {
        const sanitizedValue = sanitizeFormData({ [field]: value })[field as string];
        if (sanitizedValue !== value) {
          reportSecurityViolation('input_sanitized', { 
            field: field as string, 
            original: value, 
            sanitized: sanitizedValue 
          });
        }
        return { ...prev, [field]: sanitizedValue };
      } catch (error) {
        reportSecurityViolation('sanitization_error', { 
          field: field as string, 
          error: error.message 
        });
        return newData;
      }
    });
  }, [sanitizeFormData, reportSecurityViolation]);

  const updateData = useCallback((newData: Partial<T>) => {
    setHasBeenModified(true);
    
    try {
      const sanitizedData = sanitizeFormData(newData);
      setData(prev => ({ ...prev, ...sanitizedData }));
    } catch (error) {
      reportSecurityViolation('bulk_sanitization_error', { error: error.message });
      setData(prev => ({ ...prev, ...newData }));
    }
  }, [sanitizeFormData, reportSecurityViolation]);

  const reset = useCallback((newInitialData?: T) => {
    const resetData = newInitialData || initialData;
    setData(resetData);
    setErrors([]);
    setHasBeenModified(false);
    setIsLoading(false);
  }, [initialData]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Validação final
      const finalErrors: string[] = [];
      
      if (validationSchema) {
        finalErrors.push(...validationSchema(data));
      }
      
      if (!validateSecureSubmission(data)) {
        finalErrors.push('Dados contêm conteúdo inseguro');
      }
      
      if (finalErrors.length > 0) {
        setErrors(finalErrors);
        toast.error('Corrija os erros antes de continuar');
        return;
      }

      // Sanitização final
      const sanitizedData = sanitizeFormData(data);
      
      // Verificar se os dados foram alterados pela sanitização
      const originalStr = JSON.stringify(data);
      const sanitizedStr = JSON.stringify(sanitizedData);
      
      if (originalStr !== sanitizedStr) {
        reportSecurityViolation('final_sanitization_changes', {
          originalSize: originalStr.length,
          sanitizedSize: sanitizedStr.length
        });
      }

      // Executar submit
      await onSubmit?.(sanitizedData);
      
      setErrors([]);
      toast.success('Dados salvos com sucesso!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro no submit seguro:', error);
      
      reportSecurityViolation('submit_error', { error: errorMessage });
      setErrors([errorMessage]);
      toast.error('Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  }, [data, isLoading, validationSchema, validateSecureSubmission, sanitizeFormData, reportSecurityViolation, onSubmit]);

  const isValid = errors.length === 0;
  const canSubmit = isValid && hasBeenModified && !isLoading;

  return {
    // Estados
    data,
    errors,
    isLoading,
    isValid,
    canSubmit,
    hasBeenModified,
    
    // Ações
    updateField,
    updateData,
    reset,
    handleSubmit,
    
    // Utilitários
    setErrors,
    setIsLoading
  };
}