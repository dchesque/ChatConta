import { useEffect } from 'react';
import { useSettings } from './useSettings';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook que aplica configurações globalmente no app
 */
export function useGlobalSettings() {
  const { data: settings, isLoading } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Aplicar redirecionamento para página inicial após login
  useEffect(() => {
    if (!isLoading && settings?.start_page && location.pathname === '/dashboard' && location.state?.fromLogin) {
      navigate(settings.start_page, { replace: true });
    }
  }, [settings?.start_page, navigate, location, isLoading]);

  // Retornar configurações globais para uso em componentes
  return {
    settings,
    isLoading,
    itemsPerPage: settings?.items_per_page || 25,
    dateFormat: settings?.date_format || 'DD/MM/YYYY',
    numberFormat: settings?.number_format || 'pt-BR',
    locale: settings?.locale || 'pt-BR',
    currency: settings?.currency || 'BRL',
    timezone: settings?.timezone || 'America/Sao_Paulo'
  };
}