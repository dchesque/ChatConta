import { sanitizeObject } from '@/utils/sanitization';
import { toast } from 'sonner';

interface BackupData {
  version: string;
  timestamp: string;
  userData: {
    contas_pagar: any[];
    contas_receber: any[];
    fornecedores: any[];
    categorias: any[];
    bancos: any[];
  };
  metadata: {
    totalRecords: number;
    exportedBy: string;
    appVersion: string;
  };
}

export class BackupService {
  private static readonly CURRENT_VERSION = '1.0';
  private static readonly SUPPORTED_VERSIONS = ['1.0'];

  static async exportData(userId: string): Promise<void> {
    try {
      // Simular coleta de dados do usuário (em um app real, viria do banco)
      const userData = {
        contas_pagar: JSON.parse(localStorage.getItem('contas_pagar') || '[]'),
        contas_receber: JSON.parse(localStorage.getItem('contas_receber') || '[]'),
        fornecedores: JSON.parse(localStorage.getItem('fornecedores') || '[]'),
        categorias: JSON.parse(localStorage.getItem('categorias') || '[]'),
        bancos: JSON.parse(localStorage.getItem('bancos') || '[]')
      };

      const totalRecords = Object.values(userData).reduce((sum, arr) => sum + arr.length, 0);

      const backupData: BackupData = {
        version: this.CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        userData,
        metadata: {
          totalRecords,
          exportedBy: userId,
          appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
        }
      };

      // Sanitizar dados antes de exportar
      const sanitizedData = sanitizeObject(backupData);

      // Criar arquivo para download
      const blob = new Blob([JSON.stringify(sanitizedData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jc-financeiro-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast.success(`Backup exportado com sucesso! ${totalRecords} registros salvos.`);
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      toast.error('Erro ao exportar backup. Tente novamente.');
    }
  }

  static async importData(file: File): Promise<boolean> {
    try {
      // Validar arquivo
      if (!file.name.endsWith('.json')) {
        toast.error('Arquivo deve ser do tipo JSON (.json)');
        return false;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('Arquivo muito grande. Máximo permitido: 10MB');
        return false;
      }

      // Ler arquivo
      const text = await file.text();
      let backupData: BackupData;

      try {
        backupData = JSON.parse(text);
      } catch {
        toast.error('Arquivo JSON inválido');
        return false;
      }

      // Validar estrutura
      if (!this.validateBackupStructure(backupData)) {
        toast.error('Estrutura do backup inválida');
        return false;
      }

      // Verificar versão
      if (!this.SUPPORTED_VERSIONS.includes(backupData.version)) {
        toast.error(`Versão do backup não suportada: ${backupData.version}`);
        return false;
      }

      // Sanitizar dados importados
      const sanitizedData = sanitizeObject(backupData.userData);

      // Confirmar importação
      const confirmed = window.confirm(
        `Deseja importar ${backupData.metadata.totalRecords} registros?\n\n` +
        `Esta ação substituirá todos os dados atuais.\n` +
        `Backup de: ${new Date(backupData.timestamp).toLocaleString('pt-BR')}`
      );

      if (!confirmed) return false;

      // Fazer backup dos dados atuais
      await this.createAutoBackup();

      // Importar dados
      Object.entries(sanitizedData).forEach(([key, data]) => {
        if (Array.isArray(data)) {
          localStorage.setItem(key, JSON.stringify(data));
        }
      });

      // Atualizar última sincronização
      localStorage.setItem('lastSync', new Date().toLocaleString('pt-BR'));

      toast.success(`Dados importados com sucesso! ${backupData.metadata.totalRecords} registros restaurados.`);
      
      // Recarregar página para atualizar dados
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      return true;
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      toast.error('Erro ao importar backup. Verifique o arquivo e tente novamente.');
      return false;
    }
  }

  private static validateBackupStructure(data: any): data is BackupData {
    if (typeof data !== 'object' || !data) return false;
    
    // Verificar campos obrigatórios
    const requiredFields = ['version', 'timestamp', 'userData', 'metadata'];
    if (!requiredFields.every(field => field in data)) return false;

    // Verificar userData
    if (typeof data.userData !== 'object') return false;
    
    const expectedTables = ['contas_pagar', 'contas_receber', 'fornecedores', 'categorias', 'bancos'];
    if (!expectedTables.every(table => Array.isArray(data.userData[table]))) return false;

    // Verificar metadata
    if (typeof data.metadata !== 'object') return false;
    if (typeof data.metadata.totalRecords !== 'number') return false;

    return true;
  }

  private static async createAutoBackup(): Promise<void> {
    try {
      const userData = {
        contas_pagar: JSON.parse(localStorage.getItem('contas_pagar') || '[]'),
        contas_receber: JSON.parse(localStorage.getItem('contas_receber') || '[]'),
        fornecedores: JSON.parse(localStorage.getItem('fornecedores') || '[]'),
        categorias: JSON.parse(localStorage.getItem('categorias') || '[]'),
        bancos: JSON.parse(localStorage.getItem('bancos') || '[]')
      };

      const autoBackupData: BackupData = {
        version: this.CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        userData,
        metadata: {
          totalRecords: Object.values(userData).reduce((sum, arr) => sum + arr.length, 0),
          exportedBy: 'auto-backup',
          appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
        }
      };

      // Salvar backup automático no localStorage (temporário)
      localStorage.setItem('auto_backup', JSON.stringify(autoBackupData));
      
      // Backup automático criado antes da importação
    } catch (error) {
      // Erro ao criar backup automático
    }
  }

  static getAutoBackup(): BackupData | null {
    try {
      const backup = localStorage.getItem('auto_backup');
      return backup ? JSON.parse(backup) : null;
    } catch {
      return null;
    }
  }

  static clearAutoBackup(): void {
    localStorage.removeItem('auto_backup');
  }
}