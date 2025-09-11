import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Category } from '@/types/category';
import * as LucideIcons from 'lucide-react';

interface CategoriasListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoriasList({ categories, onEdit, onDelete }: CategoriasListProps) {
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <LucideIcons.Circle className="w-4 h-4" />;
  };

  const isSystemCategory = (category: Category) => {
    return category.is_system === true || category.user_id === null;
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="border-gray-200/30 hover:bg-gray-50/50">
                <TableCell>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {getIconComponent(category.icon || 'Circle')}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Badge 
                    className={`px-3 py-1 text-xs ${
                      category.type === 'income' 
                        ? 'bg-green-100/80 text-green-700 border-green-200' 
                        : 'bg-red-100/80 text-red-700 border-red-200'
                    }`}
                  >
                    {category.type === 'income' ? 'Receita' : 'Despesa'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isSystemCategory(category) ? (
                    <Badge variant="secondary" className="px-3 py-1 text-xs">
                      Sistema
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1 text-xs">
                      Pessoal
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingCategory(category)}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(category)}
                      className="h-8 w-8 p-0 hover:bg-orange-100"
                    >
                      <Edit className="h-4 w-4 text-orange-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(category)}
                      className="h-8 w-8 p-0 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Visualização */}
      <Dialog open={!!viewingCategory} onOpenChange={() => setViewingCategory(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Categoria</DialogTitle>
          </DialogHeader>
          
          {viewingCategory && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: viewingCategory.color }}
                >
                  {getIconComponent(viewingCategory.icon || 'Circle')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{viewingCategory.name}</h3>
                  <Badge 
                    className={`px-3 py-1 ${
                      viewingCategory.type === 'income' 
                        ? 'bg-green-100/80 text-green-700 border-green-200' 
                        : 'bg-red-100/80 text-red-700 border-red-200'
                    }`}
                  >
                    {viewingCategory.type === 'income' ? 'Receita' : 'Despesa'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="text-sm text-gray-900">
                    {isSystemCategory(viewingCategory) ? 'Categoria do Sistema' : 'Categoria Pessoal'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cor</label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: viewingCategory.color }}
                    />
                    <span className="text-sm text-gray-900">{viewingCategory.color}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setViewingCategory(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  onEdit(viewingCategory);
                  setViewingCategory(null);
                }}>
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}