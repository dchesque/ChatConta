-- Migration: add_performance_indexes.sql
-- Descrição: Adiciona índices estratégicos para otimizar performance das queries principais
-- Data: 2025-01-11
-- NOTA: Executado sem transação para permitir CREATE INDEX CONCURRENTLY

-- ========================================
-- EXTENSÕES NECESSÁRIAS
-- ========================================

-- Extensão para busca textual avançada
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ========================================
-- ÍNDICES PARA SOFT DELETE (ALTA PRIORIDADE)
-- ========================================

-- Accounts Payable - Query mais frequente do sistema
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_active 
ON accounts_payable(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Accounts Receivable - Similar ao payable
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_receivable_active 
ON accounts_receivable(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Contacts - Usado em selects de fornecedores/clientes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_active 
ON contacts(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Suppliers - Para listagem de fornecedores ativos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_active 
ON suppliers(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Customers - Para listagem de clientes ativos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_active 
ON customers(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Banks - Para seleção de bancos ativos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_banks_active 
ON banks(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- Categories - Para filtro de categorias ativas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_active 
ON categories(user_id, deleted_at) 
WHERE deleted_at IS NULL;

-- ========================================
-- ÍNDICES PARA DASHBOARD (ALTA PRIORIDADE)
-- ========================================

-- Contas a Pagar - Dashboard principal (status + vencimento)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_dashboard
ON accounts_payable(user_id, status, due_date)
WHERE deleted_at IS NULL;

-- Contas a Pagar - Por vencimento (covering index para amounts)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_due_date
ON accounts_payable(user_id, due_date) 
INCLUDE (amount, final_amount, status)
WHERE deleted_at IS NULL;

-- Contas a Receber - Dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_receivable_dashboard
ON accounts_receivable(user_id, status, due_date)
WHERE deleted_at IS NULL;

-- Transações - Para relatórios mensais
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_monthly
ON transactions(user_id, date, type) 
INCLUDE (amount)
WHERE deleted_at IS NULL;

-- ========================================
-- ÍNDICES PARA STATUS E FILTROS (MÉDIA PRIORIDADE)
-- ========================================

-- Contas pendentes e vencidas (query muito comum)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_pending_overdue
ON accounts_payable(user_id, due_date)
WHERE deleted_at IS NULL AND status IN ('pending', 'overdue');

-- Contas pagas por período (para relatórios)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_paid_period
ON accounts_payable(user_id, paid_at)
WHERE deleted_at IS NULL AND status = 'paid' AND paid_at IS NOT NULL;

-- Categories por tipo e sistema (user vs system categories)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_user_system
ON categories(user_id, is_system, type)
WHERE deleted_at IS NULL;

-- ========================================
-- ÍNDICES PARA BUSCA TEXTUAL (MÉDIA PRIORIDADE)
-- ========================================

-- Busca em nomes de contatos (trigram para LIKE e ILIKE)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_name_search
ON contacts USING gin(name gin_trgm_ops)
WHERE deleted_at IS NULL;

-- Busca em nomes de fornecedores
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_name_search
ON suppliers USING gin(name gin_trgm_ops)
WHERE deleted_at IS NULL;

-- Busca em descrições de contas a pagar
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_description_search
ON accounts_payable USING gin(description gin_trgm_ops)
WHERE deleted_at IS NULL;

-- Busca em nomes de categorias
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_name_search
ON categories USING gin(name gin_trgm_ops)
WHERE deleted_at IS NULL;

-- ========================================
-- ÍNDICES PARA FOREIGN KEYS E JOINS (BAIXA PRIORIDADE)
-- ========================================

-- Bank Accounts -> Banks (para joins frequentes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bank_accounts_bank_id
ON bank_accounts(bank_id)
WHERE deleted_at IS NULL;

-- Accounts Payable -> Categories (para relatórios por categoria)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_category
ON accounts_payable(category_id)
WHERE deleted_at IS NULL AND category_id IS NOT NULL;

-- Accounts Payable -> Contacts (para relatórios por fornecedor)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_payable_contact
ON accounts_payable(contact_id)
WHERE deleted_at IS NULL AND contact_id IS NOT NULL;

-- Transactions -> Accounts Payable (para reconciliação)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_accounts_payable
ON transactions(accounts_payable_id)
WHERE deleted_at IS NULL AND accounts_payable_id IS NOT NULL;

-- ========================================
-- ÍNDICES PARA AUDITORIA E LOGS (BAIXA PRIORIDADE)
-- ========================================

-- Audit logs por usuário e data (para compliance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_date
ON audit_logs(user_id, created_at DESC)
WHERE deleted_at IS NULL;

-- Security events por tipo e data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_type_date
ON security_events(event_type, created_at DESC);

-- Notifications por usuário e status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_status
ON notifications(user_id, status, created_at DESC)
WHERE deleted_at IS NULL;

-- ========================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================

COMMENT ON INDEX idx_accounts_payable_active IS 'Otimiza queries de contas ativas por usuário';
COMMENT ON INDEX idx_accounts_payable_dashboard IS 'Otimiza dashboard principal - status e vencimento';
COMMENT ON INDEX idx_contacts_name_search IS 'Busca textual em nomes de contatos usando trigram';
COMMENT ON INDEX idx_accounts_payable_pending_overdue IS 'Queries de contas pendentes e vencidas';
COMMENT ON INDEX idx_transactions_monthly IS 'Relatórios mensais de transações com covering index';