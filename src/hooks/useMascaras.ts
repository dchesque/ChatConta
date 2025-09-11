
import { useState, useCallback } from 'react';

export const useMascaras = () => {
  // Máscara para telefone com detecção automática de celular/fixo
  const aplicarMascaraTelefone = useCallback((value: string) => {
    const numeros = value.replace(/\D/g, '');
    
    if (numeros.length <= 10) {
      // Telefone fixo: (11) 1234-5678
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 14);
    } else {
      // Celular: (11) 91234-5678
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }
  }, []);

  // Máscara dinâmica para CPF com validação visual
  const aplicarMascaraCPF = useCallback((value: string) => {
    const numeros = value.replace(/\D/g, '');
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  }, []);

  // Máscara dinâmica para CNPJ com validação visual
  const aplicarMascaraCNPJ = useCallback((value: string) => {
    const numeros = value.replace(/\D/g, '');
    return numeros
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .substring(0, 18);
  }, []);

  // Máscara para CEP com formatação automática
  const aplicarMascaraCEP = useCallback((value: string) => {
    const numeros = value.replace(/\D/g, '');
    return numeros
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  }, []);

  // Máscara para RG
  const aplicarMascaraRG = useCallback((value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 8) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
    } else {
      return numeros
        .replace(/(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4')
        .substring(0, 12);
    }
  }, []);

  // Função para detectar tipo de documento automaticamente
  const detectarTipoDocumento = useCallback((value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return 'CPF';
    } else {
      return 'CNPJ';
    }
  }, []);

  // Função para aplicar máscara baseada no tipo
  const aplicarMascaraDocumento = useCallback((value: string, tipo: 'PF' | 'PJ') => {
    if (tipo === 'PF') {
      return aplicarMascaraCPF(value);
    } else {
      return aplicarMascaraCNPJ(value);
    }
  }, [aplicarMascaraCPF, aplicarMascaraCNPJ]);

  // Remover todas as máscaras para obter valor limpo
  const removerMascara = useCallback((value: string) => {
    return value.replace(/\D/g, '');
  }, []);

  return {
    aplicarMascaraTelefone,
    aplicarMascaraCPF,
    aplicarMascaraCNPJ,
    aplicarMascaraCEP,
    aplicarMascaraRG,
    aplicarMascaraDocumento,
    detectarTipoDocumento,
    removerMascara
  };
};
