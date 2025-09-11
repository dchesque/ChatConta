import React, { forwardRef } from 'react';
import InputMask from 'react-input-mask';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MaskedInputProps {
  mask: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(({
  mask,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  error,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      <InputMask
        mask={mask}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        {...props}
      >
        {(inputProps: any) => (
          <Input
            {...inputProps}
            ref={ref}
            placeholder={placeholder}
            className={cn(
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
          />
        )}
      </InputMask>
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
});

MaskedInput.displayName = 'MaskedInput';

// Máscaras predefinidas para uso no Brasil
export const masks = {
  cpf: '999.999.999-99',
  cnpj: '99.999.999/9999-99',
  phone: '(99) 99999-9999',
  cep: '99999-999',
  currency: 'R$ 999.999.999,99',
  percentage: '99,99%'
};