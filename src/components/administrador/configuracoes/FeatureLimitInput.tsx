import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Infinity } from 'lucide-react';

interface FeatureLimitInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  helpText?: string;
}

export function FeatureLimitInput({ 
  label, 
  value, 
  onChange, 
  disabled = false,
  helpText 
}: FeatureLimitInputProps) {
  const [isUnlimited, setIsUnlimited] = useState(value === -1);

  const handleUnlimitedChange = (unlimited: boolean) => {
    setIsUnlimited(unlimited);
    if (unlimited) {
      onChange(-1);
    } else {
      onChange(0);
    }
  };

  const handleValueChange = (inputValue: string) => {
    const numValue = parseInt(inputValue) || 0;
    onChange(Math.max(0, numValue));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {value === -1 && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Infinity className="w-3 h-3" />
            <span>Ilimitado</span>
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {/* Toggle para ilimitado */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Ilimitado</span>
          <Switch
            checked={isUnlimited}
            onCheckedChange={handleUnlimitedChange}
            disabled={disabled}
          />
        </div>

        {/* Input para valor específico */}
        {!isUnlimited && (
          <Input
            type="number"
            min="0"
            value={value >= 0 ? value : 0}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={disabled}
            placeholder="0"
            className="text-center"
          />
        )}

        {/* Exibição quando ilimitado */}
        {isUnlimited && (
          <div className="flex items-center justify-center py-2 px-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center space-x-2 text-gray-600">
              <Infinity className="w-4 h-4" />
              <span className="text-sm font-medium">Sem limite</span>
            </div>
          </div>
        )}

        {/* Texto de ajuda */}
        {helpText && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}

        {/* Valor atual formatado */}
        <div className="text-xs text-center text-muted-foreground">
          {value === -1 ? (
            'Sem limitação'
          ) : (
            `Limite: ${value} ${value === 1 ? 'item' : 'itens'}`
          )}
        </div>
      </div>
    </div>
  );
}