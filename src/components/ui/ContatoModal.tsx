import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaskedInput, masks } from '@/components/ui/MaskedInput';
import { useCategories } from '@/hooks/useCategories';
import { getGroupsByType } from '@/types/category';
import { toast } from '@/hooks/use-toast';

interface ContatoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contato?: any;
  onSave: (data: any) => void;
  tipo?: 'credor' | 'pagador';
}

export function ContatoModal({ isOpen, onClose, contato, onSave, tipo = 'credor' }: ContatoModalProps) {
  const [loading, setLoading] = useState(false);
  const { categories } = useCategories();
  
  const [formData, setFormData] = useState({
    name: '',
    document_type: 'cpf',
    document: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    type: tipo === 'credor' ? 'supplier' : 'customer',
    category_id: '',
    category_type: tipo === 'credor' ? 'expense' : 'income',
    category_group: '',
    active: true
  });

  // Categorias filtradas automaticamente por tipo baseado no modal
  const tipoCategoria = tipo === 'credor' ? 'expense' : 'income';
  const categoriasFiltradas = categories.filter(cat => cat.type === tipoCategoria);

  // Atualizar formulário quando contato mudar
  useEffect(() => {
    if (contato) {
      setFormData({
        name: contato.name || '',
        document_type: contato.document_type || 'cpf',
        document: contato.document || '',
        email: contato.email || '',
        phone: contato.phone || '',
        address: contato.address || '',
        notes: contato.notes || '',
        type: contato.type || (tipo === 'credor' ? 'supplier' : 'customer'),
        category_id: contato.category_id || '',
        category_type: tipo === 'credor' ? 'expense' : 'income',
        category_group: '',
        active: contato.active !== undefined ? contato.active : true
      });
    } else {
      setFormData({
        name: '',
        document_type: 'cpf',
        document: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        type: tipo === 'credor' ? 'supplier' : 'customer',
        category_id: '',
        category_type: tipo === 'credor' ? 'expense' : 'income',
        category_group: '',
        active: true
      });
    }
  }, [contato, tipo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações obrigatórias
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }
    
    if (!formData.category_id) {
      toast({ title: 'Erro', description: 'Categoria é obrigatória', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    
    try {
      const dadosParaSalvar = {
        name: formData.name.trim(),
        document_type: formData.document_type,
        document: formData.document?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        notes: formData.notes?.trim() || null,
        type: formData.type,
        category_id: formData.category_id,
        active: formData.active
      };
      
      await onSave(dadosParaSalvar);
      toast({ title: 'Sucesso', description: contato ? 'Contato atualizado!' : 'Contato criado!' });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      toast({ title: 'Erro', description: 'Erro ao salvar contato', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {contato ? 'Editar Contato' : `Novo ${tipo === 'credor' ? 'Credor' : 'Pagador'}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Nome do contato"
              />
            </div>
            
            <div>
              <Label htmlFor="document_type">Tipo de Documento</Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categoria - Campo obrigatório */}
          <div>
            <Label htmlFor="category_id">
              Categoria <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Selecionar categoria de ${tipo === 'credor' ? 'despesa' : 'receita'}`} />
              </SelectTrigger>
              <SelectContent>
                {categoriasFiltradas.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoria.color }}
                      />
                      {categoria.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="document">Documento</Label>
              <MaskedInput
                mask={formData.document_type === 'cpf' ? masks.cpf : formData.document_type === 'cnpj' ? masks.cnpj : null}
                value={formData.document}
                onChange={(value) => setFormData(prev => ({ ...prev, document: value }))}
                placeholder={
                  formData.document_type === 'cpf' ? 'CPF (opcional)' : 
                  formData.document_type === 'cnpj' ? 'CNPJ (opcional)' : 
                  'Documento (opcional)'
                }
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <MaskedInput
                mask={masks.phone}
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Endereço completo"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <LoadingButton type="submit" loading={loading} loadingText="Salvando...">
              Salvar
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}