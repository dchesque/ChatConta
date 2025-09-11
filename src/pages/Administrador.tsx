import { PageHeader } from '@/components/layout/PageHeader';
import { createBreadcrumb } from '@/utils/breadcrumbUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Activity, 
  Palette, 
  Shield, 
  ArrowRight,
  BarChart3,
  Cpu,
  Eye,
  Settings2
} from 'lucide-react';

export default function Administrador() {
  const navigate = useNavigate();
  const { isAdmin, role } = useAuth();

  // Dupla verificação de segurança - se não for admin, não renderizar nada
  if (!isAdmin) {
    console.warn(`[SECURITY] Unauthorized direct access to /administrador - User role: ${role}`);
    return null;
  }

  const sistemaCards = [
    {
      id: 'gestao-usuarios',
      titulo: 'Gestão de Usuários',
      descricao: 'Controle completo dos usuários, assinaturas e permissões do sistema',
      icone: Shield,
      rota: '/administrador/usuarios',
      cor: 'from-blue-500 to-blue-600',
      corFundo: 'bg-blue-50/80',
      badges: ['Usuários', 'Assinaturas']
    },
    {
      id: 'configuracoes-sistema',
      titulo: 'Configurações do Sistema',
      descricao: 'Gerencie planos, assinaturas e integrações de pagamento do sistema',
      icone: Settings2,
      rota: '/administrador/configuracoes-sistema',
      cor: 'from-amber-500 to-amber-600',
      corFundo: 'bg-amber-50/80',
      badges: ['Planos', 'Stripe', 'Pagamentos']
    },
    {
      id: 'monitoramento-performance',
      titulo: 'Monitoramento de Performance',
      descricao: 'Visualize métricas de desempenho, tempo de resposta e uso de recursos do sistema',
      icone: Activity,
      rota: '/monitoramento-performance',
      cor: 'from-green-500 to-green-600',
      corFundo: 'bg-green-50/80',
      badges: ['Tempo Real', 'Métricas']
    },
    {
      id: 'design-system',
      titulo: 'Design System',
      descricao: 'Explore e teste todos os componentes visuais e padrões de design do sistema',
      icone: Palette,
      rota: '/design-system',
      cor: 'from-purple-500 to-purple-600',
      corFundo: 'bg-purple-50/80',
      badges: ['Componentes', 'UI/UX']
    },
  ];

  const handleNavegar = (rota: string) => {
    navigate(rota);
  };

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        breadcrumb={createBreadcrumb('/administrador')}
        title="Administrador"
        subtitle="Ferramentas de administração e monitoramento • Controle total"
      />

      <div className="mt-8">
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100/80">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <p className="text-lg font-semibold text-foreground">Otimizado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100/80">
                  <Cpu className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sistema</p>
                  <p className="text-lg font-semibold text-foreground">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100/80">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Componentes</p>
                  <p className="text-lg font-semibold text-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sistemaCards.map((card) => {
            const IconeComponente = card.icone;
            
            return (
              <Card 
                key={card.id}
                className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => handleNavegar(card.rota)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${card.corFundo} group-hover:scale-110 transition-transform duration-300`}>
                      <IconeComponente className="w-6 h-6 text-gray-700" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <div className="space-y-2">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-gray-900 transition-colors">
                      {card.titulo}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {card.badges.map((badge) => (
                        <Badge 
                          key={badge}
                          variant="secondary" 
                          className="text-xs bg-gray-100/80 text-gray-600 hover:bg-gray-200/80"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {card.descricao}
                  </CardDescription>

                  <Button 
                    className={`w-full bg-gradient-to-r ${card.cor} text-white hover:shadow-lg transition-all duration-300`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavegar(card.rota);
                    }}
                  >
                    Acessar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Informações adicionais */}
        <Card className="mt-8 bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm border border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100/80">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Centro de Controle do Sistema</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Estas ferramentas permitem o controle administrativo completo do sistema. 
              Use a <strong>Gestão de Usuários</strong> para controlar assinaturas e permissões,
              o <strong>Monitoramento de Performance</strong> para verificar a velocidade e eficiência, 
              e o <strong>Design System</strong> para explorar componentes visuais.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}