# Testes Manuais - JC Financeiro

## 🎯 Objetivo
Este documento descreve os testes manuais essenciais para garantir o funcionamento correto do sistema JC Financeiro, abrangendo cenários offline, validações e fluxos principais.

## 📋 Checklist Geral

### ✅ Pré-requisitos
- [ ] Navegador atualizado (Chrome, Firefox, Safari, Edge)
- [ ] Conexão com internet (para testes online)
- [ ] Dados de teste preparados (CPF, CNPJ, telefones válidos)

---

## 🔌 Cenários Offline

### Teste 1: Detecção de Status Offline
**Objetivo:** Verificar se o sistema detecta corretamente quando está offline

**Passos:**
1. Acesse o sistema com internet ativa
2. Desative a conexão (Wi-Fi/dados móveis)
3. Tente navegar entre páginas
4. Tente realizar ações (salvar, editar, excluir)

**Resultado Esperado:**
- [ ] Indicador de "Offline" aparece no layout
- [ ] Notificações informam sobre falta de conexão
- [ ] Sistema mantém funcionalidade básica (visualização)
- [ ] Tentativas de sincronização são bloqueadas

### Teste 2: Reconexão Automática
**Objetivo:** Verificar recuperação quando a conexão volta

**Passos:**
1. Com sistema offline, reative a conexão
2. Aguarde alguns segundos
3. Tente realizar ações novamente

**Resultado Esperado:**
- [ ] Indicador muda para "Online"
- [ ] Sistema volta a funcionar normalmente
- [ ] Dados são sincronizados automaticamente

---

## ✅ Validações de Formulários

### Teste 3: Validação de CPF
**Dados de teste:**
- CPF válido: `123.456.789-09`
- CPF inválido: `111.111.111-11`
- CPF incompleto: `123.456`

**Passos:**
1. Acesse qualquer formulário com campo CPF
2. Digite cada CPF de teste
3. Tente submeter o formulário

**Resultado Esperado:**
- [ ] CPF válido: aceito e formatado automaticamente
- [ ] CPF inválido: mensagem de erro clara
- [ ] CPF incompleto: solicitação para completar

### Teste 4: Validação de CNPJ
**Dados de teste:**
- CNPJ válido: `12.345.678/0001-95`
- CNPJ inválido: `00.000.000/0000-00`
- CNPJ incompleto: `12.345`

**Passos:**
1. Acesse formulário de fornecedor
2. Selecione "Pessoa Jurídica"
3. Digite cada CNPJ de teste

**Resultado Esperado:**
- [ ] CNPJ válido: aceito e formatado
- [ ] CNPJ inválido: erro específico
- [ ] Formatação automática durante digitação

### Teste 5: Validação de E-mail
**Dados de teste:**
- E-mail válido: `teste@empresa.com.br`
- E-mail inválido: `email_invalido`
- E-mail sem domínio: `teste@`

**Resultado Esperado:**
- [ ] E-mail válido: aceito
- [ ] E-mails inválidos: mensagens específicas
- [ ] Formatação em lowercase automática

### Teste 6: Validação de Telefone
**Dados de teste:**
- Telefone válido: `(11) 99999-9999`
- Telefone inválido: `123`
- Telefone sem DDD: `99999-9999`

**Resultado Esperado:**
- [ ] Telefone válido: formatado corretamente
- [ ] Telefone inválido: erro claro
- [ ] Máscara aplicada durante digitação

### Teste 7: Validação de Valores Monetários
**Dados de teste:**
- Valor válido: `R$ 1.234,56`
- Valor zero: `R$ 0,00`
- Valor negativo: `-100`
- Texto: `abc`

**Resultado Esperado:**
- [ ] Valor válido: aceito e formatado
- [ ] Valor zero: permitido em casos específicos
- [ ] Valor negativo: bloqueado
- [ ] Texto: convertido ou rejeitado

### Teste 8: Validação de Datas
**Dados de teste:**
- Data válida: `15/12/2024`
- Data passada: `15/12/2020`
- Data futura: `15/12/2030`
- Data inválida: `32/13/2024`

**Resultado Esperado:**
- [ ] Data válida: aceita
- [ ] Regras de negócio aplicadas (ex: vencimento não pode ser passado)
- [ ] Data inválida: erro específico
- [ ] Formatação automática

---

## 🔄 Fluxos Principais

### Teste 9: Fluxo de Login (WhatsApp)
**Passos:**
1. Acesse `/auth`
2. Digite número de WhatsApp válido: `(11) 99999-9999`
3. Clique em "Enviar código"
4. Digite código (qualquer com 4+ dígitos no mock)
5. Confirme

**Resultado Esperado:**
- [ ] Formulário valida formato do WhatsApp
- [ ] Mensagem de sucesso ao enviar código
- [ ] Tela de código aparece
- [ ] Login realizado com código válido
- [ ] Redirecionamento para Dashboard

### Teste 10: Fluxo de Cadastro
**Passos:**
1. Acesse `/auth?mode=signup`
2. Digite nome completo
3. Digite WhatsApp válido
4. Envie código e confirme

**Resultado Esperado:**
- [ ] Nome é obrigatório
- [ ] Processo similar ao login
- [ ] Redirecionamento para onboarding (se novo)

