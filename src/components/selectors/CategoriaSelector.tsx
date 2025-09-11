import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoriesService } from '@/services/categoriesService';
import { Category } from '@/types/category';
import * as LucideIcons from 'lucide-react';

interface CategoriaSelectorProps {
  value: string;
  onChange: (value: string) => void;
  tipo?: 'income' | 'expense' | 'all';
  placeholder?: string;
}

export function CategoriaSelector({ value, onChange, tipo = 'all', placeholder = "Selecione uma categoria" }: CategoriaSelectorProps) {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategorias();
  }, [tipo]);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const filters = tipo !== 'all' ? { type: tipo } : undefined;
      const data = await categoriesService.list(filters);
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-3 h-3" /> : <LucideIcons.Circle className="w-3 h-3" />;
  };

  if (loading) return <div>Carregando categorias...</div>;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categorias.map((categoria) => (
          <SelectItem key={categoria.id} value={categoria.id}>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex items-center justify-center text-white text-xs"
                style={{ backgroundColor: categoria.color }}
              >
                {categoria.icon && getIconComponent(categoria.icon)}
              </div>
              <span>{categoria.name}</span>
              <span className="text-xs text-muted-foreground">
                ({categoria.type === 'income' ? 'Receita' : 'Despesa'})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}