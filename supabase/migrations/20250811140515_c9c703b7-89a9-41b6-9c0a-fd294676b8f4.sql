-- Atualizar enum de tema para remover dark theme
DROP TYPE IF EXISTS theme_type CASCADE;
CREATE TYPE theme_type AS ENUM ('light');

-- Atualizar configurações existentes que estão em dark/system para light
UPDATE settings SET theme = 'light' WHERE theme IN ('dark', 'system');