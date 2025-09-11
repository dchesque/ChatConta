import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { CategoriesService } from './categoriesService';
import { SuppliersService } from './suppliersService';
import { banksService } from './banksService';
import { accountsPayableService } from './accountsPayableService';
import { accountsReceivableService } from './accountsReceivableService';
import { transactionsService } from './transactionsService';
import { ProfileService } from './profileService';
import {
  BackupFile,
  BackupData,
  BackupMetadata,
  ValidationReport,
  ValidationIssue,
  ImportOptions,
  ImportResult,
  BACKUP_SCHEMA_VERSION,
  MAX_BACKUP_SIZE_MB,
  DEFAULT_CHUNK_SIZE
} from '@/types/backup';

// Schema de validação com Zod
const backupSchema = z.object({
  app: z.object({
    name: z.string(),
    version: z.string()
  }),
  schema_version: z.string(),
  exported_at: z.string(),
  owner: z.object({
    user_id: z.string().uuid(),
    phone: z.string()
  }),
  counts: z.object({
    profiles: z.number().min(0),
    categories: z.number().min(0),
    suppliers: z.number().min(0),
    banks: z.number().min(0),
    bank_accounts: z.number().min(0),
    accounts_payable: z.number().min(0),
    accounts_receivable: z.number().min(0),
    transactions: z.number().min(0)
  }),
  data: z.object({
    profiles: z.array(z.any()),
    categories: z.array(z.any()),
    suppliers: z.array(z.any()),
    banks: z.array(z.any()),
    bank_accounts: z.array(z.any()),
    accounts_payable: z.array(z.any()),
    accounts_receivable: z.array(z.any()),
    transactions: z.array(z.any())
  }),
  checksum: z.object({
    algo: z.string(),
    value: z.string()
  }),
  meta: z.object({
    generated_by: z.string(),
    notes: z.string().optional()
  })
});

