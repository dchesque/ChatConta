import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Timezone padrão do sistema - Brasília
export const TIMEZONE_BRASILIA = 'America/Sao_Paulo';

/**
 * Formatar data para timezone de Brasília
 */
export const formatarDataBrasilia = (
  data: string | Date, 
  pattern: string = 'dd/MM/yyyy'
): string => {
  if (!data) return '-';
  
  try {
    let dataObj: Date;
    
    if (typeof data === 'string') {
      // Se a string está no formato YYYY-MM-DD (sem horário), tratar como data local
      if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [ano, mes, dia] = data.split('-');
        dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
      } else {
        dataObj = parseISO(data);
      }
    } else {
      dataObj = data;
    }
    
    return formatInTimeZone(dataObj, TIMEZONE_BRASILIA, pattern, { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
};

/**
 * Formatar data e hora para timezone de Brasília
 */
export const formatarDataHoraBrasilia = (
  data: string | Date,
  pattern: string = 'dd/MM/yyyy HH:mm'
): string => {
  return formatarDataBrasilia(data, pattern);
};

/**
 * Converter data UTC para timezone de Brasília
 */
export const converterParaBrasilia = (data: string | Date): Date => {
  let dataObj: Date;
  
  if (typeof data === 'string') {
    // Se a string está no formato YYYY-MM-DD (sem horário), tratar como data local
    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = data.split('-');
      dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
    } else {
      dataObj = parseISO(data);
    }
  } else {
    dataObj = data;
  }
  
  return toZonedTime(dataObj, TIMEZONE_BRASILIA);
};

/**
 * Converter data de Brasília para UTC
 */
export const converterParaUTC = (data: Date): Date => {
  return fromZonedTime(data, TIMEZONE_BRASILIA);
};

/**
 * Obter data atual em Brasília
 */
export const obterDataAtualBrasilia = (): Date => {
  return toZonedTime(new Date(), TIMEZONE_BRASILIA);
};

/**
 * Verificar se uma data está vencida (baseado na timezone de Brasília)
 */
export const estaVencida = (dataVencimento: string | Date): boolean => {
  if (!dataVencimento) return false;
  
  const hoje = obterDataAtualBrasilia();
  const vencimento = converterParaBrasilia(dataVencimento);
  
  // Comparar apenas as datas (sem horário)
  const hojeData = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const vencimentoData = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
  
  return vencimentoData < hojeData;
};

/**
 * Calcular dias até vencimento (baseado na timezone de Brasília)
 */
export const calcularDiasVencimento = (dataVencimento: string | Date): number => {
  if (!dataVencimento) return 0;
  
  const hoje = obterDataAtualBrasilia();
  const vencimento = converterParaBrasilia(dataVencimento);
  
  // Comparar apenas as datas (sem horário)
  const hojeData = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const vencimentoData = new Date(vencimento.getFullYear(), vencimento.getMonth(), vencimento.getDate());
  
  const diffTime = vencimentoData.getTime() - hojeData.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Formatar data para input type="date" (YYYY-MM-DD)
 */
export const formatarParaInputDate = (data: string | Date): string => {
  if (!data) return '';
  
  try {
    const dataObj = typeof data === 'string' ? parseISO(data) : data;
    const dataBrasilia = converterParaBrasilia(dataObj);
    return format(dataBrasilia, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Erro ao formatar para input date:', error);
    return '';
  }
};

/**
 * Converter string de input date (YYYY-MM-DD) para Date em Brasília
 */
export const converterInputDateParaDate = (inputDate: string): Date => {
  if (!inputDate) throw new Error('Data inválida');
  
  const [ano, mes, dia] = inputDate.split('-').map(Number);
  // Criar data local em Brasília (sem conversão de timezone)
  return new Date(ano, mes - 1, dia, 12, 0, 0); // 12:00 para evitar problemas de DST
};

/**
 * Validar se uma string é uma data válida
 */
export const validarData = (data: string): boolean => {
  if (!data) return false;
  
  try {
    const dataObj = parseISO(data);
    return !isNaN(dataObj.getTime());
  } catch {
    return false;
  }
};