import React from 'react';
import { useValidacaoTempoReal } from '@/hooks/useValidacaoTempoReal';
import { useFormulario } from '@/hooks/useFormulario';
import { EsquemaValidacao } from '@/utils/validacoes';
import { showMessage } from '@/utils/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    customValidator?: (value: any) => string;
  };
}

interface FormularioPadraoProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  validationSchema?: EsquemaValidacao;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const FormularioPadrao: React.FC<FormularioPadraoProps> = ({
  fields,
  initialValues = {},
  validationSchema,
  onSubmit,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  onCancel,
  isLoading = false,
  className = ''
}) => {
  // Usar hook de validação em tempo real
  const {
    values,
    errors,
    setValue,
    validateForm,
    reset,
    getFieldProps,
    hasAnyError
  } = useValidacaoTempoReal(initialValues);

  // Usar hook de formulário para gerenciar submissão
  const {
    salvar,
    estaCarregando
  } = useFormulario(
    initialValues,
    async (data) => {
      try {
        await onSubmit(data);
        showMessage.saveSuccess();
        reset();
      } catch (error) {
        throw error;
      }
    },
    validationSchema
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showMessage.validationError();
      return;
    }

    await salvar(values);
  };

  const renderField = (field: FormField) => {
    const fieldProps = getFieldProps(field.name);
    const hasError = !!fieldProps.error;

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {field.type === 'textarea' ? (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            className={`${hasError ? 'border-red-500 focus:ring-red-500' : ''}`}
            {...fieldProps}
          />
        ) : field.type === 'select' ? (
          <select
            id={field.name}
            className={`input-base w-full ${hasError ? 'border-red-500 focus:ring-red-500' : ''}`}
            {...fieldProps}
          >
            <option value="">Selecione...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            className={`${hasError ? 'border-red-500 focus:ring-red-500' : ''}`}
            {...fieldProps}
          />
        )}

        {hasError && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <span>⚠️</span>
            <span>{fieldProps.error}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map(renderField)}
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={estaCarregando || isLoading}
          >
            {cancelLabel}
          </Button>
        )}

        <Button
          type="submit"
          disabled={hasAnyError || estaCarregando || isLoading}
          className="btn-primary min-w-[120px]"
        >
          {(estaCarregando || isLoading) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
};