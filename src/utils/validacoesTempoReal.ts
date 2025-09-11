// Validações em tempo real para campos

export const validarValor = (valor: string): string => {
  const num = parseFloat(valor);
  if (!valor) return 'Valor é obrigatório';
  if (isNaN(num)) return 'Deve ser um número válido';
  if (num <= 0) return 'Valor deve ser maior que zero';
  if (num > 1000000) return 'Valor muito alto (máx: R$ 1.000.000)';
  return '';
};

export const validarDescricao = (descricao: string): string => {
  if (!descricao.trim()) return 'Descrição é obrigatória';
  if (descricao.length < 3) return 'Mínimo 3 caracteres';
  if (descricao.length > 500) return 'Máximo 500 caracteres';
  return '';
};

export const validarDocumento = (documento: string): string => {
  if (documento && documento.length > 50) return 'Documento muito longo (máx: 50 caracteres)';
  return '';
};

export const validarData = (data: string): string => {
  if (!data) return 'Data é obrigatória';
  const dataObj = new Date(data);
  if (isNaN(dataObj.getTime())) return 'Data inválida';
  
  // Verificar se não é muito no passado (mais de 10 anos)
  const hoje = new Date();
  const anoPassado = new Date(hoje.getFullYear() - 10, hoje.getMonth(), hoje.getDate());
  if (dataObj < anoPassado) return 'Data muito antiga (máx: 10 anos atrás)';
  
  // Verificar se não é muito no futuro (mais de 5 anos)
  const futuro = new Date(hoje.getFullYear() + 5, hoje.getMonth(), hoje.getDate());
  if (dataObj > futuro) return 'Data muito distante (máx: 5 anos à frente)';
  
  return '';
};

export const validarDataVencimento = (dataVencimento: string, dataEmissao?: string): string => {
  if (!dataVencimento) return 'Data de vencimento é obrigatória';
  
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);
  
  if (isNaN(vencimento.getTime())) return 'Data de vencimento inválida';
  
  if (dataEmissao) {
    const emissao = new Date(dataEmissao);
    emissao.setHours(0, 0, 0, 0);
    
    if (vencimento < emissao) {
      return 'Data de vencimento não pode ser anterior à data de emissão';
    }
  } else {
    // Se não há data de emissão, validar que não seja anterior a hoje
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    ontem.setHours(23, 59, 59, 999);
    
    if (vencimento <= ontem) {
      return 'Data de vencimento não pode ser anterior a hoje';
    }
  }
  
  // Verificar se não é muito no futuro (mais de 5 anos)
  const futuro = new Date();
  futuro.setFullYear(futuro.getFullYear() + 5);
  if (vencimento > futuro) return 'Data muito distante (máx: 5 anos à frente)';
  
  return '';
};

export const validarObservacoes = (observacoes: string): string => {
  if (observacoes && observacoes.length > 1000) return 'Observações muito longas (máx: 1000 caracteres)';
  return '';
};