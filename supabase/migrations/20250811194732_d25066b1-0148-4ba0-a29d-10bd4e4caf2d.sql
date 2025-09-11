-- Migration: add_performance_indexes.sql
-- Descrição: Adiciona índices estratégicos para otimizar performance das queries principais
-- Data: 2025-01-11
-- NOTA: Usando CREATE INDEX normal (sem CONCURRENTLY) para compatibilidade com transações

-- ========================================
-- EXTENSÕES NECESSÁRIAS
-- ========================================

-- Extensão para busca textual avançada
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ========================================
-- ÍNDICES PARA SOFT DELETE (ALTA PRIORIDADE)
-- ========================================

-- Accounts Payable - Query mais frequente do sistema
CREATE INDEX IF NOT EXISTS idx_accounts_payable_active 
ON accounts_payable(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Accounts Receivable - Similar ao payable
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_active 
ON accounts_receivable(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Contacts - Usado em selects de fornecedores/clientes
CREATE INDEX IF NOT EXISTS idx_contacts_active 
ON contacts(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Suppliers - Para listagem de fornecedores ativos
CREATE INDEX IF NOT EXISTS idx_suppliers_active 
ON suppliers(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Customers - Para listagem de clientes ativos
CREATE INDEX IF NOT EXISTS idx_customers_active 
ON customers(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Banks - Para seleção de bancos ativos
CREATE INDEX IF NOT EXISTS idx_banks_active 
ON banks(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Categories - Para filtro de categorias ativas
CREATE INDEX IF NOT EXISTS idx_categories_active 
ON categories(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- ========================================
-- ÍNDICES PARA DASHBOARD (ALTA PRIORIDADE)
-- ========================================

-- Contas a Pagar - Dashboard principal (status + vencimento)
CREATE INDEX IF NOT EXISTS idx_accounts_payable_dashboard
ON accounts_payable(user_id, status, due_date)
WHERE deleted_at IS NULL;

-- Contas a Pagar - Por vencimento (covering index para amounts)
CREATE INDEX IF NOT EXISTS idx_accounts_payable_due_date
ON accounts_payable(user_id, due_date) 
INCLUDE (amount, final_amount, status)
WHERE deleted_at IS NULL;

-- Contas a Receber - Dashboard
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_dashboard
ON accounts_receivable(user_id, status, due_date)
WHERE deleted_at IS NULL;

-- Transações - Para relatórios mensais
CREATE INDEX IF NOT EXISTS idx_transactions_monthly
ON transactions(user_id, date, type) 
INCLUDE (amount)
WHERE deleted_at IS NULL;

-- ========================================
-- ÍNDICES PARA STATUS E FILTROS (MÉDIA PRIORIDADE)
-- ========================================

-- Contas pendentes e vencidas (query muito comum)
CREATE INDEX IF NOT EXISTS idx_accounts_payable_pending_overdue
ON accounts_payable(user_id, due_date)
WHERE deleted_at IS NULL AND status IN ('pending', 'overdue');

-- Contas pagas por período (para relatórios)
CREATE INDEX IF NOT EXISTS idx_accounts_payable_paid_period
ON accounts_payable(user_id, paid_at)
WHERE deleted_at IS NULL AND status = 'paid' AND paid_at IS NOT NULL;

-- Categories por tipo e sistema (user vs system categories)
CREATE INDEX IF NOT EXISTS idx_categories_user_system
ON categories(user_id, is_system, type)
WHERE deleted_at IS NULL;

-- ========================================
-- ÍNDICES PARA BUSCA TEXTUAL (MÉDIA PRIORIDADE)
-- ========================================

-- Busca em nomes de contatos (trigram para LIKE e ILIKE)
CREATE INDEX IF NOT EXISTS idx_contacts_name_search
ON contacts USING gin(name gin_trgm_ops)
WHERE deleted_at IS NULL;

-- Busca em nomes de fornecedores
CREATE INDEX IF NOT EXISTS idx_suppliers_name_search
ON suppliers USING gin(name gin_trgm_ops)
WHERE deleted_at IS NULL;

-- Busca em descrições de contas a pagar
CREATE INDEX IF NOT EXISTS idx_accounts_payable_description_search
ON accounts_payable USING gin(description gin_trgm_ops)
WHERE deleted_at IS NULL;

-- Busca em nomes de categorias
CREATE INDEX IF NOT EXISTS idx_categories_name_search
ON categories USING gin(name gin_trgm_ops)
WHERE deleted_at IS NULL;

-- ========================================
-- ÍNDICES PARA FOREIGN KEYS E JOINS (BAIXA PRIORIDADE)
-- ========================================

-- Bank Accounts -> Banks (para joins frequentes)
CREATE INDEX IF NOT EXISTS idx_bank_accounts_bank_id
ON bank_accounts(bank_id)
WHERE deleted_at IS NULL;

-- Accounts Payable -> Categories (para relatórios por categoria)
CREATE INDEX IF NOT EXISTS idx_accounts_payable_category
ON accounts_payable(category_id)
WHERE deleted_at IS NULL AND category_id IS NOT NULL;

-- Accounts Payable -> Contacts (para relatórios por fornecedor)
CREATE INDEX IF NOT EXISTS idx_accounts_payable_contact
ON accounts_payable(contact_id)
WHERE deleted_at IS NULL AND contact_id IS NOT NULL;

-- Transactions -> Accounts Payable (para reconciliação)
CREATE INDEX IF NOT EXISTS idx_transactions_accounts_payable
ON transactions(accounts_payable_id)
WHERE deleted_at IS NULL AND accounts_payable_id IS NOT NULL;

-- ========================================
-- ÍNDICES PARA AUDITORIA E LOGS (BAIXA PRIORIDADE)
-- ========================================

-- Audit logs por usuário e data (para compliance)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date
ON audit_logs(user_id, created_at DESC)
WHERE deleted_at IS NULL;

-- Security events por tipo e data
CREATE INDEX IF NOT EXISTS idx_security_events_type_date
ON security_events(event_type, created_at DESC);

-- Notifications por usuário e status
CREATE INDEX IF NOT EXISTS idx_notifications_user_status
ON notifications(user_id, status, created_at DESC)
WHERE deleted_at IS NULL;

-- ========================================
-- ÍNDICES ESPECIALIZADOS PARA RELATÓRIOS
-- ========================================

-- Para queries de fluxo de caixa (valor e data)
CREATE INDEX IF NOT EXISTS idx_transactions_cashflow
ON transactions(user_id, date, type, amount)
WHERE deleted_at IS NULL;

-- Para contatos por tipo (fornecedor, cliente, etc)
CREATE INDEX IF NOT EXISTS idx_contacts_type_active
ON contacts(user_id, type, active)
WHERE deleted_at IS NULL;

-- Para perfis de usuário (admin queries)
CREATE INDEX IF NOT EXISTS idx_profiles_role_plan
ON profiles(role, plan, ativo);

-- Para settings por usuário
CREATE INDEX IF NOT EXISTS idx_settings_user
ON settings(user_id)
WHERE deleted_at IS NULL;

-- ========================================
-- ATUALIZAR ESTATÍSTICAS
-- ========================================

-- Analisar tabelas principais para atualizar estatísticas do query planner
ANALYZE accounts_payable;
ANALYZE accounts_receivable;
ANALYZE contacts;
ANALYZE suppliers;
ANALYZE customers;
ANALYZE categories;
ANALYZE banks;
ANALYZE bank_accounts;
ANALYZE transactions;
ANALYZE audit_logs;
ANALYZE security_events;
ANALYZE notifications;
ANALYZE profiles;
ANALYZE settings;