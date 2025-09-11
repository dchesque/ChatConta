import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, FolderTree } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/category';
import { cn } from '@/lib/utils';
import { CategoryModal } from '@/components/categorias/CategoryModal';

interface CategoriaSelectorNovoProps {
  value?: Category | null;
  onSelect: (categoria: Category) => void;
  placeholder?: string;
  className?: string;
  tipo?: 'income' | 'expense' | 'all';
}

export function CategoriaSelectorNovo({ 
  value, 
  onSelect, 
  placeholder = "Selecione uma categoria",
  className = "",
  tipo = 'expense'
}: CategoriaSelectorNovoProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [categoriasCarregadas, setCategoriasCarregadas] = useState(false);
  const [cadastroModalOpen, setCadastroModalOpen] = useState(false);
  
  const { categories, loading, loadCategories } = useCategories();

  // Carregar categorias sempre que o modal abrir ou tipo mudar
  useEffect(() => {
    if (open) {
      const filters = tipo !== 'all' ? { type: tipo } : undefined;
      loadCategories(filters);
      setCategoriasCarregadas(true);
    }
  }, [open, loadCategories, tipo]);

  const handleSelect = useCallback((categoria: Category) => {
    onSelect(categoria);
    setOpen(false);
    setBusca('');
  }, [onSelect]);

  const getIcon = useCallback((iconName?: string) => {
    if (!iconName) return <FolderTree className="w-3 h-3" />;
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="w-3 h-3" /> : <FolderTree className="w-3 h-3" />;
  }, []);

  const getTipoColor = useCallback((type: string) => {
    return type === 'income' 
      ? 'bg-green-100/80 text-green-700 px-3 py-1' 
      : 'bg-red-100/80 text-red-700 px-3 py-1';
  }, []);

  const handleNovaCategoria = () => {
    setOpen(false);
    setCadastroModalOpen(true);
  };

  const handleCategoriaCriada = (novaCategoria: Category | null) => {
    if (novaCategoria) {
      // Recarregar categorias para incluir a nova
      setCategoriasCarregadas(false);
      loadCategories(tipo !== 'all' ? { type: tipo } : undefined);
      
      // Selecionar automaticamente a nova categoria
      onSelect(novaCategoria);
    }
    setCadastroModalOpen(false);
  };

  // Filtrar categorias localmente após carregamento
  const categoriasFiltradas = useMemo(() => {
    if (!categories) return [];
    
    return categories.filter(categoria => 
      categoria.name.toLowerCase().includes(busca.toLowerCase())
    );
  }, [categories, busca]);

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
                <div 
                  className="w-3 h-3 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: value.color }}
                >
                  {value.icon && getIcon(value.icon)}
                </div>
                <span>{value.name}</span>
                <Badge variant="secondary" className={getTipoColor(value.type)}>
                  {value.type === 'income' ? 'Receita' : 'Despesa'}
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
              placeholder="Buscar categoria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border border-gray-300/50"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading && !categoriasCarregadas ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando categorias...
              </div>
            ) : categoriasFiltradas.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {busca ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria disponível'}
              </div>
            ) : (
              categoriasFiltradas.map((categoria) => (
                <Button
                  key={categoria.id}
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto hover:bg-gray-50/50"
                  onClick={() => handleSelect(categoria)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div 
                      className="w-3 h-3 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: categoria.color }}
                    >
                      {categoria.icon && getIcon(categoria.icon)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{categoria.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getTipoColor(categoria.type)}>
                        {categoria.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      {categoria.is_system && (
                        <Badge variant="outline" className="bg-blue-100/80 text-blue-700 text-xs px-2 py-1">
                          Sistema
                        </Badge>
                      )}
                    </div>
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
              onClick={handleNovaCategoria}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Modal de Cadastro Rápido */}
      <CategoryModal
        open={cadastroModalOpen}
        onOpenChange={setCadastroModalOpen}
        onCategoryCreated={handleCategoriaCriada}
        fixedType={tipo === 'income' ? 'income' : tipo === 'expense' ? 'expense' : 'income'}
      />
    </Dialog>
  );
}