class BackupService {
  private async computeChecksum(data: BackupData, schemaVersion: string): Promise<string> {
    const payload = JSON.stringify({ data, schema_version: schemaVersion });
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async getAllUserData(): Promise<BackupData> {
    // Instanciar services
    const categoriesServiceInstance = new CategoriesService();
    const suppliersServiceInstance = new SuppliersService();

    const [
      profiles,
      categories,
      suppliers,
      banks,
      bankAccounts,
      accountsPayable,
      accountsReceivable,
      transactions
    ] = await Promise.all([
      ProfileService.getCurrentProfile(),
      categoriesServiceInstance.list(),
      suppliersServiceInstance.list(),
      banksService.getBanks(),
      banksService.getBanksWithAccounts().then(banks => 
        banks.flatMap(bank => bank.accounts.map(acc => ({ ...acc, bank_id: bank.id })))
      ),
      accountsPayableService.getAccountsPayable(),
      accountsReceivableService.getAccountsReceivable(),
      transactionsService.getAll()
    ]);

    return {
      profiles: profiles ? [profiles] : [],
      categories,
      suppliers,
      banks,
      bank_accounts: bankAccounts,
      accounts_payable: accountsPayable,
      accounts_receivable: accountsReceivable,
      transactions
    };
  }

  async exportAll(): Promise<Blob> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados
      const data = await this.getAllUserData();
      
      // Contar registros
      const counts = {
        profiles: data.profiles.length,
        categories: data.categories.length,
        suppliers: data.suppliers.length,
        banks: data.banks.length,
        bank_accounts: data.bank_accounts.length,
        accounts_payable: data.accounts_payable.length,
        accounts_receivable: data.accounts_receivable.length,
        transactions: data.transactions.length
      };

      // Calcular checksum
      const checksum = await this.computeChecksum(data, BACKUP_SCHEMA_VERSION);

      // Buscar perfil para telefone
      const profile = await ProfileService.getCurrentProfile();

      // Montar backup
      const backup: BackupFile = {
        app: {
          name: 'JC Financeiro',
          version: '1.0.0'
        },
        schema_version: BACKUP_SCHEMA_VERSION,
        exported_at: new Date().toISOString(),
        owner: {
          user_id: userData.user.id,
          phone: profile?.phone || ''
        },
        counts,
        data,
        checksum: {
          algo: 'sha256',
          value: checksum
        },
        meta: {
          generated_by: 'backupService@web',
          notes: null
        }
      };

      // Log da exportação - criar uma versão simples
      // Backup exported successfully

      // Criar blob
      const jsonString = JSON.stringify(backup, null, 2);
      return new Blob([jsonString], { type: 'application/json' });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw new Error('Erro ao gerar backup');
    }
  }

  async validateBackup(file: File): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];

    try {
      // Verificar tamanho
      if (file.size > MAX_BACKUP_SIZE_MB * 1024 * 1024) {
        issues.push({
          level: 'error',
          type: 'schema',
          message: `Arquivo muito grande (máximo ${MAX_BACKUP_SIZE_MB}MB)`
        });
      }

      // Ler arquivo
      const text = await file.text();
      const json = JSON.parse(text);

      // Validação do schema
      const validationResult = backupSchema.safeParse(json);
      if (!validationResult.success) {
        issues.push({
          level: 'error',
          type: 'schema',
          message: 'Formato do backup inválido',
          details: validationResult.error.issues
        });
        
        return {
          valid: false,
          issues,
          metadata: json as BackupMetadata,
          preview: {
            totalRecords: 0,
            recordCounts: {},
            sampleData: {}
          }
        };
      }

      const backup = validationResult.data as BackupFile;

      // Verificar versão do schema
      if (backup.schema_version !== BACKUP_SCHEMA_VERSION) {
        issues.push({
          level: 'error',
          type: 'schema',
          message: `Versão do schema não suportada: ${backup.schema_version}`
        });
      }

      // Verificar proprietário
      const { data: userData } = await supabase.auth.getUser();
      if (backup.owner.user_id !== userData.user?.id) {
        issues.push({
          level: 'error',
          type: 'permission',
          message: 'Este backup pertence a outro usuário'
        });
      }

      // Verificar contagens
      Object.entries(backup.counts).forEach(([key, expectedCount]) => {
        const actualCount = backup.data[key as keyof BackupData]?.length || 0;
        if (actualCount !== expectedCount) {
          issues.push({
            level: 'error',
            type: 'integrity',
            message: `Contagem incorreta para ${key}: esperado ${expectedCount}, encontrado ${actualCount}`
          });
        }
      });

      // Verificar checksum
      const calculatedChecksum = await this.computeChecksum(backup.data, backup.schema_version);
      if (calculatedChecksum !== backup.checksum.value) {
        issues.push({
          level: 'error',
          type: 'checksum',
          message: 'Checksum inválido - dados podem estar corrompidos'
        });
      }

      // Verificar integridade referencial
      this.validateReferentialIntegrity(backup.data, issues);

      // Preparar preview
      const totalRecords = Object.values(backup.counts).reduce((sum, count) => sum + count, 0);
      const recordCounts = backup.counts;
      const sampleData: Record<string, any[]> = {};

      Object.entries(backup.data).forEach(([key, records]) => {
        sampleData[key] = records.slice(0, 3); // Primeiros 3 registros
      });

      return {
        valid: issues.filter(i => i.level === 'error').length === 0,
        issues,
        metadata: backup,
        preview: {
          totalRecords,
          recordCounts,
          sampleData
        }
      };
    } catch (error) {
      issues.push({
        level: 'error',
        type: 'schema',
        message: `Erro ao ler backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });

      return {
        valid: false,
        issues,
        metadata: {} as BackupMetadata,
        preview: {
          totalRecords: 0,
          recordCounts: {},
          sampleData: {}
        }
      };
    }
  }

  private validateReferentialIntegrity(data: BackupData, issues: ValidationIssue[]) {
    const { banks, categories, suppliers, bank_accounts, accounts_payable, accounts_receivable, transactions } = data;

    // IDs disponíveis
    const bankIds = new Set(banks.map(b => b.id));
    const categoryIds = new Set(categories.map(c => c.id));
    const supplierIds = new Set(suppliers.map(s => s.id));
    const bankAccountIds = new Set(bank_accounts.map(ba => ba.id));
    const accountPayableIds = new Set(accounts_payable.map(ap => ap.id));
    const accountReceivableIds = new Set(accounts_receivable.map(ar => ar.id));

    // Validar bank_accounts
    bank_accounts.forEach((account, index) => {
      if (account.bank_id && !bankIds.has(account.bank_id)) {
        issues.push({
          level: 'error',
          type: 'integrity',
          message: `Conta bancária ${index + 1}: banco_id ${account.bank_id} não encontrado`
        });
      }
    });

    // Validar accounts_payable
    accounts_payable.forEach((account, index) => {
      if (account.category_id && !categoryIds.has(account.category_id)) {
        issues.push({
          level: 'warning',
          type: 'integrity',
          message: `Conta a pagar ${index + 1}: categoria_id ${account.category_id} não encontrada`
        });
      }
      if (account.supplier_id && !supplierIds.has(account.supplier_id)) {
        issues.push({
          level: 'warning',
          type: 'integrity',
          message: `Conta a pagar ${index + 1}: supplier_id ${account.supplier_id} não encontrado`
        });
      }
      if (account.bank_account_id && !bankAccountIds.has(account.bank_account_id)) {
        issues.push({
          level: 'warning',
          type: 'integrity',
          message: `Conta a pagar ${index + 1}: bank_account_id ${account.bank_account_id} não encontrada`
        });
      }
    });

    // Validar accounts_receivable
    accounts_receivable.forEach((account, index) => {
      if (account.category_id && !categoryIds.has(account.category_id)) {
        issues.push({
          level: 'warning',
          type: 'integrity',
          message: `Conta a receber ${index + 1}: categoria_id ${account.category_id} não encontrada`
        });
      }
      if (account.bank_account_id && !bankAccountIds.has(account.bank_account_id)) {
        issues.push({
          level: 'warning',
          type: 'integrity',
          message: `Conta a receber ${index + 1}: bank_account_id ${account.bank_account_id} não encontrada`
        });
      }
    });

    // Validar transactions
    transactions.forEach((transaction, index) => {
      if (transaction.type === 'income' && !transaction.to_account_id) {
        issues.push({
          level: 'error',
          type: 'integrity',
          message: `Transação ${index + 1}: entrada deve ter to_account_id`
        });
      }
      if (transaction.type === 'expense' && !transaction.from_account_id) {
        issues.push({
          level: 'error',
          type: 'integrity',
          message: `Transação ${index + 1}: saída deve ter from_account_id`
        });
      }
      if (transaction.type === 'transfer') {
        if (!transaction.from_account_id || !transaction.to_account_id) {
          issues.push({
            level: 'error',
            type: 'integrity',
            message: `Transação ${index + 1}: transferência deve ter from_account_id e to_account_id`
          });
        } else if (transaction.from_account_id === transaction.to_account_id) {
          issues.push({
            level: 'error',
            type: 'integrity',
            message: `Transação ${index + 1}: transferência não pode ter mesma conta origem/destino`
          });
        }
      }
      
      if (transaction.accounts_payable_id && !accountPayableIds.has(transaction.accounts_payable_id)) {
        issues.push({
          level: 'warning',
          type: 'integrity',
          message: `Transação ${index + 1}: accounts_payable_id ${transaction.accounts_payable_id} não encontrada`
        });
      }
      if (transaction.accounts_receivable_id && !accountReceivableIds.has(transaction.accounts_receivable_id)) {
        issues.push({
          level: 'warning',
          type: 'integrity',
          message: `Transação ${index + 1}: accounts_receivable_id ${transaction.accounts_receivable_id} não encontrada`
        });
      }
    });
  }

  async importFromBackup(backup: BackupFile, options: ImportOptions): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: false,
      summary: {
        created: {},
        updated: {},
        deleted: {},
        errors: {}
      },
      duration: 0,
      errors: []
    };

    try {
      if (options.dryRun) {
        // Apenas simular
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Implementar estratégia de import
      if (options.strategy === 'replace') {
        await this.performReplaceImport(backup.data, result, options.chunkSize || DEFAULT_CHUNK_SIZE);
      } else {
        await this.performMergeImport(backup.data, result, options.chunkSize || DEFAULT_CHUNK_SIZE);
      }

      // Log da importação - criar uma versão simples  
      // Backup imported successfully

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;
      
      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Erro desconhecido');
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  private async performMergeImport(data: BackupData, result: ImportResult, chunkSize: number) {
    // Implementar merge - upsert por ID
    // Ordem: profiles -> categories -> suppliers -> banks -> bank_accounts -> accounts_payable -> accounts_receivable -> transactions
    
    const operations = [
      { key: 'categories', service: new CategoriesService(), method: 'create' },
      { key: 'suppliers', service: new SuppliersService(), method: 'create' },
      { key: 'banks', service: banksService, method: 'createBank' },
      // bank_accounts precisa de tratamento especial pois não tem service direto
      { key: 'accounts_payable', service: accountsPayableService, method: 'createAccountPayable' },
      { key: 'accounts_receivable', service: accountsReceivableService, method: 'createAccountReceivable' },
      { key: 'transactions', service: transactionsService, method: 'create' }
    ];

    for (const op of operations) {
      const records = data[op.key as keyof BackupData] as any[];
      await this.processRecordsInChunks(records, op.service, op.method, op.key, result, chunkSize);
    }
  }

  private async performReplaceImport(data: BackupData, result: ImportResult, chunkSize: number) {
    // Para replace, primeiro deletar dados existentes (implementação simplificada)
    // Em produção, seria necessário deletar em ordem reversa das dependências
    throw new Error('Estratégia Replace não implementada - use Merge');
  }

  private async processRecordsInChunks(
    records: any[], 
    service: any, 
    method: string, 
    key: string, 
    result: ImportResult, 
    chunkSize: number
  ) {
    result.summary.created[key] = 0;
    result.summary.updated[key] = 0;
    result.summary.errors[key] = 0;

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      
      for (const record of chunk) {
        try {
          // Tentar criar (para merge, ignorar duplicados)
          await service[method](record);
          result.summary.created[key]++;
        } catch (error) {
          result.summary.errors[key]++;
          result.errors.push(`Erro ao importar ${key}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
    }
  }

  generateFileName(): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';
    return `backup_jc_financeiro_${timestamp}.json`;
  }
}

export const backupService = new BackupService();