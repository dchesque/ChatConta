import React, { useState, useCallback } from 'react';
import { Input } from './input';
import { sanitizeString, sanitizeMonetaryValue, sanitizeEmail, sanitizePhone } from '@/utils/sanitization';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  sanitizationType?: 'string' | 'monetary' | 'email' | 'phone' | 'none';
  onSecureChange?: (sanitizedValue: string) => void;
  maxLength?: number;
  className?: string;
}

export const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(({
  sanitizationType = 'string',
  onSecureChange,
  onChange,
  maxLength = 1000,
  className,
  ...props
}, ref) => {
  const [lastSanitizedValue, setLastSanitizedValue] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Aplicar sanitização baseada no tipo
    let sanitizedValue = rawValue;
    
    switch (sanitizationType) {
      case 'string':
        sanitizedValue = sanitizeString(rawValue);
        break;
      case 'monetary':
        sanitizedValue = sanitizeMonetaryValue(rawValue).toString();
        break;
      case 'email':
        sanitizedValue = sanitizeEmail(rawValue);
        break;
      case 'phone':
        sanitizedValue = sanitizePhone(rawValue);
        break;
      case 'none':
        // Pelo menos aplicar limite de tamanho
        sanitizedValue = rawValue.substring(0, maxLength);
        break;
    }
    
    // Atualizar apenas se o valor mudou após sanitização
    if (sanitizedValue !== lastSanitizedValue) {
      setLastSanitizedValue(sanitizedValue);
      
      // Atualizar o valor do input se foi alterado pela sanitização
      if (sanitizedValue !== rawValue) {
        e.target.value = sanitizedValue;
      }
      
      // Chamar callbacks
      onSecureChange?.(sanitizedValue);
      onChange?.(e);
    } else if (rawValue === sanitizedValue) {
      // Se o valor não mudou com a sanitização, ainda chamar onChange
      onChange?.(e);
    }
  }, [sanitizationType, maxLength, onSecureChange, onChange, lastSanitizedValue]);

  return (
    <Input
      {...props}
      ref={ref}
      onChange={handleChange}
      maxLength={maxLength}
      className={cn(
        // Adicionar indicador visual para inputs seguros
        "border-l-2 border-l-blue-500/30",
        className
      )}
      autoComplete="off" // Prevenir autocomplete em campos sensíveis
    />
  );
});

SecureInput.displayName = 'SecureInput';