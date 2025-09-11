import React from 'react';
import { Home } from 'lucide-react';
import { BreadcrumbItem } from '@/components/layout/PageHeader';

export const createBreadcrumb = (path: string, customItems?: BreadcrumbItem[]): BreadcrumbItem[] => {
  if (customItems) return customItems;
  
  const defaultBreadcrumbs: Record<string, BreadcrumbItem[]> = {
    '/': [
      { label: 'Dashboard', icon: React.createElement(Home, { className: "w-4 h-4" }) }
    ],
    '/dashboard': [
      { label: 'Dashboard', icon: React.createElement(Home, { className: "w-4 h-4" }) }
    ],
    '/contas-pagar': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Contas a Pagar' }
    ],
    '/conta-individual': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Contas a Pagar', href: '/contas-pagar' },
      { label: 'Nova Conta' }
    ],
    '/lancamento-lote': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Contas a Pagar', href: '/contas-pagar' },
      { label: 'Lançamento em Lote' }
    ],
    '/contatos': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Cadastros' },
      { label: 'Contatos' }
    ],
    '/lancamento-recorrente': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Recebimentos' },
      { label: 'Lançamento Recorrente' }
    ],
    '/categorias': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Cadastros' },
      { label: 'Categorias de Despesas' }
    ],
    '/bancos': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Cadastros' },
      { label: 'Bancos' }
    ],
    '/contas-receber': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Contas a Receber' }
    ],
    '/administrador': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Administrador' }
    ],
    '/administrador/usuarios': [
      { label: 'Início', href: '/dashboard' },
      { label: 'Administrador', href: '/administrador' },
      { label: 'Gestão de Usuários' }
    ]
  };
  
  return defaultBreadcrumbs[path] || [
    { label: 'Início', href: '/dashboard', icon: React.createElement(Home, { className: "w-4 h-4" }) },
    { label: 'Página Atual' }
  ];
};