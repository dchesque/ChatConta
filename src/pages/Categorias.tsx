import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useCategories } from '@/hooks/useCategories';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { CategoriasList } from '@/components/categorias/CategoriasList';
import { CategoryModal } from '@/components/categorias/CategoryModal';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { Category, CreateCategory, CATEGORY_COLORS, getDefaultColorByType } from '@/types/category';
import { toast } from '@/hooks/use-toast';

const breadcrumbs = [
  { label: 'Início', href: '/' },
  { label: 'Categorias', href: '/categorias' }
];


export default function Categorias() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { categories, loading, createCategory, updateCategory, deleteCategory, getStats } = useCategories();

  const filteredCategories = categories.filter(category => {
    const matchesSearch = !debouncedSearch || 
      category.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesType = typeFilter === 'all' || category.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = getStats();

  const handleOpenModal = (category?: Category) => {
    setEditingCategory(category || null);
    setModalOpen(true);
  };

  const handleCategoryCreated = (category: Category | null) => {
    if (category) {
      // Categoria criada com sucesso
    }
    setModalOpen(false);
  };

  const handleDelete = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      toast({
        title: 'Categoria excluída!',
        description: 'A categoria foi excluída com sucesso.',
      });
      setDeletingCategory(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao excluir categoria',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader 
          title="Categorias" 
          subtitle="Gerencie suas categorias financeiras"
          breadcrumb={breadcrumbs}
        />
        <div className="space-y-6">
          <LoadingSkeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Categorias" 
        subtitle="Gerencie suas categorias financeiras"
        breadcrumb={breadcrumbs}
        actions={
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{stats.income}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{stats.expense}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sistema</p>
                <p className="text-2xl font-bold text-purple-600">{stats.system}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={(value: 'all' | 'income' | 'expense') => setTypeFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Nenhuma categoria encontrada"
          description="Crie sua primeira categoria para começar a organizar suas finanças."
          actionLabel="Nova Categoria"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <CategoriasList
          categories={filteredCategories}
          onEdit={handleOpenModal}
          onDelete={setDeletingCategory}
        />
      )}

      {/* Modal */}
      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
        title="Excluir Categoria"
        description={`Tem certeza que deseja excluir a categoria "${deletingCategory?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => deletingCategory && handleDelete(deletingCategory)}
      />
    </PageContainer>
  );
}