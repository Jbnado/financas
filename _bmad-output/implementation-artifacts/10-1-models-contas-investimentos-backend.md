# Story 10.1: Models e CRUD de Contas Bancárias e Investimentos (Backend)

Status: done

## Story

As a usuario,
I want cadastrar minhas contas bancárias e investimentos,
So that tenho visibilidade do meu patrimônio total.

## Acceptance Criteria

1. **AC1:** Model BankAccount: id UUID, userId, name, institution, type (enum: checking/savings/wallet), balance Decimal(15,2), isActive Boolean default true, createdAt, updatedAt. @@map("bank_accounts") (FR47)
2. **AC2:** Model Investment: id UUID, userId, name, type (enum: fixed_income/variable_income/crypto/real_estate/other), institution, appliedAmount Decimal(15,2), currentValue Decimal(15,2), liquidity (enum: daily/monthly/at_maturity), maturityDate DateTime?, isActive Boolean default true, createdAt, updatedAt. @@map("investments") (FR48)
3. **AC3:** Migration criada e aplicada
4. **AC4:** POST `/api/bank-accounts` cria conta bancária (FR47)
5. **AC5:** GET `/api/bank-accounts` lista contas ativas do usuário (FR47)
6. **AC6:** PUT `/api/bank-accounts/:id` atualiza dados da conta (FR47)
7. **AC7:** DELETE `/api/bank-accounts/:id` soft-delete (isActive: false)
8. **AC8:** PATCH `/api/bank-accounts/:id/balance` atualiza saldo { balance } (FR49)
9. **AC9:** POST `/api/investments` cria investimento (FR48)
10. **AC10:** GET `/api/investments` lista investimentos ativos do usuário (FR48)
11. **AC11:** PUT `/api/investments/:id` atualiza dados do investimento (FR48)
12. **AC12:** DELETE `/api/investments/:id` soft-delete (isActive: false)
13. **AC13:** PATCH `/api/investments/:id/value` atualiza valor atual { currentValue } (FR49)
14. **AC14:** Endpoints autenticados via JWT, scoped ao userId
15. **AC15:** Endpoints documentados no Swagger
16. **AC16:** Testes unitários cobrindo CRUD completo de ambos os módulos

## Tasks / Subtasks

- [x] Task 1: Adicionar models ao Prisma schema (AC: 1, 2, 3)
  - [x] 1.1: Model BankAccount com enum BankAccountType
  - [x] 1.2: Model Investment com enums InvestmentType e LiquidityType
  - [x] 1.3: Adicionar relações no User model
  - [x] 1.4: Criar e aplicar migration
- [x] Task 2: Criar BankAccountModule (AC: 4-8, 14, 15)
  - [x] 2.1: DTOs com validação (CreateBankAccountDto, UpdateBankAccountDto, UpdateBalanceDto)
  - [x] 2.2: BankAccountService com CRUD + updateBalance
  - [x] 2.3: BankAccountController com Swagger
  - [x] 2.4: Testes unitários service + controller
- [x] Task 3: Criar InvestmentModule (AC: 9-13, 14, 15)
  - [x] 3.1: DTOs com validação (CreateInvestmentDto, UpdateInvestmentDto, UpdateValueDto)
  - [x] 3.2: InvestmentService com CRUD + updateValue
  - [x] 3.3: InvestmentController com Swagger
  - [x] 3.4: Testes unitários service + controller
- [x] Task 4: Registrar módulos no AppModule
- [x] Task 5: Seed data para desenvolvimento
- [x] Task 6: Verificação final (AC: 16)

## Dev Notes

### Contrato API — Bank Accounts
- POST `/api/bank-accounts` { name, institution, type, balance } -> 201
- GET `/api/bank-accounts` -> 200 + array
- PUT `/api/bank-accounts/:id` { name?, institution?, type? } -> 200
- DELETE `/api/bank-accounts/:id` -> 200 (soft-delete)
- PATCH `/api/bank-accounts/:id/balance` { balance } -> 200

### Contrato API — Investments
- POST `/api/investments` { name, type, institution, appliedAmount, currentValue, liquidity, maturityDate? } -> 201
- GET `/api/investments` -> 200 + array
- PUT `/api/investments/:id` { name?, type?, institution?, liquidity?, maturityDate? } -> 200
- DELETE `/api/investments/:id` -> 200 (soft-delete)
- PATCH `/api/investments/:id/value` { currentValue } -> 200

### Enums
```prisma
enum BankAccountType { checking savings wallet }
enum InvestmentType { fixed_income variable_income crypto real_estate other }
enum LiquidityType { daily monthly at_maturity }
```

### References
- [Source: epics.md#Epic 10 - FR47, FR48, FR49]
- Padrão de soft-delete igual Category, Person, FixedExpense

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- All 16 ACs satisfied
- BankAccountModule: CRUD + updateBalance with Swagger
- InvestmentModule: CRUD + updateValue with Swagger
- Models and migrations already applied
- Controller tests added (5 per module)
- Backend: 44 suites, 340 tests passing

### Code Review Fixes
- Fix: isActive: true added to findFirst in update/remove/updateBalance/updateValue (both services)
- Fix: Controller specs created for both modules

### File List
- backend/src/modules/bank-account/bank-account.service.ts (modified — isActive: true fix)
- backend/src/modules/bank-account/bank-account.controller.spec.ts (new — 5 tests)
- backend/src/modules/investment/investment.service.ts (modified — isActive: true fix)
- backend/src/modules/investment/investment.controller.spec.ts (new — 5 tests)
