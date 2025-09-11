import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { usePlanoContas } from '@/hooks/usePlanoContas';
import { useToast } from '@/hooks/use-toast';
import { PlanoContas, TIPOS_DRE, CORES_PLANO_CONTAS, ICONES_PLANO_CONTAS } from '@/types/planoContas';
import { Save, X, FolderPlus } from 'lucide-react';
import * as Icons from 'lucide-react';

interface CadastroRapidoCategoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriaCriada: (categoria: PlanoContas) => void;
  tipoDrePadrao?: 'despesa_pessoal';
}

export function CadastroRapidoCategoriaModal({
  open,
  onOpenChange,
  onCategoriaCriada,
  tipoDrePadrao
}: CadastroRapidoCategoriaModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    tipo_dre: 'despesa_pessoal' as const,
    descricao: '',
    cor: '#3B82F6',
    icone: 'Package'
  });

  const { criarPlanoContas, planoContas } = usePlanoContas();
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      tipo_dre: 'despesa_pessoal',
      descricao: '',
      cor: '#3B82F6',
      icone: 'Package'
    });
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    } else {
      // Sugerir próximo código quando abrir o modal
      sugerirProximoCodigo();
    }
  }, [open, tipoDrePadrao]);

  const sugerirProximoCodigo = () => {
    if (!formData.tipo_dre) return;

    // Buscar códigos existentes do mesmo tipo
    const codigosExistentes = planoContas
      .filter(p => p.tipo_dre === formData.tipo_dre)
      .map(p => p.codigo)
      .sort();

    // Gerar próximo código baseado no padrão para despesas pessoais
    let proximoCodigo = '';
    
    // Para despesas pessoais, usar numeração sequencial simples
    if (formData.tipo_dre === 'despesa_pessoal') {
      proximoCodigo = gerarProximoCodigo(codigosExistentes, '');
    }

    setFormData(prev => ({ ...prev, codigo: proximoCodigo }));
  };

  const gerarProximoCodigo = (codigosExistentes: string[], prefixo: string) => {
    if (prefixo === '') {
      // Para sistema pessoal, buscar o maior número existente
      const numeros = codigosExistentes
        .map(c => {
          const match = c.match(/(\d+)\.(\d+)$/);
          return match ? parseFloat(`${match[1]}.${match[2]}`) : 0;
        })
        .sort((a, b) => b - a);

      const proximoNumero = numeros.length > 0 ? numeros[0] + 0.1 : 1.1;
      const inteira = Math.floor(proximoNumero);
      const decimal = Math.round((proximoNumero - inteira) * 10);
      
      return `${inteira}.${decimal}`;
    }

    // Código original para prefixos específicos
    const codigosComPrefixo = codigosExistentes
      .filter(c => c.startsWith(prefixo))
      .map(c => {
        const numero = c.replace(prefixo, '').split('.')[0];
        return parseInt(numero) || 0;
      })
      .sort((a, b) => a - b);

    const proximoNumero = codigosComPrefixo.length > 0 
      ? Math.max(...codigosComPrefixo) + 1 
      : 1;

    return `${prefixo}${proximoNumero.toString().padStart(3, '0')}`;
  };

  useEffect(() => {
    if (formData.tipo_dre) {
      sugerirProximoCodigo();
    }
  }, [formData.tipo_dre]);

  const validarFormulario = () => {
    const erros: string[] = [];

    if (!formData.nome.trim()) {
      erros.push('Nome é obrigatório');
    }

    if (!formData.codigo.trim()) {
      erros.push('Código é obrigatório');
    }

    // Verificar se código já existe
    const codigoExiste = planoContas.some(p => 
      p.codigo.toLowerCase() === formData.codigo.toLowerCase().trim()
    );
    
    if (codigoExiste) {
      erros.push('Código já existe');
    }

    if (!formData.tipo_dre) {
      erros.push('Tipo DRE é obrigatório');
    }

    return erros;
  };

  const handleSubmit = async () => {
    const erros = validarFormulario();
    if (erros.length > 0) {
      toast({
        title: "Erro de validação",
        description: erros.join(', '),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const novaCategoria: Omit<PlanoContas, 'id' | 'created_at' | 'updated_at'> = {
        nome: formData.nome.trim(),
        codigo: formData.codigo.trim(),
        tipo_dre: formData.tipo_dre,
        descricao: formData.descricao.trim() || undefined,
        cor: formData.cor,
        icone: formData.icone,
        nivel: 3, // Sempre nível 3 (analítica)
        aceita_lancamento: true, // Categorias criadas aqui sempre aceitam lançamento
        ativo: true,
        plano_pai_id: undefined, // Por simplicidade, não definir pai
        total_contas: 0,
        valor_total: 0
      };

      const categoriaCriada = await criarPlanoContas(novaCategoria);
      
      if (categoriaCriada) {
        toast({
          title: "Categoria cadastrada",
          description: `${formData.nome} foi cadastrada com sucesso!`
        });
        
        onCategoriaCriada(categoriaCriada);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar a categoria. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconeComponent = (nomeIcone: string) => {
    const IconComponent = (Icons as any)[nomeIcone];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Icons.Package className="h-4 w-4" />;
  };

  const getTipoDreColor = (tipo: string) => {
    const tipoConfig = TIPOS_DRE.find(t => t.valor === tipo);
    return tipoConfig?.cor || '#3B82F6';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderPlus className="h-5 w-5" />
            <span>Cadastro Rápido de Categoria</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              placeholder="Nome da categoria"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="bg-white/80 backdrop-blur-sm border-gray-300/50"
            />
          </div>

          {/* Código e Tipo DRE */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                placeholder="Ex: 5.1.001"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                className="bg-white/80 backdrop-blur-sm border-gray-300/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo DRE *</Label>
              <Select 
                value={formData.tipo_dre} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo_dre: value }))}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-300/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DRE.map((tipo) => (
                    <SelectItem key={tipo.valor} value={tipo.valor}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tipo.cor }}
                        />
                        <span className="text-sm">{tipo.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cor e Ícone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor</Label>
              <Select 
                value={formData.cor} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, cor: value }))}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-300/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORES_PLANO_CONTAS.map((cor) => (
                    <SelectItem key={cor.valor} value={cor.valor}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: cor.valor }}
                        />
                        <span>{cor.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select 
                value={formData.icone} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, icone: value }))}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-300/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONES_PLANO_CONTAS.map((icone) => (
                    <SelectItem key={icone.icone} value={icone.icone}>
                      <div className="flex items-center space-x-2">
                        {getIconeComponent(icone.icone)}
                        <span>{icone.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descrição opcional da categoria"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              className="bg-white/80 backdrop-blur-sm border-gray-300/50 min-h-[80px]"
              maxLength={500}
            />
          </div>

          {/* Preview */}
          <div className="p-3 bg-gray-50/80 rounded-lg border border-gray-200/50">
            <Label className="text-xs text-gray-600 mb-2 block">Preview:</Label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: formData.cor }}
              >
                {getIconeComponent(formData.icone)}
              </div>
              <div>
                <div className="font-medium text-sm">
                  {formData.codigo || 'XXX.XXX.XXX'} - {formData.nome || 'Nome da categoria'}
                </div>
                <div className="text-xs text-gray-500">
                  {TIPOS_DRE.find(t => t.valor === formData.tipo_dre)?.nome}
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="bg-white/80 backdrop-blur-sm border-gray-300/50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4 p-3 bg-blue-50/80 rounded-lg">
          <strong>Cadastro Rápido:</strong> A categoria será criada como analítica (nível 3) e pronta para receber lançamentos.
          Para configurações avançadas, acesse o menu Plano de Contas.
        </div>
      </DialogContent>
    </Dialog>
  );
}