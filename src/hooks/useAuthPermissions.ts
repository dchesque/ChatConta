import { useAuth } from './useAuth';

export function useAuthPermissions() {
  const { profile, isAuthenticated, loading } = useAuth();

  const hasRole = (role: 'user' | 'admin'): boolean => {
    if (!isAuthenticated || !profile) return false;
    return profile.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isUser = (): boolean => {
    return hasRole('user');
  };

  const canAccess = (requiredRole: 'user' | 'admin' = 'user'): boolean => {
    if (!isAuthenticated || loading) return false;
    
    // Admin pode acessar tudo
    if (profile?.role === 'admin') return true;
    
    // User só pode acessar recursos de user
    return requiredRole === 'user' && profile?.role === 'user';
  };

  const canManage = (resource: 'users' | 'profiles' | 'system'): boolean => {
    if (!isAuthenticated || !profile) return false;
    
    switch (resource) {
      case 'users':
      case 'profiles':
      case 'system':
        return profile.role === 'admin';
      default:
        return false;
    }
  };

  return {
    // Estados
    isAuthenticated,
    loading,
    profile,
    
    // Verificações de role
    hasRole,
    isAdmin,
    isUser,
    canAccess,
    canManage,
    
    // Dados do usuário
    userId: profile?.user_id,
    userRole: profile?.role || 'user',
    userName: profile?.name,
    userPhone: profile?.phone
  };
}