# 🔄 Guia de Migração: Mock → Supabase

## 📋 Visão Geral

Este guia documenta o processo de migração da arquitetura de dados MockDataService para Supabase, permitindo alternância fácil entre os dois sistemas.

## 🎯 Configuração Rápida

### Desenvolvimento (Mock Data)
```env
VITE_USE_MOCK_DATA=true
VITE_ENABLE_DB_LOGGING=true
```

### Produção (Supabase)
```env
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_ENABLE_DB_LOGGING=false
```

## 🏗️ Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   UI/Hooks  │ --> │ DataService  │ --> │ MockDataService │
└─────────────┘     │   Factory    │     └─────────────────┘
                    └──────────────┘     ┌─────────────────┐
                            └─────────-> │ SupabaseService │
                                        └─────────────────┘
```

### Componentes da Arquitetura

- **DataServiceFactory**: Gerencia qual serviço usar baseado na configuração
- **IDataService**: Interface unificada que ambos os serviços implementam
- **MockDataServiceAdapter**: Wrapper que adapta o MockDataService existente
- **SupabaseDataService**: Implementação futura para Supabase

## ✅ Checklist de Migração

### Fase 1: Preparação (CONCLUÍDA)
- [x] Criar configuração de ambiente
- [x] Implementar interface IDataService
- [x] Criar DataServiceFactory
- [x] Adaptar MockDataService
- [x] Criar stub SupabaseDataService
- [x] Atualizar todos os hooks
- [x] Criar migrations SQL

### Fase 2: Conexão Supabase (PRÓXIMA)
- [ ] Criar projeto no Supabase
- [ ] Configurar variáveis de ambiente
- [ ] Executar migrations
- [ ] Implementar SupabaseDataService
- [ ] Configurar autenticação
- [ ] Testar conexão

### Fase 3: Migração Gradual
- [ ] Migrar dados existentes
- [ ] Testar cada módulo
- [ ] Validar funcionalidades
- [ ] Monitorar performance
- [ ] Deploy em produção

## 🔧 Como Alternar Entre Mock e Supabase

### Para usar Mock (desenvolvimento):
1. Edite `.env.local`:
   ```env
   VITE_USE_MOCK_DATA=true
   ```
2. Reinicie o servidor de desenvolvimento
3. ✅ Dados salvos no localStorage

### Para usar Supabase (produção):
1. Configure as variáveis no `.env.local`:
   ```env
   VITE_USE_MOCK_DATA=false
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
   ```
2. Reinicie o servidor
3. ✅ Dados salvos no banco Supabase

## 🚨 Rollback de Emergência

Se algo der errado após conectar o Supabase:

1. **Rollback imediato**:
   ```env
   VITE_USE_MOCK_DATA=true
   ```
2. Reinicie o servidor
3. ✅ Sistema volta a funcionar com localStorage

## 🧪 Testando a Migração

### Verificar Mock funcionando:
```bash
# Configurar .env.local
VITE_USE_MOCK_DATA=true

# Testar
npm run dev
# ✅ Fazer login
# ✅ Criar uma conta a pagar
# ✅ Editar a conta
# ✅ Verificar que salvou no localStorage
```

### Verificar estrutura Supabase:
```bash
# Configurar .env.local
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://teste.supabase.co
VITE_SUPABASE_ANON_KEY=teste

# Resultado esperado atual
# ⚠️ Mensagens de "não implementado ainda"
# ✅ Mas estrutura funciona sem erros
```

## 📁 Estrutura de Arquivos

```
src/
├── config/
│   └── database.config.ts        # ✨ Configuração centralizada
├── services/
│   ├── interfaces/
│   │   └── IDataService.ts       # ✨ Interface unificada
│   ├── adapters/
│   │   ├── MockDataServiceAdapter.ts   # ✨ Adapter para Mock
│   │   └── SupabaseDataService.ts      # ✨ Stub Supabase
│   ├── DataServiceFactory.ts     # ✨ Factory pattern
│   └── mockDataService.ts        # ✅ Mantido inalterado
├── hooks/
│   ├── useAuth.ts               # 🔄 Atualizado
│   ├── useContasPagar.ts        # 🔄 Atualizado
│   ├── useDashboard.ts          # 🔄 Atualizado
│   └── ...outros hooks          # 🔄 Todos atualizados
```

## 🔍 Debug e Logging

### Verificar qual serviço está ativo:
```typescript
import { DataServiceFactory } from '@/services/DataServiceFactory';

console.log('Serviço ativo:', DataServiceFactory.getActiveService());
DataServiceFactory.logStatus();
```

### Logs de desenvolvimento:
```env
VITE_ENABLE_DB_LOGGING=true
```

Mostra no console:
- 🔧 Qual serviço foi inicializado
- 🔄 Quando o factory é resetado
- 🔍 Status detalhado da configuração

## ⚠️ Pontos Importantes

### O que NÃO mudou:
- ✅ MockDataService continua funcionando exatamente igual
- ✅ localStorage continua sendo usado em modo Mock
- ✅ Todas as funcionalidades existentes mantidas
- ✅ Interface dos hooks permanece igual
- ✅ Zero breaking changes

### O que mudou:
- 🔄 Hooks agora usam `dataService` ao invés de `MockDataService.getInstance()`
- ✨ Possibilidade de alternar para Supabase
- 🏗️ Arquitetura preparada para migração
- 📁 Estrutura organizada para escalabilidade

## 🎯 Próximos Passos

1. **Conectar Supabase** (aguardando implementação)
2. **Implementar SupabaseDataService**
3. **Migrar dados existentes**
4. **Testes de integração**
5. **Deploy em produção**

## 📞 Suporte

Se encontrar problemas:

1. Verifique as variáveis de ambiente no `.env.local`
2. Confirme que `VITE_USE_MOCK_DATA=true` para desenvolvimento
3. Check console logs para debug
4. Em caso de dúvida, faça rollback para Mock

---

**Status atual**: ✅ Infraestrutura pronta | ⏳ Aguardando conexão Supabase