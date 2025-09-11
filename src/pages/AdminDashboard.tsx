import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/usePermissions';
import { Navigate } from 'react-router-dom';
import { 
  Users, 
  Crown, 
  DollarSign, 
  TrendingUp, 
  Search, 
  MoreHorizontal,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { GLASSMORPHISM, ANIMATIONS } from '@/constants/designSystem';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Mock data para usuários admin
interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'trial' | 'free' | 'premium';
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  last_login?: string;
  trial_ends_at?: string;
}

const mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    phone: '(11) 99999-9999',
    plan: 'premium',
    status: 'active',
    created_at: '2024-01-15',
    last_login: '2024-01-20'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@startup.com',
    phone: '(11) 88888-8888',
    plan: 'trial',
    status: 'active',
    created_at: '2024-01-18',
    last_login: '2024-01-19',
    trial_ends_at: '2024-02-01'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@free.com',
    phone: '(11) 77777-7777',
    plan: 'free',
    status: 'active',
    created_at: '2024-01-10',
    last_login: '2024-01-18'
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    email: 'ana@expired.com',
    phone: '(11) 66666-6666',
    plan: 'trial',
    status: 'expired',
    created_at: '2024-01-01',
    last_login: '2024-01-15',
    trial_ends_at: '2024-01-15'
  }
];

export default function AdminDashboard() {
  const { canAccessAdminPanel } = usePermissions();
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Verificar permissão de admin
  if (!canAccessAdminPanel()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesPlan = selectedPlan === 'all' || user.plan === selectedPlan;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Estatísticas
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    premiumUsers: users.filter(u => u.plan === 'premium').length,
    trialUsers: users.filter(u => u.plan === 'trial').length,
    mrr: users.filter(u => u.plan === 'premium' && u.status === 'active').length * 29.90
  };

  const handleUserAction = (userId: string, action: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'block':
        toast.info(`Usuário ${user.name} foi bloqueado`);
        break;
      case 'upgrade':
        toast.info(`Upgrade iniciado para ${user.name}`);
        break;
      case 'details':
        toast.info(`Detalhes de ${user.name}`);
        break;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case 'trial':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Trial</Badge>;
      case 'free':
        return <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Grátis</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Painel Administrativo"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '/admin' }
        ]}
        subtitle="Gerencie usuários, planos e sistema"
      />

      <div className="space-y-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={GLASSMORPHISM.card}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} ativos
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className={GLASSMORPHISM.card}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Premium</CardTitle>
                <Crown className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.premiumUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className={GLASSMORPHISM.card}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  MRR atual
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className={GLASSMORPHISM.card}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Trial</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.trialUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Usuários testando
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gestão de Usuários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className={GLASSMORPHISM.card}>
            <CardHeader>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos os planos</option>
                  <option value="premium">Premium</option>
                  <option value="trial">Trial</option>
                  <option value="free">Grátis</option>
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="expired">Expirado</option>
                </select>
              </div>

              {/* Tabela de usuários */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Usuário</th>
                      <th className="text-center py-3 px-4 font-medium">Plano</th>
                      <th className="text-center py-3 px-4 font-medium">Status</th>
                      <th className="text-center py-3 px-4 font-medium">Cadastro</th>
                      <th className="text-center py-3 px-4 font-medium">Último Acesso</th>
                      <th className="text-center py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            <div className="text-xs text-muted-foreground">{user.phone}</div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          {getPlanBadge(user.plan)}
                        </td>
                        <td className="text-center py-3 px-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="text-center py-3 px-4 text-sm">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="text-center py-3 px-4 text-sm">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : 'Nunca'}
                        </td>
                        <td className="text-center py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'details')}>
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'upgrade')}>
                                Alterar plano
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, 'block')}
                                className="text-red-600"
                              >
                                Bloquear usuário
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum usuário encontrado com os filtros selecionados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
}