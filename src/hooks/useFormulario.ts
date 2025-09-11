import { useState, useCallback, useRef } from 'react';
import type { EsquemaValidacao } from '@/utils/validacoes';

interface UseFormularioReturn<T> {
  dados: T;
  alterarCampo: (campo: keyof T, valor: any) => void;
  alterarCampos: (novosValues: Partial<T>) => void;
  resetar: () => void;
  estaCarregando: boolean;
  setCarregando: (carregando: boolean) => void;
  salvar: (dadosParaSalvar?: any) => Promise<void>;
  erros: Record<string, string>;
  validarCampo: (campo: string, valor: string) => string;
  validarTodos: () => boolean;
  limparErros: () => void;
  temErros: boolean;
}

export function useFormulario<T extends Record<string, any>>(
  dadosIniciais: T,
  onSalvar: (dados: T) => Promise<void>,
  validacao?: EsquemaValidacao
): UseFormularioReturn<T> {
  const [dados, setDados] = useState<T>(dadosIniciais);
  const [estaCarregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const timersRef = useRef<Record<string, number>>({});

  const validarCampo = useCallback((campo: string, valor: string): string => {
    if (!validacao || !validacao[campo]) return '';

    const validadores = validacao[campo];
    for (const validador of validadores) {
      const erro = validador.validador(valor);
      if (erro) {
        return erro;
      }
    }
    return '';
  }, [validacao]);

  const alterarCampo = useCallback((campo: keyof T, valor: any) => {
    setDados(prev => ({ ...prev, [campo]: valor }));
    
    // Validação com debounce
    const key = String(campo);
    if (timersRef.current[key]) {
      window.clearTimeout(timersRef.current[key]);
    }
    timersRef.current[key] = window.setTimeout(() => {
      const erro = validarCampo(key, String(valor ?? ''));
      setErros(prev => ({ ...prev, [key]: erro }));
    }, 500);
  }, [validarCampo]);

  const alterarCampos = useCallback((novosValues: Partial<T>) => {
    setDados(prev => ({ ...prev, ...novosValues }));
  }, []);

  const resetar = useCallback(() => {
    setDados(dadosIniciais);
    setErros({});
  }, [dadosIniciais]);

  const validarTodos = useCallback(() => {
    if (!validacao) return true;

    let todosValidos = true;
    const novosErros: Record<string, string> = {};

    Object.keys(validacao).forEach((campo) => {
      const valor = dados[campo as keyof T];
      const erro = validarCampo(campo, String(valor ?? ''));
      if (erro) {
        novosErros[campo] = erro;
        todosValidos = false;
      }
    });

    setErros(novosErros);
    return todosValidos;
  }, [dados, validacao, validarCampo]);

  const limparErros = useCallback(() => {
    setErros({});
  }, []);

  const salvar = useCallback(async (dadosParaSalvar?: any) => {
    // Garantir que sempre usamos os dados do formulário quando dadosParaSalvar não for válido
    const dadosFinais = (dadosParaSalvar && typeof dadosParaSalvar === 'object' && !dadosParaSalvar.type) ? dadosParaSalvar : dados;
    
    if (validacao && !validarTodos()) {
      return;
    }

    setCarregando(true);
    try {
      await onSalvar(dadosFinais);
    } catch (error) {
      // Error handling without console logs
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [dados, onSalvar, validacao, validarTodos]);

  return {
    dados,
    alterarCampo,
    alterarCampos,
    resetar,
    estaCarregando,
    setCarregando,
    salvar,
    erros,
    validarCampo,
    validarTodos,
    limparErros,
    temErros: Object.keys(erros).length > 0
  };
}