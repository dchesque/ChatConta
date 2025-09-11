import { ReactNode } from 'react';
import { HOVER_EFFECTS } from '@/constants/premiumEffects';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <div className={cn(
      "bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg",
      HOVER_EFFECTS.cardSubtle,
      className
    )}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}