
import { useState, useCallback } from 'react';

export const useFormatacao = () => {
  const formatarMoedaInput = useCallback((valor: string): string => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (!apenasNumeros) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const numero = parseInt(apenasNumeros) / 100;
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numero);
  }, []);

  const formatarPercentualInput = useCallback((valor: string): string => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (!apenasNumeros) return '';
    
    // Converte para número e divide por 100
    const numero = parseInt(apenasNumeros) / 100;
    
    // Limita a 100%
    const percentual = Math.min(numero, 100);
    
    return percentual.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';
  }, []);

  const converterMoedaParaNumero = useCallback((valorMoeda: string): number => {
    if (!valorMoeda) return 0;
    // Remove R$, espaços e pontos, substitui vírgula por ponto
    const numero = valorMoeda
      .replace(/[R$\s.]/g, '')
      .replace(',', '.');
    return parseFloat(numero) || 0;
  }, []);

  const converterPercentualParaNumero = useCallback((valorPercentual: string): number => {
    if (!valorPercentual) return 0;
    // Remove % e espaços, substitui vírgula por ponto
    const numero = valorPercentual
      .replace(/[%\s]/g, '')
      .replace(',', '.');
    return parseFloat(numero) || 0;
  }, []);

  return {
    formatarMoedaInput,
    formatarPercentualInput,
    converterMoedaParaNumero,
    converterPercentualParaNumero
  };
};
