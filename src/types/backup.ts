export interface BackupMetadata {
  app: {
    name: string;
    version: string;
  };
  schema_version: string;
  exported_at: string;
  owner: {
    user_id: string;
    phone: string;
  };
  counts: {
    profiles: number;
    categories: number;
    suppliers: number;
    banks: number;
    bank_accounts: number;
    accounts_payable: number;
    accounts_receivable: number;
    transactions: number;
  };
  checksum: {
    algo: string;
    value: string;
  };
  meta: {
    generated_by: string;
    notes?: string;
  };
}

export interface BackupData {
  profiles: any[];
  categories: any[];
  suppliers: any[];
  banks: any[];
  bank_accounts: any[];
  accounts_payable: any[];
  accounts_receivable: any[];
  transactions: any[];
}

export interface BackupFile extends BackupMetadata {
  data: BackupData;
}

export interface ValidationIssue {
  level: 'error' | 'warning';
  type: 'schema' | 'checksum' | 'integrity' | 'permission';
  message: string;
  details?: any;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
  metadata: BackupMetadata;
  preview: {
    totalRecords: number;
    recordCounts: Record<string, number>;
    sampleData: Record<string, any[]>;
  };
}

export interface ImportOptions {
  strategy: 'merge' | 'replace';
  dryRun: boolean;
  chunkSize?: number;
}

export interface ImportResult {
  success: boolean;
  summary: {
    created: Record<string, number>;
    updated: Record<string, number>;
    deleted: Record<string, number>;
    errors: Record<string, number>;
  };
  duration: number;
  errors: string[];
}

export const BACKUP_SCHEMA_VERSION = '1.0.0';
export const MAX_BACKUP_SIZE_MB = 10;
export const DEFAULT_CHUNK_SIZE = 200;