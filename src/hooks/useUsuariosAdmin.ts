import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { showMessage } from '@/utils/messages';
import { useErrorHandler } from './useErrorHandler';

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
  status_assinatura: 'ativo' | 'inativo' | 'trial' | 'cancelado';
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

export function useUsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const calcularMetricas = (): MetricasUsuarios => {
    const usuariosAtivos = usuarios.filter(u => u.ativo && u.status_assinatura === 'ativo');
    const usuariosInativos = usuarios.filter(u => !u.ativo || u.status_assinatura === 'inativo');
    const assinaturasAtivas = usuarios.filter(u => ['ativo', 'trial'].includes(u.status_assinatura));
    const valorTotal = usuariosAtivos.reduce((total, u) => total + u.valor_mensalidade, 0);
    
    // Calcular novos usuários do mês
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const novosUsuariosMes = usuarios.filter(u => {
      const dataCadastro = new Date(u.data_cadastro);
      return dataCadastro >= inicioMes;
    }).length;

    const cancelamentosMes = usuarios.filter(u => {
      const dataAtualizacao = new Date(u.updated_at);
      return dataAtualizacao >= inicioMes && ['cancelado', 'inativo'].includes(u.status_assinatura);
    }).length;

    return {
      total_usuarios: usuarios.length,
      usuarios_ativos: usuariosAtivos.length,
      usuarios_inativos: usuariosInativos.length,
      total_assinaturas: assinaturasAtivas.length,
      valor_total_mensal: valorTotal,
      novos_usuarios_mes: novosUsuariosMes,
      cancelamentos_mes: cancelamentosMes
    };
  };

  const obterUsuarios = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar dados reais dos usuários
      const [{ data: profiles }, { data: subscriptions }] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('subscriptions').select('*')
      ]);

      if (profiles) {
        // Converter dados do Supabase para interface UsuarioAdmin
        const usuariosAdmin: UsuarioAdmin[] = profiles.map(profile => {
          const subscription = subscriptions?.find(s => s.user_id === profile.user_id);
          
          // Mapear plano baseado nos features_limit
          let plano: 'gratuito' | 'basico' | 'premium' | 'enterprise' = 'gratuito';
          let valorMensalidade = 0;
          
          if (profile.features_limit) {
            const contasPagar = profile.features_limit.contas_pagar;
            if (contasPagar === -1) {
              plano = 'enterprise';
              valorMensalidade = 199.90;
            } else if (contasPagar >= 100) {
              plano = 'premium';
              valorMensalidade = 89.90;
            } else if (contasPagar >= 50) {
              plano = 'basico';
              valorMensalidade = 39.90;
            }
          }

          // Determinar status da assinatura
          let statusAssinatura: 'ativo' | 'inativo' | 'trial' | 'cancelado' = 'inativo';
          if (subscription) {
            if (subscription.status === 'trial') {
              statusAssinatura = 'trial';
            } else if (subscription.status === 'active') {
              statusAssinatura = 'ativo';
            } else if (subscription.status === 'expired') {
              statusAssinatura = 'cancelado';
            }
          }

          return {
            id: profile.user_id,
            email: '', // Não temos acesso ao email através da tabela profiles
            nome: profile.name || 'Usuário sem nome',
            tipo_pessoa: 'pessoa_fisica', // Assumir pessoa física por padrão
            documento: profile.phone || '', // Usar telefone como documento temporário
            telefone: profile.phone,
            data_cadastro: profile.created_at,
            ultimo_acesso: profile.last_login || profile.updated_at,
            status_assinatura: statusAssinatura,
            plano,
            valor_mensalidade: valorMensalidade,
            data_vencimento: subscription?.subscription_ends_at || subscription?.trial_ends_at,
            observacoes: profile.role === 'admin' ? 'Usuário administrador' : '',
            ativo: profile.ativo,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          };
        });

        setUsuarios(usuariosAdmin);
      }
    } catch (err) {
      const appError = handleError(err, 'useUsuariosAdmin.obterUsuarios');
      setError(appError.message);
      showMessage.saveError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const atualizarUsuario = async (usuarioId: string, dadosAtualizados: Partial<UsuarioAdmin>) => {
    try {
      setLoading(true);
      
      // Atualizar na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: dadosAtualizados.nome,
          phone: dadosAtualizados.telefone,
          ativo: dadosAtualizados.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', usuarioId);

      if (profileError) throw profileError;

      // Se estiver atualizando plano/assinatura, atualizar também na tabela subscriptions
      if (dadosAtualizados.status_assinatura) {
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({
            status: dadosAtualizados.status_assinatura === 'ativo' ? 'active' : 
                   dadosAtualizados.status_assinatura === 'trial' ? 'trial' : 'expired',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', usuarioId);

        if (subscriptionError) throw subscriptionError;
      }
      
      // Atualizar estado local
      setUsuarios(prevUsuarios => 
        prevUsuarios.map(usuario => 
          usuario.id === usuarioId 
            ? { 
                ...usuario, 
                ...dadosAtualizados, 
                updated_at: new Date().toISOString() 
              }
            : usuario
        )
      );
      
      showMessage.saveSuccess('Usuário atualizado com sucesso!');
    } catch (err) {
      handleError(err, 'useUsuariosAdmin.atualizarUsuario');
      showMessage.saveError('Erro ao atualizar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const obterUsuarioPorId = (id: string): UsuarioAdmin | undefined => {
    return usuarios.find(usuario => usuario.id === id);
  };

  useEffect(() => {
    if (user) {
      obterUsuarios();
    }
  }, [user]);

  return {
    usuarios,
    loading,
    error,
    metricas: calcularMetricas(),
    obterUsuarios,
    atualizarUsuario,
    obterUsuarioPorId
  };
}