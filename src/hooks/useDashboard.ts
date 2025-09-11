import { useState, useEffect } from 'react';
import { dataService } from '@/services/DataServiceFactory';
import { useAuth } from './useAuth';
import { useErrorHandler } from './useErrorHandler';
import { showMessage } from '@/utils/messages';
import type { DashboardSummary } from '@/services/interfaces/IDataService';

export interface UseDashboardReturn {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  recarregar: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError, withRetry, withTimeout, cancelAll } = useErrorHandler('dashboard');

  const carregarDashboard = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      const data = await withRetry(() => 
        withTimeout(dataService.dashboard.getSummary(), 30000)
      );
      setSummary(data);
    } catch (err) {
      const appErr = handleError(err, 'carregar-dashboard');
      setError(appErr.message);
    } finally {
      setLoading(false);
    }
  };

  const recarregar = async (): Promise<void> => {
    await carregarDashboard();
  };

  useEffect(() => {
    if (user) {
      carregarDashboard();
    } else {
      setSummary(null);
    }

    return () => {
      cancelAll();
    };
  }, [user, cancelAll]);

  return {
    summary,
    loading,
    error,
    recarregar
  };
}