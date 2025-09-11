# 🗄️ Esquema do Banco de Dados

## 📋 Visão Geral

Documentação completa do esquema de banco de dados para migração MockDataService → Supabase.

## 🏗️ Estrutura Geral

### Convenções de Nomenclatura
- **Tabelas**: snake_case em português (`contas_pagar`, `fornecedores`)
- **Colunas**: snake_case em português (`data_vencimento`, `valor_original`)
- **IDs**: `id` como chave primária (SERIAL ou UUID)
- **Timestamps**: `created_at`, `updated_at` (inglês por convenção)
- **Foreign Keys**: `nome_da_tabela_id` (`fornecedor_id`, `categoria_id`)

## 📊 Tabelas Principais

### 1. profiles (Perfis de Usuário)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(20),
  documento VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Função**: Estende dados do usuário autenticado do Supabase Auth.

### 2. fornecedores (Fornecedores/Contatos)
```sql
CREATE TABLE fornecedores (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('pessoa_fisica', 'pessoa_juridica')),
  documento VARCHAR(20),
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco completo...,
  tipo_fornecedor VARCHAR(20) CHECK (tipo_fornecedor IN ('receita', 'despesa')),
  total_compras INTEGER DEFAULT 0,
  valor_total DECIMAL(15,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Função**: Gerencia fornecedores, clientes e contatos em geral.

### 3. categorias (Categorias)
```sql
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')),
  cor VARCHAR(7),
  icone VARCHAR(50),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Função**: Categorização de receitas e despesas.

### 4. bancos (Contas Bancárias)
```sql
CREATE TABLE bancos (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  nome VARCHAR(100) NOT NULL,
  codigo VARCHAR(10),
  agencia VARCHAR(20),
  conta VARCHAR(20),
  tipo_conta VARCHAR(20) CHECK (tipo_conta IN ('conta_corrente', 'poupanca', 'conta_salario')),
  saldo_inicial DECIMAL(15,2) DEFAULT 0,
  saldo_atual DECIMAL(15,2) DEFAULT 0,
  limite DECIMAL(15,2),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Função**: Gerencia contas bancárias e saldos.

### 5. contas_pagar (Contas a Pagar)
```sql
CREATE TABLE contas_pagar (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  fornecedor_id INTEGER REFERENCES fornecedores(id),
  categoria_id UUID REFERENCES categorias(id),
  banco_id INTEGER REFERENCES bancos(id),
  descricao TEXT NOT NULL,
  valor_original DECIMAL(15,2) NOT NULL,
  valor_final DECIMAL(15,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Função**: Controle de contas a pagar e despesas.

### 6. contas_receber (Contas a Receber)
```sql
CREATE TABLE contas_receber (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  cliente_id INTEGER REFERENCES fornecedores(id),
  categoria_id UUID REFERENCES categorias(id),
  banco_id INTEGER REFERENCES bancos(id),
  descricao TEXT NOT NULL,
  valor_original DECIMAL(15,2) NOT NULL,
  valor_final DECIMAL(15,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido', 'vencido', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Função**: Controle de contas a receber e receitas.

## 🔐 Segurança (RLS - Row Level Security)

### Política Geral
Todos os dados são isolados por usuário através do `user_id`.

### Políticas Implementadas
```sql
-- Exemplo para contas_pagar
CREATE POLICY "Users can manage own payables" ON contas_pagar
  FOR ALL USING (auth.uid() = user_id);
```

**Resultado**: Usuários só acessam seus próprios dados.

## 📈 Índices para Performance

### Índices Críticos
```sql
-- Contas a Pagar
CREATE INDEX idx_contas_pagar_user_id ON contas_pagar(user_id);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);

-- Contas a Receber
CREATE INDEX idx_contas_receber_user_id ON contas_receber(user_id);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);

-- Fornecedores
CREATE INDEX idx_fornecedores_documento ON fornecedores(documento);
```

## 🔄 Triggers Automáticos

### Update Timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicado em todas as tabelas
CREATE TRIGGER update_contas_pagar_updated_at 
  BEFORE UPDATE ON contas_pagar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🎯 Tipos de Dados Específicos

### Monetários
- **Tipo**: `DECIMAL(15,2)`
- **Precisão**: 15 dígitos totais, 2 decimais
- **Suporte**: Até R$ 999.999.999.999,99

### Datas
- **data_vencimento**: `DATE` (apenas data)
- **created_at**: `TIMESTAMPTZ` (data/hora com timezone)

### Status
- **Contas a Pagar**: `'pendente' | 'pago' | 'vencido' | 'cancelado'`
- **Contas a Receber**: `'pendente' | 'recebido' | 'vencido' | 'cancelado'`

## 🔗 Relacionamentos

```
profiles (1) ←→ (N) fornecedores
profiles (1) ←→ (N) categorias  
profiles (1) ←→ (N) bancos
profiles (1) ←→ (N) contas_pagar
profiles (1) ←→ (N) contas_receber

fornecedores (1) ←→ (N) contas_pagar
fornecedores (1) ←→ (N) contas_receber

categorias (1) ←→ (N) contas_pagar
categorias (1) ←→ (N) contas_receber

bancos (1) ←→ (N) contas_pagar
bancos (1) ←→ (N) contas_receber
```

## 📦 Constraints Únicos

### Por Usuário
```sql
-- Documento único por usuário
ALTER TABLE fornecedores 
ADD CONSTRAINT unique_fornecedor_documento_user 
UNIQUE (user_id, documento);

-- Nome+tipo único por usuário
ALTER TABLE categorias 
ADD CONSTRAINT unique_categoria_nome_tipo_user 
UNIQUE (user_id, nome, tipo);

-- Nome único por usuário
ALTER TABLE bancos 
ADD CONSTRAINT unique_banco_nome_user 
UNIQUE (user_id, nome);
```

## 🚀 Migration Scripts

### Executar Migrations
```bash
# No Supabase Dashboard
1. Ir em "SQL Editor"
2. Cole o conteúdo de supabase/migrations/001_initial_schema.sql
3. Execute

# Ou via CLI (se configurado)
supabase db push
```

### Verificar Schema
```sql
-- Listar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar políticas RLS
SELECT tablename, policyname, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';
```

## 🔧 Manutenção

### Backup
```sql
-- Supabase faz backup automático
-- Adicional: exportar dados via Dashboard
```

### Monitoring
```sql
-- Verificar uso de índices
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats WHERE schemaname = 'public';

-- Verificar tamanho das tabelas
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**Status**: ✅ Schema documentado e pronto para implementação