import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useContatos } from '@/hooks/useContatos';
import { toast } from 'sonner';
import { ESTADOS_BRASIL } from '@/types/fornecedor';

interface CadastroRapidoContatoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContatoCriado: (contato: any) => void;
  tipo?: 'supplier' | 'customer';
  titulo?: string;
}

export function CadastroRapidoContatoModal({
  open,
  onOpenChange,
  onContatoCriado,
  tipo = 'supplier',
  titulo = 'Novo Contato'
}: CadastroRapidoContatoModalProps) {
  const { criarContato, loading } = useContatos();
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    document_type: 'cpf' as 'cpf' | 'cnpj',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      const novoContato = await criarContato({
        ...formData,
        type: tipo,
        active: true
      });

      onContatoCriado(novoContato);
      setFormData({
        name: '',
        document: '',
        document_type: 'cpf',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        notes: ''
      });
      toast.success(`${tipo === 'supplier' ? 'Fornecedor' : 'Cliente'} criado com sucesso!`);
    } catch (error) {
      toast.error(`Erro ao criar ${tipo === 'supplier' ? 'fornecedor' : 'cliente'}`);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      document: '',
      document_type: 'cpf',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      notes: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {titulo}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                className="bg-white/80 backdrop-blur-sm"
                required
              />
            </div>

            <div>
              <Label htmlFor="document_type">Tipo de Documento</Label>
              <Select
                value={formData.document_type}
                onValueChange={(value: 'cpf' | 'cnpj') => 
                  setFormData({ ...formData, document_type: value })
                }
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="document">
                {formData.document_type === 'cpf' ? 'CPF' : 'CNPJ'}
              </Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder={formData.document_type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número"
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Nome da cidade"
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Selecionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BRASIL.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="zip">CEP</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                placeholder="00000-000"
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Informações adicionais..."
                className="bg-white/80 backdrop-blur-sm"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}