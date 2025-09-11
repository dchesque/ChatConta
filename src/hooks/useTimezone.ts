import { useCallback, useMemo } from 'react';
import {
  formatarDataBrasilia,
  formatarDataHoraBrasilia,
  converterParaBrasilia,
  obterDataAtualBrasilia,
  estaVencida,
  calcularDiasVencimento,
  formatarParaInputDate,
  converterInputDateParaDate,
  validarData,
  TIMEZONE_BRASILIA
} from '@/utils/timezone';

/**
 * Hook para manipulação consistente de datas com timezone de Brasília
 */
export const useTimezone = () => {
  // Formatadores
  const formatarData = useCallback((data: string | Date, pattern?: string) => {
    return formatarDataBrasilia(data, pattern);
  }, []);

  const formatarDataHora = useCallback((data: string | Date, pattern?: string) => {
    return formatarDataHoraBrasilia(data, pattern);
  }, []);

  const formatarParaInput = useCallback((data: string | Date) => {
    return formatarParaInputDate(data);
  }, []);

  // Conversores
  const converterParaTimezone = useCallback((data: string | Date) => {
    return converterParaBrasilia(data);
  }, []);

  const converterInputParaDate = useCallback((inputDate: string) => {
    return converterInputDateParaDate(inputDate);
  }, []);

  // Validadores e calculadores
  const verificarVencimento = useCallback((dataVencimento: string | Date) => {
    return estaVencida(dataVencimento);
  }, []);

  const calcularDias = useCallback((dataVencimento: string | Date) => {
    return calcularDiasVencimento(dataVencimento);
  }, []);

  const validar = useCallback((data: string) => {
    return validarData(data);
  }, []);

  // Data atual em Brasília (memoizada)
  const dataAtual = useMemo(() => {
    return obterDataAtualBrasilia();
  }, []);

  // Utilitários para status de contas
  const obterStatusConta = useCallback((dataVencimento: string | Date, status: string) => {
    if (status === 'pago') return 'pago';
    if (verificarVencimento(dataVencimento)) return 'vencido';
    return 'pendente';
  }, [verificarVencimento]);

  const obterClasseStatus = useCallback((dataVencimento: string | Date, status: string) => {
    const statusCalculado = obterStatusConta(dataVencimento, status);
    
    switch (statusCalculado) {
      case 'pago':
        return 'bg-green-100/80 text-green-700';
      case 'vencido':
        return 'bg-red-100/80 text-red-700';
      case 'pendente':
      default:
        return 'bg-blue-100/80 text-blue-700';
    }
  }, [obterStatusConta]);

  const obterTextoStatus = useCallback((dataVencimento: string | Date, status: string) => {
    const statusCalculado = obterStatusConta(dataVencimento, status);
    
    switch (statusCalculado) {
      case 'pago':
        return 'Pago';
      case 'vencido':
        return 'Vencido';
      case 'pendente':
      default:
        return 'Pendente';
    }
  }, [obterStatusConta]);

  return {
    // Constantes
    timezone: TIMEZONE_BRASILIA,
    dataAtual,
    
    // Formatadores
    formatarData,
    formatarDataHora,
    formatarParaInput,
    
    // Conversores
    converterParaTimezone,
    converterInputParaDate,
    
    // Validadores e calculadores
    verificarVencimento,
    calcularDias,
    validar,
    
    // Utilitários de status
    obterStatusConta,
    obterClasseStatus,
    obterTextoStatus
  };
};