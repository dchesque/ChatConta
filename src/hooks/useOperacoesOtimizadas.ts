import { useState, useCallback } from 'react';

export function useOperacoesOtimizadas() {
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState(new Map());

  const executarComCache = useCallback(async (
    chave: string, 
    operacao: () => Promise<any>,
    tempoCache = 30 * 1000 // 30 segundos
  ) => {
    // Verificar cache
    const itemCache = cache.get(chave);
    if (itemCache && Date.now() - itemCache.timestamp < tempoCache) {
      return itemCache.data;
    }

    setLoading(true);
    try {
      const resultado = await operacao();
      
      // Salvar no cache
      setCache(prev => new Map(prev.set(chave, {
        data: resultado,
        timestamp: Date.now()
      })));
      
      return resultado;
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const limparCache = useCallback((chave?: string) => {
    if (chave) {
      setCache(prev => {
        const novoCache = new Map(prev);
        novoCache.delete(chave);
        return novoCache;
      });
    } else {
      setCache(new Map());
    }
  }, []);

  const executarBatch = useCallback(async (operacoes: Array<() => Promise<any>>) => {
    setLoading(true);
    try {
      const resultados = await Promise.allSettled(operacoes.map(op => op()));
      return resultados.map(r => r.status === 'fulfilled' ? r.value : null);
    } finally {
      setLoading(false);
    }
  }, []);

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  return {
    loading,
    executarComCache,
    limparCache,
    executarBatch,
    debounce
  };
}