import { useState, useEffect } from 'react';
import { suppliersService } from '@/services/suppliersService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logService } from '@/services/logService';
import { auditService } from '@/services/auditService';
import { toast } from 'sonner';
import type { Supplier, CreateSupplier, UpdateSupplier, SupplierFilters, SupplierStats } from '@/types/supplier';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const loadSuppliers = async (filters?: SupplierFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await suppliersService.list(filters);
      setSuppliers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      handleError(err, 'Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (supplierData: CreateSupplier): Promise<Supplier | null> => {
    try {
      const newSupplier = await suppliersService.create(supplierData);
      setSuppliers(prev => [...prev, newSupplier].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Log e auditoria
      logService.logInfo('Supplier created', { supplierId: newSupplier.id, name: newSupplier.name }, 'suppliers');
      
      toast.success('Fornecedor criado com sucesso');
      return newSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar fornecedor';
      toast.error(errorMessage);
      handleError(err, 'Erro ao criar fornecedor');
      return null;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<CreateSupplier>): Promise<Supplier | null> => {
    try {
      const updatedSupplier = await suppliersService.update(id, updates);
      setSuppliers(prev => 
        prev.map(supplier => supplier.id === id ? updatedSupplier : supplier)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      
      // Log e auditoria
      logService.logInfo('Supplier updated', { supplierId: id, updates }, 'suppliers');
      
      toast.success('Fornecedor atualizado com sucesso');
      return updatedSupplier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar fornecedor';
      toast.error(errorMessage);
      handleError(err, 'Erro ao atualizar fornecedor');
      return null;
    }
  };

  const deleteSupplier = async (id: string): Promise<boolean> => {
    try {
      const supplierToDelete = suppliers.find(supplier => supplier.id === id);
      await suppliersService.delete(id);
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
      
      // Log e auditoria
      logService.logInfo('Supplier deleted', { supplierId: id, name: supplierToDelete?.name }, 'suppliers');
      
      toast.success('Fornecedor excluído com sucesso');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir fornecedor';
      toast.error(errorMessage);
      handleError(err, 'Erro ao excluir fornecedor');
      return false;
    }
  };

  const toggleSupplierActive = async (id: string): Promise<boolean> => {
    try {
      const updatedSupplier = await suppliersService.toggleActive(id);
      setSuppliers(prev => 
        prev.map(supplier => supplier.id === id ? updatedSupplier : supplier)
      );
      
      const status = updatedSupplier.active ? 'ativado' : 'desativado';
      toast.success(`Fornecedor ${status} com sucesso`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status do fornecedor';
      toast.error(errorMessage);
      handleError(err, 'Erro ao alterar status do fornecedor');
      return false;
    }
  };

  const getStats = (): SupplierStats => {
    const total = suppliers.length;
    const active = suppliers.filter(supplier => supplier.active).length;
    const inactive = total - active;

    return { total, active, inactive };
  };

  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const refresh = () => {
    loadSuppliers();
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierActive,
    getStats,
    getSupplierById,
    refresh,
  };
}