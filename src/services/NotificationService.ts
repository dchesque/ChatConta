import { toast } from '@/hooks/use-toast';

// Sistema de notificações padronizado para toda a aplicação
export class NotificationService {
  
  // Notificações de sucesso
  static sucesso(titulo: string, descricao?: string) {
    toast({
      title: titulo,
      description: descricao,
      variant: "default",
      duration: 3000
    });
  }

  // Notificações de erro
  static erro(titulo: string, descricao?: string, erro?: any) {
    console.error('Erro:', titulo, descricao, erro);
    toast({
      title: titulo,
      description: descricao || "Tente novamente ou entre em contato com o suporte",
      variant: "destructive",
      duration: 5000
    });
  }

  // Notificações de aviso
  static aviso(titulo: string, descricao?: string) {
    toast({
      title: titulo,
      description: descricao,
      variant: "default",
      duration: 4000
    });
  }

  // Notificações de informação
  static info(titulo: string, descricao?: string) {
    toast({
      title: titulo,
      description: descricao,
      variant: "default",
      duration: 3000
    });
  }

  // Notificações específicas para operações financeiras
  static contaPaga(valor: number, fornecedor: string) {
    this.sucesso(
      "Conta baixada com sucesso!",
      `Pagamento de ${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor)} para ${fornecedor} registrado.`
    );
  }

  static vendaRegistrada(valor: number, cliente: string) {
    this.sucesso(
      "Venda registrada!",
      `Venda de ${new Intl.NumberFormat('pt-BR', {
        style: 'currency', 
        currency: 'BRL'
      }).format(valor)} para ${cliente} foi salva.`
    );
  }

  static chequeEmitido(numero: string, valor: number) {
    this.sucesso(
      "Cheque emitido!",
      `Cheque nº ${numero} no valor de ${new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor)} foi registrado.`
    );
  }

  // Notificações de validação
  static campoObrigatorio(campo: string) {
    this.aviso("Campo obrigatório", `O campo "${campo}" deve ser preenchido.`);
  }

  static valorInvalido(campo: string) {
    this.aviso("Valor inválido", `O valor informado para "${campo}" não é válido.`);
  }

  // Notificações de conexão
  static erroConexao() {
    this.erro(
      "Erro de conexão",
      "Verifique sua conexão com a internet e tente novamente."
    );
  }

  static sincronizando() {
    this.info("Sincronizando dados", "Aguarde enquanto atualizamos as informações...");
  }

  // Notificações de permissão
  static semPermissao(acao: string) {
    this.aviso(
      "Permissão negada",
      `Você não tem permissão para ${acao}. Entre em contato com o administrador.`
    );
  }

  // Notificações de limite/restrição
  static limiteExcedido(limite: string) {
    this.aviso(
      "Limite excedido",
      `O limite de ${limite} foi excedido. Revise os valores informados.`
    );
  }

  // Notificações de backup/segurança
  static backupRealizado() {
    this.sucesso(
      "Backup realizado",
      "Seus dados foram salvos com segurança."
    );
  }

  static dadosAtualizados() {
    this.info("Dados atualizados", "As informações foram sincronizadas com sucesso.");
  }
}