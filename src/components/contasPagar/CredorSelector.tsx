import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type SimpleContact = {
  id: string;
  name: string;
  type?: string;
  document?: string;
};

interface CredorSelectorProps {
  value?: Contact | SimpleContact | null;
  onSelect: (contact: Contact | null) => void;
  placeholder?: string;
  className?: string;
}

export function CredorSelector({ 
  value, 
  onSelect, 
  placeholder = "Selecionar credor...",
  className = ""
}: CredorSelectorProps) {
  const [credores, setCredores] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug logs para o value
  useEffect(() => {
    console.log('CredorSelector - Value recebido:', value);
    console.log('CredorSelector - Value ID:', value?.id);
    console.log('CredorSelector - Credores carregados:', credores.length);
  }, [value, credores]);

  useEffect(() => {
    const loadCredores = async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from('contacts')
          .select('*')
          .eq('type', 'supplier')
          .is('deleted_at', null)
          .order('name');
        
        console.log('Credores carregados do banco:', data);
        setCredores(data || []);
      } catch (error) {
        console.error('Erro ao carregar credores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCredores();
  }, []);

  const handleValueChange = (id: string) => {
    console.log('CredorSelector - handleValueChange:', id);
    
    if (id === 'clear' || id === '') {
      onSelect(null);
      return;
    }
    
    const credor = credores.find(c => c.id === id);
    if (credor) {
      console.log('CredorSelector - Credor selecionado:', credor);
      onSelect(credor);
    }
  };

  // Determinar o valor para o Select
  const selectValue = value?.id || '';
  
  console.log('CredorSelector - Render - selectValue:', selectValue);
  console.log('CredorSelector - Render - loading:', loading);

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
            Carregando credores...
          </SelectItem>
        ) : credores.length === 0 ? (
          <SelectItem value="__empty__" disabled>
            Nenhum credor encontrado
          </SelectItem>
        ) : (
          <>
            {value && (
              <SelectItem value="clear">
                <span className="text-red-600">Limpar seleção</span>
              </SelectItem>
            )}
            {credores.map((credor) => (
              <SelectItem key={credor.id} value={credor.id}>
                {credor.name}
                {credor.document && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({credor.document})
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