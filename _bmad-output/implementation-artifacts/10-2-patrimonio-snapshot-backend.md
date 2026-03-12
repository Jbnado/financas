# Story 10.2: Patrimônio Total, Líquido e Snapshot Automático (Backend)

Status: done

## Story

As a usuario,
I want ver meu patrimônio total e líquido real, com snapshots automáticos ao fechar ciclo,
So that acompanho a evolução do meu patrimônio ao longo do tempo.

## Acceptance Criteria

1. **AC1:** GET `/api/patrimony/summary` retorna patrimônio total (contas + investimentos), patrimônio líquido (total - parcelas futuras), totais por tipo (FR50, FR51)
2. **AC2:** Resposta do summary inclui breakdown: totalBankAccounts, totalInvestments, totalAssets, futureInstallments, netPatrimony
3. **AC3:** GET `/api/patrimony/distribution` retorna distribuição por tipo: checking, savings, wallet, fixed_income, variable_income, crypto, real_estate, other — com valor e percentual (FR54)
4. **AC4:** Model PatrimonySnapshot: id UUID, userId, billingCycleId (unique per user+cycle), totalBankAccounts Decimal, totalInvestments Decimal, totalAssets Decimal, futureInstallments Decimal, netPatrimony Decimal, snapshotDate DateTime, createdAt. @@map("patrimony_snapshots") (FR52)
5. **AC5:** Ao fechar um ciclo (PATCH `/api/billing-cycles/:id/close`), o sistema grava automaticamente um PatrimonySnapshot com os valores atuais (FR52)
6. **AC6:** GET `/api/patrimony/evolution?last=N` retorna array de snapshots dos últimos N ciclos fechados, ordenados por data (FR53)
7. **AC7:** Se não existir nenhum snapshot, evolution retorna array vazio
8. **AC8:** Cálculo de futureInstallments: soma dos valores de parcelas com installmentNumber < totalInstallments que ainda não venceram
9. **AC9:** Endpoints autenticados via JWT, scoped ao userId
10. **AC10:** Endpoints documentados no Swagger
11. **AC11:** Testes unitários cobrindo: summary com e sem dados, distribuição, snapshot automático no close, evolution

## Tasks / Subtasks

- [x] Task 1: Adicionar model PatrimonySnapshot ao schema (AC: 4)
  - [x] 1.1: Model com campos e unique constraint [userId, billingCycleId]
  - [x] 1.2: Relações: User, BillingCycle
  - [x] 1.3: Criar e aplicar migration
- [x] Task 2: Criar PatrimonyService (AC: 1-3, 6-8)
  - [x] 2.1: getSummary(userId) — agregar saldos de contas + investimentos, calcular parcelas futuras
  - [x] 2.2: getDistribution(userId) — agrupar por tipo com percentuais
  - [x] 2.3: createSnapshot(userId, billingCycleId) — gravar snapshot
  - [x] 2.4: getEvolution(userId, last) — buscar snapshots ordenados
- [x] Task 3: Criar PatrimonyController com Swagger (AC: 9, 10)
- [x] Task 4: Integrar snapshot no BillingCycleService.close() (AC: 5)
  - [x] 4.1: Injetar PatrimonyService no BillingCycleService
  - [x] 4.2: Chamar createSnapshot após fechar ciclo
  - [x] 4.3: Atualizar testes do billing-cycle.service para mockar PatrimonyService
- [x] Task 5: DTOs de resposta
- [x] Task 6: Testes unitários TDD (AC: 11)
- [x] Task 7: Registrar PatrimonyModule no AppModule
- [x] Task 8: Verificação final

## Dev Notes

### Contrato API
- GET `/api/patrimony/summary` -> 200
  ```json
  {
    "totalBankAccounts": "15000.00",
    "totalInvestments": "50000.00",
    "totalAssets": "65000.00",
    "futureInstallments": "8000.00",
    "netPatrimony": "57000.00"
  }
  ```
- GET `/api/patrimony/distribution` -> 200
  ```json
  {
    "items": [
      { "type": "checking", "label": "Conta Corrente", "total": "5000.00", "percentage": 7.69 },
      { "type": "fixed_income", "label": "Renda Fixa", "total": "30000.00", "percentage": 46.15 }
    ],
    "grandTotal": "65000.00"
  }
  ```
- GET `/api/patrimony/evolution?last=6` -> 200
  ```json
  {
    "snapshots": [
      {
        "cycleName": "Jan 2026",
        "snapshotDate": "2026-01-31T...",
        "totalAssets": "60000.00",
        "netPatrimony": "52000.00"
      }
    ]
  }
  ```

### Integração com Close Cycle
O BillingCycleService.close() já existe. Precisamos:
1. Injetar PatrimonyService
2. Após setar status=closed + closedAt, chamar patrimonyService.createSnapshot()
3. Tratar falha no snapshot sem impedir o fechamento do ciclo (try/catch com log)

### References
- [Source: epics.md#Epic 10 - FR50, FR51, FR52, FR53, FR54]

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- All 11 ACs satisfied
- PatrimonyService: getSummary, getDistribution, createSnapshot, getEvolution
- Snapshot created on billing cycle close with graceful error handling
- Controller tests added (6 tests)
- Backend: 44 suites, 340 tests passing

### Code Review Fixes
- Fix: getEvolution now uses .toFixed(2) for consistent decimal format
- Fix: NaN/negative guard on `last` query parameter
- Fix: futureInstallments now calculated from real installment data (was hardcoded 0)
- Fix: Controller spec created with NaN and negative edge cases

### File List
- backend/src/modules/patrimony/patrimony.service.ts (modified — toFixed, futureInstallments calc)
- backend/src/modules/patrimony/patrimony.controller.ts (modified — NaN guard)
- backend/src/modules/patrimony/patrimony.service.spec.ts (modified — futureInstallments test, toFixed assertion)
- backend/src/modules/patrimony/patrimony.controller.spec.ts (new — 6 tests)
