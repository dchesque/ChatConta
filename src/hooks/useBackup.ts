import { useState } from 'react';
import { backupService } from '@/services/backupService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';
import {
  BackupFile,
  ValidationReport,
  ImportOptions,
  ImportResult
} from '@/types/backup';

export const useBackup = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { handleError } = useErrorHandler();

  const exportBackup = async () => {
    setIsExporting(true);
    
    try {
      const exportPromise = backupService.exportAll();
      
      toast.promise(exportPromise, {
        loading: 'Gerando backup...',
        success: 'Backup criado com sucesso!',
        error: 'Erro ao gerar backup'
      });

      const blob = await exportPromise;
      
      // Download do arquivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = backupService.generateFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      handleError(error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  const validateFile = async (file: File): Promise<ValidationReport> => {
    try {
      const report = await backupService.validateBackup(file);
      setValidationReport(report);
      return report;
    } catch (error) {
      handleError(error);
      const errorReport: ValidationReport = {
        valid: false,
        issues: [{
          level: 'error',
          type: 'schema',
          message: 'Erro ao validar arquivo'
        }],
        metadata: {} as any,
        preview: {
          totalRecords: 0,
          recordCounts: {},
          sampleData: {}
        }
      };
      setValidationReport(errorReport);
      return errorReport;
    }
  };

  const importBackup = async (backup: BackupFile, options: ImportOptions): Promise<ImportResult> => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const importPromise = backupService.importFromBackup(backup, options);
      
      if (!options.dryRun) {
        toast.promise(importPromise, {
          loading: 'Importando dados...',
          success: 'Dados importados com sucesso!',
          error: 'Erro ao importar dados'
        });
      }

      const result = await importPromise;
      setImportResult(result);
      return result;
    } catch (error) {
      handleError(error);
      const errorResult: ImportResult = {
        success: false,
        summary: {
          created: {},
          updated: {},
          deleted: {},
          errors: {}
        },
        duration: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
      setImportResult(errorResult);
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setValidationReport(null);
    setImportResult(null);
  };

  return {
    // Estados
    isExporting,
    isImporting,
    validationReport,
    importResult,

    // Ações
    exportBackup,
    validateFile,
    importBackup,
    resetState
  };
};