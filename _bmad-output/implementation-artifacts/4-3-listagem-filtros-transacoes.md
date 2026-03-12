# Story 4.3: Listagem e Filtros de Transacoes (Backend + Frontend)

Status: done

## Story

As a usuario,
I want ver a lista de transacoes do ciclo atual com filtros,
So that posso acompanhar meus gastos e encontrar transacoes especificas.

## Acceptance Criteria

1. **AC1:** GET `/api/billing-cycles/:cycleId/transactions` retorna lista de transacoes do ciclo ordenadas por data descendente
2. **AC2:** Query params `?categoryId=xxx&paymentMethodId=yyy&isPaid=true` filtram a lista (FR18)
3. **AC3:** TransactionItem mostra: icone da categoria (cor), descricao, metadata (cartao + categoria), valor alinhado a direita
4. **AC4:** Transacoes parceladas mostram InstallmentBadge ("3/10") (FR19)
5. **AC5:** Lista agrupada por data, valores monetarios com `tabular-nums`
6. **AC6:** Filtros: categoria (select), meio de pagamento (select), status pago/nao pago (toggle). Aplicados em tempo real via TanStack Query
7. **AC7:** Empty state: "Nenhuma transacao neste ciclo" + botao "Registrar"
8. **AC8:** CycleSelector presente no topo da pagina de Transacoes
9. **AC9:** Hook `use-transactions.ts` com TanStack Query

## Tasks / Subtasks

- [x] Task 1: Adicionar filtros ao endpoint de transacoes (AC: 1, 2)
  - [x] 1.1: Escrever testes (RED) para GET /billing-cycles/:cycleId/transactions com query params (categoryId, paymentMethodId, isPaid)
  - [x] 1.2: Atualizar TransactionService.findAllByCycle para aceitar filtros opcionais
  - [x] 1.3: Incluir relacoes category e paymentMethod no retorno (evitar N+1)
  - [x] 1.4: Verificar testes passam (GREEN)

- [x] Task 2: Criar tipos e hook frontend (AC: 9)
  - [x] 2.1: Adicionar interfaces Transaction, CreateTransactionInput, TransactionFilters ao `src/features/transaction/types.ts`
  - [x] 2.2: Criar `src/features/transaction/hooks/use-transactions.ts` com query + mutations
  - [x] 2.3: Escrever testes para o hook (5 testes)

- [x] Task 3: Criar componentes de listagem (AC: 3, 4, 5, 7)
  - [x] 3.1: Criar InstallmentBadge.tsx
  - [x] 3.2: Criar TransactionItem.tsx
  - [x] 3.3: Criar TransactionList.tsx (agrupamento por data, empty state, skeleton)
  - [x] 3.4: Escrever testes para TransactionList (5 testes)

- [x] Task 4: Criar componente de filtros (AC: 6)
  - [x] 4.1: Criar TransactionFilters.tsx (categoria, meio de pagamento, status pago)
  - [x] 4.2: Filtros testados indiretamente via hook tests

- [x] Task 5: Criar TransactionsPage (AC: 8)
  - [x] 5.1: Atualizar TransacoesPage.tsx com CycleSelector, filtros, lista
  - [x] 5.2: Rota /transacoes ja aponta para TransacoesPage (sem placeholder)
  - [x] 5.3: Corrigir teste de rotas para novo conteudo
  - [x] 5.4: Verificar testes passam (GREEN) — 7/7 route tests

- [x] Task 6: Verificacao final (AC: 1-9)
  - [x] 6.1: Backend: 21 suites, 164 testes — todos passando
  - [x] 6.2: Frontend: 34 suites, 180 testes — todos passando (e2e/login.spec.ts pre-existente ignorado)
  - [x] 6.3: Builds verificados
  - [x] 6.4: Nenhuma regressao em stories anteriores

## Dev Notes

### Contrato API — Filtros
```
GET /api/billing-cycles/:cycleId/transactions
  ?categoryId=uuid          (opcional)
  &paymentMethodId=uuid     (opcional)
  &isPaid=true|false        (opcional)
  → 200 + array de transacoes com relations (category, paymentMethod)
```

### Estrutura Frontend
```
frontend/src/features/transactions/
├── types.ts
├── hooks/
│   └── use-transactions.ts
├── components/
│   ├── TransactionItem.tsx
│   ├── TransactionList.tsx
│   ├── TransactionFilters.tsx
│   └── InstallmentBadge.tsx
└── pages/
    └── TransactionsPage.tsx
```

