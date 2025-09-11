import { useState, useCallback, useMemo } from 'react';
import { Banco } from '@/types/banco';

export interface ErrosValidacao {
  nome: string[];
  codigo_banco: string[];
  agencia: string[];
  conta: string[];
  tipo_conta: string[];
  email: string[];
  telefone: string[];
  saldo_inicial: string[];
  digito_verificador: string[];
  url_ofx: string[];
}

export function useValidacoesBanco(bancos: Banco[], bancoAtual?: Banco | null) {
  const [erros, setErros] = useState<ErrosValidacao>({
    nome: [],
    codigo_banco: [],
    agencia: [],
    conta: [],
    tipo_conta: [],
    email: [],
    telefone: [],
    saldo_inicial: [],
    digito_verificador: [],
    url_ofx: []
  });

  const validarCampo = useCallback((campo: keyof ErrosValidacao, valor: any, formData?: any): string[] => {
    const errosCampo: string[] = [];

    switch (campo) {
      case 'nome':
        if (!valor || valor.trim().length === 0) {
          errosCampo.push('Nome é obrigatório');
        } else if (valor.trim().length < 2) {
          errosCampo.push('Nome deve ter pelo menos 2 caracteres');
        } else if (valor.trim().length > 100) {
          errosCampo.push('Nome deve ter no máximo 100 caracteres');
        }
        break;

      case 'codigo_banco':
        if (!valor || valor.trim().length === 0) {
          errosCampo.push('Código do banco é obrigatório');
        } else if (!/^\d{3}$/.test(valor)) {
          errosCampo.push('Código deve ter exatamente 3 dígitos');
        } else {
          // Verificar unicidade
          const codigoExiste = bancos.some(banco => 
            banco.codigo_banco === valor && 
            (!bancoAtual || banco.id !== bancoAtual.id)
          );
          if (codigoExiste) {
            errosCampo.push('Este código de banco já está sendo usado');
          }
        }
        break;

      case 'agencia':
        if (!valor || valor.trim().length === 0) {
          errosCampo.push('Agência é obrigatória');
        } else if (valor.trim().length < 4) {
          errosCampo.push('Agência deve ter pelo menos 4 caracteres');
        }
        break;

      case 'conta':
        if (!valor || valor.trim().length === 0) {
          errosCampo.push('Conta é obrigatória');
        } else if (valor.trim().length < 5) {
          errosCampo.push('Conta deve ter pelo menos 5 caracteres');
        }
        break;

      case 'tipo_conta':
        if (!valor) {
          errosCampo.push('Tipo de conta é obrigatório');
        }
        break;

      case 'email':
        if (valor && valor.trim().length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(valor)) {
            errosCampo.push('Email inválido');
          }
        }
        break;

      case 'telefone':
        if (valor && valor.trim().length > 0) {
          const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
          if (!telefoneRegex.test(valor)) {
            errosCampo.push('Formato inválido. Use: (11) 99999-9999');
          }
        }
        break;

      case 'saldo_inicial':
        if (valor !== undefined && valor !== null && valor !== '') {
          const numero = parseFloat(valor.toString().replace(',', '.'));
          if (isNaN(numero)) {
            errosCampo.push('Saldo deve ser um número válido');
          }
        }
        break;

      case 'digito_verificador':
        if (!valor || valor.trim().length === 0) {
          errosCampo.push('Dígito verificador é obrigatório');
        } else if (!/^\d{1}$/.test(valor)) {
          errosCampo.push('Dígito verificador deve ter 1 dígito');
        }
        break;

      case 'url_ofx':
        if (valor && valor.trim().length > 0) {
          try {
            new URL(valor);
          } catch {
            errosCampo.push('URL inválida');
          }
        }
        break;
    }

    return errosCampo;
  }, [bancos, bancoAtual]);

  const validarTodos = useCallback((formData: any): boolean => {
    const novosErros: ErrosValidacao = {
      nome: validarCampo('nome', formData.nome, formData),
      codigo_banco: validarCampo('codigo_banco', formData.codigo_banco, formData),
      agencia: validarCampo('agencia', formData.agencia, formData),
      conta: validarCampo('conta', formData.conta, formData),
      tipo_conta: validarCampo('tipo_conta', formData.tipo_conta, formData),
      email: validarCampo('email', formData.email, formData),
      telefone: validarCampo('telefone', formData.telefone, formData),
      saldo_inicial: validarCampo('saldo_inicial', formData.saldo_inicial, formData),
      digito_verificador: validarCampo('digito_verificador', formData.digito_verificador, formData),
      url_ofx: validarCampo('url_ofx', formData.url_ofx, formData)
    };

    setErros(novosErros);

    // Retorna true se houver erros
    return Object.values(novosErros).some(errosCampo => errosCampo.length > 0);
  }, [validarCampo]);

  const limparErros = useCallback(() => {
    setErros({
      nome: [],
      codigo_banco: [],
      agencia: [],
      conta: [],
      tipo_conta: [],
      email: [],
      telefone: [],
      saldo_inicial: [],
      digito_verificador: [],
      url_ofx: []
    });
  }, []);

  const temErros = useMemo(() => {
    return Object.values(erros).some(errosCampo => errosCampo.length > 0);
  }, [erros]);

  return {
    erros,
    validarCampo,
    validarTodos,
    limparErros,
    temErros
  };
}