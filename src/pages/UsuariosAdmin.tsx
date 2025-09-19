import { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { createBreadcrumb } from '@/utils/breadcrumbUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUsuariosAdmin } from '@/hooks/useUsuariosAdmin';
import { useAuth } from '@/hooks/useAuth';
import { UsuarioAdmin } from '@/types/usuarioAdmin';
import { TabelaUsuarios } from '@/components/administrador/TabelaUsuarios';
import { MetricasUsuarios } from '@/components/administrador/MetricasUsuarios';
import { ModalEditarUsuario } from '@/components/administrador/ModalEditarUsuario';
import { 
  Users, 
  Plus, 
  Search,
  Filter,
  Download
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function UsuariosAdmin() {
  const { isAdmin, role, loading: authLoading } = useAuth();
  const { usuarios, loading, metricas, atualizarUsuario } = useUsuariosAdmin();

  // Aguardar carregamento da autenticação antes de verificar
  if (authLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando permissões...</p>
          </div>
        </div>
      </div>
    );
  }

  // Dupla verificação de segurança - se não for admin, não renderizar nada
  if (!isAdmin) {
    console.warn(`[SECURITY] Unauthorized direct access to /administrador/usuarios - User role: ${role}`);
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acesso Negado</h3>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </div>
    );
  }
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioAdmin | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  // Debounce para busca - aguarda 300ms após o usuário parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaDebounced(busca);
    }, 300);

    return () => clearTimeout(timer);
  }, [busca]);

  const breadcrumbs = [
    { label: 'Início', href: '/dashboard' },
    { label: 'Administrador', href: '/administrador' },
    { label: 'Gestão de Usuários' }
  ];

  // Filtrar usuários baseado na busca (com debounce) e filtros com memoização
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchBusca = !buscaDebounced ||
        usuario.nome.toLowerCase().includes(buscaDebounced.toLowerCase()) ||
        usuario.email.toLowerCase().includes(buscaDebounced.toLowerCase()) ||
        usuario.documento.includes(buscaDebounced);

      const matchStatus = filtroStatus === 'todos' ||
        (filtroStatus === 'ativo' && usuario.status_assinatura === 'ativo') ||
        (filtroStatus === 'inativo' && ['inativo', 'cancelado'].includes(usuario.status_assinatura)) ||
        (filtroStatus === 'trial' && usuario.status_assinatura === 'trial');

      return matchBusca && matchStatus;
    });
  }, [usuarios, buscaDebounced, filtroStatus]);

  const handleEditarUsuario = useCallback((usuario: UsuarioAdmin) => {
    setUsuarioSelecionado(usuario);
    setModalEditarAberto(true);
  }, []);

  const handleSalvarUsuario = useCallback(async (dadosUsuario: Partial<UsuarioAdmin>) => {
    if (usuarioSelecionado) {
      await atualizarUsuario(usuarioSelecionado.id, dadosUsuario);
      setModalEditarAberto(false);
      setUsuarioSelecionado(null);
    }
  }, [usuarioSelecionado, atualizarUsuario]);

  const handleExportarDados = useCallback(() => {
    // Implementação futura para exportar dados dos usuários
    // TODO: Exportar dados dos usuários
  }, []);

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        breadcrumb={breadcrumbs}
        title="Gestão de Usuários"
        subtitle="Controle completo dos usuários e assinaturas do sistema"
        icon={<Users className="w-8 h-8 text-blue-600" />}
        actions={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleExportarDados}
              className="bg-white/80 backdrop-blur-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        }
      />

      {/* Métricas dos Usuários */}
      <MetricasUsuarios metricas={metricas} loading={loading} />

      {/* Filtros e Busca */}
      <Card className="mb-6 bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Buscar usuário</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Nome, email ou documento..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Filtro de Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status da Assinatura</label>
              <select 
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="trial">Trial</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            {/* Resultados */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Resultados</label>
              <div className="flex items-center justify-center h-10 bg-gray-50/80 backdrop-blur-sm rounded-lg border">
                <span className="text-sm text-gray-600">
                  {usuariosFiltrados.length} de {usuarios.length} usuários
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <TabelaUsuarios 
        usuarios={usuariosFiltrados}
        loading={loading}
        onEditarUsuario={handleEditarUsuario}
      />

      {/* Modal de Edição */}
      {modalEditarAberto && usuarioSelecionado && (
        <ModalEditarUsuario
          usuario={usuarioSelecionado}
          aberto={modalEditarAberto}
          onFechar={() => {
            setModalEditarAberto(false);
            setUsuarioSelecionado(null);
          }}
          onSalvar={handleSalvarUsuario}
        />
      )}
    </div>
  );
}