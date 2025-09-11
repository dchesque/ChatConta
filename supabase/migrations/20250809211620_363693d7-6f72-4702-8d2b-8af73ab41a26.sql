-- Adicionar novos tipos de banco: corretora e cripto
ALTER TYPE bank_type ADD VALUE IF NOT EXISTS 'corretora';
ALTER TYPE bank_type ADD VALUE IF NOT EXISTS 'cripto';