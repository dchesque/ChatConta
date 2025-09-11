import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { Skeleton } from '@/components/ui/skeleton';

export function StatusChart() {
  const { chartData, loading } = useDashboardCharts();

  if (loading) {
    return <Skeleton className="h-80 w-full" />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData.statusContas}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.statusContas.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.cor} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, '']}
            labelClassName="font-medium"
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {chartData.statusContas.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.cor }}
            />
            <span className="text-sm text-muted-foreground">{item.status}</span>
            <span className="text-sm font-medium">{item.quantidade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}