import { STATUS_BADGES, getStatusBadge } from '@/constants/designSystem';

interface StatusBadgeProps {
  status: 'pendente' | 'pago' | 'vencido';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = getStatusBadge(status);

  const labels = {
    pendente: 'Pendente',
    pago: 'Pago',
    vencido: 'Vencido'
  };

  return (
    <span className={statusConfig.container}>
      <div className={statusConfig.dot}></div>
      {labels[status]}
    </span>
  );
}