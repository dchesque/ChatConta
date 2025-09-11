
import { useState, useCallback } from 'react';

interface DreFiltros {
  ano: number;
  tipoVisualizacao: 'mensal' | 'anual';
  mesEspecifico?: number;
  compararAtivo: boolean;
  anoComparacao?: number;
  mesComparacao?: number;
  nivelDetalhamento: 'resumido' | 'detalhado' | 'analitico';
}

interface ErrosValidacao {
  ano?: string;
  mes?: string;
  anoComparacao?: string;
  mesComparacao?: string;
  geral?: string;
}

export const useValidacoesDRE = () => {
  const [erros, setErros] = useState<ErrosValidacao>({});

  const validarFiltros = useCallback((filtros: DreFiltros): boolean => {
    const novosErros: ErrosValidacao = {};
    let temErros = false;

    // Validar ano
    if (!filtros.ano || filtros.ano < 2000 || filtros.ano > new Date().getFullYear() + 1) {
      novosErros.ano = `Ano deve estar entre 2000 e ${new Date().getFullYear() + 1}`;
      temErros = true;
    }

    // Validar mês específico (se mensal)
    if (filtros.tipoVisualizacao === 'mensal') {
      if (!filtros.mesEspecifico || filtros.mesEspecifico < 1 || filtros.mesEspecifico > 12) {
        novosErros.mes = 'Mês deve estar entre 1 e 12';
        temErros = true;
      }

      // Verificar se não é uma data futura
      const dataAtual = new Date();
      const anoAtual = dataAtual.getFullYear();
      const mesAtual = dataAtual.getMonth() + 1;

      if (filtros.ano > anoAtual || (filtros.ano === anoAtual && filtros.mesEspecifico! > mesAtual)) {
        novosErros.geral = 'Não é possível gerar DRE para períodos futuros';
        temErros = true;
      }
    }

    // Validar comparação
    if (filtros.compararAtivo) {
      if (!filtros.anoComparacao) {
        novosErros.anoComparacao = 'Ano de comparação é obrigatório quando comparação está ativa';
        temErros = true;
      } else if (filtros.anoComparacao < 2000 || filtros.anoComparacao > new Date().getFullYear()) {
        novosErros.anoComparacao = `Ano de comparação deve estar entre 2000 e ${new Date().getFullYear()}`;
        temErros = true;
      }

      if (filtros.tipoVisualizacao === 'mensal') {
        if (!filtros.mesComparacao || filtros.mesComparacao < 1 || filtros.mesComparacao > 12) {
          novosErros.mesComparacao = 'Mês de comparação deve estar entre 1 e 12';
          temErros = true;
        }

        // Verificar se os períodos são diferentes
        if (filtros.ano === filtros.anoComparacao && filtros.mesEspecifico === filtros.mesComparacao) {
          novosErros.geral = 'O período de comparação deve ser diferente do período principal';
          temErros = true;
        }
      } else {
        // Para anual, verificar se os anos são diferentes
        if (filtros.ano === filtros.anoComparacao) {
          novosErros.geral = 'O ano de comparação deve ser diferente do ano principal';
          temErros = true;
        }
      }
    }

    setErros(novosErros);
    return !temErros;
  }, []);

  const validarDadosEssenciais = useCallback((dados: any): boolean => {
    const novosErros: ErrosValidacao = {};
    let temErros = false;

    if (!dados.cmv_valor || dados.cmv_valor <= 0) {
      novosErros.geral = 'CMV deve ser maior que zero';
      temErros = true;
    }

    if (dados.estoque_inicial_valor !== undefined && dados.estoque_inicial_valor < 0) {
      novosErros.geral = 'Valor do estoque inicial não pode ser negativo';
      temErros = true;
    }

    if (dados.estoque_final_valor !== undefined && dados.estoque_final_valor < 0) {
      novosErros.geral = 'Valor do estoque final não pode ser negativo';
      temErros = true;
    }

    setErros(novosErros);
    return !temErros;
  }, []);

  const validarExportacao = useCallback((configuracao: any): boolean => {
    const novosErros: ErrosValidacao = {};
    let temErros = false;

    if (!configuracao.formato) {
      novosErros.geral = 'Formato de exportação é obrigatório';
      temErros = true;
    }

    if (!configuracao.tipoRelatorio) {
      novosErros.geral = 'Tipo de relatório é obrigatório';
      temErros = true;
    }

    setErros(novosErros);
    return !temErros;
  }, []);

  const limparErros = useCallback(() => {
    setErros({});
  }, []);

  const obterErroGeral = useCallback((): string | null => {
    return erros.geral || Object.values(erros).find(erro => erro) || null;
  }, [erros]);

  return {
    erros,
    validarFiltros,
    validarDadosEssenciais,
    validarExportacao,
    limparErros,
    obterErroGeral
  };
};
