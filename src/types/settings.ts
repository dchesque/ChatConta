export type ThemeMode = 'light';

export interface NotificationSettings {
  email: boolean;
  in_app: boolean;
  marketing: boolean;
}

export interface Settings {
  id: string;
  user_id: string;
  theme: ThemeMode;
  timezone: string;
  locale: string;
  currency: string;
  date_format: string;
  number_format: string;
  items_per_page: number;
  notifications: NotificationSettings;
  start_page: string;
  extras: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SettingsUpdateData {
  theme?: ThemeMode;
  timezone?: string;
  locale?: string;
  currency?: string;
  date_format?: string;
  number_format?: string;
  items_per_page?: number;
  notifications?: Partial<NotificationSettings>;
  start_page?: string;
  extras?: Record<string, any>;
}

export const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'light',
  timezone: 'America/Sao_Paulo',
  locale: 'pt-BR',
  currency: 'BRL',
  date_format: 'DD/MM/YYYY',
  number_format: 'pt-BR',
  items_per_page: 25,
  notifications: {
    email: false,
    in_app: true,
    marketing: false
  },
  start_page: '/dashboard',
  extras: {}
};

export const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Campo_Grande', label: 'Campo Grande (GMT-4)' },
  { value: 'America/Cuiaba', label: 'Cuiabá (GMT-4)' },
  { value: 'America/Porto_Velho', label: 'Porto Velho (GMT-4)' },
  { value: 'America/Boa_Vista', label: 'Boa Vista (GMT-4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' }
];

export const LOCALE_OPTIONS = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' }
];

export const CURRENCY_OPTIONS = [
  { value: 'BRL', label: 'Real (R$)' },
  { value: 'USD', label: 'Dólar ($)' },
  { value: 'EUR', label: 'Euro (€)' }
];

export const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD' }
];

export const START_PAGE_OPTIONS = [
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/contas-pagar', label: 'Contas a Pagar' },
  { value: '/contas-receber', label: 'Contas a Receber' },
  { value: '/fornecedores', label: 'Fornecedores' },
  { value: '/bancos', label: 'Bancos' }
];