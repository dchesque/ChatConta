import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useErrorHandler } from './useErrorHandler';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export interface UseContactsReturn {
  contacts: Contact[];
  suppliers: Contact[];
  customers: Contact[];
  loading: boolean;
  error: string | null;
  createContact: (contact: Omit<ContactInsert, 'user_id'>) => Promise<Contact>;
  updateContact: (id: string, contact: ContactUpdate) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<void>;
  findByDocument: (document: string) => Contact | null;
  reload: () => Promise<void>;
}

export function useContacts(): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  // Separar contatos por tipo
  const suppliers = contacts.filter(contact => contact.type === 'supplier');
  const customers = contacts.filter(contact => contact.type === 'customer');

  const loadContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('name');
      
      if (error) throw error;
      
      setContacts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      handleError(err, 'Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contactData: Omit<ContactInsert, 'user_id'>): Promise<Contact> => {
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...contactData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    setContacts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  const updateContact = async (id: string, contactData: ContactUpdate): Promise<Contact | null> => {
    const { data, error } = await supabase
      .from('contacts')
      .update(contactData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setContacts(prev => 
        prev.map(contact => contact.id === id ? data : contact)
           .sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    return data;
  };

  const deleteContact = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      setLoading(true);
      
      // Usar a função SQL segura criada no Supabase
      const { error } = await supabase
        .rpc('soft_delete_contact', { 
          contact_id: id 
        });
      
      if (error) {
        console.error('Erro ao excluir contato:', error);
        
        // Fallback para UPDATE direto se a função não existir
        if (error.message.includes('function') || error.code === '42883') {
          console.log('Tentando método alternativo...');
          
          const { error: updateError } = await supabase
            .from('contacts')
            .update({ 
              deleted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id);
          
          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }
      
      // Atualizar estado local
      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      toast({ 
        title: 'Sucesso', 
        description: 'Contato excluído com sucesso!' 
      });
      
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
      
      let errorMessage = 'Erro ao excluir contato';
      if (error instanceof Error) {
        if (error.message.includes('permissão')) {
          errorMessage = 'Você não tem permissão para excluir este contato';
        } else if (error.message.includes('não encontrado')) {
          errorMessage = 'Contato não encontrado';
        }
      }
      
      toast({ 
        title: 'Erro', 
        description: errorMessage,
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const findByDocument = (document: string): Contact | null => {
    return contacts.find(contact => contact.document === document) || null;
  };

  const reload = async () => {
    await loadContacts();
  };

  // Carregar contatos quando o usuário muda
  useEffect(() => {
    if (user) {
      loadContacts();
    } else {
      setContacts([]);
    }
  }, [user]);

  return {
    contacts,
    suppliers,
    customers,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    findByDocument,
    reload
  };
}