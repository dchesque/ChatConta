import { ReactNode } from 'react';
import { useAuthPermissions } from '@/hooks/useAuthPermissions';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin';
  fallback?: ReactNode;
}

export function RoleGuard({ children, requiredRole = 'user', fallback }: RoleGuardProps) {
  const { canAccess, loading } = useAuthPermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!canAccess(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Acesso Negado
          </h3>
          <p className="text-red-600">
            Você não tem permissão para acessar este recurso.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}