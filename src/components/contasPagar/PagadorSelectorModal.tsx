import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePagadores } from '@/hooks/usePagadores';
import { Pagador } from '@/types/pagador';
import { Building2, User, Plus, Search, Check } from 'lucide-react';

interface PagadorSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pagador: Pagador) => void;
  onCreateNew: () => void;
}

export const PagadorSelectorModal: React.FC<PagadorSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onCreateNew
}) => {
  const { pagadores, loading } = usePagadores();
  const [busca, setBusca] = useState('');

  const pagadoresFiltrados = pagadores.filter(pagador =>
    pagador.ativo && (
      pagador.nome.toLowerCase().includes(busca.toLowerCase()) ||
      pagador.documento.includes(busca) ||
      pagador.email?.toLowerCase().includes(busca.toLowerCase())
    )
  );

  const handleSelect = (pagador: Pagador) => {
    onSelect(pagador);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateNew();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-white/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Selecionar Pagador
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, documento ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-white/20"
            />
          </div>

          {/* Botão Criar Novo */}
          <Button
            onClick={handleCreateNew}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Pagador
          </Button>

          <Separator />

          {/* Lista de Pagadores */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-muted-foreground">Carregando pagadores...</p>
              </div>
            ) : pagadoresFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {busca ? 'Nenhum pagador encontrado' : 'Nenhum pagador cadastrado'}
                </p>
              </div>
            ) : (
              pagadoresFiltrados.map((pagador) => (
                <div
                  key={pagador.id}
                  className="card-base p-4 cursor-pointer hover:bg-white/90 transition-all duration-200"
                  onClick={() => handleSelect(pagador as any)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {pagador.tipo === 'pessoa_fisica' ? (
                          <User className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Building2 className="w-4 h-4 text-purple-600" />
                        )}
                        <h3 className="font-medium text-gray-900">{pagador.nome}</h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{pagador.documento}</span>
                        {pagador.email && <span>{pagador.email}</span>}
                        {pagador.telefone && <span>{pagador.telefone}</span>}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {pagador.tipo === 'pessoa_fisica' ? 'PF' : 'PJ'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};