import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryAreaChart() {
  const { chartData, loading } = useDashboardCharts();

  if (loading) {
    return <Skeleton className="h-80 w-full" />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData.fluxoMensal} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorMaterial" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorServicos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorAluguel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorOutros" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="opacity-30" />
          <XAxis 
            dataKey="mes" 
            stroke="#6B7280" 
            fontSize={12}
            tick={{ fontSize: 11, fill: '#6B7280' }}
          />
          <YAxis 
            stroke="#6B7280" 
            fontSize={12}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
            labelClassName="font-medium text-gray-900"
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="material" 
            stackId="1" 
            stroke="#3B82F6" 
            fill="url(#colorMaterial)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="servicos" 
            stackId="1" 
            stroke="#10B981" 
            fill="url(#colorServicos)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="aluguel" 
            stackId="1" 
            stroke="#8B5CF6" 
            fill="url(#colorAluguel)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="outros" 
            stackId="1" 
            stroke="#F59E0B" 
            fill="url(#colorOutros)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}