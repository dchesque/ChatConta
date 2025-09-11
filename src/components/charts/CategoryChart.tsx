import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryChart() {
  const { chartData, loading } = useDashboardCharts();

  if (loading) {
    return <Skeleton className="h-80 w-full" />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData.fluxoMensal} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="mes" 
            className="text-xs"
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
            labelClassName="font-medium"
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar dataKey="material" fill="#10B981" radius={[2, 2, 0, 0]} />
          <Bar dataKey="servicos" fill="#06B6D4" radius={[2, 2, 0, 0]} />
          <Bar dataKey="aluguel" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
          <Bar dataKey="outros" fill="#F59E0B" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}