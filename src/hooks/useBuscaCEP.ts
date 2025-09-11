
import { useState } from 'react';

interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface DadosEndereco {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export const useBuscaCEP = () => {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscarCEP = async (cep: string): Promise<DadosEndereco | null> => {
    // Limpa o CEP deixando apenas números
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Valida se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      setErro('CEP deve ter 8 dígitos');
      return null;
    }

    setCarregando(true);
    setErro(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na consulta do CEP');
      }

      const dados: EnderecoViaCEP = await response.json();

      if (dados.erro) {
        setErro('CEP não encontrado');
        return null;
      }

      // Retorna os dados formatados
      return {
        logradouro: dados.logradouro || '',
        bairro: dados.bairro || '',
        cidade: dados.localidade || '',
        estado: dados.uf || ''
      };

    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setErro('Erro ao consultar CEP. Verifique sua conexão.');
      return null;
    } finally {
      setCarregando(false);
    }
  };

  const limparErro = () => {
    setErro(null);
  };

  return {
    buscarCEP,
    carregando,
    erro,
    limparErro
  };
};
