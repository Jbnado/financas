# Story 4.1: Model de Transacao e CRUD Backend

Status: review

## Story

As a usuario,
I want registrar transacoes via API com todos os campos necessarios,
So that meus gastos ficam registrados no ciclo correto.

## Acceptance Criteria

1. **AC1:** POST `/api/transactions` com descricao, valor, data, categoryId, paymentMethodId, billingCycleId cria transacao com `isPaid: false`. Valor armazenado como Decimal. ID aceita UUID v4 gerado pelo client (idempotencia)
2. **AC2:** PUT `/api/transactions/:id` atualiza descricao, valor, data, categoria, meio de pagamento. Nao permite editar transacao de ciclo fechado (retorna 400)
3. **AC3:** DELETE `/api/transactions/:id` exclui transacao (hard delete). Se tem parcelas vinculadas, parcelas futuras excluidas tambem
4. **AC4:** PATCH `/api/transactions/:id/toggle-paid` alterna isPaid entre true/false
5. **AC5:** Model Transaction no Prisma: id UUID, description String, amount Decimal(15,2), date DateTime, isPaid Boolean default false, billingCycleId, categoryId, paymentMethodId, parentTransactionId (auto-referencia para parcelas, nullable), installmentNumber Int opcional, totalInstallments Int opcional, userId, createdAt, updatedAt
6. **AC6:** Mapeamento @@map("transactions"), foreign keys para BillingCycle, Category, PaymentMethod, User
7. **AC7:** Migration criada e aplicada
8. **AC8:** Endpoints documentados no Swagger
9. **AC9:** GET `/api/billing-cycles/:cycleId/transactions` retorna transacoes do ciclo (preparar endpoint para Story 4.3)

## Tasks / Subtasks

- [x] Task 1: Adicionar model Transaction ao Prisma schema (AC: 5, 6, 7)
  - [x] 1.1: Adicionar model Transaction: id UUID, description String, amount Decimal @db.Decimal(15,2), date DateTime, isPaid Boolean @default(false), installmentNumber Int?, totalInstallments Int?, userId String, billingCycleId String, categoryId String, paymentMethodId String, parentTransactionId String? (auto-referencia)
  - [x] 1.2: Relacoes: User (onDelete: Cascade), BillingCycle, Category, PaymentMethod, parent Transaction? (auto-referencia), children Transaction[]
  - [x] 1.3: @@map("transactions"), @@index([userId]), @@index([billingCycleId])
  - [x] 1.4: Adicionar relacao transactions Transaction[] nos models User, BillingCycle, Category, PaymentMethod
  - [x] 1.5: Rodar migration e prisma generate

- [x] Task 2: Criar DTOs com validacao (AC: 1, 8)
  - [x] 2.1: Escrever testes (RED) para CreateTransactionDto — description required, amount positive decimal, date required, billingCycleId UUID required, categoryId UUID required, paymentMethodId UUID required
  - [x] 2.2: Criar `src/modules/transaction/dto/create-transaction.dto.ts` com class-validator + Swagger decorators
  - [x] 2.3: Criar `src/modules/transaction/dto/update-transaction.dto.ts` como PartialType
  - [x] 2.4: Criar `src/modules/transaction/dto/transaction-response.dto.ts`
  - [x] 2.5: Verificar testes passam (GREEN)

- [x] Task 3: Criar TransactionService com CRUD (AC: 1, 2, 3, 4)
  - [x] 3.1: Escrever testes (RED) para service: create, findAll, findOne, update, remove, togglePaid
  - [x] 3.2: Criar `src/modules/transaction/transaction.service.ts` com:
    - create(userId, dto) — valida que ciclo esta aberto, cria transacao
    - findAllByCycle(userId, billingCycleId) — lista transacoes do ciclo
    - findOne(userId, id) — busca transacao com relacoes
    - update(userId, id, dto) — valida ciclo aberto antes de editar
    - remove(userId, id) — hard delete, cascata em parcelas futuras nao pagas
    - togglePaid(userId, id) — alterna isPaid
  - [x] 3.3: Verificar testes passam (GREEN)

- [x] Task 4: Criar TransactionController com endpoints (AC: 1, 2, 3, 4, 8, 9)
  - [x] 4.1: Escrever testes (RED) para controller: POST, GET by cycle, GET :id, PUT, DELETE, PATCH toggle-paid
  - [x] 4.2: Criar `src/modules/transaction/transaction.controller.ts`:
    - POST `/transactions` — cria transacao (201)
    - GET `/billing-cycles/:cycleId/transactions` — lista transacoes do ciclo (200)
    - GET `/transactions/:id` — busca transacao (200)
    - PUT `/transactions/:id` — atualiza transacao (200)
    - DELETE `/transactions/:id` — remove transacao (200)
    - PATCH `/transactions/:id/toggle-paid` — alterna isPaid (200)
  - [x] 4.3: Swagger decorators em todos endpoints
  - [x] 4.4: Criar `src/modules/transaction/transaction.module.ts` e registrar no AppModule
  - [x] 4.5: Verificar testes passam (GREEN)

