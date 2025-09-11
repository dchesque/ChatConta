import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/userProfile';
import { logService } from '@/services/logService';
import { rateLimiter } from '@/services/security/rateLimiter';
import { toast } from 'sonner';
import { generateSecurePassword } from '@/utils/cryptoUtils';
import { SECURITY_CONFIG } from '@/config/security.config';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);

  // Timeout de sessão por inatividade (minutos vindos da config)
  const SESSION_TIMEOUT_MINUTES = SECURITY_CONFIG.auth.sessionTimeoutMinutes || 60;
  const sessionTimeoutRef = useRef<number | null>(null);

  // Calcular se está bloqueado (forçar boolean)
  const isLocked = !!lockoutEndTime && lockoutEndTime > Date.now();

  // Função para carregar perfil do usuário
  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔍 [AUTH] Carregando perfil para user ID:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ [AUTH] Erro ao carregar perfil:', error);
        logService.logError(error, 'useSupabaseAuth.loadUserProfile');
        return null;
      }

      console.log('✅ [AUTH] Perfil carregado com sucesso:', { id: data.id, role: data.role, name: data.name });
      return data;
    } catch (error) {
      console.error('💥 [AUTH] Erro crítico ao carregar perfil:', error);
      logService.logError(error, 'useSupabaseAuth.loadUserProfile');
      return null;
    }
  };

  // Função para resetar timeout de sessão
  const resetSessionTimeout = () => {
    // Limpar timer anterior
    if (sessionTimeoutRef.current) {
      window.clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    // Só arma o timer se houver usuário autenticado
    if (!user) return;

    const ms = SESSION_TIMEOUT_MINUTES * 60 * 1000;
    sessionTimeoutRef.current = window.setTimeout(async () => {
      console.warn('Sessão encerrada por inatividade');
      toast.info('Sua sessão foi encerrada por inatividade.');
      try {
        await supabase.auth.signOut();
      } finally {
        // Forçar limpeza de estados locais e redirecionar
        window.location.href = '/auth';
      }
    }, ms);
  };

  // Carregar tentativas de login do localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem('login_attempts');
    const storedLockoutEnd = localStorage.getItem('lockout_end_time');
    
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
    
    if (storedLockoutEnd) {
      const lockoutEnd = parseInt(storedLockoutEnd);
      if (lockoutEnd > Date.now()) {
        setLockoutEndTime(lockoutEnd);
      } else {
        // Lockout expirou, limpar
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('lockout_end_time');
      }
    }
  }, []);

  // Função para incrementar tentativas de login (usar SECURITY_CONFIG)
  const incrementLoginAttempts = () => {
    const maxAttempts = SECURITY_CONFIG.auth.maxLoginAttempts || 5;
    const lockoutMinutes = SECURITY_CONFIG.auth.lockoutDurationMinutes || 15;

    const newAttempts = (loginAttempts || 0) + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('login_attempts', newAttempts.toString());

    if (newAttempts >= maxAttempts) {
      // Bloquear pelo tempo configurado
      const lockoutEnd = Date.now() + lockoutMinutes * 60 * 1000;
      setLockoutEndTime(lockoutEnd);
      localStorage.setItem('lockout_end_time', lockoutEnd.toString());
    }
  };

  // Configurar listeners de autenticação
  useEffect(() => {
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          // Carregar perfil do usuário
          setTimeout(async () => {
            const userProfile = await loadUserProfile(session.user!.id);
            setProfile(userProfile);
            // Armar/Resetar o timeout de sessão ao autenticar ou atualizar sessão
            resetSessionTimeout();
          }, 0);
        } else {
          setProfile(null);
          // Limpar timer se deslogar
          if (sessionTimeoutRef.current) {
            window.clearTimeout(sessionTimeoutRef.current);
            sessionTimeoutRef.current = null;
          }
        }
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        setTimeout(async () => {
          const userProfile = await loadUserProfile(session.user!.id);
          setProfile(userProfile);
          // Armar/Resetar o timeout ao inicializar com sessão válida
          resetSessionTimeout();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Detectar atividade do usuário para resetar timeout
  useEffect(() => {
    const handleActivity = () => {
      resetSessionTimeout();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      // Limpar timer ao desmontar
      if (sessionTimeoutRef.current) {
        window.clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    };
  }, [user]); // resetar quando usuário muda

  // Função para login via WhatsApp/OTP
  const signInWithWhatsApp = async (whatsapp: string) => {
    if (isLocked) {
      const remainingTime = Math.ceil((lockoutEndTime! - Date.now()) / 60000);
      toast.error(`Conta bloqueada. Tente novamente em ${remainingTime} minutos.`);
      return { error: 'Conta bloqueada' };
    }

    try {
      // Limpar e formatar número
      const cleanPhone = whatsapp.replace(/\D/g, '');
      const formattedPhone = `+55${cleanPhone}`;

      // Enviar OTP via Supabase
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'whatsapp'
        }
      });

      if (error) {
        logService.logError(error, 'useSupabaseAuth.signInWithWhatsApp');
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      logService.logError(error, 'useSupabaseAuth.signInWithWhatsApp');
      return { error };
    }
  };

  // Função para cadastro via WhatsApp/OTP
  const signUpWithWhatsApp = async (whatsapp: string, userData?: { nome?: string }) => {
    try {
      // Limpar e formatar número
      const cleanPhone = whatsapp.replace(/\D/g, '');
      const formattedPhone = `+55${cleanPhone}`;

      console.log('🚀 [AUTH] Iniciando cadastro via WhatsApp para:', formattedPhone);

      // Criar conta via Supabase
      const { data, error } = await supabase.auth.signUp({
        phone: formattedPhone,
        password: generateSecurePassword(), // Password aleatório seguro (não usado para OTP)
        options: {
          data: {
            name: userData?.nome || '',
            phone: formattedPhone
          },
          channel: 'whatsapp'
        }
      });

      if (error) {
        console.error('❌ [AUTH] Erro no signup WhatsApp:', error);
        logService.logError(error, 'useSupabaseAuth.signUpWithWhatsApp');
        throw error;
      }

      console.log('✅ [AUTH] Signup WhatsApp realizado. User ID:', data.user?.id);
      console.log('🔄 [AUTH] Trigger automático handle_new_user criará o perfil');

      return { error: null };
    } catch (error: any) {
      console.error('💥 [AUTH] Erro crítico no signup WhatsApp:', error);
      logService.logError(error, 'useSupabaseAuth.signUpWithWhatsApp');
      return { error };
    }
  };

  // Função para login via email/senha
  const signInWithEmail = async (email: string, password: string) => {
    if (isLocked) {
      const remainingTime = Math.ceil((lockoutEndTime! - Date.now()) / 60000);
      toast.error(`Conta bloqueada. Tente novamente em ${remainingTime} minutos.`);
      return { error: 'Conta bloqueada' };
    }

    // Verificar rate limiting antes de tentar login
    if (!rateLimiter.checkLimit('login', email)) {
      const remaining = rateLimiter.getRemainingAttempts('login', email);
      const message = remaining === 0 
        ? 'Muitas tentativas de login. Tente novamente em 15 minutos.'
        : `Limite de tentativas excedido. ${remaining} tentativas restantes.`;
      
      toast.error(message);
      return { error: message };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Registrar tentativa falhada no rate limiter
        rateLimiter.recordAttempt('login', email);
        incrementLoginAttempts();
        logService.logError(error, 'useSupabaseAuth.signInWithEmail');
        throw error;
      }

      // Reset tentativas de login em caso de sucesso
      setLoginAttempts(0);
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('lockout_end_time');
      
      // Resetar limite no rate limiter também
      rateLimiter.resetLimit('login', email);

      return { error: null, user: data.user };
    } catch (error: any) {
      logService.logError(error, 'useSupabaseAuth.signInWithEmail');
      return { error };
    }
  };

  // Função para cadastro via email/senha
  const signUpWithEmail = async (email: string, password: string, phone: string, userData?: { nome?: string }) => {
    // Verificar rate limiting para signup
    if (!rateLimiter.checkLimit('signup', email)) {
      const remaining = rateLimiter.getRemainingAttempts('signup', email);
      const message = remaining === 0 
        ? 'Muitas tentativas de cadastro. Tente novamente em 1 hora.'
        : `Limite de tentativas de cadastro excedido. ${remaining} tentativas restantes.`;
      
      toast.error(message);
      return { error: message };
    }
    console.log('=====================================');
    console.log('INICIANDO SIGNUP');
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    console.log('Phone:', phone);
    console.log('Phone length:', phone?.length);
    console.log('UserData:', userData);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Location origin:', window.location.origin);
    console.log('=====================================');

    try {
      // Verificar conexão com Supabase antes de prosseguir
      console.log('🔍 [AUTH] Verificando conexão com Supabase...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('✅ [AUTH] Conexão Supabase OK, sessão atual:', session ? 'Existe' : 'Nenhuma');
        if (sessionError) {
          console.warn('⚠️ [AUTH] Warning na sessão:', sessionError);
        }
      } catch (connError) {
        console.error('❌ [AUTH] Erro de conexão Supabase:', connError);
      }

      // Montar dados de cadastro
      const signUpData = {
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            name: userData?.nome || '',
            phone: phone,
            email
          }
        }
      };
      
      console.log('📤 [AUTH] Dados enviados para signUp:', JSON.stringify(signUpData, (key, value) => {
        if (key === 'password') return '[HIDDEN]';
        return value;
      }, 2));
      
      console.log('🚀 [AUTH] Chamando supabase.auth.signUp...');
      console.time('supabase.auth.signUp');
      
      const { data, error } = await supabase.auth.signUp(signUpData);
      
      console.timeEnd('supabase.auth.signUp');
      console.log('📥 [AUTH] RESPOSTA COMPLETA DO SUPABASE:');
      console.log('  Data:', data);
      console.log('  Error:', error);
      console.log('  Data.user:', data?.user);
      console.log('  Data.session:', data?.session);

      if (error) {
        // Registrar tentativa falhada no rate limiter
        rateLimiter.recordAttempt('signup', email);
        
        console.error('❌ ❌ ❌ ERRO DETALHADO DO SUPABASE ❌ ❌ ❌');
        console.error('  Message:', error.message);
        console.error('  Status:', error.status);
        console.error('  Code:', error.code);
        console.error('  Name:', error.name);
        console.error('  Stack:', error.stack);
        console.error('  Error typeof:', typeof error);
        console.error('  Error constructor:', error.constructor?.name);
        console.error('  Full error object:', JSON.stringify(error, null, 2));
        
        // Análise específica do erro
        if (error.message) {
          if (error.message.includes('already registered') || error.message.includes('already been registered')) {
            console.log('🔍 [AUTH] Tipo de erro identificado: Email já registrado');
          } else if (error.message.includes('weak_password')) {
            console.log('🔍 [AUTH] Tipo de erro identificado: Senha fraca');
          } else if (error.message.includes('invalid_credentials')) {
            console.log('🔍 [AUTH] Tipo de erro identificado: Credenciais inválidas');
          } else if (error.message.includes('email_not_confirmed')) {
            console.log('🔍 [AUTH] Tipo de erro identificado: Email não confirmado');
          } else if (error.message.includes('signup_disabled')) {
            console.log('🔍 [AUTH] Tipo de erro identificado: Cadastro desabilitado');
          } else {
            console.log('🔍 [AUTH] Tipo de erro: Desconhecido/Genérico');
          }
        }
        
        logService.logError(error, 'useSupabaseAuth.signUpWithEmail');
        throw error;
      }

      console.log('✅ ✅ ✅ SIGNUP BEM-SUCEDIDO ✅ ✅ ✅');
      console.log('  User ID:', data.user?.id);
      console.log('  User email:', data.user?.email);
      console.log('  Email confirmado?:', data.user?.email_confirmed_at ? 'SIM' : 'NÃO');
      console.log('  Session existe?:', data.session ? 'SIM' : 'NÃO');
      console.log('  Precisa confirmar email?:', !data.session ? 'SIM' : 'NÃO');
      console.log('  User metadata:', data.user?.user_metadata);
      console.log('  Created at:', data.user?.created_at);
      
      // REMOVIDO: Chamadas RPC duplicadas
      // O trigger handle_new_user já cria automaticamente o perfil e trial
      console.log('🔄 [AUTH] Trigger automático handle_new_user criará o perfil automaticamente');

      return { 
        error: null, 
        user: data.user,
        needsEmailConfirmation: !data.session // Se não tem session, precisa confirmar email
      };
      
    } catch (error: any) {
      console.error('💥 💥 💥 EXCEÇÃO CAPTURADA NO SIGNUP 💥 💥 💥');
      console.error('  Tipo do erro:', typeof error);
      console.error('  Nome:', error.name);
      console.error('  Mensagem:', error.message);
      console.error('  Stack trace:', error.stack);
      console.error('  Objeto completo:', error);
      console.error('  JSON stringify:', JSON.stringify(error, null, 2));
      
      logService.logError(error, 'useSupabaseAuth.signUpWithEmail.catch');
      return { error };
    } finally {
      console.log('=====================================');
      console.log('FIM DO SIGNUP');
      console.log('Timestamp final:', new Date().toISOString());
      console.log('=====================================');
    }
  };

  // Função para reenviar email de confirmação
  const resendEmailConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) {
        logService.logError(error, 'useSupabaseAuth.resendEmailConfirmation');
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      logService.logError(error, 'useSupabaseAuth.resendEmailConfirmation');
      return { error };
    }
  };

  // Função para verificar código OTP
  const verifyCode = async (whatsapp: string, code: string) => {
    if (isLocked) {
      const remainingTime = Math.ceil((lockoutEndTime! - Date.now()) / 60000);
      toast.error(`Conta bloqueada. Tente novamente em ${remainingTime} minutos.`);
      return { error: 'Conta bloqueada' };
    }

    try {
      // Limpar e formatar número
      const cleanPhone = whatsapp.replace(/\D/g, '');
      const formattedPhone = `+55${cleanPhone}`;

      // Verificar código OTP
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: code,
        type: 'sms'
      });

      if (error) {
        // Incrementar tentativas apenas para códigos inválidos
        if (error.message?.includes('invalid') || error.message?.includes('expired')) {
          incrementLoginAttempts();
        }
        
        logService.logError(error, 'useSupabaseAuth.verifyCode');
        throw error;
      }

      // Reset tentativas de login em caso de sucesso
      setLoginAttempts(0);
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('lockout_end_time');

      // REMOVIDO: Criação manual de perfil e trial
      // O trigger handle_new_user já cria automaticamente o perfil e trial
      // quando um novo usuário é inserido na tabela auth.users
      
      console.log('✅ [AUTH] OTP verificado com sucesso. User ID:', data.user?.id);
      console.log('🔄 [AUTH] Trigger automático handle_new_user criará o perfil se necessário');

      return { error: null, needsOnboarding: false, user: data.user };
    } catch (error: any) {
      logService.logError(error, 'useSupabaseAuth.verifyCode');
      return { error };
    }
  };

  // Função para logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logService.logError(error, 'useSupabaseAuth.signOut');
        throw error;
      }

      // Limpar dados locais
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Redirecionar para página de autenticação
      window.location.href = '/auth';
      
      return { error: null };
    } catch (error: any) {
      logService.logError(error, 'useSupabaseAuth.signOut');
      return { error };
    }
  };

  // Função para resetar senha via email
  const resetPassword = async (email: string) => {
    // Verificar rate limiting para reset de senha
    if (!rateLimiter.checkLimit('password_reset', email)) {
      const remaining = rateLimiter.getRemainingAttempts('password_reset', email);
      const message = remaining === 0 
        ? 'Muitas tentativas de reset de senha. Tente novamente em 30 minutos.'
        : `Limite de tentativas de reset excedido. ${remaining} tentativas restantes.`;
      
      toast.error(message);
      return { error: message };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        // Registrar tentativa no rate limiter
        rateLimiter.recordAttempt('password_reset', email);
        logService.logError(error, 'useSupabaseAuth.resetPassword');
        throw error;
      }

      // Registrar tentativa bem-sucedida (para controlar frequência)
      rateLimiter.recordAttempt('password_reset', email);

      return { error: null };
    } catch (error: any) {
      logService.logError(error, 'useSupabaseAuth.resetPassword');
      return { error };
    }
  };

  // Função para verificar role específico
  const checkRole = (requiredRole: string): boolean => {
    if (!profile || !user) return false;
    return profile.role === requiredRole;
  };

  // Debug removido - problema resolvido

  return {
    // Estados de autenticação
    user,
    session,
    profile,
    loading: loading || (!!user && !profile), // Loading até ter perfil carregado
    isAuthenticated: !!user,
    role: profile?.role || 'user',
    isAdmin: profile?.role === 'admin',

    // Funções de autenticação
    signInWithWhatsApp,
    signUpWithWhatsApp,
    signInWithEmail,
    signUpWithEmail,
    verifyCode,
    signOut,
    resetPassword,
    resendEmailConfirmation,

    // Funções de sessão
    resetSessionTimeout,
    loadUserProfile,

    // Funções de autorização
    checkRole,

    // Estado de bloqueio
    loginAttempts,
    isLocked,
    lockoutEndTime
  };
}
