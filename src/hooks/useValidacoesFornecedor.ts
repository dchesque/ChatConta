import { useState, useCallback } from 'react';
import { useFornecedores } from './useFornecedores';
import { useMascaras } from './useMascaras';

interface ValidacaoFornecedor {
  campo: string;
  mensagem: string;
}

export const useValidacoesFornecedor = () => {
  const [erros, setErros] = useState<ValidacaoFornecedor[]>([]);
  const [validando, setValidando] = useState(false);
  const { buscarPorDocumento } = useFornecedores();
  const { removerMascara } = useMascaras();

  const limparErros = useCallback(() => {
    setErros([]);
  }, []);

  const adicionarErro = useCallback((campo: string, mensagem: string) => {
    setErros(prev => [...prev.filter(e => e.campo !== campo), { campo, mensagem }]);
  }, []);

  const removerErro = useCallback((campo: string) => {
    setErros(prev => prev.filter(e => e.campo !== campo));
  }, []);

  const validarCPF = (cpf: string): boolean => {
    const cpfLimpo = removerMascara(cpf);
    
    if (cpfLimpo.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) return false;
    
    // Calcular primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false;
    
    // Calcular segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.charAt(10))) return false;
    
    return true;
  };

  const validarCNPJ = (cnpj: string): boolean => {
    const cnpjLimpo = removerMascara(cnpj);
    
    if (cnpjLimpo.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
    
    // Calcular primeiro dígito verificador
    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    let digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Calcular segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
  };

  const validarDocumento = async (documento: string, tipo: 'pessoa_fisica' | 'pessoa_juridica', fornecedorId?: number): Promise<boolean> => {
    if (!documento) {
      adicionarErro('documento', 'Documento é obrigatório');
      return false;
    }

    const documentoLimpo = removerMascara(documento);

    // Validar formato do documento
    if (tipo === 'pessoa_fisica') {
      if (!validarCPF(documento)) {
        adicionarErro('documento', 'CPF inválido');
        return false;
      }
    } else {
      if (!validarCNPJ(documento)) {
        adicionarErro('documento', 'CNPJ inválido');
        return false;
      }
    }

    // Verificar duplicidade
    try {
      setValidando(true);
      const fornecedorExistente = buscarPorDocumento(documentoLimpo);
      
      if (fornecedorExistente) {
        adicionarErro('documento', 'Este documento já está cadastrado');
        return false;
      }

      removerErro('documento');
      return true;
    } catch (error) {
      console.error('Erro ao validar documento:', error);
      adicionarErro('documento', 'Erro ao validar documento');
      return false;
    } finally {
      setValidando(false);
    }
  };

  const validarEmail = (email: string): boolean => {
    if (!email) {
      removerErro('email');
      return true; // Email é opcional
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      adicionarErro('email', 'Email inválido');
      return false;
    }

    removerErro('email');
    return true;
  };

  const validarTelefone = (telefone: string): boolean => {
    if (!telefone) {
      removerErro('telefone');
      return true; // Telefone é opcional
    }

    const telefoneLimpo = removerMascara(telefone);
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      adicionarErro('telefone', 'Telefone deve ter 10 ou 11 dígitos');
      return false;
    }

    removerErro('telefone');
    return true;
  };

  const validarCEP = (cep: string): boolean => {
    if (!cep) {
      removerErro('cep');
      return true; // CEP é opcional
    }

    const cepLimpo = removerMascara(cep);
    if (cepLimpo.length !== 8) {
      adicionarErro('cep', 'CEP deve ter 8 dígitos');
      return false;
    }

    removerErro('cep');
    return true;
  };

  const validarCamposObrigatorios = (dados: any): boolean => {
    let valido = true;

    if (!dados.nome || dados.nome.trim() === '') {
      adicionarErro('nome', 'Nome é obrigatório');
      valido = false;
    } else {
      removerErro('nome');
    }

    if (!dados.tipo) {
      adicionarErro('tipo', 'Tipo de pessoa é obrigatório');
      valido = false;
    } else {
      removerErro('tipo');
    }

    if (!dados.tipo_fornecedor) {
      adicionarErro('tipo_fornecedor', 'Tipo de fornecedor é obrigatório');
      valido = false;
    } else {
      removerErro('tipo_fornecedor');
    }

    return valido;
  };

  const obterErro = useCallback((campo: string): string | undefined => {
    return erros.find(e => e.campo === campo)?.mensagem;
  }, [erros]);

  const temErros = useCallback((): boolean => {
    return erros.length > 0;
  }, [erros]);

  return {
    erros,
    validando,
    limparErros,
    validarDocumento,
    validarEmail,
    validarTelefone,
    validarCEP,
    validarCamposObrigatorios,
    obterErro,
    temErros
  };
};