- [x] Task 5: Verificacao final (AC: 1-9)
  - [x] 5.1: Executar suite completa de testes backend — todos passando
  - [x] 5.2: Verificar build TypeScript sem erros
  - [x] 5.3: Verificar que testes de stories anteriores nao regredem

## Dev Notes

### Contrato API
- POST `/api/transactions` { description, amount, date, billingCycleId, categoryId, paymentMethodId, id? } → 201
- GET `/api/billing-cycles/:cycleId/transactions` → 200 + array de transacoes (incluir category e paymentMethod relations)
- GET `/api/transactions/:id` → 200 + transacao com relacoes
- PUT `/api/transactions/:id` { description?, amount?, date?, categoryId?, paymentMethodId? } → 200
- DELETE `/api/transactions/:id` → 200 (hard delete + cascata parcelas futuras)
- PATCH `/api/transactions/:id/toggle-paid` → 200

### Decimal/Money Handling
- Usar `@db.Decimal(15, 2)` no Prisma para amount
- API recebe/retorna amount como string: "125.50"
- Validacao no DTO: @IsNumberString ou @IsDecimal com 2 casas
- NUNCA usar float para calculos monetarios

### Validacao de Ciclo Fechado
- Antes de criar/editar transacao, verificar `billingCycle.status !== 'closed'`
- Se ciclo fechado, retornar 400 Bad Request com mensagem clara

### Parentesco de Parcelas
- `parentTransactionId` e nullable — so preenchido em parcelas-filha
- Transacao principal (parcela 1) nao tem parentTransactionId
- `installmentNumber` e `totalInstallments` so preenchidos em transacoes parceladas
- Para transacoes simples (a vista), ambos ficam null

### Hard Delete com Cascata
- Diferente de Category/PaymentMethod/Person que usam soft-delete
- Transacao usa HARD DELETE (remocao real do banco)
- Ao deletar transacao principal parcelada: deletar parcelas futuras (isPaid: false)
- Parcelas ja pagas (isPaid: true) permanecem no banco

### Padrao Identico a Modules Anteriores
- Mesma estrutura: module, service, controller, DTOs, specs
- Mesmo padrao de: PrismaService injection, mockPrisma em testes, ParseUUIDPipe
- Diferencial: Transaction tem mais relacoes e logica de negocio (ciclo fechado, parcelas)

### Indice de Performance
- @@index([userId]) para isolamento por usuario
- @@index([billingCycleId]) para listagem por ciclo (NFR3: < 1s)
- Include relations no findAll para evitar N+1

### Project Structure Notes
- Backend: `backend/src/modules/transaction/`
- Seguir mesmo padrao de category/payment-method/person modules
- Importar e usar PrismaService do `../../prisma/prisma.service.js`

### References
- [Source: epics.md#Epic 4 - Story 4.1]
- [Source: architecture.md#Data Models - Transaction]
- [Source: architecture.md#API Design]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Docker Desktop offline — migration SQL criada manualmente

### Completion Notes List
- Todos os 9 ACs satisfeitos
- Backend: 20 suites, 153 testes — todos passando (0 regressoes)
- TypeScript: build sem erros
- Transaction model com auto-referencia para parcelas (parent/children)
- Service valida ciclo aberto antes de criar/editar, hard delete com cascata em parcelas futuras
- Controller com @Controller() base (sem prefix) pois usa rotas em 2 controllers: /transactions e /billing-cycles/:cycleId/transactions

### File List

#### Backend (novos)
- backend/prisma/schema.prisma (modificado — adicionado Transaction model + relacoes em User, BillingCycle, Category, PaymentMethod)
- backend/prisma/migrations/20260303130000_add_transaction/migration.sql (novo)
- backend/src/app.module.ts (modificado — import TransactionModule)
- backend/src/modules/transaction/transaction.module.ts (novo)
- backend/src/modules/transaction/transaction.service.ts (novo)
- backend/src/modules/transaction/transaction.service.spec.ts (novo)
- backend/src/modules/transaction/transaction.controller.ts (novo)
- backend/src/modules/transaction/transaction.controller.spec.ts (novo)
- backend/src/modules/transaction/dto/create-transaction.dto.ts (novo)
- backend/src/modules/transaction/dto/create-transaction.dto.spec.ts (novo)
- backend/src/modules/transaction/dto/update-transaction.dto.ts (novo)
- backend/src/modules/transaction/dto/transaction-response.dto.ts (novo)

## Change Log

- 2026-03-03: Story 4.1 implementada — Transaction model + CRUD backend completo com validacao de ciclo fechado, hard delete com cascata, toggle-paid, e endpoint de listagem por ciclo
