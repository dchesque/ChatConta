import React, { forwardRef, useState } from 'react';
import { X, Check, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputValidacaoProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  obrigatorio?: boolean;
  erro?: string;
  sucesso?: boolean;
  validacao?: (valor: string) => string;
  mascara?: (valor: string) => string;
  maxLength?: number;
  className?: string;
  dica?: string;
  isLoading?: boolean;
  loadingText?: string;
}

export const InputValidacao = forwardRef<HTMLInputElement, InputValidacaoProps>(({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  obrigatorio = false,
  erro,
  sucesso = false,
  validacao,
  mascara,
  maxLength,
  className,
  dica,
  disabled,
  isLoading = false,
  loadingText = 'Carregando...',
  ...props
}, ref) => {
  const [localErro, setLocalErro] = useState('');
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value;
    
    // Aplicar máscara se fornecida
    if (mascara) {
      valor = mascara(valor);
    }
    
    // Limitar comprimento se definido
    if (maxLength && valor.length > maxLength) {
      valor = valor.slice(0, maxLength);
    }
    
    // Atualizar valor
    const novoEvento = { ...e, target: { ...e.target, value: valor } };
    onChange(novoEvento);
    
    // Validação em tempo real se o campo já foi tocado
    if (validacao && touched) {
      const mensagemErro = validacao(valor);
      setLocalErro(mensagemErro);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    setFocused(false);
    
    if (validacao) {
      const mensagemErro = validacao(value);
      setLocalErro(mensagemErro);
    }
    
    props.onBlur?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const temErro = erro || localErro;
  const temSucesso = sucesso && !temErro && value.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {obrigatorio && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      
      {/* Input Container */}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            // Base styles
            "w-full px-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl",
            "focus:ring-2 focus:border-transparent transition-all duration-200",
            "placeholder:text-gray-400",
            
            // Estados condicionais
            temErro
              ? "border-red-500 focus:ring-red-200"
              : temSucesso
              ? "border-green-500 focus:ring-green-200"
              : "border-gray-300/50 focus:ring-blue-500/20 focus:border-blue-500",
            
            // Estado desabilitado
            (disabled || isLoading) && "bg-gray-100/80 border-gray-200/50 text-gray-500 cursor-not-allowed",
            
            // Estado de foco
            focused && !temErro && !temSucesso && "border-blue-500 ring-2 ring-blue-500/20",
            
            // Espaço para ícone de loading
            isLoading && "pr-10"
          )}
          {...props}
        />
        
        {/* Ícone de Status */}
        {isLoading ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        ) : (temErro || temSucesso) && !disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {temErro ? (
              <X className="w-5 h-5 text-red-500" />
            ) : (
              <Check className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Mensagem de Erro */}
      {temErro && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{temErro}</span>
        </p>
      )}
      
      {/* Mensagem de Sucesso */}
      {temSucesso && (
        <p className="text-sm text-green-600 flex items-center space-x-1">
          <CheckCircle className="w-4 h-4" />
          <span>Campo preenchido corretamente</span>
        </p>
      )}
      
      {/* Mensagem de Loading */}
      {isLoading && (
        <p className="text-sm text-blue-600 flex items-center space-x-1">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </p>
      )}
      
      {/* Dica */}
      {dica && !temErro && !temSucesso && !isLoading && (
        <p className="text-sm text-gray-500">{dica}</p>
      )}
    </div>
  );
});

InputValidacao.displayName = 'InputValidacao';