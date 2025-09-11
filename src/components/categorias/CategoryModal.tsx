import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { Category, CreateCategory, getDefaultColorByType } from '@/types/category';
import { toast } from '@/hooks/use-toast';
import * as LucideIcons from 'lucide-react';

const AVAILABLE_ICONS = [
  'Circle', 'Plus', 'MoreHorizontal', 'Home', 'Car', 'Heart', 'Banknote', 
  'TrendingUp', 'Briefcase', 'UtensilsCrossed', 'GraduationCap', 'Gamepad2', 
  'Smartphone', 'Shield', 'DollarSign', 'Laptop', 'ShoppingCart', 'PiggyBank',
  'LineChart', 'Users', 'Award', 'Zap', 'Wrench', 'Fuel', 'Bus', 'ShoppingBasket',
  'Pill', 'Sparkles', 'FileText', 'Plane'
];

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: (categoria: Category | null) => void;
  fixedType?: 'expense' | 'income'; // Para forçar um tipo específico
}

export function CategoryModal({ 
  open, 
  onOpenChange, 
  onCategoryCreated,
  fixedType
}: CategoryModalProps) {
  const { createCategory } = useCategories();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateCategory>({
    name: '',
    type: fixedType || 'expense',
    color: getDefaultColorByType(fixedType || 'expense'),
    icon: 'MoreHorizontal'
  });

  const handleCloseModal = () => {
    setFormData({
      name: '',
      type: fixedType || 'expense',
      color: getDefaultColorByType(fixedType || 'expense'),
      icon: 'MoreHorizontal'
    });
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const novaCategoria = await createCategory(formData);
      if (novaCategoria) {
        toast({
          title: 'Categoria criada!',
          description: 'A nova categoria foi criada com sucesso.',
        });
        onCategoryCreated(novaCategoria);
        handleCloseModal();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar categoria',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <LucideIcons.Circle className="w-4 h-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-base max-w-md">
        <DialogHeader>
          <DialogTitle>
            Nova Categoria {fixedType === 'expense' ? 'de Despesa' : ''}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex: Energia Elétrica, Combustível, etc."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {!fixedType && (
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData(prev => ({ 
                    ...prev, 
                    type: value,
                    color: getDefaultColorByType(value),
                    icon: value === 'income' ? 'Plus' : 'MoreHorizontal'
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="icon">Ícone</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <div className="flex items-center gap-2">
                      {getIconComponent(icon)}
                      {icon}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Preview</Label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: formData.color }}
              >
                {getIconComponent(formData.icon || 'Circle')}
              </div>
              <div>
                <p className="font-medium">{formData.name || 'Nome da categoria'}</p>
                <p className="text-sm text-muted-foreground">
                  {formData.type === 'income' ? 'Receita' : 'Despesa'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleCloseModal} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.name.trim() || loading}
          >
            {loading ? 'Criando...' : 'Criar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}