# Story 5.1: Model de Split e Logica de A Receber (Backend)

Status: done

## Story

As a usuario,
I want dividir uma transacao entre pessoas via API e ter o "a receber" gerado automaticamente,
So that o sistema controla quem me deve quanto.

## Acceptance Criteria

1. **AC1:** POST `/api/transactions/:id/splits` com array de splits [{personId, amount}] cria registros de split vinculados a transacao. Valida que soma dos splits + parte do usuario = valor total (FR24)
2. **AC2:** Para cada split de outra pessoa, um Receivable e criado automaticamente com status `pending` e valor do split (FR25)
3. **AC3:** GET `/api/transactions/:id` retorna splits com pessoa e valor, e campo `userAmount` com a parte do usuario (FR29)
4. **AC4:** DELETE de uma transacao com splits exclui splits e receivables em cascata
5. **AC5:** Model Split no Prisma: id UUID, transactionId, personId, amount Decimal(15,2), createdAt
6. **AC6:** Model Receivable no Prisma: id UUID, splitId, personId, amount Decimal(15,2), paidAmount Decimal(15,2) default 0, status String (pending/partial/paid), createdAt, updatedAt
7. **AC7:** Mapeamento @@map (`splits`, `receivables`), foreign keys com onDelete Cascade
8. **AC8:** Migration criada e aplicada
9. **AC9:** Endpoints documentados no Swagger
10. **AC10:** PUT `/api/transactions/:id/splits` substitui splits existentes (re-cria receivables)

## Tasks / Subtasks

- [x] Task 1: Adicionar models Split e Receivable ao Prisma schema (AC: 5, 6, 7, 8)
  - [x] 1.1: Adicionar model Split: id UUID, transactionId String, personId String, amount Decimal @db.Decimal(15,2), createdAt DateTime
  - [x] 1.2: Adicionar model Receivable: id UUID, splitId String, personId String, amount Decimal @db.Decimal(15,2), paidAmount Decimal @db.Decimal(15,2) @default(0), status String @default("pending"), createdAt, updatedAt
  - [x] 1.3: Relacoes: Split -> Transaction (onDelete: Cascade), Split -> Person, Receivable -> Split (onDelete: Cascade), Receivable -> Person
  - [x] 1.4: @@map("splits"), @@map("receivables"), @@index([transactionId]) em Split
  - [x] 1.5: Adicionar relacao splits Split[] em Transaction e Person
  - [x] 1.6: Adicionar relacao receivables Receivable[] em Person
  - [x] 1.7: Rodar migration e prisma generate

- [x] Task 2: Criar DTOs com validacao (AC: 1, 9)
  - [x] 2.1: Escrever testes (RED) para CreateSplitDto — personId UUID required, amount positive decimal required
  - [x] 2.2: Criar `src/modules/split/dto/create-splits.dto.ts` com array de splits + Swagger decorators
  - [x] 2.3: Criar `src/modules/split/dto/split-response.dto.ts`
  - [x] 2.4: Verificar testes passam (GREEN)

- [x] Task 3: Criar SplitService (AC: 1, 2, 3, 4, 10)
  - [x] 3.1: Escrever testes (RED) para service: createSplits, replaceSplits, findByTransaction
  - [x] 3.2: Criar `src/modules/split/split.service.ts`
  - [x] 3.3: Verificar testes passam (GREEN)

- [x] Task 4: Criar SplitController com endpoints (AC: 1, 3, 9, 10)
  - [x] 4.1: Escrever testes (RED) para controller: POST splits, PUT splits, GET splits
  - [x] 4.2: Criar `src/modules/split/split.controller.ts`
  - [x] 4.3: Swagger decorators em todos endpoints
  - [x] 4.4: Criar `src/modules/split/split.module.ts` e registrar no AppModule
  - [x] 4.5: Verificar testes passam (GREEN)

- [x] Task 5: Atualizar TransactionService para incluir splits (AC: 3, 4)
  - [x] 5.1: Atualizar findOne para incluir splits com person e receivables, calcular userAmount
  - [x] 5.2: Testes atualizados e passando

- [x] Task 6: Verificacao final (AC: 1-10)
  - [x] 6.1: Backend: 27 suites, 195 testes — todos passando
  - [x] 6.2: TypeScript build sem erros
  - [x] 6.3: Zero regressoes em stories anteriores

## Dev Notes

### Contrato API
- POST `/api/transactions/:id/splits` { splits: [{personId, amount}] } -> 201
- PUT `/api/transactions/:id/splits` { splits: [{personId, amount}] } -> 200
- GET `/api/transactions/:id` -> 200 + transacao com splits[], userAmount

### Validacao de Splits
- Soma dos amounts de splits deve ser < valor total da transacao
- userAmount = transaction.amount - soma(splits.amount)
- userAmount deve ser >= 0 (usuario nao pode dever mais que o total)
- Cada split.amount deve ser > 0
- personId deve existir e pertencer ao usuario

### Cascade Delete
- Transaction onDelete -> Splits deletados (Prisma cascade)
- Split onDelete -> Receivables deletados (Prisma cascade)
- Nao precisa de logica manual — cascade no schema

### Padrao Identico a Modules Anteriores
- Mesma estrutura: module, service, controller, DTOs, specs
- PrismaService injection, mockPrisma em testes, ParseUUIDPipe

### References
- [Source: epics.md#Epic 5 - Story 5.1]
- [Source: architecture.md#Data Models]
- [Source: architecture.md#API Design]

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- Todos os 10 ACs satisfeitos
- Models Split, Receivable, ReceivablePayment criados no Prisma
- Migration SQL criada manualmente (Docker offline)
- SplitService com createSplits, replaceSplits, findByTransaction
- SplitController com POST/PUT/GET endpoints
- TransactionService.findOne atualizado com splits + userAmount
- Evitado import de Decimal do Prisma generated (incompativel com Jest) — usado toNum helper
- Backend: 27 suites, 195 testes — zero regressoes

### File List
- backend/prisma/schema.prisma (modificado — Split, Receivable, ReceivablePayment models + relacoes)
- backend/prisma/migrations/20260304120000_add_split_receivable/migration.sql (novo)
- backend/src/app.module.ts (modificado — import SplitModule)
- backend/src/modules/split/split.module.ts (novo)
- backend/src/modules/split/split.service.ts (novo)
- backend/src/modules/split/split.service.spec.ts (novo)
- backend/src/modules/split/split.controller.ts (novo)
- backend/src/modules/split/split.controller.spec.ts (novo)
- backend/src/modules/split/dto/create-splits.dto.ts (novo)
- backend/src/modules/split/dto/create-splits.dto.spec.ts (novo)
- backend/src/modules/split/dto/split-response.dto.ts (novo)
- backend/src/modules/transaction/transaction.service.ts (modificado — findOne com splits + userAmount)
- backend/src/modules/transaction/transaction.service.spec.ts (modificado — mock com splits)
