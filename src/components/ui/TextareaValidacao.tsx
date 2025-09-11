import React, { forwardRef, useState } from 'react';
import { X, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextareaValidacaoProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  obrigatorio?: boolean;
  erro?: string;
  sucesso?: boolean;
  validacao?: (valor: string) => string;
  rows?: number;
  maxLength?: number;
  className?: string;
  dica?: string;
}

export const TextareaValidacao = forwardRef<HTMLTextAreaElement, TextareaValidacaoProps>(({
  id,
  label,
  value,
  onChange,
  placeholder,
  obrigatorio = false,
  erro,
  sucesso = false,
  validacao,
  rows = 4,
  maxLength,
  className,
  dica,
  disabled,
  ...props
}, ref) => {
  const [localErro, setLocalErro] = useState('');
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let valor = e.target.value;
    
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

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setTouched(true);
    setFocused(false);
    
    if (validacao) {
      const mensagemErro = validacao(value);
      setLocalErro(mensagemErro);
    }
    
    props.onBlur?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const temErro = erro || localErro;
  const temSucesso = sucesso && !temErro && value.length > 0;

  const caracteresRestantes = maxLength ? maxLength - value.length : null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <div className="flex justify-between items-center">
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {obrigatorio && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        
        {/* Contador de caracteres */}
        {maxLength && (
          <span className={cn(
            "text-xs",
            caracteresRestantes && caracteresRestantes < 50 
              ? "text-orange-500" 
              : "text-gray-400"
          )}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      
      {/* Textarea Container */}
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(
            // Base styles
            "w-full px-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl",
            "focus:ring-2 focus:border-transparent transition-all duration-200",
            "placeholder:text-gray-400 resize-none",
            
            // Estados condicionais
            temErro
              ? "border-red-500 focus:ring-red-200"
              : temSucesso
              ? "border-green-500 focus:ring-green-200"
              : "border-gray-300/50 focus:ring-blue-500/20 focus:border-blue-500",
            
            // Estado desabilitado
            disabled && "bg-gray-100/80 border-gray-200/50 text-gray-500 cursor-not-allowed",
            
            // Estado de foco
            focused && !temErro && !temSucesso && "border-blue-500 ring-2 ring-blue-500/20"
          )}
          {...props}
        />
        
        {/* Ícone de Status */}
        {(temErro || temSucesso) && !disabled && (
          <div className="absolute top-3 right-3">
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
      
      {/* Dica */}
      {dica && !temErro && !temSucesso && (
        <p className="text-sm text-gray-500">{dica}</p>
      )}
    </div>
  );
});

TextareaValidacao.displayName = 'TextareaValidacao';