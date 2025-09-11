import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimezone } from '@/hooks/useTimezone';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  disabled = false,
  className
}) => {
  const { formatarData, formatarParaInput, converterInputParaDate } = useTimezone();
  const [open, setOpen] = React.useState(false);

  const selectedDate = value ? converterInputParaDate(value) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Converter para formato de input (YYYY-MM-DD)
      const inputDate = formatarParaInput(date);
      onChange(inputDate);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl hover:bg-white/90',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatarData(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};