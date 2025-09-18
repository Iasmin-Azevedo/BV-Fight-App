# Configuração do Firebase - BV Fight

## Problemas Corrigidos

### 1. Regras de Segurança do Firestore
- ✅ Adicionada regra para coleção `progresso_faixas`
- ✅ Todas as coleções agora permitem leitura/escrita para usuários autenticados

### 2. Consultas Otimizadas
- ✅ Removidas consultas que requeriam índices compostos complexos
- ✅ Implementada ordenação no cliente para evitar necessidade de índices
- ✅ Consultas de check-ins otimizadas para melhor performance

## Configuração Necessária

### 1. Aplicar Regras do Firestore

Execute o script para ver as regras:
```bash
node scripts/apply-firebase-rules.js
```

Ou aplique manualmente:
1. Acesse: https://console.firebase.google.com/v1/r/project/bv-fight/firestore/rules
2. Cole o conteúdo do arquivo `firebase-rules.txt`
3. Clique em "Publish"

### 2. Índices do Firestore (Opcionais)

Os índices abaixo são opcionais, pois as consultas foram otimizadas para funcionar sem eles:

#### Índice para Check-ins (se necessário):
- **Coleção**: `checkins`
- **Campos**: `alunoId` (Ascending), `data` (Descending)

#### Índice para Técnicas (se necessário):
- **Coleção**: `tecnicas`
- **Campos**: `status` (Ascending), `categoria` (Ascending), `nome` (Ascending)

### 3. Verificação

Após aplicar as regras, os seguintes erros devem ser resolvidos:
- ❌ `Missing or insufficient permissions` → ✅ Resolvido
- ❌ `The query requires an index` → ✅ Resolvido (consultas otimizadas)

## Estrutura das Coleções

```
usuarios/
├── {userId} - Dados dos usuários

checkins/
├── {checkinId} - Registros de presença

progresso_faixas/
├── {alunoId} - Progresso de faixas dos alunos

tecnicas/
├── {tecnicaId} - Técnicas de luta

alunos/
├── {alunoId} - Dados dos alunos

atletas/
├── {atletaId} - Dados dos atletas

treinos/
├── {treinoId} - Dados dos treinos
```

## Teste das Correções

1. Faça login na aplicação
2. Verifique se não há mais erros de permissão no console
3. Teste as funcionalidades de check-in e progresso
4. Verifique se as técnicas são carregadas corretamente
