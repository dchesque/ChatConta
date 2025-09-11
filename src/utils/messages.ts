import { toast } from 'sonner';

export const showMessage = {
  saveSuccess: (message = 'Dados salvos com sucesso!') => toast.success(message),
  saveError: (message = 'Erro ao salvar. Tente novamente.') => toast.error(message),
  deleteSuccess: (message = 'Item excluído com sucesso!') => toast.success(message),
  deleteError: (message = 'Erro ao excluir. Verifique se não há dependências.') => toast.error(message),
  deleteConfirm: (onConfirm: () => void, message = 'Tem certeza?') => 
    toast(message, {
      action: {
        label: 'Confirmar',
        onClick: onConfirm
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    }),
  networkError: () => toast.error('Erro de conexão', {
    description: 'Verifique sua internet'
  }),
  validationError: () => toast.warning('Corrija os campos destacados'),
  loading: (message = 'Carregando...') => toast.loading(message),
  processing: (message = 'Processando...') => toast.loading(message),
  
  // Métodos para operações com promise
  promise: <T>(
    promise: Promise<T>, 
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    toast.promise(promise, messages);
    return promise;
  },

  // Método para ações desfazer
  withUndo: (message: string, undoAction: () => void) => 
    toast.success(message, {
      action: {
        label: 'Desfazer',
        onClick: undoAction
      }
    }),

  dismiss: () => toast.dismiss(),
  dismissAll: () => toast.dismiss()
};