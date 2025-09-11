export interface DadosOFX {
  fitid?: string;
  saldoFinal: number;
  dataSaldo: Date;
  transacoes: TransacaoOFX[];
  totalTransacoes: number;
  dadosBanco?: {
    codigo?: string;
    agencia?: string;
    conta?: string;
  };
}

export interface TransacaoOFX {
  fitid?: string;
  valor: number;
  data: Date;
  descricao: string;
  tipo: 'debito' | 'credito';
  trntype?: string;
}

export const processarArquivoOFX = async (conteudoOFX: string): Promise<DadosOFX> => {
  try {
    const transacoes: TransacaoOFX[] = [];
    let saldoFinal = 0;
    let dataSaldo = new Date();

    // Extrair FITID (ID único do arquivo)
    const fitidMatch = conteudoOFX.match(/<FITID>(.*?)<\/FITID>/);
    const fitid = fitidMatch ? fitidMatch[1] : undefined;

    // Extrair saldo final
    const saldoMatch = conteudoOFX.match(/<BALAMT>(.*?)<\/BALAMT>/);
    saldoFinal = saldoMatch ? parseFloat(saldoMatch[1]) : 0;

    // Extrair data do saldo
    const dtSaldoMatch = conteudoOFX.match(/<DTASOF>(.*?)<\/DTASOF>/);
    dataSaldo = dtSaldoMatch ? formatarDataOFX(dtSaldoMatch[1]) : new Date();

    // Extrair dados do banco
    const codigoBancoMatch = conteudoOFX.match(/<BANKID>(.*?)<\/BANKID>/);
    const agenciaMatch = conteudoOFX.match(/<BRANCHID>(.*?)<\/BRANCHID>/);
    const contaMatch = conteudoOFX.match(/<ACCTID>(.*?)<\/ACCTID>/);

    const dadosBanco = {
      codigo: codigoBancoMatch ? codigoBancoMatch[1] : undefined,
      agencia: agenciaMatch ? agenciaMatch[1] : undefined,
      conta: contaMatch ? contaMatch[1] : undefined,
    };

    // Extrair transações
    const stmtTrnRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gs;
    const matches = conteudoOFX.matchAll(stmtTrnRegex);

    for (const match of matches) {
      const trn = match[1];
      
      const trnamt = trn.match(/<TRNAMT>(.*?)<\/TRNAMT>/)?.[1];
      const dtposted = trn.match(/<DTPOSTED>(.*?)<\/DTPOSTED>/)?.[1];
      const memo = trn.match(/<MEMO>(.*?)<\/MEMO>/)?.[1];
      const trntype = trn.match(/<TRNTYPE>(.*?)<\/TRNTYPE>/)?.[1];
      const trnFitid = trn.match(/<FITID>(.*?)<\/FITID>/)?.[1];

      if (trnamt && dtposted) {
        const valor = parseFloat(trnamt);
        transacoes.push({
          fitid: trnFitid,
          valor: Math.abs(valor),
          data: formatarDataOFX(dtposted),
          descricao: memo || 'Transação importada',
          tipo: valor < 0 ? 'debito' : 'credito',
          trntype
        });
      }
    }

    return {
      fitid,
      saldoFinal,
      dataSaldo,
      transacoes,
      totalTransacoes: transacoes.length,
      dadosBanco
    };
  } catch (error) {
    throw new Error('Formato OFX inválido ou arquivo corrompido');
  }
};

const formatarDataOFX = (dataOFX: string): Date => {
  // OFX usa formato YYYYMMDD ou YYYYMMDDHHMMSS
  const ano = parseInt(dataOFX.substring(0, 4));
  const mes = parseInt(dataOFX.substring(4, 6)) - 1; // JS usa 0-11 para meses
  const dia = parseInt(dataOFX.substring(6, 8));
  
  return new Date(ano, mes, dia);
};

export const validarArquivoOFX = (arquivo: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!arquivo.name.toLowerCase().endsWith('.ofx')) {
      reject(new Error('Arquivo deve ter extensão .ofx'));
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) { // 5MB
      reject(new Error('Arquivo muito grande (máximo 5MB)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Verificações básicas do formato OFX
      if (!content.includes('<OFX>') && !content.includes('<OFX ')) {
        reject(new Error('Arquivo não parece ser um OFX válido'));
        return;
      }

      resolve(true);
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsText(arquivo);
  });
};