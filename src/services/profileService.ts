import { supabase } from '@/integrations/supabase/client';
import { logService } from './logService';

export interface UserProfile {
  id: string;
  user_id: string;
  phone: string;
  name?: string;
  role: 'user' | 'admin';
  plan: string;
  subscription_status: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  features_limit: Record<string, any>;
  created_at: string;
  updated_at: string;
  ativo: boolean;
  phone_verified?: boolean;
  last_login?: string;
  onboarding_completed?: boolean;
}

export class ProfileService {
  
  /**
   * Busca o perfil do usuário atual
   */
  static async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logService.logError(error, 'ProfileService.getCurrentProfile');
        return null;
      }

      return profile;
    } catch (error) {
      logService.logError(error, 'ProfileService.getCurrentProfile');
      return null;
    }
  }

  /**
   * Cria ou atualiza o perfil do usuário usando a função RPC
   */
  static async upsertProfile(
    userId: string, 
    phone: string, 
    name?: string, 
    email?: string
  ): Promise<UserProfile | null> {
    try {
      // Usar a função RPC do Supabase para fazer upsert seguro
      const { data: profile, error } = await supabase
        .rpc('upsert_profile', {
          p_user_id: userId,
          p_phone: phone,
          p_name: name || null,
          p_email: email || null
        });

      if (error) {
        logService.logError(error, 'ProfileService.upsertProfile');
        return null;
      }

      // Atualizar last_login
      await this.updateLastLogin(userId);

      return profile;
    } catch (error) {
      logService.logError(error, 'ProfileService.upsertProfile');
      return null;
    }
  }

  /**
   * Atualiza o perfil do usuário
   */
  static async updateProfile(
    userId: string, 
    updates: Partial<Pick<UserProfile, 'name' | 'phone' | 'onboarding_completed'>>
  ): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logService.logError(error, 'ProfileService.updateProfile');
        return null;
      }

      return profile;
    } catch (error) {
      logService.logError(error, 'ProfileService.updateProfile');
      return null;
    }
  }

  /**
   * Atualiza o último login do usuário
   */
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      logService.logError(error, 'ProfileService.updateLastLogin');
    }
  }

  /**
   * Marca o onboarding como concluído
   */
  static async completeOnboarding(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', userId);

      if (error) {
        logService.logError(error, 'ProfileService.completeOnboarding');
        return false;
      }

      return true;
    } catch (error) {
      logService.logError(error, 'ProfileService.completeOnboarding');
      return false;
    }
  }

  /**
   * Verifica se o usuário é admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      return profile?.role === 'admin';
    } catch (error) {
      logService.logError(error, 'ProfileService.isAdmin');
      return false;
    }
  }

  /**
   * Busca todos os perfis (apenas para admins)
   */
  static async getAllProfiles(): Promise<UserProfile[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logService.logError(error, 'ProfileService.getAllProfiles');
        return [];
      }

      return profiles || [];
    } catch (error) {
      logService.logError(error, 'ProfileService.getAllProfiles');
      return [];
    }
  }
}