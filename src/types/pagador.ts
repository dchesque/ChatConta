export interface Pagador {
  id: number;
  nome: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  documento: string; // CPF ou CNPJ
  email: string;
  telefone: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
  user_id: string;
  created_at: string;
  updated_at?: string;
  category?: {
    id: string;
    name: string;
    color?: string;
    type?: string;
  };
}

export interface CriarPagador {
  nome: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica';
  documento: string;
  email: string;
  telefone: string;
  endereco?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface AtualizarPagador extends Partial<CriarPagador> {
  id: number;
}

export interface FiltrosPagador {
  busca?: string;
  tipo?: 'pessoa_fisica' | 'pessoa_juridica';
  ativo?: boolean;
}

export interface EstatisticasPagador {
  total_pagadores: number;
  pessoas_fisicas: number;
  pessoas_juridicas: number;
  ativos: number;
  inativos: number;
}