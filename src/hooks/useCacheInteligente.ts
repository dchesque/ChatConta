import { useState, useEffect, useCallback, useRef } from 'react';
import { globalCache, apiCache, userCache, staticCache, CACHE_CONFIGS } from '@/services/cacheService';
import type { CacheStrategy } from '@/services/cacheService';

/**
 * Tipo de cache para diferentes usos
 */
export type CacheType = 'global' | 'api' | 'user' | 'static' | 'fornecedores' | 'contas' | 'categorias';

/**
 * Configurações do hook de cache
 */
export interface CacheHookConfig {
  /** Tipo de cache a usar */
  type?: CacheType;
  /** TTL customizado em ms */
  ttl?: number;
  /** Se deve revalidar em background */
  revalidateOnFocus?: boolean;
  /** Se deve revalidar quando voltar online */
  revalidateOnReconnect?: boolean;
  /** Intervalo de revalidação automática em ms */
  refreshInterval?: number;
  /** Callback quando dados são atualizados */
  onSuccess?: (data: any) => void;
  /** Callback quando há erro */
  onError?: (error: Error) => void;
  /** Se deve fazer fallback para cache expirado */
  fallbackToExpired?: boolean;
}

/**
 * Estado do cache
 */
export interface CacheState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isValidating: boolean;
  lastUpdated: Date | null;
}

/**
 * Função fetcher para dados
 */
export type Fetcher<T> = () => Promise<T>;

/**
 * Hook para cache inteligente com estratégias avançadas
 * 
 * @param key - Chave única do cache
 * @param fetcher - Função para buscar dados
 * @param config - Configurações do cache
 * @returns Estado do cache e funções de controle
 * 
 * @example
 * ```tsx
 * const FornecedoresList = () => {
 *   const { 
 *     data: fornecedores, 
 *     isLoading, 
 *     error, 
 *     mutate, 
 *     revalidate 
 *   } = useCacheInteligente(
 *     'fornecedores',
 *     () => fetchFornecedores(),
 *     { 
 *       type: 'fornecedores',
 *       revalidateOnFocus: true,
 *       refreshInterval: 5 * 60 * 1000 // 5 minutos
 *     }
 *   );
 * 
 *   if (isLoading) return <div>Carregando...</div>;
 *   if (error) return <div>Erro: {error.message}</div>;
 * 
 *   return (
 *     <div>
 *       {fornecedores.map(fornecedor => (
 *         <div key={fornecedor.id}>{fornecedor.nome}</div>
 *       ))}
 *       <button onClick={() => revalidate()}>Atualizar</button>
 *     </div>
 *   );
 * };
 * ```
 */
export function useCacheInteligente<T>(
  key: string,
  fetcher: Fetcher<T>,
  config: CacheHookConfig = {}
) {
  const {
    type = 'global',
    ttl,
    revalidateOnFocus = false,
    revalidateOnReconnect = false,
    refreshInterval,
    onSuccess,
    onError,
    fallbackToExpired = true
  } = config;

  const [state, setState] = useState<CacheState<T>>({
    data: null,
    isLoading: true,
    error: null,
    isValidating: false,
    lastUpdated: null
  });

  const fetcherRef = useRef(fetcher);
  const intervalRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Atualizar ref do fetcher
  fetcherRef.current = fetcher;

  /**
   * Obter instância do cache baseada no tipo
   */
  const getCacheInstance = useCallback(() => {
    switch (type) {
      case 'api': return apiCache;
      case 'user': return userCache;
      case 'static': return staticCache;
      case 'fornecedores':
      case 'contas':
      case 'categorias':
        return globalCache;
      default: return globalCache;
    }
  }, [type]);

  /**
   * Obter TTL baseado no tipo ou configuração
   */
  const getTTL = useCallback(() => {
    if (ttl) return ttl;
    
    const configs = CACHE_CONFIGS as any;
    return configs[type]?.ttl || 5 * 60 * 1000; // 5 minutos padrão
  }, [type, ttl]);

  /**
   * Buscar dados com cache
   */
  const fetchData = useCallback(async (options: {
    forceRefresh?: boolean;
    showLoading?: boolean;
  } = {}) => {
    const { forceRefresh = false, showLoading = true } = options;
    const cache = getCacheInstance();
    
    try {
      // Cancelar requisição anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Verificar cache primeiro (se não for force refresh)
      if (!forceRefresh) {
        const cachedData = cache.get<T>(key);
        if (cachedData) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            error: null,
            lastUpdated: new Date()
          }));
          
          if (onSuccess) {
            onSuccess(cachedData);
          }
          
          return cachedData;
        }
      }

      // Mostrar loading se necessário
      if (showLoading) {
        setState(prev => ({
          ...prev,
          isLoading: true,
          isValidating: !prev.data // Só é validating se já tem dados
        }));
      }

      // Buscar dados frescos
      const freshData = await fetcherRef.current();
      
      // Verificar se não foi cancelado
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Salvar no cache
      cache.set(key, freshData, getTTL());

      // Atualizar estado
      setState({
        data: freshData,
        isLoading: false,
        error: null,
        isValidating: false,
        lastUpdated: new Date()
      });

      if (onSuccess) {
        onSuccess(freshData);
      }

      return freshData;

    } catch (error: any) {
      // Verificar se não foi cancelado
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Tentar fallback para cache expirado
      if (fallbackToExpired) {
        const cache = getCacheInstance();
        const expiredData = cache.get<T>(key);
        
        if (expiredData) {
          setState(prev => ({
            ...prev,
            data: expiredData,
            isLoading: false,
            error: errorObj,
            isValidating: false,
            lastUpdated: new Date()
          }));
          
          if (onError) {
            onError(errorObj);
          }
          
          return expiredData;
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
        isValidating: false
      }));

      if (onError) {
        onError(errorObj);
      }

      throw errorObj;
    }
  }, [key, getCacheInstance, getTTL, onSuccess, onError, fallbackToExpired]);

  /**
   * Revalidar dados
   */
  const revalidate = useCallback(() => {
    return fetchData({ forceRefresh: true, showLoading: false });
  }, [fetchData]);

  /**
   * Mutar dados diretamente no cache
   */
  const mutate = useCallback((newData: T | ((current: T | null) => T)) => {
    const cache = getCacheInstance();
    
    setState(prev => {
      const updatedData = typeof newData === 'function' 
        ? (newData as (current: T | null) => T)(prev.data)
        : newData;
      
      // Atualizar cache
      cache.set(key, updatedData, getTTL());
      
      return {
        ...prev,
        data: updatedData,
        lastUpdated: new Date()
      };
    });
  }, [key, getCacheInstance, getTTL]);

  /**
   * Invalidar cache
   */
  const invalidate = useCallback(() => {
    const cache = getCacheInstance();
    cache.delete(key);
    
    setState(prev => ({
      ...prev,
      data: null,
      lastUpdated: null
    }));
  }, [key, getCacheInstance]);

  /**
   * Obter métricas do cache
   */
  const getMetrics = useCallback(() => {
    const cache = getCacheInstance();
    return cache.getMetrics();
  }, [getCacheInstance]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [key]); // Só recarregar se a key mudar

  // Configurar refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        revalidate();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, revalidate]);

  // Revalidar quando voltar o foco (se habilitado)
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      revalidate();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [revalidateOnFocus, revalidate]);

  // Revalidar quando voltar online (se habilitado)
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => {
      revalidate();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [revalidateOnReconnect, revalidate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    mutate,
    revalidate,
    invalidate,
    getMetrics,
    isStale: false // TODO: Implementar lógica de stale
  };
}

export default useCacheInteligente;