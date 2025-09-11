import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CampoComValidacaoProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validacao?: (value: string) => string;
  placeholder?: string;
  tipo?: string;
  obrigatorio?: boolean;
  className?: string;
}

export const CampoComValidacao = ({ 
  label, 
  value, 
  onChange, 
  validacao, 
  placeholder, 
  tipo = "text",
  obrigatorio = false,
  className
}: CampoComValidacaoProps) => {
  const [foiTocado, setFoiTocado] = useState(false);
  const [erro, setErro] = useState('');
  
  useEffect(() => {
    if (foiTocado && validacao) {
      const resultadoValidacao = validacao(value);
      setErro(resultadoValidacao || '');
    }
  }, [value, foiTocado, validacao]);
  
  const temErro = foiTocado && erro;
  const temSucesso = foiTocado && !erro && value;
  
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center space-x-1">
        <span>{label}</span>
        {obrigatorio && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          type={tipo}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setFoiTocado(true)}
          placeholder={placeholder}
          className={cn(
            "transition-all duration-200",
            temErro && "border-red-500 focus:border-red-500 focus:ring-red-500",
            temSucesso && "border-green-500 focus:border-green-500 focus:ring-green-500"
          )}
        />
        
        {/* Ícone de status */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {temErro && <AlertCircle className="w-4 h-4 text-red-500" />}
          {temSucesso && <CheckCircle className="w-4 h-4 text-green-500" />}
        </div>
      </div>
      
      {/* Mensagem de erro */}
      {temErro && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>{erro}</span>
        </p>
      )}
      
      {/* Mensagem de sucesso */}
      {temSucesso && (
        <p className="text-sm text-green-600 flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>✓ Válido</span>
        </p>
      )}
    </div>
  );
};