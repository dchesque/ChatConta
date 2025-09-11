import { useState, useEffect } from 'react';
import { Search, FolderTree, Plus } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { CadastroRapidoCategoriaModal } from './CadastroRapidoCategoriaModal';
import type { Category } from '@/types/category';

interface PlanoContasSelectorProps {
  value?: Category | null;
  onSelect: (conta: Category) => void;
  placeholder?: string;
  className?: string;
}

export function PlanoContasSelector({ 
  value, 
  onSelect, 
  placeholder = "Selecionar categoria...",
  className = ""
}: PlanoContasSelectorProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [cadastroModalOpen, setCadastroModalOpen] = useState(false);
  
  const { categories, loading: categoriesLoading, loadCategories } = useCategories();
  const buscaDebounced = useDebounce(busca, 300);

  // Filtrar apenas categorias de despesa
  useEffect(() => {
    const categoriasExpense = categories.filter(cat => 
      cat.type === 'expense' && 
      cat.active !== false &&
      (buscaDebounced === '' || cat.name.toLowerCase().includes(buscaDebounced.toLowerCase()))
    );
    setCategorias(categoriasExpense);
  }, [categories, buscaDebounced]);

  // Carregar categorias quando o componente monta
  useEffect(() => {
    loadCategories();
  }, []);

  const handleSelect = (conta: Category) => {
    onSelect(conta);
    setOpen(false);
    setBusca('');
  };

  const handleCategoriaCriada = (novaCategoria: Category) => {
    onSelect(novaCategoria);
    setOpen(false);
    setBusca('');
    // Recarregar lista
    loadCategories();
  };

  const getIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <FolderTree className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`h-10 justify-start text-left font-normal bg-white/80 backdrop-blur-sm border-gray-300/50 ${className}`}
          role="combobox"
          aria-expanded={open}
        >
          {value ? (
            <div className="flex items-center space-x-2">
              <div style={{ color: value.color }}>
                {getIcon(value.icon || 'FolderTree')}
              </div>
              <span className="truncate">{value.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <Search className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderTree className="h-5 w-5" />
            <span>Selecionar Categoria do Plano de Contas</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por código, nome ou descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-gray-300/50"
              autoFocus
            />
          </div>

          {/* Lista de contas */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {categoriesLoading ? (
              <div className="p-6 text-center text-gray-500">
                Carregando categorias...
              </div>
            ) : categorias.length > 0 ? (
              categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="p-3 rounded-lg border border-gray-200/50 hover:bg-gray-50/80 cursor-pointer transition-all duration-200"
                  onClick={() => handleSelect(categoria)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div style={{ color: categoria.color }}>
                        {getIcon(categoria.icon || 'FolderTree')}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{categoria.name}</div>
                        {categoria.description && (
                          <div className="text-sm text-gray-500">{categoria.description}</div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {categoria.type === 'expense' ? 'Despesa' : 'Receita'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma categoria encontrada</p>
                <p className="text-sm">Apenas contas analíticas podem receber lançamentos</p>
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="border-t pt-4 text-sm text-gray-600">
            <p className="mb-2">ℹ️ Apenas contas analíticas (nível 3) podem receber lançamentos diretos</p>
            <Button 
              className="w-full btn-primary"
              onClick={() => setCadastroModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Plano de Contas
            </Button>
          </div>
        </div>
      </DialogContent>

      <CadastroRapidoCategoriaModal
        open={cadastroModalOpen}
        onOpenChange={setCadastroModalOpen}
        onCategoriaCriada={handleCategoriaCriada}
        tipoDrePadrao="despesa_pessoal"
      />
    </Dialog>
  );
}