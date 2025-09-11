import { Badge } from '@/components/ui/badge';

interface BadgeStatusAssinaturaProps {
  status: 'ativo' | 'inativo' | 'cancelado' | 'trial';
}

export function BadgeStatusAssinatura({ status }: BadgeStatusAssinaturaProps) {
  const statusConfig = {
    ativo: {
      label: 'Ativo',
      variant: 'default' as const,
      className: 'bg-green-100/80 text-green-700 hover:bg-green-100',
      dotColor: 'bg-green-600'
    },
    inativo: {
      label: 'Inativo',
      variant: 'secondary' as const,
      className: 'bg-red-100/80 text-red-700 hover:bg-red-100',
      dotColor: 'bg-red-600'
    },
    cancelado: {
      label: 'Cancelado',
      variant: 'destructive' as const,
      className: 'bg-red-100/80 text-red-700 hover:bg-red-100',
      dotColor: 'bg-red-600'
    },
    trial: {
      label: 'Trial',
      variant: 'outline' as const,
      className: 'bg-blue-100/80 text-blue-700 hover:bg-blue-100 border-blue-200',
      dotColor: 'bg-blue-600'
    }
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant={config.variant}
      className={`inline-flex items-center gap-1.5 ${config.className}`}
    >
      <div className={`w-2 h-2 rounded-full ${config.dotColor}`}></div>
      {config.label}
    </Badge>
  );
}