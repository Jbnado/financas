# Story 8.1: API de Relatórios Agregados (Backend)

## Objetivo
Criar endpoints de relatórios para gráficos e comparativos do dashboard avançado.

## Endpoints

### GET /api/reports/category-distribution/:billingCycleId
Retorna distribuição de gastos por categoria para gráfico pizza/barras.
```json
{
  "items": [
    { "categoryId": "uuid", "categoryName": "Alimentação", "categoryColor": "#f97316", "total": "800.00", "percentage": 40.0 }
  ],
  "grandTotal": "2000.00"
}
```

### GET /api/reports/cycle-evolution?last=6
Retorna evolução do resultado líquido nos últimos N ciclos (default 6).
```json
{
  "cycles": [
    { "cycleId": "uuid", "cycleName": "Janeiro 2026", "salary": "7300.00", "totalExpenses": "5000.00", "netResult": "2300.00" }
  ]
}
```

### GET /api/reports/cycle-comparison/:billingCycleId
Compara o ciclo informado com o ciclo anterior.
```json
{
  "current": { "cycleName": "Fev 2026", "salary": "7300.00", "totalExpenses": "5000.00", "netResult": "2300.00", "categories": [...] },
  "previous": { "cycleName": "Jan 2026", ... } | null,
  "diff": { "expensesDiff": "-500.00", "netResultDiff": "+200.00" }
}
```

## Acceptance Criteria
- AC1: Endpoints autenticados com JWT
- AC2: category-distribution retorna items ordenados por total desc com percentual
- AC3: cycle-evolution retorna últimos N ciclos ordenados cronologicamente
- AC4: cycle-comparison retorna null para previous se não houver ciclo anterior
- AC5: Todos os cálculos usam userAmount (descontam splits)
- AC6: Endpoints documentados no Swagger
- AC7: Service é read-only

## Tarefas
- [x] Criar ReportModule, ReportService, ReportController
- [x] Implementar category-distribution
- [x] Implementar cycle-evolution
- [x] Implementar cycle-comparison
- [x] Testes unitários do service
