import { useState, useEffect } from 'react';
import { dataService } from '@/services/DataServiceFactory';
import { useAuth } from './useAuth';
import { useErrorHandler } from './useErrorHandler';
import type { DashboardSummary } from '@/services/interfaces/IDataService';

export interface UseDashboardWithPeriodReturn {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  recarregar: () => Promise<void>;
}

export function useDashboardWithPeriod(): UseDashboardWithPeriodReturn {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuth();
  const { handleError, withRetry, withTimeout, cancelAll } = useErrorHandler('dashboard');

  const carregarDashboard = async (date: Date = selectedDate) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      const data = await withRetry(() => 
        withTimeout(
          dataService.dashboard.getSummary(date.getFullYear(), date.getMonth()),
          30000
        )
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    carregarDashboard(date);
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
    selectedDate,
    setSelectedDate: handleDateChange,
    recarregar
  };
}