import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { LoadingButton } from '@/components/ui/LoadingButton';
import { useContatos } from '@/hooks/useContatos';
import { useCategories } from '@/hooks/useCategories';
import { CategoriaSelectorNovo } from '@/components/contasPagar/CategoriaSelectorNovo';
import { Pagador } from '@/hooks/usePagadores';
import { User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CadastroRapidoPagadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPagadorCriado: (pagador: Pagador) => void;
}

interface FormData {
  nome: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  categoria_id?: number;
  documento?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  observacoes?: string;
}

export const CadastroRapidoPagadorModal: React.FC<CadastroRapidoPagadorModalProps> = ({
  isOpen,
  onClose,
  onPagadorCriado
}) => {
  const { criarContato, recarregar } = useContatos();
  const { categories } = useCategories();
  const { toast } = useToast();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      tipo: 'pessoa_fisica'
    }
  });

  const [categoriaSelecionada, setCategoriaSelecionada] = React.useState(null);
  const tipoSelecionado = watch('tipo');

  const onSubmit = async (data: FormData) => {
    try {
      // Estrutura compatível com a tabela contacts
      const dadosContato = {
        name: data.nome,
        document_type: data.tipo === 'pessoa_fisica' ? 'cpf' : 'cnpj',
        document: data.documento || '',
        email: data.email || '',
        phone: data.telefone || '',
        address: data.endereco || '',
        notes: data.observacoes || '',
        type: 'customer' as const,
        category_id: categoriaSelecionada?.id || null,
        active: true
      };

      const novoContato = await criarContato(dadosContato);
      
      toast({
        title: 'Sucesso',
        description: `Pagador "${data.nome}" criado com sucesso!`
      });

      // Converter contato para formato Pagador para o callback
      const novoPagador: Pagador = {
        id: novoContato.id,
        nome: novoContato.name,
        tipo: novoContato.document_type === 'cpf' ? 'pessoa_fisica' : 'pessoa_juridica',
        documento: novoContato.document || '',
        email: novoContato.email || '',
        telefone: novoContato.phone || '',
        endereco: novoContato.address || '',
        observacoes: novoContato.notes || '',
        ativo: novoContato.active,
        total_recebimentos: 0,
        valor_total: 0,
        created_at: novoContato.created_at,
        updated_at: novoContato.updated_at
      };

      onPagadorCriado(novoPagador);
      await recarregar(); // Recarregar lista de contatos
      setCategoriaSelecionada(null);
      reset();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar pagador',
        variant: 'destructive'
      });
    }
  };

  const handleClose = () => {
    setCategoriaSelecionada(null);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Cadastro Rápido de Pagador
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Pessoa */}
          <div className="space-y-2">
            <Label>Tipo de Pessoa *</Label>
            <Select 
              value={tipoSelecionado} 
              onValueChange={(value: 'pessoa_fisica' | 'pessoa_juridica') => setValue('tipo', value)}
            >
              <SelectTrigger className="bg-white/80 backdrop-blur-sm border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pessoa_fisica">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Pessoa Física
                  </div>
                </SelectItem>
                <SelectItem value="pessoa_juridica">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Pessoa Jurídica
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nome e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                {tipoSelecionado === 'pessoa_fisica' ? 'Nome Completo' : 'Razão Social'} *
              </Label>
              <Input
                id="nome"
                {...register('nome', { required: 'Nome é obrigatório' })}
                placeholder={tipoSelecionado === 'pessoa_fisica' ? 'Ex: João Silva' : 'Ex: Empresa LTDA'}
                className="bg-white/80 backdrop-blur-sm border-white/20"
              />
              {errors.nome && (
                <p className="text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <CategoriaSelectorNovo
                value={categoriaSelecionada}
                onSelect={(categoria) => {
                  setCategoriaSelecionada(categoria);
                  setValue('categoria_id', Number(categoria?.id) || undefined);
                }}
                tipo="income"
                placeholder="Selecione uma categoria"
              />
            </div>
          </div>

          {/* Documento */}
          <div className="space-y-2">
            <Label htmlFor="documento">
              {tipoSelecionado === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}
            </Label>
              <Input
                {...register('documento')}
                placeholder={tipoSelecionado === 'pessoa_fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                className="bg-white/80 backdrop-blur-sm border-white/20"
              />
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido'
                  }
                })}
                placeholder="exemplo@email.com"
                className="bg-white/80 backdrop-blur-sm border-white/20"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                {...register('telefone')}
                placeholder="(00) 00000-0000"
                className="bg-white/80 backdrop-blur-sm border-white/20"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              {...register('endereco')}
              placeholder="Endereço completo (opcional)"
              className="bg-white/80 backdrop-blur-sm border-white/20"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Observações adicionais (opcional)"
              className="bg-white/80 backdrop-blur-sm border-white/20"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              Criar Pagador
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};