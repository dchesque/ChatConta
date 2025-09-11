import React, { useState } from 'react';
import { ChevronDown, Plus, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useContatos } from '@/hooks/useContatos';
import { CadastroRapidoContatoModal } from './CadastroRapidoContatoModal';

interface FornecedorSelectorProps {
  value?: string;
  onChange: (contactId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FornecedorSelectorModerno({
  value,
  onChange,
  placeholder = "Selecionar fornecedor...",
  disabled = false,
  className = ""
}: FornecedorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const { contatos, loading } = useContatos();

  // Filtrar apenas fornecedores (contacts com type='supplier')
  const fornecedores = contatos.filter(contato => 
    contato.type === 'supplier' || contato.type === 'fornecedor'
  );

  const selectedFornecedor = fornecedores.find(f => f.id === value);

  const handleSelect = (contactId: string) => {
    onChange(contactId === value ? undefined : contactId);
    setOpen(false);
  };

  const handleNovoFornecedor = () => {
    setOpen(false);
    setShowCadastroModal(true);
  };

  const handleFornecedorCriado = (novoContato: any) => {
    onChange(novoContato.id);
    setShowCadastroModal(false);
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-white/80 backdrop-blur-sm border-gray-300/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              disabled={disabled}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedFornecedor ? (
                  <>
                    {selectedFornecedor.document_type === 'cpf' ? (
                      <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <Building className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    )}
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="font-medium text-sm truncate w-full">
                        {selectedFornecedor.name}
                      </span>
                      {selectedFornecedor.document && (
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {selectedFornecedor.document}
                        </span>
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100/80 text-green-700 flex-shrink-0"
                    >
                      {selectedFornecedor.document_type === 'cpf' ? 'PF' : 'PJ'}
                    </Badge>
                  </>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-[400px] p-0 bg-white/95 backdrop-blur-xl border border-white/20">
            <Command className="rounded-lg border-0">
              <CommandInput 
                placeholder="Buscar fornecedor..." 
                className="border-0 focus:ring-0"
              />
              <CommandList className="max-h-[300px]">
                <CommandEmpty>
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhum fornecedor encontrado
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNovoFornecedor}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Fornecedor
                    </Button>
                  </div>
                </CommandEmpty>
                
                <CommandGroup>
                  {/* Opção para criar novo fornecedor */}
                  <CommandItem
                    onSelect={handleNovoFornecedor}
                    className="cursor-pointer hover:bg-blue-50/80"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Novo Fornecedor</div>
                        <div className="text-xs text-muted-foreground">
                          Cadastrar um novo fornecedor
                        </div>
                      </div>
                    </div>
                  </CommandItem>

                  {/* Lista de fornecedores */}
                  {fornecedores.map((fornecedor) => (
                    <CommandItem
                      key={fornecedor.id}
                      value={`${fornecedor.name} ${fornecedor.document || ''} ${fornecedor.email || ''}`}
                      onSelect={() => handleSelect(fornecedor.id)}
                      className="cursor-pointer hover:bg-gray-50/80"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex-shrink-0">
                          {fornecedor.document_type === 'cpf' ? (
                            <User className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Building className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {fornecedor.name}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className="bg-green-100/80 text-green-700 text-xs"
                            >
                              {fornecedor.document_type === 'cpf' ? 'PF' : 'PJ'}
                            </Badge>
                          </div>
                          {fornecedor.document && (
                            <div className="text-xs text-muted-foreground truncate">
                              {fornecedor.document}
                            </div>
                          )}
                          {fornecedor.email && (
                            <div className="text-xs text-muted-foreground truncate">
                              {fornecedor.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <CadastroRapidoContatoModal
        open={showCadastroModal}
        onOpenChange={setShowCadastroModal}
        onContatoCriado={handleFornecedorCriado}
        tipo="supplier"
        titulo="Novo Fornecedor"
      />
    </>
  );
}