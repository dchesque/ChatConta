import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileService } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useBuscaCEP } from '@/hooks/useBuscaCEP';

export interface DadosPerfil {
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  avatar_url?: string;
  bio?: string;
}

interface SecurityConfig {
  two_factor_enabled: boolean;
  login_notifications: boolean;
  session_timeout: number;
  backup_codes_generated: boolean;
}

export function useProfileData() {
  const { user, profile, loading: authLoading } = useAuth();
  const { buscarCEP, carregando: carregandoCEP } = useBuscaCEP();
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [dadosPerfil, setDadosPerfil] = useState<DadosPerfil>({
    nome: '',
    email: '',
    telefone: '',
    whatsapp: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    avatar_url: '',
    bio: ''
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    two_factor_enabled: false,
    login_notifications: true,
    session_timeout: 30,
    backup_codes_generated: false
  });

  // Carregar dados do perfil ao montar o componente
  useEffect(() => {
    if (user?.id && !authLoading) {
      carregarDadosPerfil();
    }
  }, [user?.id, authLoading]);

  // Carregar dados do perfil
  const carregarDadosPerfil = async () => {
    if (!user?.id) {
      return;
    }

    setCarregando(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const dadosCarregados: DadosPerfil = {
        nome: data?.name || '',
        email: user.email || '',
        telefone: data?.phone || '',
        whatsapp: data?.whatsapp || '',
        cep: data?.cep || '',
        endereco: data?.endereco || '',
        cidade: data?.cidade || '',
        estado: data?.estado || '',
        bio: data?.bio || '',
        avatar_url: data?.avatar_url || ''
      };

      // Carregar configurações de segurança
      const securityConfigRaw = data?.security_config;
      if (securityConfigRaw) {
        setSecurityConfig({
          two_factor_enabled: securityConfigRaw.two_factor_enabled || false,
          login_notifications: securityConfigRaw.login_notifications !== false,
          session_timeout: securityConfigRaw.session_timeout || 30,
          backup_codes_generated: securityConfigRaw.backup_codes_generated || false
        });
      }

      setDadosPerfil(dadosCarregados);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do perfil',
        variant: 'destructive'
      });
    } finally {
      setCarregando(false);
    }
  };

  // Função para buscar endereço pelo CEP
  const buscarEnderecoPorCEP = async (cep: string) => {
    if (cep.replace(/\D/g, '').length === 8) {
      const endereco = await buscarCEP(cep);
      if (endereco) {
        toast({
          title: 'Endereço encontrado',
          description: 'Dados preenchidos automaticamente'
        });
        
        return endereco;
      } else {
        return null;
      }
    }
    
    return null;
  };

  // Função para upload de avatar
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    setUploadingAvatar(true);
    try {
      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Apenas imagens são permitidas',
          variant: 'destructive'
        });
        return null;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast({
          title: 'Erro',
          description: 'Imagem muito grande. Máximo 2MB',
          variant: 'destructive'
        });
        return null;
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar perfil via RPC
      const { error: updateError } = await supabase.rpc('update_user_profile', {
        p_avatar_url: publicUrl
      });

      if (!updateError) {
        setDadosPerfil(prev => ({ ...prev, avatar_url: publicUrl }));
        toast({
          title: 'Sucesso',
          description: 'Foto de perfil atualizada!'
        });
        return publicUrl;
      }

      return null;
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload da imagem',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Função para salvar dados do perfil
  const salvarPerfil = async (dados: Partial<DadosPerfil>) => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return false;
    }

    setSalvando(true);
    
    try {
      // Usar a função RPC correta
      const { data, error } = await supabase.rpc('update_user_profile', {
        p_name: dados.nome || null,
        p_phone: dados.telefone || null,
        p_bio: dados.bio || null,
        p_avatar_url: dados.avatar_url || null,
        p_endereco: dados.endereco || null,
        p_cidade: dados.cidade || null,
        p_estado: dados.estado || null,
        p_cep: dados.cep || null,
        p_whatsapp: dados.whatsapp || null
      });

      if (error) {
        throw error;
      }

      // Recarregar dados do Supabase para garantir sincronização
      await carregarDadosPerfil();
      
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!'
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar alterações: ' + error.message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setSalvando(false);
    }
  };

  // Função para salvar configurações de segurança
  const salvarConfiguracaoSeguranca = async (config: Partial<SecurityConfig>) => {
    if (!user) return false;

    setSalvando(true);
    try {
      const newConfig = { ...securityConfig, ...config };

      const { error } = await supabase.rpc('update_security_config', {
        p_config: newConfig
      });

      if (error) {
        throw error;
      }

      setSecurityConfig(newConfig);

      toast({
        title: 'Sucesso',
        description: 'Configurações de segurança atualizadas!'
      });

      return true;
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSalvando(false);
    }
  };

  // Função para alterar senha
  const alterarSenha = async (senhaAtual: string, novaSenha: string) => {
    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso!'
      });

      return true;
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar senha. Verifique a senha atual.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSalvando(false);
    }
  };

  return {
    // Estados
    dadosPerfil,
    setDadosPerfil,
    securityConfig,
    setSecurityConfig,
    carregando: carregando || authLoading,
    salvando,
    uploadingAvatar,
    carregandoCEP,

    // Funções
    buscarEnderecoPorCEP,
    uploadAvatar,
    salvarPerfil,
    salvarConfiguracaoSeguranca,
    alterarSenha
  };
}