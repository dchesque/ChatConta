// Factory pattern para gerenciar instâncias de serviços de dados
import { IDataService } from './interfaces/IDataService';
import { SupabaseDataService } from './adapters/SupabaseDataService';
import { FEATURES } from '@/config/features';

let serviceInstance: IDataService | null = null;

// Função principal para criar instância do serviço
function createDataService(): IDataService {
  // Sempre usar Supabase - mock services removidos para simplificar
  return new SupabaseDataService();
}

export class DataServiceFactory {
  static getInstance(): IDataService {
    if (!serviceInstance) {
      serviceInstance = createDataService();
      
      if (import.meta.env.DEV) {
        console.warn('🔧 DataService inicializado: Supabase');
      }
    }
    
    return serviceInstance;
  }
  
  // Método para forçar recriação (útil para testes ou troca de configuração)
  static reset(): void {
    serviceInstance = null;
    console.warn('🔄 Factory resetado - próxima chamada criará nova instância');
  }
  
  // Método para verificar qual serviço está ativo
  static getActiveService(): 'supabase' {
    return 'supabase';
  }

  // Método para verificar se está em modo de desenvolvimento
  static isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  // Método para logging de debug
  static logStatus(): void {
    console.warn('🔍 Status do DataServiceFactory:', {
      activeService: DataServiceFactory.getActiveService(),
      isDevelopment: DataServiceFactory.isDevelopment(),
      hasInstance: !!serviceInstance
    });
  }
}

// Export conveniente para uso direto
export const dataService = DataServiceFactory.getInstance();