# Story 6.3: Integracao de Fixos e Impostos no Resumo do Ciclo

Status: review

## Story

As a usuario,
I want que gastos fixos e impostos aparecam no resumo do ciclo,
So that o calculo do resultado liquido do ciclo seja completo e preciso.

## Acceptance Criteria

1. **AC1:** GET `/api/billing-cycles/:id` retorna summary com totalFixedExpenses e totalTaxes reais
2. **AC2:** netResult calcula: salario - totalTransactions - totalFixedExpenses - totalTaxes + totalReceivables (FR6)
3. **AC3:** Gastos fixos sem valor real registrado usam estimatedAmount como fallback
4. **AC4:** Endpoint retorna breakdown: { salary, totalCards, totalFixed, totalTaxes, totalReceivables, netResult }

## Tasks / Subtasks

- [x] Task 1: Atualizar BillingCycleService.findOne com calculos reais
- [x] Task 2: Testes atualizados
- [x] Task 3: Verificacao final

## Dev Notes

### Calculo do Resumo
- totalCards = soma de transactions.amount do ciclo (apenas parte do usuario se tem splits)
- totalFixed = soma de fixedExpenseEntries.actualAmount do ciclo (ou estimatedAmount se null)
- totalTaxes = soma de taxEntries.actualAmount do ciclo (ou estimatedAmount se null)
- totalReceivables = soma de receivables pendentes do usuario
- netResult = salary - totalCards - totalFixed - totalTaxes + totalReceivables

### References
- [Source: epics.md#Epic 6 - Story 6.3]

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- Todos os 4 ACs satisfeitos
- BillingCycleService.findOne agora calcula totalCards, totalFixed, totalTaxes, totalReceivables e netResult reais
- totalCards: soma transactions.amount - splits por transação
- totalFixed: actualAmount da entry, fallback para estimatedAmount se sem entry
- totalTaxes: actualAmount da entry, fallback para estimatedAmount se sem entry
- totalReceivables: soma de amount - paidAmount de receivables pendentes do ciclo
- netResult: salary - totalCards - totalFixed - totalTaxes + totalReceivables
- Teste com dados reais valida cálculo completo (7300 - 1300 - 1570 - 480 + 150 = 4100)
- Backend: 35 suites, 258 testes — todos passando

### File List
- backend/src/modules/billing-cycle/billing-cycle.service.ts (modificado — findOne com cálculos reais)
- backend/src/modules/billing-cycle/billing-cycle.service.spec.ts (modificado — mock ampliado, teste com dados reais)
