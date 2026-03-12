# Story 9.2: Tela de Projeção Financeira (Frontend)

Status: done

## Story

As a usuario,
I want visualizar graficamente a projeção dos próximos meses e os alertas de déficit,
So that tenho uma visão clara do futuro financeiro e posso agir preventivamente.

## Acceptance Criteria

1. **AC1:** Nova rota `/projecoes` acessível via navegação (ícone TrendingUp) (FR44)
2. **AC2:** Página exibe gráfico de barras (Recharts BarChart) com projeção dos próximos N meses mostrando salário vs despesas projetadas
3. **AC3:** Barras de meses com resultado negativo destacadas em vermelho (FR45)
4. **AC4:** Card de resumo mostra: média do resultado projetado, pior mês, melhor mês
5. **AC5:** Seção "Alertas" exibe lista de meses com déficit projetado com ícone de warning e valor do déficit (FR45)
6. **AC6:** Seção "Comprometimento Futuro" exibe tabela/lista de parcelas futuras agrupadas por ciclo: mês, total comprometido, quantidade de parcelas (FR46)
7. **AC7:** Dropdown para selecionar horizonte: 3, 6 ou 12 meses (default 6)
8. **AC8:** Loading skeleton enquanto dados carregam
9. **AC9:** Empty state quando não há dados suficientes para projeção (ex: nenhum ciclo criado)
10. **AC10:** Responsivo mobile com layout empilhado
11. **AC11:** Testes unitários dos componentes

## Tasks / Subtasks

- [x] Task 1: Criar tipos TypeScript para projeção (AC: todos)
  - [x] 1.1: ProjectionEntry, ProjectionResponse, InstallmentCommitment
- [x] Task 2: Criar hooks TanStack Query (AC: 1)
  - [x] 2.1: useProjection(months) — GET /api/projections?months=N
  - [x] 2.2: useInstallmentCommitments() — GET /api/projections/installment-commitments
- [x] Task 3: Criar componente ProjectionChart (AC: 2, 3)
  - [x] 3.1: BarChart com barras empilhadas: fixos + impostos + parcelas vs salário
  - [x] 3.2: Barras vermelhas para meses negativos
  - [x] 3.3: Tooltip customizado com breakdown
- [x] Task 4: Criar componente ProjectionSummaryCard (AC: 4)
  - [x] 4.1: Média, pior mês, melhor mês
- [x] Task 5: Criar componente DeficitAlerts (AC: 5)
  - [x] 5.1: Lista de alertas com ícone AlertTriangle, mês e valor
  - [x] 5.2: Estado vazio "Nenhum alerta — projeção positiva"
- [x] Task 6: Criar componente CommitmentTable (AC: 6)
  - [x] 6.1: Lista de compromissos futuros por ciclo
  - [x] 6.2: Estado vazio quando sem parcelas futuras
- [x] Task 7: Criar ProjecoesPage com layout (AC: 1, 7, 8, 9, 10)
  - [x] 7.1: Dropdown de horizonte (3/6/12 meses)
  - [x] 7.2: Layout responsivo: gráfico, resumo, alertas, compromissos
  - [x] 7.3: Skeleton loading
  - [x] 7.4: Empty state
- [x] Task 8: Registrar rota e nav item (AC: 1)
- [x] Task 9: Testes unitários dos componentes (AC: 11)
- [x] Task 10: Verificação final

## Dev Notes

### Layout da Página
```
┌─────────────────────────────────┐
│  Projeção Financeira   [6m ▼]   │
├─────────────────────────────────┤
│  ┌─ Resumo ──────────────────┐  │
│  │ Média: +R$2.100  Pior: Ju │  │
│  └───────────────────────────┘  │
│  ┌─ Gráfico de Barras ──────┐  │
│  │ ████  ████  ████  ▓▓▓▓   │  │
│  │ Abr   Mai   Jun   Jul    │  │
│  └───────────────────────────┘  │
│  ┌─ Alertas ─────────────────┐  │
│  │ ⚠ Jul 2026: -R$1.200,00  │  │
│  └───────────────────────────┘  │
│  ┌─ Compromissos Futuros ───┐  │
│  │ Abr: R$1.500 (3 parcelas)│  │
│  │ Mai: R$1.000 (2 parcelas)│  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Navegação
- Adicionar "Projeções" ao nav com ícone TrendingUp (lucide-react)
- Rota: `/projecoes`
- TabId: `'projecoes'` no ui.store

### References
- [Source: epics.md#Epic 9 - FR44, FR45, FR46]
- Reusar padrões do ReportsPage (CycleSelector não necessário aqui — horizonte fixo)

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- Todos os 11 ACs satisfeitos
- Implementação completa: types, hooks, 4 componentes, page, rota, navegação
- ProjectionChart com BarChart Recharts, tooltip customizado, cores dinâmicas
- ProjectionSummaryCard com média, pior e melhor mês — cores dinâmicas baseadas no valor
- DeficitAlerts com lista de alertas e empty state positivo
- CommitmentTable com parcelas futuras agrupadas por ciclo
- ProjecoesPage com dropdown horizonte (3/6/12), skeleton, empty state corrigido
- Frontend: 60 suites, 334 testes — todos passando
- E2E: 20 testes passando

### Code Review Fixes
- Fix: ProjectionSummaryCard cores de Pior/Melhor mês agora são dinâmicas (verde se positivo, vermelho se negativo)
- Fix: Empty state corrigido — agora detecta array vazio além de salários zero
- Fix: shortName no chart inclui ano (ex: "Abr/26") para evitar labels duplicados em 12 meses

### File List
- frontend/src/features/projection/types.ts (existente)
- frontend/src/features/projection/hooks/use-projection.ts (existente)
- frontend/src/features/projection/hooks/use-projection.test.tsx (existente — 4 testes)
- frontend/src/features/projection/components/ProjectionChart.tsx (modificado — shortName com ano)
- frontend/src/features/projection/components/ProjectionChart.test.tsx (existente — 4 testes)
- frontend/src/features/projection/components/ProjectionSummaryCard.tsx (modificado — cores dinâmicas)
- frontend/src/features/projection/components/ProjectionSummaryCard.test.tsx (modificado — 7 testes, +3 novos)
- frontend/src/features/projection/components/DeficitAlerts.tsx (existente)
- frontend/src/features/projection/components/DeficitAlerts.test.tsx (existente — 4 testes)
- frontend/src/features/projection/components/CommitmentTable.tsx (existente)
- frontend/src/features/projection/components/CommitmentTable.test.tsx (existente — 5 testes)
- frontend/src/features/projection/pages/ProjecoesPage.tsx (modificado — empty state fix)
- frontend/src/features/projection/pages/ProjecoesPage.test.tsx (modificado — 9 testes, +2 novos)
