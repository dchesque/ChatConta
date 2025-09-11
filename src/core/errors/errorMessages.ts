import { ErrorCode } from './AppError';

/**
 * Mensagens de erro em português para exibição ao usuário
 * 
 * Organizada por categorias e contextos específicos.
 * Mensagens são amigáveis e orientam o usuário sobre como resolver o problema.
 */

/**
 * Mensagens principais mapeadas por código de erro
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Erros de validação
  [ErrorCode.VALIDATION_ERROR]: 'Os dados informados são inválidos. Verifique os campos e tente novamente.',
  [ErrorCode.INVALID_INPUT]: 'Informação inválida. Verifique os dados inseridos.',
  [ErrorCode.REQUIRED_FIELD]: 'Campo obrigatório não preenchido.',
  
  // Erros de autenticação e autorização
  [ErrorCode.UNAUTHORIZED]: 'Você precisa estar logado para acessar este recurso.',
  [ErrorCode.FORBIDDEN]: 'Você não tem permissão para realizar esta ação.',
  [ErrorCode.TOKEN_EXPIRED]: 'Sua sessão expirou. Faça login novamente.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Email ou senha incorretos.',
  
  // Erros de recursos
  [ErrorCode.NOT_FOUND]: 'O item solicitado não foi encontrado.',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'Recurso não encontrado.',
  [ErrorCode.DUPLICATE_RESOURCE]: 'Este item já existe no sistema.',
  
  // Erros de negócio
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 'Esta operação não é permitida pelas regras do sistema.',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Permissões insuficientes para realizar esta ação.',
  [ErrorCode.OPERATION_NOT_ALLOWED]: 'Operação não permitida neste momento.',
  [ErrorCode.QUOTA_EXCEEDED]: 'Limite excedido. Verifique seu plano ou tente novamente mais tarde.',
  
  // Erros de banco de dados
  [ErrorCode.DATABASE_ERROR]: 'Erro interno no banco de dados. Tente novamente em alguns minutos.',
  [ErrorCode.CONSTRAINT_VIOLATION]: 'Esta operação viola as regras de integridade dos dados.',
  [ErrorCode.CONNECTION_ERROR]: 'Problemas de conexão com o banco de dados.',
  [ErrorCode.TRANSACTION_ERROR]: 'Erro na transação. A operação foi cancelada.',
  
  // Erros de rede
  [ErrorCode.NETWORK_ERROR]: 'Erro de conexão. Verifique sua internet e tente novamente.',
  [ErrorCode.TIMEOUT_ERROR]: 'A operação demorou mais que o esperado. Tente novamente.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
  
  // Erros do sistema
  [ErrorCode.INTERNAL_ERROR]: 'Erro interno do sistema. Nossa equipe foi notificada.',
  [ErrorCode.CONFIGURATION_ERROR]: 'Erro de configuração do sistema.',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'Erro em serviço externo. Tente novamente mais tarde.',
  
  // Erros específicos do domínio financeiro
  [ErrorCode.INVALID_AMOUNT]: 'Valor monetário inválido. Verifique se o valor é positivo e tem no máximo 2 casas decimais.',
  [ErrorCode.INVALID_DATE]: 'Data inválida. Verifique o formato e tente novamente.',
  [ErrorCode.ACCOUNT_NOT_FOUND]: 'Conta não encontrada.',
  [ErrorCode.PAYMENT_ERROR]: 'Erro no processamento do pagamento. Tente novamente.',
  [ErrorCode.BANK_ERROR]: 'Erro na comunicação com o banco. Tente novamente mais tarde.',
  
  // Erros de rate limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
  [ErrorCode.TOO_MANY_REQUESTS]: 'Muitas solicitações. Tente novamente em alguns minutos.',
};

/**
 * Mensagens contextuais por módulo/funcionalidade
 */
