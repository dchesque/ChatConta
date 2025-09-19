import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Contact } from '@/types/contact';
type SimpleContact = {
  id: string;
  name: string;
  type?: string;
  document?: string;
};

interface PagadorSelectorProps {
  value?: Contact | SimpleContact | null;
  onSelect: (contact: Contact | null) => void;
  placeholder?: string;
  className?: string;
}

export function PagadorSelector({ 
  value, 
  onSelect, 
  placeholder = "Selecionar pagador...",
  className = ""
}: PagadorSelectorProps) {
  const [pagadores, setPagadores] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug logs para o value
  useEffect(() => {
    console.log('PagadorSelector - Value recebido:', value);
    console.log('PagadorSelector - Value ID:', value?.id);
    console.log('PagadorSelector - Pagadores carregados:', pagadores.length);
  }, [value, pagadores]);

  useEffect(() => {
    const loadPagadores = async () => {
      try {
        setLoading(true);

        // Verificar autenticação antes de buscar dados
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        const { data } = await supabase
          .from('contacts')
          .select('*')
          .eq('type', 'customer')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('name');
        
        console.log('Pagadores carregados do banco:', data);
        setPagadores(data || []);
      } catch (error) {
        console.error('Erro ao carregar pagadores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPagadores();
  }, []);

  const handleValueChange = (id: string) => {
    console.log('PagadorSelector - handleValueChange:', id);
    
    if (id === 'clear' || id === '') {
      onSelect(null);
      return;
    }
    
    const pagador = pagadores.find(c => c.id === id);
    if (pagador) {
      console.log('PagadorSelector - Pagador selecionado:', pagador);
      onSelect(pagador);
    }
  };

  // Determinar o valor para o Select
  const selectValue = value?.id || '';
  
  console.log('PagadorSelector - Render - selectValue:', selectValue);
  console.log('PagadorSelector - Render - loading:', loading);

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {value ? (
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400 inline" />
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
            Carregando pagadores...
          </SelectItem>
        ) : pagadores.length === 0 ? (
          <SelectItem value="__empty__" disabled>
            Nenhum pagador encontrado
          </SelectItem>
        ) : (
          <>
            {value && (
              <SelectItem value="clear">
                <span className="text-red-600">Limpar seleção</span>
              </SelectItem>
            )}
            {pagadores.map((pagador) => (
              <SelectItem key={pagador.id} value={pagador.id}>
                {pagador.name}
                {pagador.document && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({pagador.document})
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