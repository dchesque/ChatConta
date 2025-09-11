import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users,
  BarChart3,
  Calendar,
  PieChart,
  Settings
} from 'lucide-react';

export function AcoesRapidas() {
  const navigate = useNavigate();

  const acoes = [
    {
      icone: DollarSign,
      titulo: 'Nova Despesa',
      descricao: 'Lançar gasto',
      cor: 'from-red-500 to-red-600',
      corHover: 'hover:from-red-600 hover:to-red-700',
      link: '/contas-pagar'
    },
    {
      icone: Users,
      titulo: 'Credores',
      descricao: 'Cadastrar/consultar',
      cor: 'from-green-500 to-green-600',
      corHover: 'hover:from-green-600 hover:to-green-700',
      link: '/credores'
    },
    {
      icone: BarChart3,
      titulo: 'Relatório Mensal',
      descricao: 'Gastos do mês',
      cor: 'from-blue-500 to-blue-600',
      corHover: 'hover:from-blue-600 hover:to-blue-700',
      link: '/relatorios'
    },
    {
      icone: Calendar,
      titulo: 'Agenda Financeira',
      descricao: 'Próximos vencimentos',
      cor: 'from-purple-500 to-purple-600',
      corHover: 'hover:from-purple-600 hover:to-purple-700',
      link: '/contas-pagar'
    },
    {
      icone: PieChart,
      titulo: 'Análise de Gastos',
      descricao: 'Por categoria',
      cor: 'from-cyan-500 to-cyan-600',
      corHover: 'hover:from-cyan-600 hover:to-cyan-700',
      link: '/relatorios'
    },
    {
      icone: Settings,
      titulo: 'Configurações',
      descricao: 'Ajustes pessoais',
      cor: 'from-orange-500 to-orange-600',
      corHover: 'hover:from-orange-600 hover:to-orange-700',
      link: '/configuracoes'
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          ⚡ Ações Rápidas
        </CardTitle>
        <p className="text-sm text-gray-600">Acesso direto às funcionalidades mais usadas</p>
      </CardHeader>
      
      <CardContent className="pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {acoes.map((acao, index) => {
            const IconeComponente = acao.icone;
            
            return (
              <button
                key={index}
                onClick={() => navigate(acao.link)}
                className={`
                  group relative p-4 rounded-xl transition-all duration-200
                  bg-gradient-to-br ${acao.cor} ${acao.corHover}
                  hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
              >
                {/* Conteúdo */}
                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-2">
                    <IconeComponente className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {acao.titulo}
                  </h3>
                  
                  <p className="text-xs text-white/80 leading-tight">
                    {acao.descricao}
                  </p>
                </div>

                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}