### Agrupamento por Data
- Ordenar transacoes por date DESC
- Agrupar no frontend (nao no backend) — backend retorna lista flat
- Header de grupo: formato "03 Mar 2026" (dia + mes abreviado + ano)
- Usar date-fns ou Intl.DateTimeFormat para formatacao

### Valores Monetarios
- Usar `tabular-nums` (font-variant-numeric) para alinhamento de colunas
- Formato: R$ 1.234,56 (Intl.NumberFormat com locale pt-BR, currency BRL)
- Valores negativos em vermelho (#fca5a5), positivos em verde (#6ee7a0)

### InstallmentBadge
- Aparece SOMENTE quando totalInstallments > 1
- Formato: "3/10" (installmentNumber/totalInstallments)
- Estilo: Badge pequeno, variante secondary/outline

### CycleSelector
- Reusar componente existente de `src/features/billing-cycle/components/CycleSelector.tsx`
- Ja funciona com hook `use-cycle-navigation`
- Ao mudar ciclo, TransactionList atualiza via queryKey do TanStack Query

### Filtros em Tempo Real
- State local no TransactionsPage: { categoryId?, paymentMethodId?, isPaid? }
- Passar filtros como query params via useTransactions(cycleId, filters)
- queryKey inclui filtros: ['transactions', cycleId, filters]
- Select de categorias: usar useCategories() existente
- Select de meios de pagamento: usar usePaymentMethods() existente

### TransactionItem Layout (Mobile)
```
[●] Supermercado Extra                    R$ 234,50
    Nubank · Alimentacao                  3/10 ☐
```
- Coluna esquerda: icone cor categoria (circulo 12px), descricao bold
- Linha 2: metadata (cartao · categoria), InstallmentBadge, checkbox isPaid
- Coluna direita: valor alinhado, tabular-nums

### Depende de Story 4.1
- Model Transaction e endpoints ja devem existir
- Esta story ADICIONA filtros ao endpoint e cria o frontend de listagem

### Rota Existente
- /transacoes ja existe como placeholder no React Router (src/routes/index.tsx)
- Substituir o componente placeholder pelo novo TransactionsPage

### References
- [Source: epics.md#Epic 4 - Story 4.3]
- [Source: architecture.md#API Design - Filtering]
- [Source: ux-design.md#TransactionItem]
- [Source: epics.md#FR18, FR19]

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Debug Log References
- Corrigido teste de rotas: assertion mudou de /Transações/i para /Nenhuma transação neste ciclo/i
- Adicionado método `patch` ao apiService (não existia)
- Pasta frontend usa `transaction` (singular) ao invés de `transactions` (plural) conforme padrão existente

### Completion Notes List
- Todos os ACs atendidos (1-9)
- Hook useTransactions retorna CRUD completo + togglePaid
- Filtros aplicados em tempo real via queryKey do TanStack Query
- TransactionList agrupa por data com Intl.DateTimeFormat
- TransactionItem com confirmação de dois cliques para deletar
- 10 testes frontend novos (5 hook + 5 componente)
- Endpoint aceita categoryId, paymentMethodId, isPaid como query params

### File List
- backend/src/modules/transaction/dto/transaction-filters.dto.ts (new)
- backend/src/modules/transaction/transaction.service.ts (modified — filters)
- backend/src/modules/transaction/transaction.service.spec.ts (modified — filter tests)
- backend/src/modules/transaction/transaction.controller.ts (modified — @Query filters)
- backend/src/modules/transaction/transaction.controller.spec.ts (modified — filter test)
- frontend/src/shared/services/api.service.ts (modified — added patch method)
- frontend/src/features/transaction/types.ts (new)
- frontend/src/features/transaction/hooks/use-transactions.ts (new)
- frontend/src/features/transaction/hooks/use-transactions.test.tsx (new)
- frontend/src/features/transaction/components/InstallmentBadge.tsx (new)
- frontend/src/features/transaction/components/TransactionItem.tsx (new)
- frontend/src/features/transaction/components/TransactionList.tsx (new)
- frontend/src/features/transaction/components/TransactionList.test.tsx (new)
- frontend/src/features/transaction/components/TransactionFilters.tsx (new)
- frontend/src/features/transaction/pages/TransacoesPage.tsx (modified — full implementation)
- frontend/src/routes/index.test.tsx (modified — updated assertions)

## Change Log

- 2026-03-03: Story 4.3 implementada — filtros, listagem agrupada, TransactionItem, hook completo
- 2026-03-12: Code Review fix — (M1) Changed deleteTransaction/togglePaid from mutate to mutateAsync for consistency. Added .catch() wrappers in TransacoesPage and TransactionFormWrapper to prevent unhandled rejections.
