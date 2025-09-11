import React, { useState, useEffect } from 'react';
import { FolderTree } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/category';
import * as LucideIcons from 'lucide-react';

type SimpleCategory = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
};

interface CategoriaReceitaSelectorProps {
  value?: Category | SimpleCategory | null;
  onSelect: (category: Category | null) => void;
  placeholder?: string;
  className?: string;
}

export function CategoriaReceitaSelector({ 
  value, 
  onSelect, 
  placeholder = "Selecionar categoria...",
  className = ""
}: CategoriaReceitaSelectorProps) {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug logs para o value
  useEffect(() => {
    console.log('CategoriaReceitaSelector - Value recebido:', value);
    console.log('CategoriaReceitaSelector - Value ID:', value?.id);
    console.log('CategoriaReceitaSelector - Categorias carregadas:', categorias.length);
  }, [value, categorias]);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from('categories')
          .select('*')
          .eq('type', 'income')
          .is('deleted_at', null)
          .order('name');
        
        console.log('Categorias de receita carregadas do banco:', data);
        setCategorias(data || []);
      } catch (error) {
        console.error('Erro ao carregar categorias de receita:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategorias();
  }, []);

  const getIcon = (iconName?: string) => {
    if (!iconName) return <FolderTree className="h-4 w-4" />;
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <FolderTree className="h-4 w-4" />;
  };

  const handleValueChange = (id: string) => {
    console.log('CategoriaReceitaSelector - handleValueChange:', id);
    
    if (id === 'clear' || id === '') {
      onSelect(null);
      return;
    }
    
    const categoria = categorias.find(c => c.id === id);
    if (categoria) {
      console.log('CategoriaReceitaSelector - Categoria selecionada:', categoria);
      onSelect(categoria);
    }
  };

  // Determinar o valor para o Select
  const selectValue = value?.id || '';
  
  console.log('CategoriaReceitaSelector - Render - selectValue:', selectValue);
  console.log('CategoriaReceitaSelector - Render - loading:', loading);

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {value ? (
            <span className="flex items-center gap-2">
              <span style={{ color: value.color || '#6B7280' }}>
                {React.cloneElement(getIcon(value.icon) as React.ReactElement, { 
                  className: "h-4 w-4 inline" 
                })}
              </span>
              {value.name}
            </span>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value="__loading__" disabled>
            Carregando categorias...
          </SelectItem>
        ) : categorias.length === 0 ? (
          <SelectItem value="__empty__" disabled>
            Nenhuma categoria de receita encontrada
          </SelectItem>
        ) : (
          <>
            {value && (
              <SelectItem value="clear">
                <span className="text-red-600">Limpar seleção</span>
              </SelectItem>
            )}
            {categorias.map((categoria) => (
              <SelectItem key={categoria.id} value={categoria.id}>
                {categoria.name}
                {categoria.description && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({categoria.description})
                  </span>
                )}
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
}