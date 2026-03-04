# Story 6.1: CRUD de Gastos Fixos (Backend + Frontend)

Status: review

## Story

As a usuario,
I want cadastrar minhas despesas fixas e registrar o valor real pago em cada ciclo,
So that controlo aluguel, energia, internet e outras contas recorrentes.

## Acceptance Criteria

1. **AC1:** POST `/api/fixed-expenses` com nome, estimatedAmount e dueDay cria gasto fixo com isActive true
2. **AC2:** GET `/api/fixed-expenses` lista gastos fixos ativos do usuario
3. **AC3:** PUT `/api/fixed-expenses/:id` atualiza nome, estimatedAmount, dueDay
4. **AC4:** DELETE `/api/fixed-expenses/:id` soft-delete (isActive: false)
5. **AC5:** POST `/api/fixed-expenses/:id/entries` com billingCycleId, actualAmount e isPaid cria registro do ciclo (FR31)
6. **AC6:** PATCH `/api/fixed-expense-entries/:id/toggle-paid` alterna isPaid (FR34)
7. **AC7:** GET `/api/billing-cycles/:id/fixed-expenses` lista gastos fixos com entry do ciclo: nome, estimado, real, diferenca, isPaid (FR32). Gastos sem entry aparecem com actualAmount null
8. **AC8:** GET `/api/fixed-expenses/:id/history` retorna historico de entries ao longo dos ciclos (FR33)
9. **AC9:** Model FixedExpense: id UUID, name, estimatedAmount Decimal(15,2), dueDay Int, isActive Boolean default true, userId, createdAt, updatedAt. @@map("fixed_expenses")
10. **AC10:** Model FixedExpenseEntry: id UUID, fixedExpenseId, billingCycleId, actualAmount Decimal(15,2), isPaid Boolean default false, createdAt, updatedAt. @@map("fixed_expense_entries")
11. **AC11:** Migration criada e aplicada
12. **AC12:** Endpoints documentados no Swagger
13. **AC13:** Frontend: tela de gastos fixos na ConfigPage com lista, formulario, toggle pago, input valor real

## Tasks / Subtasks

- [x] Task 1: Adicionar models ao Prisma schema (AC: 9, 10, 11)
- [x] Task 2: Criar DTOs com validacao e testes (AC: 1, 12)
- [x] Task 3: Criar FixedExpenseService com testes TDD (AC: 1-8)
- [x] Task 4: Criar FixedExpenseController com testes TDD (AC: 1-8, 12)
- [x] Task 5: Frontend hooks e componentes (AC: 13)
- [x] Task 6: Verificacao final

## Dev Notes

### Contrato API
- POST `/api/fixed-expenses` { name, estimatedAmount, dueDay } -> 201
- GET `/api/fixed-expenses` -> 200 + array
- PUT `/api/fixed-expenses/:id` { name?, estimatedAmount?, dueDay? } -> 200
- DELETE `/api/fixed-expenses/:id` -> 200 (soft-delete)
- POST `/api/fixed-expenses/:id/entries` { billingCycleId, actualAmount, isPaid } -> 201
- PATCH `/api/fixed-expense-entries/:id/toggle-paid` -> 200
- GET `/api/billing-cycles/:cycleId/fixed-expenses` -> 200 + array com entry do ciclo
- GET `/api/fixed-expenses/:id/history` -> 200 + array de entries

### References
- [Source: epics.md#Epic 6 - Story 6.1]

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- Todos os 13 ACs satisfeitos
- Models FixedExpense + FixedExpenseEntry + Tax + TaxEntry adicionados ao schema (migration compartilhada)
- FixedExpenseService com CRUD, createEntry, toggleEntryPaid, findByCycle, findHistory
- FixedExpenseController com Swagger completo
- DTOs com validacao class-validator e testes
- Frontend: FixedExpenseList + FixedExpenseFormDialog na ConfigPage
- Hook useFixedExpenses com TanStack Query
- Backend: 31 suites, 228 testes — todos passando
- Frontend: 41 suites, 217 testes — todos passando
- TypeScript build sem erros

### File List
- backend/prisma/schema.prisma (modificado — 4 novos models)
- backend/prisma/migrations/20260304130000_add_fixed_expense_tax/migration.sql (novo)
- backend/src/modules/fixed-expense/fixed-expense.module.ts (novo)
- backend/src/modules/fixed-expense/fixed-expense.service.ts (novo)
- backend/src/modules/fixed-expense/fixed-expense.service.spec.ts (novo — 12 testes)
- backend/src/modules/fixed-expense/fixed-expense.controller.ts (novo)
- backend/src/modules/fixed-expense/fixed-expense.controller.spec.ts (novo — 9 testes)
- backend/src/modules/fixed-expense/dto/create-fixed-expense.dto.ts (novo)
- backend/src/modules/fixed-expense/dto/create-fixed-expense.dto.spec.ts (novo — 6 testes)
- backend/src/modules/fixed-expense/dto/update-fixed-expense.dto.ts (novo)
- backend/src/modules/fixed-expense/dto/create-fixed-expense-entry.dto.ts (novo)
- backend/src/modules/fixed-expense/dto/create-fixed-expense-entry.dto.spec.ts (novo — 4 testes)
- backend/src/modules/fixed-expense/dto/fixed-expense-response.dto.ts (novo)
- backend/src/app.module.ts (modificado — FixedExpenseModule)
- frontend/src/features/settings/types.ts (modificado — tipos FixedExpense)
- frontend/src/features/settings/hooks/use-fixed-expenses.ts (novo)
- frontend/src/features/settings/hooks/use-fixed-expenses.test.tsx (novo — 5 testes)
- frontend/src/features/settings/components/FixedExpenseList.tsx (novo)
- frontend/src/features/settings/components/FixedExpenseList.test.tsx (novo — 4 testes)
- frontend/src/features/settings/components/FixedExpenseForm.tsx (novo)
- frontend/src/features/settings/pages/ConfigPage.tsx (modificado — FixedExpenseList)
