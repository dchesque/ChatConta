import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { dataService } from '@/services/DataServiceFactory';
import { useAuth } from './useAuth';
import { useErrorHandler } from './useErrorHandler';

export function usePlanoContas() {
  const [contas, setContas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const carregarContas = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await dataService.categorias.getAll();
      setContas(data);
    } catch (error) {
      const appError = handleError(error, 'usePlanoContas.carregarContas');
      setError(appError.message);
    } finally {
      setLoading(false);
    }
  };

  const criarConta = async (conta: any): Promise<any> => {
    try {
      const novaConta = await dataService.categorias.create(conta);
      setContas(prev => [...prev, novaConta]);
      toast({ title: 'Sucesso', description: 'Categoria criada com sucesso!' });
      return novaConta;
    } catch (error) {
      handleError(error, 'usePlanoContas.criarConta');
      throw error;
    }
  };

  const atualizarConta = async (id: string, dadosAtualizacao: any): Promise<any> => {
    try {
      const contaAtualizada = await dataService.categorias.update(id, dadosAtualizacao);
      setContas(prev => prev.map(c => c.id === id ? contaAtualizada : c));
      toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso!' });
      return contaAtualizada;
    } catch (error) {
      handleError(error, 'usePlanoContas.atualizarConta');
      throw error;
    }
  };

  const excluirConta = async (id: string): Promise<void> => {
    try {
      await dataService.categorias.delete(id);
      setContas(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso!' });
    } catch (error) {
      handleError(error, 'usePlanoContas.excluirConta');
      throw error;
    }
  };

  const buscarContasPorTipo = (tipo_dre: string): any[] => {
    return contas.filter(c => (c.tipo_dre === tipo_dre || c.type === tipo_dre) && (c.ativo || c.active));
  };

  const buscarContasAnaliticas = async (termo?: string): Promise<any[]> => {
    const contasAnaliticas = contas.filter(c => (c.aceita_lancamento !== false) && (c.ativo !== false));
    if (!termo) return contasAnaliticas;
    
    return contasAnaliticas.filter(c => 
      (c.nome || c.name)?.toLowerCase().includes(termo.toLowerCase()) ||
      (c.codigo || c.code)?.includes(termo)
    );
  };

  useEffect(() => {
    if (user) {
      carregarContas();
    } else {
      setContas([]);
    }
  }, [user]);

  return {
    contas,
    planoContas: contas, // Alias para compatibilidade
    loading,
    error,
    carregarContas,
    listarPlanoContas: carregarContas, // Alias para compatibilidade
    criarConta,
    criarPlanoContas: criarConta, // Alias para compatibilidade
    atualizarConta,
    atualizarPlanoContas: atualizarConta, // Alias para compatibilidade
    excluirConta,
    excluirPlanoContas: excluirConta, // Alias para compatibilidade
    buscarContasPorTipo,
    buscarContasAnaliticas
  };
}