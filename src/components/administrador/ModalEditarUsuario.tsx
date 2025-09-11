import { useState, useEffect } from 'react';
import { UsuarioAdmin } from '@/types/usuarioAdmin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MaskedInput } from '@/components/ui/MaskedInput';
import { BadgeStatusAssinatura } from './BadgeStatusAssinatura';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail,
  Building,
  FileText
} from 'lucide-react';

interface ModalEditarUsuarioProps {
  usuario: UsuarioAdmin;
  aberto: boolean;
  onFechar: () => void;
  onSalvar: (dadosUsuario: Partial<UsuarioAdmin>) => Promise<void>;
}

export function ModalEditarUsuario({ usuario, aberto, onFechar, onSalvar }: ModalEditarUsuarioProps) {
  const [formData, setFormData] = useState<Partial<UsuarioAdmin>>({});
  const [loading, setLoading] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState('pessoal');

  useEffect(() => {
    if (usuario) {
      setFormData(usuario);
    }
  }, [usuario]);

  const handleInputChange = (campo: keyof UsuarioAdmin, valor: any) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSalvar(formData);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularValorMensalidade = (plano: string): number => {
    const valores = {
      gratuito: 0,
      basico: 39.90,
      premium: 89.90,
      enterprise: 199.90
    };
    return valores[plano as keyof typeof valores] || 0;
  };

  const handlePlanoChange = (novoPlano: string) => {
    const novoValor = calcularValorMensalidade(novoPlano);
    setFormData(prev => ({
      ...prev,
      plano: novoPlano as UsuarioAdmin['plano'],
      valor_mensalidade: novoValor
    }));
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Editar Usuário
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário {usuario.nome}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-100/80">
              <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="observacoes">Observações</TabsTrigger>
            </TabsList>

            {/* Aba Dados Pessoais */}
            <TabsContent value="pessoal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome || ''}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_pessoa">Tipo de Pessoa</Label>
                    <Select 
                      value={formData.tipo_pessoa || ''} 
                      onValueChange={(value) => handleInputChange('tipo_pessoa', value)}
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                        <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documento">Documento</Label>
                    <MaskedInput
                      mask={formData.tipo_pessoa === 'pessoa_juridica' ? '99.999.999/9999-99' : '999.999.999-99'}
                      value={formData.documento || ''}
                      onChange={(value) => handleInputChange('documento', value)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <MaskedInput
                      mask="(99) 99999-9999"
                      value={formData.telefone || ''}
                      onChange={(value) => handleInputChange('telefone', value)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={formData.empresa || ''}
                      onChange={(e) => handleInputChange('empresa', e.target.value)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Assinatura */}
            <TabsContent value="assinatura" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Dados da Assinatura
                  </CardTitle>
                  <CardDescription>
                    Status atual: <BadgeStatusAssinatura status={formData.status_assinatura || 'inativo'} />
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status_assinatura">Status da Assinatura</Label>
                    <Select 
                      value={formData.status_assinatura || ''} 
                      onValueChange={(value) => handleInputChange('status_assinatura', value)}
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plano">Plano</Label>
                    <Select 
                      value={formData.plano || ''} 
                      onValueChange={handlePlanoChange}
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gratuito">Gratuito</SelectItem>
                        <SelectItem value="basico">Básico</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_mensalidade">Valor Mensalidade</Label>
                    <Input
                      id="valor_mensalidade"
                      type="number"
                      step="0.01"
                      value={formData.valor_mensalidade || 0}
                      onChange={(e) => handleInputChange('valor_mensalidade', parseFloat(e.target.value) || 0)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                    <Input
                      id="data_vencimento"
                      type="date"
                      value={formData.data_vencimento || ''}
                      onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Endereço */}
            <TabsContent value="endereco" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço Completo</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco || ''}
                      onChange={(e) => handleInputChange('endereco', e.target.value)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade || ''}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={formData.estado || ''}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      className="bg-white/80 backdrop-blur-sm"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <MaskedInput
                      mask="99999-999"
                      value={formData.cep || ''}
                      onChange={(value) => handleInputChange('cep', value)}
                      className="bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Observações */}
            <TabsContent value="observacoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Observações Administrativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes || ''}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      className="bg-white/80 backdrop-blur-sm min-h-[120px]"
                      placeholder="Adicione observações sobre este usuário..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Data de Cadastro</Label>
                      <Input
                        value={usuario.data_cadastro}
                        disabled
                        className="bg-gray-100 text-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Último Acesso</Label>
                      <Input
                        value={usuario.ultimo_acesso || 'Nunca'}
                        disabled
                        className="bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFechar}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}