import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface MonthPickerFilterProps {
  value: string; // YYYY-MM format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const MONTHS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function MonthPickerFilter({ value, onChange, placeholder = "Selecionar mês", className = "" }: MonthPickerFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Se há valor, extrair ano e mês
  const currentDate = value ? new Date(`${value}-01`) : null;
  const [viewYear, setViewYear] = useState(currentDate?.getFullYear() || new Date().getFullYear());
  
  const handleMonthSelect = (monthIndex: number) => {
    const monthString = String(monthIndex + 1).padStart(2, '0');
    const newValue = `${viewYear}-${monthString}`;
    onChange(newValue);
    setIsOpen(false);
  };
  
  const handleYearChange = (increment: number) => {
    setViewYear(prev => prev + increment);
  };
  
  const isCurrentMonth = (monthIndex: number) => {
    if (!value) return false;
    const [year, month] = value.split('-');
    return parseInt(month) === monthIndex + 1 && parseInt(year) === viewYear;
  };
  
  const formatDisplayValue = () => {
    if (!value) return placeholder;
    const [year, month] = value.split('-');
    const monthIndex = parseInt(month) - 1;
    return `${MONTHS_FULL[monthIndex]} ${year}`;
  };

  const clearValue = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`justify-start text-left font-normal ${className} ${!value ? 'text-muted-foreground' : ''}`}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          {/* Header do Ano */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange(-1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h3 className="font-semibold text-lg">
              {viewYear}
            </h3>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleYearChange(1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Grade de Meses */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, index) => (
              <Button
                key={month}
                variant={isCurrentMonth(index) ? "default" : "ghost"}
                className="h-10 text-xs font-medium justify-center"
                onClick={() => handleMonthSelect(index)}
              >
                {month}
              </Button>
            ))}
          </div>
          
          {/* Footer - Botões de Ação */}
          <div className="pt-4 border-t mt-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                const now = new Date();
                setViewYear(now.getFullYear());
                handleMonthSelect(now.getMonth());
              }}
            >
              Ir para mês atual
            </Button>
            
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={clearValue}
              >
                Todos os meses
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}