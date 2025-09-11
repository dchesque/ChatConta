import { Card, CardContent } from '@/components/ui/card';
import { MetricasUsuarios as IMetricasUsuarios } from '@/types/usuarioAdmin';
import { formatarMoeda } from '@/lib/formatacaoBrasileira';
import { 
  Users, 
  UserCheck, 
  UserX, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface MetricasUsuariosProps {
  metricas: IMetricasUsuarios;
  loading: boolean;
}

export function MetricasUsuarios({ metricas, loading }: MetricasUsuariosProps) {
  const cartoes = [
    {
      titulo: 'Total de Usuários',
      valor: metricas.total_usuarios,
      icone: Users,
      cor: 'from-blue-500 to-blue-600',
      corFundo: 'bg-blue-50/80',
      corTexto: 'text-blue-600'
    },
    {
      titulo: 'Usuários Ativos',
      valor: metricas.usuarios_ativos,
      icone: UserCheck,
      cor: 'from-green-500 to-green-600',
      corFundo: 'bg-green-50/80',
      corTexto: 'text-green-600'
    },
    {
      titulo: 'Usuários Inativos',
      valor: metricas.usuarios_inativos,
      icone: UserX,
      cor: 'from-red-500 to-red-600',
      corFundo: 'bg-red-50/80',
      corTexto: 'text-red-600'
    },
    {
      titulo: 'Total Assinaturas',
      valor: metricas.total_assinaturas,
      icone: CreditCard,
      cor: 'from-purple-500 to-purple-600',
      corFundo: 'bg-purple-50/80',
      corTexto: 'text-purple-600'
    },
    {
      titulo: 'Receita Mensal',
      valor: formatarMoeda(metricas.valor_total_mensal),
      icone: DollarSign,
      cor: 'from-amber-500 to-amber-600',
      corFundo: 'bg-amber-50/80',
      corTexto: 'text-amber-600'
    },
    {
      titulo: 'Novos este Mês',
      valor: metricas.novos_usuarios_mes,
      icone: TrendingUp,
      cor: 'from-cyan-500 to-cyan-600',
      corFundo: 'bg-cyan-50/80',
      corTexto: 'text-cyan-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cartoes.map((cartao, index) => {
        const IconeComponente = cartao.icone;
        
        return (
          <Card 
            key={index}
            className="bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white/90 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${cartao.corFundo}`}>
                  <IconeComponente className={`w-5 h-5 ${cartao.corTexto}`} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">{cartao.titulo}</h3>
              </div>
              
              <p className="text-2xl font-bold text-gray-900">
                {cartao.valor}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}