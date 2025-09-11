import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { showMessage } from '@/utils/messages';
import { useErrorHandler } from './useErrorHandler';
import { toast } from '@/hooks/use-toast';

export interface Pagador {
  id: string;
  nome: string;
  documento?: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica' | 'other';
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  ativo: boolean;
  total_recebimentos: number;
  valor_total: number;
  ultimo_recebimento?: string;
  created_at: string;
  updated_at: string;
}

export interface FiltrosPagador {
  busca?: string;
  tipo?: string;
  ativo?: boolean;
}

export interface CriarPagador {
  nome: string;
  documento?: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica' | 'other';
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface AtualizarPagador extends Partial<CriarPagador> {
  id: string;
}

export interface EstatisticasPagador {
  total: number;
  ativos: number;
  inativos: number;
  totalRecebimentos: number;
  valorTotal: number;
}

// Converter Contact para Pagador
const contactToPagador = (contact: any): Pagador => ({
  id: contact.id,
  nome: contact.name,
  documento: contact.document || '',
  tipo: contact.document_type === 'cpf' ? 'pessoa_fisica' : 'pessoa_juridica',
  email: contact.email || '',
  telefone: contact.phone || '',
  endereco: contact.address || '',
  observacoes: contact.notes || '',
  ativo: contact.active,
  total_recebimentos: contact.metadata?.total_recebimentos || 0,
  valor_total: contact.metadata?.valor_total || 0,
  ultimo_recebimento: contact.metadata?.ultimo_recebimento,
  created_at: contact.created_at,
  updated_at: contact.updated_at
});

// Converter Pagador para Contact (Create)
const pagadorToCreateContact = (pagador: CriarPagador) => ({
  name: pagador.nome,
  document: pagador.documento,
  document_type: pagador.tipo === 'pessoa_fisica' ? 'cpf' : pagador.tipo === 'pessoa_juridica' ? 'cnpj' : 'other',
  type: 'customer', // Sempre customer para pagadores
  email: pagador.email,
  phone: pagador.telefone,
  address: pagador.endereco,
  city: pagador.cidade,
  state: pagador.estado,
  zip: pagador.cep,
  notes: pagador.observacoes,
  active: pagador.ativo ?? true
});

// Converter Pagador para Contact (Update)
const pagadorToUpdateContact = (pagador: Omit<AtualizarPagador, 'id'>) => ({
  name: pagador.nome,
  document: pagador.documento,
  document_type: pagador.tipo === 'pessoa_fisica' ? 'cpf' : pagador.tipo === 'pessoa_juridica' ? 'cnpj' : 'other',
  type: 'customer', // Sempre customer para pagadores
  email: pagador.email,
  phone: pagador.telefone,
  address: pagador.endereco,
  city: pagador.cidade,
  state: pagador.estado,
  zip: pagador.cep,
  notes: pagador.observacoes,
  active: pagador.ativo
});

export function usePagadores() {
  const [pagadores, setPagadores] = useState<Pagador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  const carregarPagadores = async (filtros?: FiltrosPagador) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('contacts')
        .select('*')
        .eq('type', 'customer') // Apenas pagadores (customers)
        .is('deleted_at', null); // Apenas registros não excluídos
      
      if (filtros?.busca) {
        query = query.or(`name.ilike.%${filtros.busca}%,document.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%`);
      }
      
      if (filtros?.tipo && filtros.tipo !== 'todos') {
        // Mapear os tipos para o formato do banco
        if (filtros.tipo === 'pessoa_fisica') {
          query = query.eq('document_type', 'cpf');
        } else if (filtros.tipo === 'pessoa_juridica') {
          query = query.eq('document_type', 'cnpj');
        }
      }
      
      if (filtros?.ativo !== undefined) {
        query = query.eq('active', filtros.ativo);
      }
      
      const { data: contacts, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const pagadoresData = contacts.map(contactToPagador);
      setPagadores(pagadoresData);
    } catch (err) {
      const appError = handleError(err, 'usePagadores.carregarPagadores');
      setError(appError.message);
      showMessage.saveError('Erro ao carregar pagadores');
    } finally {
      setLoading(false);
    }
  };

  const criarPagador = async (dados: CriarPagador): Promise<boolean> => {
    try {
      const contactData = pagadorToCreateContact(dados);
      const { data, error } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();
        
      if (error) throw error;
      
      await carregarPagadores(); // Refresh the list
      showMessage.saveSuccess('Pagador criado com sucesso!');
      return true;
    } catch (err) {
      handleError(err, 'usePagadores.criarPagador');
      showMessage.saveError('Erro ao criar pagador');
      return false;
    }
  };

  const atualizarPagador = async (dados: AtualizarPagador): Promise<boolean> => {
    try {
      const { id, ...updateData } = dados;
      const contactData = pagadorToUpdateContact(updateData);
      const { error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', id);
        
      if (error) throw error;
      
      await carregarPagadores(); // Refresh the list
      showMessage.saveSuccess('Pagador atualizado com sucesso!');
      return true;
    } catch (err) {
      handleError(err, 'usePagadores.atualizarPagador');
      showMessage.saveError('Erro ao atualizar pagador');
      return false;
    }
  };

  const excluirPagador = async (id: string): Promise<boolean> => {
    try {
      // Soft delete - marcar como excluído
      const { error } = await supabase
        .from('contacts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      await carregarPagadores(); // Refresh the list
      showMessage.deleteSuccess('Pagador excluído com sucesso!');
      return true;
    } catch (err) {
      handleError(err, 'usePagadores.excluirPagador');
      showMessage.deleteError('Erro ao excluir pagador');
      return false;
    }
  };

  const obterEstatisticas = (): EstatisticasPagador => {
    const ativos = pagadores.filter(p => p.ativo);
    const inativos = pagadores.filter(p => !p.ativo);
    
    return {
      total: pagadores.length,
      ativos: ativos.length,
      inativos: inativos.length,
      totalRecebimentos: pagadores.reduce((acc, p) => acc + p.total_recebimentos, 0),
      valorTotal: pagadores.reduce((acc, p) => acc + p.valor_total, 0)
    };
  };

  useEffect(() => {
    if (user) {
      carregarPagadores();
    } else {
      setPagadores([]);
    }
  }, [user]);

  return {
    pagadores,
    loading,
    error,
    carregarPagadores,
    criarPagador,
    atualizarPagador,
    excluirPagador,
    obterEstatisticas
  };
}