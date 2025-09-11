import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { 
  validarValor, 
  validarDescricao, 
  validarDocumento, 
  validarData, 
  validarDataVencimento, 
  validarObservacoes 
} from '@/utils/validacoesTempoReal';

export interface ValidationErrors {
  [key: string]: string;
}

export function useValidacaoTempoReal(initialValues: Record<string, any> = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Debounce de 500ms para validações
  const debouncedValues = useDebounce(values, 500);

  const validateField = useCallback((fieldName: string, value: any, extraValidation?: any) => {
    let error = '';

    switch (fieldName) {
      case 'valor':
      case 'valorTotal':
      case 'valorOriginal':
        error = validarValor(String(value || ''));
        break;
      case 'descricao':
      case 'nome':
        error = validarDescricao(String(value || ''));
        break;
      case 'documento':
      case 'numeroDocumento':
        error = validarDocumento(String(value || ''));
        break;
      case 'dataEmissao':
      case 'dataRecebimento':
        error = validarData(String(value || ''));
        break;
      case 'dataVencimento':
        error = validarDataVencimento(String(value || ''), extraValidation?.dataEmissao);
        break;
      case 'observacoes':
        error = validarObservacoes(String(value || ''));
        break;
      default:
        // Validação customizada pode ser passada
        if (extraValidation?.customValidator) {
          error = extraValidation.customValidator(value);
        }
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error === '';
  }, []);

  const setValue = useCallback((fieldName: string, value: any, extraValidation?: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validação imediata para alguns campos críticos
    if (['valor', 'dataVencimento'].includes(fieldName)) {
      validateField(fieldName, value, extraValidation);
    }
  }, [validateField]);

  const setMultipleValues = useCallback((newValues: Record<string, any>) => {
    setValues(prev => ({ ...prev, ...newValues }));
    Object.keys(newValues).forEach(key => {
      setTouched(prev => ({ ...prev, [key]: true }));
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(values).forEach(fieldName => {
      const isFieldValid = validateField(fieldName, values[fieldName]);
      if (!isFieldValid) {
        isValid = false;
      }
    });

    return isValid;
  }, [values, validateField]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback((fieldName: string) => ({
    value: values[fieldName] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
      setValue(fieldName, e.target.value),
    error: touched[fieldName] ? errors[fieldName] : '',
    hasError: touched[fieldName] && !!errors[fieldName]
  }), [values, errors, touched, setValue]);

  return {
    values,
    errors,
    touched,
    setValue,
    setMultipleValues,
    validateField,
    validateForm,
    reset,
    getFieldProps,
    hasErrors: Object.values(errors).some(error => error !== ''),
    hasAnyError: Object.keys(errors).some(key => touched[key] && errors[key])
  };
}