### Teste 11: CRUD de Contas a Pagar
**Passos de Criação:**
1. Acesse "Contas a Pagar"
2. Clique em "Nova Conta"
3. Preencha todos os campos obrigatórios:
   - Fornecedor
   - Valor: `R$ 1.500,00`
   - Data de vencimento (futura)
   - Descrição
4. Salve

**Resultado Esperado:**
- [ ] Validações funcionam
- [ ] Conta criada com sucesso
- [ ] Aparece na listagem
- [ ] Dados salvos corretamente

**Passos de Edição:**
1. Localize a conta criada
2. Clique em "Editar"
3. Altere valor para `R$ 2.000,00`
4. Salve alterações

**Resultado Esperado:**
- [ ] Modal de edição abre
- [ ] Dados carregados corretamente
- [ ] Alterações salvas
- [ ] Listagem atualizada

**Passos de Exclusão:**
1. Localize uma conta
2. Clique em "Excluir"
3. Confirme exclusão

**Resultado Esperado:**
- [ ] Modal de confirmação aparece
- [ ] Conta removida após confirmação
- [ ] Listagem atualizada

### Teste 12: CRUD de Fornecedores
**Passos:**
1. Acesse "Contatos" > "Fornecedores"
2. Crie novo fornecedor:
   - Nome: `Fornecedor Teste`
   - Tipo: Pessoa Física
   - CPF: `123.456.789-09`
   - E-mail: `fornecedor@teste.com`
   - Telefone: `(11) 99999-9999`

**Resultado Esperado:**
- [ ] Validações de CPF funcionam
- [ ] Fornecedor criado
- [ ] Disponível para seleção em contas

### Teste 13: Dashboard e Relatórios
**Passos:**
1. Acesse Dashboard
2. Verifique métricas principais
3. Interaja com gráficos
4. Teste filtros de período

**Resultado Esperado:**
- [ ] Dados carregam corretamente
- [ ] Gráficos são interativos
- [ ] Filtros alteram as informações
- [ ] Responsividade funciona

---

## 🔐 Segurança e Sessão

### Teste 14: Timeout de Sessão
**Passos:**
1. Faça login
2. Aguarde 30 minutos sem atividade
3. Tente realizar uma ação

**Resultado Esperado:**
- [ ] Sistema detecta inatividade
- [ ] Usuário é redirecionado para login
- [ ] Mensagem de timeout é exibida

### Teste 15: Bloqueio por Tentativas
**Passos:**
1. Na tela de login, digite WhatsApp válido
2. Digite código inválido 5 vezes consecutivas
3. Tente novo login

**Resultado Esperado:**
- [ ] Após 5 tentativas, conta é bloqueada temporariamente
- [ ] Mensagem informa sobre bloqueio
- [ ] Contador é persistido entre sessões

---

## 📱 Responsividade

### Teste 16: Mobile/Tablet
**Passos:**
1. Acesse o sistema em dispositivo móvel/tablet
2. Teste navegação via menu hambúrguer
3. Preencha formulários
4. Interaja com tabelas e gráficos

**Resultado Esperado:**
- [ ] Layout se adapta corretamente
- [ ] Menu mobile funciona
- [ ] Formulários são usáveis
- [ ] Tabelas têm scroll horizontal
- [ ] Botões têm tamanho adequado para toque

---

## 🚀 Performance

### Teste 17: Carregamento de Páginas
**Passos:**
1. Limpe cache do navegador
2. Acesse diferentes páginas do sistema
3. Monitore tempo de carregamento

**Resultado Esperado:**
- [ ] Páginas carregam em menos de 3 segundos
- [ ] Lazy loading funciona
- [ ] Skeletons aparecem durante carregamento

---

## 📊 Relatório de Teste

### Template de Execução
```
Data do Teste: ___/___/2024
Testador: ________________
Navegador: _______________
Versão do Sistema: _______

Resultados:
✅ Passou  ❌ Falhou  ⚠️ Parcial

[ ] Teste 1: Detecção Offline
[ ] Teste 2: Reconexão
[ ] Teste 3: Validação CPF
[ ] Teste 4: Validação CNPJ
[ ] Teste 5: Validação E-mail
[ ] Teste 6: Validação Telefone
[ ] Teste 7: Validação Valores
[ ] Teste 8: Validação Datas
[ ] Teste 9: Login WhatsApp
[ ] Teste 10: Cadastro
[ ] Teste 11: CRUD Contas
[ ] Teste 12: CRUD Fornecedores
[ ] Teste 13: Dashboard
[ ] Teste 14: Timeout Sessão
[ ] Teste 15: Bloqueio Tentativas
[ ] Teste 16: Responsividade
[ ] Teste 17: Performance

Observações:
_________________________________
_________________________________
_________________________________
```

### Critérios de Aprovação
- ✅ **Aprovado:** Todos os testes críticos passaram
- ⚠️ **Atenção:** Falhas menores que não afetam usabilidade
- ❌ **Reprovado:** Falhas críticas que impedem uso normal

---

## 🔧 Troubleshooting

### Problemas Comuns
1. **Validações não funcionam:** Verificar console para erros JavaScript
2. **Dados não salvam:** Verificar se modo mock está ativo
3. **Layout quebrado:** Verificar se Tailwind está carregando
4. **Performance lenta:** Verificar ferramentas do desenvolvedor

### Logs para Análise
- Console do navegador (F12)
- Network tab para requisições
- Performance tab para análise de velocidade
- Aplicação tab para localStorage/sessionStorage