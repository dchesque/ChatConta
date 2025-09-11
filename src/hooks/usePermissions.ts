import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export const usePermissions = () => {
  const { user } = useAuth();
  const { plan, isActive, checkLimit, limits } = useSubscription();
  
  // Mock: verificar se é admin baseado no email
  const isAdmin = user?.email?.includes('admin') || false;
  
  const permissions = {
    // Admin tem acesso total
    isAdmin,
    
    // Permissões por feature
    canCreateConta: (currentCount: number = 0) => {
      if (isAdmin) return true;
      return checkLimit('contas_pagar', currentCount);
    },
    
    canCreateFornecedor: (currentCount: number = 0) => {
      if (isAdmin) return true;
      return checkLimit('fornecedores', currentCount);
    },

    canCreateCategoria: (currentCount: number = 0) => {
      if (isAdmin) return true;
      return checkLimit('categorias', currentCount);
    },
    
    canExport: () => {
      if (isAdmin) return true;
      return limits.exportacao && isActive;
    },
    
    canBackup: () => {
      if (isAdmin) return true;
      return limits.backup && isActive;
    },
    
    canViewReports: () => {
      if (isAdmin) return true;
      return limits.relatorios;
    },
    
    canDeleteBulk: () => {
      return isAdmin;
    },
    
    canManageUsers: () => {
      return isAdmin;
    },

    canAccessAdminPanel: () => {
      return isAdmin;
    },

    // Verificações de plano
    isPremiumFeature: (feature: string) => {
      const premiumFeatures = ['exportacao', 'backup', 'bulk_operations'];
      return premiumFeatures.includes(feature);
    },

    // Verificar se pode usar uma feature específica
    canUseFeature: (feature: string, currentCount: number = 0) => {
      if (isAdmin) return true;
      
      switch (feature) {
        case 'contas_pagar':
          return checkLimit('contas_pagar', currentCount);
        case 'fornecedores':
          return checkLimit('fornecedores', currentCount);
        case 'categorias':
          return checkLimit('categorias', currentCount);
        case 'exportacao':
          return limits.exportacao;
        case 'backup':
          return limits.backup;
        case 'relatorios':
          return limits.relatorios;
        default:
          return true;
      }
    }
  };
  
  return permissions;
};