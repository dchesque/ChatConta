import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { Skeleton } from '@/components/ui/skeleton';

export function StatusDonutChart() {
  const { chartData, loading } = useDashboardCharts();

  if (loading) {
    return <Skeleton className="h-80 w-full" />;
  }

  const data = chartData.statusContas;

  return (
    <div className="h-80">
      <div className="flex items-center justify-center h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}%`, '']}
              labelClassName="font-medium text-gray-900"
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center space-x-6 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.cor }}
            ></div>
            <span className="text-sm text-gray-600">{item.status} {item.quantidade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}