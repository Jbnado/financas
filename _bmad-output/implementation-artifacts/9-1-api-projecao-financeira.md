# Story 9.1: API de Projeção Financeira (Backend)

Status: pending

## Story

As a usuario,
I want ver a projeção do resultado líquido dos próximos 3-6 ciclos,
So that consigo antecipar meses com resultado negativo e me planejar.

## Acceptance Criteria

1. **AC1:** GET `/api/projections?months=N` retorna projeção para os próximos N ciclos (default 6, max 12) baseada em: salário do último ciclo + gastos fixos ativos + parcelas futuras + impostos ativos (FR44)
2. **AC2:** Cada item da projeção contém: cycleName (mês/ano), projectedSalary, projectedFixedExpenses, projectedTaxes, projectedInstallments, projectedNetResult
3. **AC3:** projectedInstallments considera apenas parcelas já registradas (transactions com totalInstallments != null e installmentNumber < totalInstallments que cairão no ciclo projetado)
4. **AC4:** projectedFixedExpenses = soma de estimatedAmount de todos FixedExpense ativos do usuário
5. **AC5:** projectedTaxes = soma de estimatedAmount de todos Tax ativos do usuário
6. **AC6:** projectedSalary usa o salário do ciclo mais recente do usuário como base
7. **AC7:** Resposta inclui campo `alerts: Array<{ month: string, deficit: string }>` com ciclos cujo projectedNetResult < 0 (FR45)
8. **AC8:** GET `/api/projections/installment-commitments` retorna comprometimento em parcelas futuras agrupado por ciclo: cycleName, totalCommitted, installmentCount (FR46)
9. **AC9:** Endpoints autenticados via JWT, scoped ao userId
10. **AC10:** Endpoints documentados no Swagger
11. **AC11:** Testes unitários cobrindo: projeção sem dados, projeção com dados completos, alertas de déficit, comprometimento de parcelas

## Tasks / Subtasks

- [ ] Task 1: Criar ProjectionService com método `getProjection(userId, months)` (AC: 1-7)
  - [ ] 1.1: Buscar salário do ciclo mais recente
  - [ ] 1.2: Somar estimatedAmount dos FixedExpense ativos
  - [ ] 1.3: Somar estimatedAmount dos Tax ativos
  - [ ] 1.4: Calcular parcelas futuras por mês (buscar transactions com installments pendentes)
  - [ ] 1.5: Montar array de projeção com cálculo do netResult
  - [ ] 1.6: Gerar alertas para ciclos com resultado negativo
- [ ] Task 2: Criar método `getInstallmentCommitments(userId)` (AC: 8)
  - [ ] 2.1: Agrupar parcelas futuras por ciclo projetado (mês/ano)
  - [ ] 2.2: Retornar totalCommitted e installmentCount por ciclo
- [ ] Task 3: Criar ProjectionController com rotas e Swagger (AC: 9, 10)
- [ ] Task 4: Criar DTOs de resposta com validação
- [ ] Task 5: Testes unitários TDD para service e controller (AC: 11)
- [ ] Task 6: Registrar no AppModule e verificação final

## Dev Notes

### Contrato API
- GET `/api/projections?months=6` -> 200
  ```json
  {
    "projections": [
      {
        "cycleName": "Abril 2026",
        "projectedSalary": "7000.00",
        "projectedFixedExpenses": "3200.00",
        "projectedTaxes": "800.00",
        "projectedInstallments": "500.00",
        "projectedNetResult": "2500.00"
      }
    ],
    "alerts": [
      { "month": "Julho 2026", "deficit": "-1200.00" }
    ]
  }
  ```
- GET `/api/projections/installment-commitments` -> 200
  ```json
  {
    "commitments": [
      { "cycleName": "Abril 2026", "totalCommitted": "1500.00", "installmentCount": 3 }
    ]
  }
  ```

### Lógica de Projeção de Parcelas
Para cada transação parcelada ativa:
- Verificar installmentNumber e totalInstallments
- Calcular quantas parcelas restam
- Distribuir nos ciclos futuros com base na data base + periodicidade mensal
- Usar billingCycles existentes futuros ou gerar nomes de ciclo projetados

### References
- [Source: epics.md#Epic 9 - FR44, FR45, FR46]
