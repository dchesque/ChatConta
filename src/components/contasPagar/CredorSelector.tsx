import React, { useState, useEffect } from 'react';
import { Building2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { CadastroRapidoFornecedorModal } from './CadastroRapidoFornecedorModal';
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
  const [cadastroRapidoOpen, setCadastroRapidoOpen] = useState(false);

  // Debug logs para o value
  useEffect(() => {
    console.log('CredorSelector - Value recebido:', value);
    console.log('CredorSelector - Value ID:', value?.id);
    console.log('CredorSelector - Credores carregados:', credores.length);
  }, [value, credores]);

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

  useEffect(() => {
    loadCredores();
  }, []);

  const handleValueChange = (id: string) => {
    console.log('CredorSelector - handleValueChange:', id);

    if (id === 'clear' || id === '') {
      onSelect(null);
      return;
    }

    if (id === 'novo_credor') {
      setCadastroRapidoOpen(true);
      return;
    }

    const credor = credores.find(c => c.id === id);
    if (credor) {
      console.log('CredorSelector - Credor selecionado:', credor);
      onSelect(credor);
    }
  };

  const handleFornecedorCriado = (fornecedor: Contact) => {
    // Recarregar a lista de credores
    loadCredores();
    // Selecionar o novo fornecedor criado
    onSelect(fornecedor);
    setCadastroRapidoOpen(false);
  };

  // Determinar o valor para o Select
  const selectValue = value?.id || '';

  console.log('CredorSelector - Render - selectValue:', selectValue);
  console.log('CredorSelector - Render - loading:', loading);

  return (
    <div className="relative">
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
              {/* Opção para criar novo credor */}
              <SelectItem value="novo_credor">
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Credor</span>
                </div>
              </SelectItem>

              {/* Separador visual se houver credores */}
              {credores.length > 0 && (
                <div className="px-2 py-1">
                  <div className="border-t border-gray-200"></div>
                </div>
              )}

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

      {/* Modal de Cadastro Rápido */}
      <CadastroRapidoFornecedorModal
        open={cadastroRapidoOpen}
        onOpenChange={setCadastroRapidoOpen}
        onFornecedorCriado={handleFornecedorCriado}
      />
    </div>
  );
}