import React from 'react';
import { Category } from '@/types/category';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface CategoriaCardProps {
  category: Category;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  userRole?: string;
}

export function CategoriaCard({ 
  category, 
  onView, 
  onEdit, 
  onDelete,
  userRole 
}: CategoriaCardProps) {
  const getIconComponent = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <LucideIcons.Circle className="w-5 h-5" />;
  };

  const isSystem = category.is_system === true || category.user_id === null;
  const canEdit = isSystem ? userRole === 'admin' : true;

  return (
    <Card className="card-base group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: category.color || '#6b7280' }}
            >
              {getIconComponent(category.icon || 'Circle')}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {category.name}
                </h3>
                {isSystem && (
                  <Badge variant="secondary" className="text-xs">
                    Sistema
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={category.type === 'income' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {category.type === 'income' ? 'Receita' : 'Despesa'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(category)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {canEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(category)}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {!isSystem && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(category)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}