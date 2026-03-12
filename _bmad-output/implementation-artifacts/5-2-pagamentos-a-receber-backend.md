# Story 5.2: Pagamentos de A Receber (Backend)

Status: done

## Story

As a usuario,
I want marcar que alguem me pagou (total ou parcialmente) e ver o historico,
So that sei exatamente quem ainda me deve e quanto.

## Acceptance Criteria

1. **AC1:** POST `/api/receivables/:id/payments` com amount cria pagamento e atualiza status do receivable para `partial` ou `paid` (FR27)
2. **AC2:** Validacao: nao pode pagar mais que o saldo restante (amount - paidAmount)
3. **AC3:** GET `/api/persons/:id/receivables` retorna lista de receivables da pessoa com status e valores (FR28)
4. **AC4:** GET `/api/receivables/summary` retorna visao consolidada por pessoa: nome, total pendente, total pago (FR26)
5. **AC5:** Model ReceivablePayment no Prisma: id UUID, receivableId, amount Decimal(15,2), paidAt DateTime, createdAt
6. **AC6:** Mapeamento @@map (`receivable_payments`), foreign key com onDelete Cascade
7. **AC7:** Migration criada e aplicada
8. **AC8:** Endpoints documentados no Swagger

## Tasks / Subtasks

- [x] Task 1: Model ReceivablePayment ja incluido na migration de 5.1 (AC: 5, 6, 7)
  - [x] 1.1-1.5: Ja feito na Story 5.1 (schema, migration, prisma generate)

- [x] Task 2: Criar DTOs com validacao (AC: 1, 8)
  - [x] 2.1: Testes para CreatePaymentDto — 5 testes passando
  - [x] 2.2: create-payment.dto.ts + Swagger
  - [x] 2.3: receivable-response.dto.ts + receivable-summary.dto.ts
  - [x] 2.4: Testes passam (GREEN)

- [x] Task 3: Criar ReceivableService (AC: 1, 2, 3, 4)
  - [x] 3.1: 7 testes para service
  - [x] 3.2: receivable.service.ts com createPayment, findByPerson, getSummary
  - [x] 3.3: Testes passam (GREEN)

- [x] Task 4: Criar ReceivableController com endpoints (AC: 1, 3, 4, 8)
  - [x] 4.1: 3 testes para controller
  - [x] 4.2: receivable.controller.ts com POST/GET endpoints
  - [x] 4.3: Swagger decorators
  - [x] 4.4: receivable.module.ts + AppModule
  - [x] 4.5: Testes passam (GREEN)

- [x] Task 5: Verificacao final (AC: 1-8)
  - [x] 5.1: Backend: 27 suites, 195 testes — todos passando
  - [x] 5.2: TypeScript build sem erros
  - [x] 5.3: Zero regressoes

## Dev Notes

### Contrato API
- POST `/api/receivables/:id/payments` { amount, paidAt } -> 201
- GET `/api/persons/:personId/receivables` -> 200 + array de receivables com transacao e payments
- GET `/api/receivables/summary` -> 200 + array de {person, totalPending, totalPaid}

### Logica de Status
- Se paidAmount == 0: status = "pending"
- Se paidAmount > 0 && paidAmount < amount: status = "partial"
- Se paidAmount >= amount: status = "paid"
- Atualizar status automaticamente ao registrar pagamento

### Validacao de Pagamento
- amount > 0
- amount <= (receivable.amount - receivable.paidAmount) — nao pode ultrapassar saldo
- Receivable deve pertencer a uma transacao do usuario

### Summary Query
- Agrupar receivables por personId
- Somar amount onde status != "paid" para totalPending
- Somar paidAmount para totalPaid
- Incluir nome da pessoa

### References
- [Source: epics.md#Epic 5 - Story 5.2]
- [Source: architecture.md#Data Models]

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- Todos os 8 ACs satisfeitos
- ReceivableService com createPayment (valida saldo, atualiza status), findByPerson, getSummary
- ReceivableController com 3 endpoints: POST payment, GET by person, GET summary
- Summary agrupa por pessoa com totalPending e totalPaid
- 15 testes novos no módulo receivable

### File List
- backend/src/app.module.ts (modificado — import ReceivableModule)
- backend/src/modules/receivable/receivable.module.ts (novo)
- backend/src/modules/receivable/receivable.service.ts (novo)
- backend/src/modules/receivable/receivable.service.spec.ts (novo)
- backend/src/modules/receivable/receivable.controller.ts (novo)
- backend/src/modules/receivable/receivable.controller.spec.ts (novo)
- backend/src/modules/receivable/dto/create-payment.dto.ts (novo)
- backend/src/modules/receivable/dto/create-payment.dto.spec.ts (novo)
- backend/src/modules/receivable/dto/receivable-response.dto.ts (novo)
