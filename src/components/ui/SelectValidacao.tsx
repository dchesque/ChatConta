import React, { useState } from 'react';
import { Check, ChevronDown, X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Select from '@radix-ui/react-select';

interface SelectValidacaoProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  obrigatorio?: boolean;
  erro?: string;
  sucesso?: boolean;
  validacao?: (valor: string) => string;
  className?: string;
  dica?: string;
  disabled?: boolean;
}

export function SelectValidacao({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção...",
  obrigatorio = false,
  erro,
  sucesso = false,
  validacao,
  className,
  dica,
  disabled = false
}: SelectValidacaoProps) {
  const [localErro, setLocalErro] = useState('');
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);

  const handleValueChange = (novoValor: string) => {
    onChange(novoValor);
    
    // Validação em tempo real se o campo já foi tocado
    if (validacao && touched) {
      const mensagemErro = validacao(novoValor);
      setLocalErro(mensagemErro);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    // Marcar como tocado quando o usuário abre o select
    if (isOpen && !touched) {
      setTouched(true);
    }
    
    // Validar quando fechar o select
    if (!isOpen && validacao && touched) {
      const mensagemErro = validacao(value);
      setLocalErro(mensagemErro);
    }
  };

  const temErro = erro || localErro;
  const temSucesso = sucesso && !temErro && value.length > 0;

  const opcaoSelecionada = options.find(option => option.value === value);

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
      
      {/* Select Container */}
      <div className="relative">
        <Select.Root
          value={value}
          onValueChange={handleValueChange}
          onOpenChange={handleOpenChange}
          disabled={disabled}
          open={open}
        >
          <Select.Trigger
            className={cn(
              // Base styles
              "w-full px-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl",
              "focus:ring-2 focus:border-transparent transition-all duration-200",
              "flex items-center justify-between text-left",
              "disabled:bg-gray-100/80 disabled:border-gray-200/50 disabled:text-gray-500 disabled:cursor-not-allowed",
              
              // Estados condicionais
              temErro
                ? "border-red-500 focus:ring-red-200"
                : temSucesso
                ? "border-green-500 focus:ring-green-200"
                : "border-gray-300/50 focus:ring-blue-500/20 focus:border-blue-500",
              
              // Estado de foco
              open && !temErro && !temSucesso && "border-blue-500 ring-2 ring-blue-500/20"
            )}
          >
            <Select.Value className={cn(
              opcaoSelecionada ? "text-gray-900" : "text-gray-400"
            )}>
              {opcaoSelecionada ? opcaoSelecionada.label : placeholder}
            </Select.Value>
            
            <div className="flex items-center space-x-2">
              {/* Ícone de Status */}
              {(temErro || temSucesso) && !disabled && (
                <>
                  {temErro ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </>
              )}
              
              {/* Seta do Select */}
              <Select.Icon>
                <ChevronDown className={cn(
                  "w-5 h-5 text-gray-400 transition-transform duration-200",
                  open && "rotate-180"
                )} />
              </Select.Icon>
            </div>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
              <Select.Viewport className="p-2">
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      "relative flex items-center px-3 py-2 rounded-lg cursor-pointer select-none transition-colors",
                      "data-[highlighted]:bg-blue-50/80 data-[highlighted]:text-blue-700",
                      "data-[disabled]:text-gray-400 data-[disabled]:cursor-not-allowed",
                      option.value === value && "bg-blue-100/80 text-blue-700"
                    )}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    {option.value === value && (
                      <Select.ItemIndicator className="absolute right-2">
                        <Check className="w-4 h-4" />
                      </Select.ItemIndicator>
                    )}
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
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
}