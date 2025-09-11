import { useEffect } from 'react';
import { initializeApp, isDebugMode } from '@/utils/startup';
import { logService } from '@/services/logService';

interface StartupInitializerProps {
  children: React.ReactNode;
}

export function StartupInitializer({ children }: StartupInitializerProps) {
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApp({
          enableAudit: true,
          enablePerformanceMonitoring: true,
          enableErrorTracking: true,
          debugMode: isDebugMode(),
          environmentChecks: true
        });
        
        logService.logInfo('Aplicação inicializada com sucesso');
      } catch (error) {
        logService.logError(error, 'startup-initialization');
      }
    };

    initialize();
  }, []);

  return <>{children}</>;
}