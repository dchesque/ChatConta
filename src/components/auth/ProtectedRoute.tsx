import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRole, redirectTo = '/dashboard' }: ProtectedRouteProps) {
  const { isAuthenticated, loading, checkRole, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Salvar URL atual para redirecionamento após login
      const returnUrl = location.pathname + location.search;
      if (returnUrl !== '/auth') {
        localStorage.setItem('returnUrl', returnUrl);
      }
      navigate('/auth');
    } else if (!loading && isAuthenticated && requiredRole && !checkRole(requiredRole)) {
      // Log da tentativa de acesso não autorizado
      console.warn(`[SECURITY] Unauthorized access attempt to ${location.pathname} - Required: ${requiredRole}, User: ${role}`);
      
      toast.error(`Acesso negado. Você precisa ter permissão de ${requiredRole} para acessar esta página.`);
      navigate(redirectTo);
    }
  }, [isAuthenticated, loading, navigate, location, requiredRole, checkRole, role, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        {/* Background abstratos */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 text-center bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-lg">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Verificando autenticação...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Verificar role se especificado
  if (requiredRole && !checkRole(requiredRole)) {
    return null; // Navegação já foi feita no useEffect
  }

  return <>{children}</>;
}