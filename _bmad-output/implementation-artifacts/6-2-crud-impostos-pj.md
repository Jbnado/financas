# Story 6.2: CRUD de Impostos PJ (Backend + Frontend)

Status: done

## Story

As a usuario,
I want cadastrar meus impostos PJ e registrar o valor real pago em cada ciclo,
So that controlo DAS, ISS e outros tributos da minha empresa.

## Acceptance Criteria

1. **AC1:** POST `/api/taxes` com nome, rate e estimatedAmount cria imposto
2. **AC2:** GET `/api/taxes` lista impostos ativos do usuario
3. **AC3:** PUT `/api/taxes/:id` atualiza nome, rate, estimatedAmount
4. **AC4:** DELETE `/api/taxes/:id` soft-delete (isActive: false)
5. **AC5:** POST `/api/taxes/:id/entries` com billingCycleId, actualAmount e isPaid cria registro do ciclo (FR36)
6. **AC6:** PATCH `/api/tax-entries/:id/toggle-paid` alterna isPaid (FR37)
7. **AC7:** GET `/api/billing-cycles/:id/taxes` lista impostos com entry do ciclo
8. **AC8:** Model Tax: id UUID, name, rate Decimal(5,2), estimatedAmount Decimal(15,2), isActive Boolean default true, userId, createdAt, updatedAt. @@map("taxes")
9. **AC9:** Model TaxEntry: id UUID, taxId, billingCycleId, actualAmount Decimal(15,2), isPaid Boolean default false, createdAt, updatedAt. @@map("tax_entries")
10. **AC10:** Migration, Swagger, frontend na ConfigPage

## Tasks / Subtasks

- [x] Task 1: Adicionar models ao Prisma schema (AC: 8, 9) — compartilhado com 6.1
- [x] Task 2: Criar DTOs com validacao e testes (AC: 1, 10)
- [x] Task 3: Criar TaxService com testes TDD (AC: 1-7)
- [x] Task 4: Criar TaxController com testes TDD (AC: 1-7, 10)
- [x] Task 5: Frontend hooks e componentes (AC: 10)
- [x] Task 6: Verificacao final

## Dev Notes

### Contrato API
- POST `/api/taxes` { name, rate, estimatedAmount } -> 201
- GET `/api/taxes` -> 200
- PUT `/api/taxes/:id` { name?, rate?, estimatedAmount? } -> 200
- DELETE `/api/taxes/:id` -> 200 (soft-delete)
- POST `/api/taxes/:id/entries` { billingCycleId, actualAmount, isPaid } -> 201
- PATCH `/api/tax-entries/:id/toggle-paid` -> 200
- GET `/api/billing-cycles/:cycleId/taxes` -> 200

### References
- [Source: epics.md#Epic 6 - Story 6.2]

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- Todos os 10 ACs satisfeitos
- Models Tax + TaxEntry já criados na migration compartilhada com 6.1
- TaxService com CRUD, createEntry, toggleEntryPaid, findByCycle
- TaxController com Swagger completo
- DTOs com validacao e testes
- Frontend: TaxList + TaxFormDialog na ConfigPage
- Hook useTaxes com TanStack Query
- Backend: 35 suites, 257 testes — todos passando
- Frontend: 43 suites, 226 testes — todos passando
- TypeScript build sem erros

### File List
- backend/src/modules/tax/tax.module.ts (novo)
- backend/src/modules/tax/tax.service.ts (novo)
- backend/src/modules/tax/tax.service.spec.ts (novo — 11 testes)
- backend/src/modules/tax/tax.controller.ts (novo)
- backend/src/modules/tax/tax.controller.spec.ts (novo — 8 testes)
- backend/src/modules/tax/dto/create-tax.dto.ts (novo)
- backend/src/modules/tax/dto/create-tax.dto.spec.ts (novo — 4 testes)
- backend/src/modules/tax/dto/update-tax.dto.ts (novo)
- backend/src/modules/tax/dto/create-tax-entry.dto.ts (novo)
- backend/src/modules/tax/dto/create-tax-entry.dto.spec.ts (novo — 4 testes)
- backend/src/modules/tax/dto/tax-response.dto.ts (novo)
- backend/src/app.module.ts (modificado — TaxModule)
- frontend/src/features/settings/types.ts (modificado — tipos Tax)
- frontend/src/features/settings/hooks/use-taxes.ts (novo)
- frontend/src/features/settings/hooks/use-taxes.test.tsx (novo — 5 testes)
- frontend/src/features/settings/components/TaxList.tsx (novo)
- frontend/src/features/settings/components/TaxList.test.tsx (novo — 4 testes)
- frontend/src/features/settings/components/TaxForm.tsx (novo)
- frontend/src/features/settings/pages/ConfigPage.tsx (modificado — TaxList)