export const CONTEXTUAL_MESSAGES = {
  // Autenticação
  auth: {
    [ErrorCode.INVALID_CREDENTIALS]: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
    [ErrorCode.UNAUTHORIZED]: 'Faça login para continuar.',
    [ErrorCode.TOKEN_EXPIRED]: 'Sua sessão expirou. Redirecionando para o login...',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Muitas tentativas de login. Aguarde 15 minutos antes de tentar novamente.',
  },
  
  // Contas a pagar
  payables: {
    [ErrorCode.NOT_FOUND]: 'Conta a pagar não encontrada.',
    [ErrorCode.DUPLICATE_RESOURCE]: 'Já existe uma conta com essas informações.',
    [ErrorCode.VALIDATION_ERROR]: 'Verifique os dados da conta a pagar.',
    [ErrorCode.INVALID_AMOUNT]: 'O valor da conta deve ser maior que zero.',
    [ErrorCode.INVALID_DATE]: 'A data de vencimento deve ser válida.',
  },
  
  // Contas a receber
  receivables: {
    [ErrorCode.NOT_FOUND]: 'Conta a receber não encontrada.',
    [ErrorCode.DUPLICATE_RESOURCE]: 'Já existe uma conta a receber com essas informações.',
    [ErrorCode.VALIDATION_ERROR]: 'Verifique os dados da conta a receber.',
    [ErrorCode.INVALID_AMOUNT]: 'O valor da conta deve ser maior que zero.',
    [ErrorCode.INVALID_DATE]: 'A data de vencimento deve ser válida.',
  },
  
  // Fornecedores/Contatos
  contacts: {
    [ErrorCode.NOT_FOUND]: 'Contato não encontrado.',
    [ErrorCode.DUPLICATE_RESOURCE]: 'Já existe um contato com este email ou documento.',
    [ErrorCode.VALIDATION_ERROR]: 'Verifique os dados do contato.',
  },
  
  // Clientes
  customers: {
    [ErrorCode.NOT_FOUND]: 'Cliente não encontrado.',
    [ErrorCode.DUPLICATE_RESOURCE]: 'Já existe um cliente com este email ou documento.',
    [ErrorCode.VALIDATION_ERROR]: 'Verifique os dados do cliente.',
  },
  
  // Categorias
  categories: {
    [ErrorCode.NOT_FOUND]: 'Categoria não encontrada.',
    [ErrorCode.DUPLICATE_RESOURCE]: 'Já existe uma categoria com este nome.',
    [ErrorCode.VALIDATION_ERROR]: 'Verifique o nome da categoria.',
  },
  
  // Bancos
  banks: {
    [ErrorCode.NOT_FOUND]: 'Banco não encontrado.',
    [ErrorCode.DUPLICATE_RESOURCE]: 'Este banco já está cadastrado.',
    [ErrorCode.VALIDATION_ERROR]: 'Verifique os dados bancários.',
  },
  
  // Contas bancárias
  bankAccounts: {
    [ErrorCode.NOT_FOUND]: 'Conta bancária não encontrada.',
    [ErrorCode.DUPLICATE_RESOURCE]: 'Já existe uma conta com este número e agência.',
    [ErrorCode.VALIDATION_ERROR]: 'Verifique os dados da conta bancária.',
  },
  
  // Transações
  transactions: {
    [ErrorCode.NOT_FOUND]: 'Transação não encontrada.',
    [ErrorCode.VALIDATION_ERROR]: 'Verifique os dados da transação.',
    [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Você não pode editar esta transação.',
  },
  
  // Relatórios
  reports: {
    [ErrorCode.VALIDATION_ERROR]: 'Período inválido para o relatório.',
    [ErrorCode.NOT_FOUND]: 'Nenhum dado encontrado para o período selecionado.',
  },
  
  // Sistema
  system: {
    [ErrorCode.QUOTA_EXCEEDED]: 'Limite do seu plano atingido. Considere fazer upgrade.',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'Sistema em manutenção. Voltamos em breve!',
    [ErrorCode.CONFIGURATION_ERROR]: 'Erro de configuração. Entre em contato com o suporte.',
  }
};

/**
 * Mensagens de sucesso para operações
 */
export const SUCCESS_MESSAGES = {
  // CRUD genérico
  created: 'Item criado com sucesso!',
  updated: 'Item atualizado com sucesso!',
  deleted: 'Item excluído com sucesso!',
  
  // Autenticação
  loginSuccess: 'Login realizado com sucesso!',
  logoutSuccess: 'Logout realizado com sucesso!',
  passwordReset: 'Email de redefinição de senha enviado!',
  
  // Contas
  accountPaid: 'Conta marcada como paga!',
  accountReceived: 'Conta marcada como recebida!',
  accountCancelled: 'Conta cancelada com sucesso!',
  
  // Importação/Exportação
  importSuccess: 'Dados importados com sucesso!',
  exportSuccess: 'Dados exportados com sucesso!',
  
  // Configurações
  settingsSaved: 'Configurações salvas com sucesso!',
  profileUpdated: 'Perfil atualizado com sucesso!',
};

/**
 * Dicas e soluções para erros comuns
 */
export const ERROR_TIPS = {
  [ErrorCode.NETWORK_ERROR]: [
    'Verifique sua conexão com a internet',
    'Tente atualizar a página',
    'Se o problema persistir, entre em contato com o suporte'
  ],
  
  [ErrorCode.VALIDATION_ERROR]: [
    'Verifique se todos os campos obrigatórios estão preenchidos',
    'Confirme se os formatos estão corretos (email, telefone, etc.)',
    'Valores monetários devem ser positivos'
  ],
  
  [ErrorCode.UNAUTHORIZED]: [
    'Faça login novamente',
    'Verifique se suas credenciais estão corretas',
    'Se o problema persistir, redefina sua senha'
  ],
  
  [ErrorCode.RATE_LIMIT_EXCEEDED]: [
    'Aguarde alguns minutos antes de tentar novamente',
    'Evite fazer muitas solicitações rapidamente',
    'Se necessário, entre em contato com o suporte'
  ],
  
  [ErrorCode.QUOTA_EXCEEDED]: [
    'Verifique os limites do seu plano atual',
    'Considere fazer upgrade para um plano superior',
    'Remova itens não utilizados para liberar espaço'
  ]
};

/**
 * Função para obter mensagem contextual
 */
export function getErrorMessage(
  code: ErrorCode, 
  context?: string
): string {
  // Tenta obter mensagem contextual primeiro
  if (context && CONTEXTUAL_MESSAGES[context as keyof typeof CONTEXTUAL_MESSAGES]) {
    const contextualMessages = CONTEXTUAL_MESSAGES[context as keyof typeof CONTEXTUAL_MESSAGES];
    const contextualMessage = contextualMessages[code as keyof typeof contextualMessages];
    if (contextualMessage) {
      return contextualMessage;
    }
  }
  
  // Fallback para mensagem padrão
  return ERROR_MESSAGES[code] || 'Erro inesperado. Tente novamente.';
}

/**
 * Função para obter dicas de solução
 */
export function getErrorTips(code: ErrorCode): string[] {
  return ERROR_TIPS[code] || [];
}

/**
 * Função para verificar se o erro deve ser exibido ao usuário
 */
export function shouldShowToUser(code: ErrorCode): boolean {
  // Erros que não devem ser exibidos diretamente ao usuário
  const internalErrors = [
    ErrorCode.INTERNAL_ERROR,
    ErrorCode.CONFIGURATION_ERROR,
    ErrorCode.DATABASE_ERROR,
    ErrorCode.TRANSACTION_ERROR
  ];
  
  return !internalErrors.includes(code);
}

/**
 * Função para obter ícone do erro (para uso em toast/UI)
 */
export function getErrorIcon(code: ErrorCode): string {
  const errorIcons: Partial<Record<ErrorCode, string>> = {
    [ErrorCode.VALIDATION_ERROR]: '⚠️',
    [ErrorCode.UNAUTHORIZED]: '🔒',
    [ErrorCode.FORBIDDEN]: '🚫',
    [ErrorCode.NOT_FOUND]: '🔍',
    [ErrorCode.NETWORK_ERROR]: '🌐',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: '⏰',
    [ErrorCode.QUOTA_EXCEEDED]: '📊',
    [ErrorCode.PAYMENT_ERROR]: '💳',
    [ErrorCode.BANK_ERROR]: '🏦',
  };
  
  return errorIcons[code] || '❌';
}