export interface UsuarioAdmin {
  id: string;
  email: string;
  nome: string;
  tipo_pessoa: 'pessoa_fisica' | 'pessoa_juridica';
  documento: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_cadastro: string;
  ultimo_acesso?: string;
  status_assinatura: 'ativo' | 'inativo' | 'cancelado' | 'trial';
  plano: 'gratuito' | 'basico' | 'premium' | 'enterprise';
  valor_mensalidade: number;
  data_vencimento?: string;
  empresa?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetricasUsuarios {
  total_usuarios: number;
  usuarios_ativos: number;
  usuarios_inativos: number;
  total_assinaturas: number;
  valor_total_mensal: number;
  novos_usuarios_mes: number;
  cancelamentos_mes: number;
}