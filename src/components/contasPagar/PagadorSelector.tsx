import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePagadores, Pagador } from '@/hooks/usePagadores';
import { User, Building2, Search, Plus } from 'lucide-react';
import { CadastroRapidoPagadorModal } from './CadastroRapidoPagadorModal';
import { cn } from '@/lib/utils';

interface PagadorSelectorProps {
  value?: Pagador | null;
  onSelect: (pagador: Pagador) => void;
  className?: string;
  placeholder?: string;
}

export const PagadorSelector: React.FC<PagadorSelectorProps> = ({
  value,
  onSelect,
  className = '',
  placeholder = "Selecione um pagador"
}) => {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [cadastroModalOpen, setCadastroModalOpen] = useState(false);
  
  const { pagadores, loading } = usePagadores();

  const handleSelect = (pagador: Pagador) => {
    onSelect(pagador);
    setOpen(false);
    setBusca('');
  };

  const handleNovoPagador = () => {
    setOpen(false);
    setCadastroModalOpen(true);
  };

  const handlePagadorCriado = (novoPagador: any) => {
    if (novoPagador) {
      // Converter para o formato do hook usePagadores
      const pagadorHook: Pagador = {
        id: novoPagador.id,
        nome: novoPagador.nome,
        documento: novoPagador.documento,
        tipo: novoPagador.tipo,
        email: novoPagador.email,
        telefone: novoPagador.telefone,
        endereco: novoPagador.endereco,
        cidade: novoPagador.cidade || '',
        estado: novoPagador.estado || '',
        cep: novoPagador.cep || '',
        observacoes: novoPagador.observacoes,
        ativo: novoPagador.ativo,
        total_recebimentos: 0,
        valor_total: 0,
        ultimo_recebimento: undefined,
        created_at: novoPagador.created_at || new Date().toISOString(),
        updated_at: novoPagador.updated_at || new Date().toISOString()
      };
      onSelect(pagadorHook);
    }
    setCadastroModalOpen(false);
  };

  // Filtrar pagadores localmente
  const pagadoresFiltrados = pagadores?.filter(pagador => 
    pagador.nome.toLowerCase().includes(busca.toLowerCase()) ||
    pagador.documento.toLowerCase().includes(busca.toLowerCase()) ||
    (pagador.email && pagador.email.toLowerCase().includes(busca.toLowerCase()))
  ) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between bg-white/80 backdrop-blur-sm border border-gray-300/50 hover:bg-white/90",
            className
          )}
        >
          <div className="flex items-center gap-2">
            {value ? (
              <>
                {value.tipo === 'pessoa_fisica' ? (
                  <User className="w-4 h-4 text-blue-600" />
                ) : (
                  <Building2 className="w-4 h-4 text-purple-600" />
                )}
                <span>{value.nome}</span>
                <Badge variant="secondary" className={value.tipo === 'pessoa_fisica' 
                  ? 'bg-blue-100/80 text-blue-700 px-3 py-1' 
                  : 'bg-purple-100/80 text-purple-700 px-3 py-1'
                }>
                  {value.tipo === 'pessoa_fisica' ? 'PF' : 'PJ'}
                </Badge>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <Search className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border border-white/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pagador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border border-gray-300/50"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando pagadores...
              </div>
            ) : pagadoresFiltrados.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {busca ? 'Nenhum pagador encontrado' : 'Nenhum pagador disponível'}
              </div>
            ) : (
              pagadoresFiltrados.map((pagador) => (
                <Button
                  key={pagador.id}
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto hover:bg-gray-50/50"
                  onClick={() => handleSelect(pagador)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {pagador.tipo === 'pessoa_fisica' ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-purple-600" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{pagador.nome}</div>
                      <div className="text-sm text-gray-500">{pagador.documento}</div>
                      {pagador.email && (
                        <div className="text-xs text-gray-400">{pagador.email}</div>
                      )}
                    </div>
                    <Badge variant="secondary" className={pagador.tipo === 'pessoa_fisica' 
                      ? 'bg-blue-100/80 text-blue-700 px-3 py-1' 
                      : 'bg-purple-100/80 text-purple-700 px-3 py-1'
                    }>
                      {pagador.tipo === 'pessoa_fisica' ? 'PF' : 'PJ'}
                    </Badge>
                  </div>
                </Button>
              ))
            )}
          </div>

          <div className="flex justify-center pt-2 border-t border-gray-200/50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              onClick={handleNovoPagador}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Pagador
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Modal de Cadastro Rápido */}
      <CadastroRapidoPagadorModal
        isOpen={cadastroModalOpen}
        onClose={() => setCadastroModalOpen(false)}
        onPagadorCriado={handlePagadorCriado}
      />
    </Dialog>
  );
};