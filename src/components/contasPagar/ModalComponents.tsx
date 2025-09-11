// Componentes base reutilizáveis para modais
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// === INTERFACES ===
interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  color?: 'blue' | 'purple' | 'green' | 'emerald' | 'gray' | 'red' | 'orange';
}

interface FieldDisplayProps {
  label: string;
  value: string | number | ReactNode;
  valueClass?: string;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

// === COMPONENTES BASE ===

// Header de seção com ícone colorido
export const SectionHeader = ({ icon: Icon, title, color = "blue" }: SectionHeaderProps) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    gray: 'bg-gray-100 text-gray-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="flex items-center space-x-3 mb-6">
      <div className={`p-2 rounded-xl ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-base font-medium text-gray-900">{title}</h3>
    </div>
  );
};

// Componente para exibir campo e valor
export const FieldDisplay = ({ label, value, valueClass = "text-gray-900" }: FieldDisplayProps) => (
  <div>
    <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
    <div className={`text-sm ${valueClass}`}>
      {value || '-'}
    </div>
  </div>
);

// Spinner de loading
export const LoadingSpinner = ({ size = "md" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };
  
  return (
    <div className={`border-2 border-current border-t-transparent rounded-full animate-spin ${sizeClasses[size]}`}></div>
  );
};

// === CLASSES BASE PARA MODAIS ===
export const baseModalClasses = {
  overlay: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50",
  container: "bg-white/98 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden",
  header: "flex items-center justify-between p-8 border-b border-gray-100",
  content: "p-8 overflow-y-auto max-h-[calc(95vh-180px)]",
  footer: "flex items-center justify-between p-8 border-t border-gray-100 bg-gray-50/30"
};

// === COMPONENTE DE INPUT COM MÁSCARA DE MOEDA ===
interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CurrencyInput = ({ value, onChange, placeholder = "R$ 0,00", className = "", disabled = false }: CurrencyInputProps) => {
  const formatarMoedaInput = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const parseMoedaInput = (valorString: string): number => {
    if (!valorString) return 0;
    return parseFloat(valorString.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseMoedaInput(e.target.value);
    onChange(valor);
  };

  return (
    <input
      type="text"
      value={formatarMoedaInput(value)}
      onChange={handleChange}
      disabled={disabled}
      className={`w-full text-right font-medium ${className}`}
      placeholder={placeholder}
    />
  );
};

// === GRID DE VALORES FINANCEIROS ===
interface ValorGridProps {
  valorOriginal: number;
  valorJuros?: number;
  valorDesconto?: number;
  valorFinal: number;
  percentualJuros?: number;
  percentualDesconto?: number;
}

export const ValorGrid = ({ valorOriginal, valorJuros, valorDesconto, valorFinal, percentualJuros, percentualDesconto }: ValorGridProps) => (
  <div className="space-y-6">
    <FieldDisplay label="Valor Original" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorOriginal)} />
    
    {valorJuros && valorJuros > 0 && (
      <FieldDisplay 
        label="Juros" 
        value={`${percentualJuros ? `${percentualJuros}% - ` : ''}${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorJuros)}`}
        valueClass="text-red-600 font-semibold"
      />
    )}
    
    {valorDesconto && valorDesconto > 0 && (
      <FieldDisplay 
        label="Desconto" 
        value={`${percentualDesconto ? `${percentualDesconto}% - ` : ''}${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorDesconto)}`}
        valueClass="text-green-600 font-semibold"
      />
    )}
    
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-gray-800">Valor Final:</span>
        <span className="text-3xl font-bold text-blue-600">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorFinal)}
        </span>
      </div>
    </div>
  </div>
);