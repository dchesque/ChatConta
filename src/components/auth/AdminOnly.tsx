import { useAuth } from '@/hooks/useAuth';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin, loading } = useAuth();
  
  // Durante o loading, não mostrar nada para evitar flash de conteúdo
  if (loading) return <>{fallback}</>;
  
  // Se não for admin, retornar fallback (null por padrão)
  if (!isAdmin) return <>{fallback}</>;
  
  // Se for admin, mostrar o conteúdo
  return <>{children}</>;
}