import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MonthYearSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function MonthYearSelector({ selectedDate, onDateChange }: MonthYearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewYear, monthIndex, 1);
    onDateChange(newDate);
    setIsOpen(false);
  };
  
  const handleYearChange = (increment: number) => {
    setViewYear(prev => prev + increment);
  };
  
  const isCurrentMonth = (monthIndex: number) => {
    return monthIndex === currentMonth && viewYear === currentYear;
  };
  
  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Calendar className="w-4 h-4" />
          <span className="capitalize">{formatSelectedDate()}</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
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
                {month.substring(0, 3)}
              </Button>
            ))}
          </div>
          
          {/* Footer - Botão Mês Atual */}
          <div className="pt-4 border-t mt-4">
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}