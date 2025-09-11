import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContatoModal } from '@/components/ui/ContatoModal';
import { ContatosList } from '@/components/contatos/ContatosList';
import { useContatos } from '@/hooks/useContatos';
import { toast } from '@/hooks/use-toast';

type ContatoTipo = 'credor' | 'pagador';

export default function Contatos() {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'supplier' | 'customer'>('todos');
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoModal, setTipoModal] = useState<'credor' | 'pagador'>('credor');
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  
  const {
    contatos,
    loading,
    error,
    criarContato,
    atualizarContato,
    excluirContato,
    recarregar
  } = useContatos();

  const breadcrumbItems = [
    { label: 'Início', href: '/dashboard' },
    { label: 'Cadastros' },
    { label: 'Pessoas e Empresas' }
  ];

  // Filtrar contatos
  const contatosFiltrados = contatos.filter(contato => {
    const matchTipo = filtroTipo === 'todos' || contato.type === filtroTipo;
    const matchBusca = !busca || contato.name.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  const handleNovoContato = (tipo: 'credor' | 'pagador') => {
    setTipoModal(tipo);
    setItemSelecionado(null);
    setModoEdicao(false);
    setModalAberto(true);
  };

  const handleEditarContato = (contato: any) => {
    setTipoModal(contato.type === 'supplier' ? 'credor' : 'pagador');
    setItemSelecionado(contato);
    setModoEdicao(true);
    setModalAberto(true);
  };

  const handleExcluirContato = (contato: any) => {
    setItemToDelete(contato);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await excluirContato(itemToDelete.id);
      toast({ title: 'Sucesso', description: 'Contato excluído com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir contato', variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSalvarContato = async (dados: any) => {
    try {
      if (modoEdicao && itemSelecionado) {
        await atualizarContato(itemSelecionado.id, dados);
        toast({ title: 'Sucesso', description: 'Contato atualizado com sucesso!' });
      } else {
        await criarContato(dados);
        toast({ title: 'Sucesso', description: 'Contato criado com sucesso!' });
      }
      setModalAberto(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar contato', variant: 'destructive' });
    }
  };

  // Recarregar dados quando houver erro
  useEffect(() => {
    if (error) {
      console.error('Erro ao carregar contatos:', error);
      toast({ 
        title: 'Erro', 
        description: 'Erro ao carregar contatos. Tentando novamente...', 
        variant: 'destructive' 
      });
      setTimeout(() => recarregar(), 2000);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Background abstratos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Container principal com padding responsivo e max-width */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 lg:px-8 lg:py-8">
      <PageHeader 
        title="Pessoas e Empresas" 
        subtitle="Gerencie credores e pagadores"
        breadcrumb={breadcrumbItems}
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={() => handleNovoContato('credor')}
              className="bg-gradient-to-r from-red-600 to-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Credor
            </Button>
            <Button 
              onClick={() => handleNovoContato('pagador')}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Pagador
            </Button>
          </div>
        }
      />

      <div className="grid gap-6">
        {/* Filtros */}
        <Card className="card-base">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar por nome
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Digite o nome do contato..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipo de contato
                </label>
                <Tabs value={filtroTipo} onValueChange={(value) => setFiltroTipo(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="supplier">Credores</TabsTrigger>
                    <TabsTrigger value="customer">Pagadores</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Contatos */}
        <ContatosList
          contatos={contatosFiltrados}
          loading={loading}
          onEdit={handleEditarContato}
          onDelete={handleExcluirContato}
        />
      </div>

      {/* Modal de Contato */}
      <ContatoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        contato={itemSelecionado}
        onSave={handleSalvarContato}
        tipo={tipoModal}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir "${itemToDelete?.name || itemToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        loading={loading}
      />
      </div>
    </div>
  );
}