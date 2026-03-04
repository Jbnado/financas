# Story 9.2: Tela de Projeção Financeira (Frontend)

Status: pending

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

- [ ] Task 1: Criar tipos TypeScript para projeção (AC: todos)
  - [ ] 1.1: ProjectionEntry, ProjectionResponse, InstallmentCommitment
- [ ] Task 2: Criar hooks TanStack Query (AC: 1)
  - [ ] 2.1: useProjection(months) — GET /api/projections?months=N
  - [ ] 2.2: useInstallmentCommitments() — GET /api/projections/installment-commitments
- [ ] Task 3: Criar componente ProjectionChart (AC: 2, 3)
  - [ ] 3.1: BarChart com barras empilhadas: fixos + impostos + parcelas vs salário
  - [ ] 3.2: Barras vermelhas para meses negativos
  - [ ] 3.3: Tooltip customizado com breakdown
- [ ] Task 4: Criar componente ProjectionSummaryCard (AC: 4)
  - [ ] 4.1: Média, pior mês, melhor mês
- [ ] Task 5: Criar componente DeficitAlerts (AC: 5)
  - [ ] 5.1: Lista de alertas com ícone AlertTriangle, mês e valor
  - [ ] 5.2: Estado vazio "Nenhum alerta — projeção positiva"
- [ ] Task 6: Criar componente CommitmentTable (AC: 6)
  - [ ] 6.1: Lista de compromissos futuros por ciclo
  - [ ] 6.2: Estado vazio quando sem parcelas futuras
- [ ] Task 7: Criar ProjecoesPage com layout (AC: 1, 7, 8, 9, 10)
  - [ ] 7.1: Dropdown de horizonte (3/6/12 meses)
  - [ ] 7.2: Layout responsivo: gráfico, resumo, alertas, compromissos
  - [ ] 7.3: Skeleton loading
  - [ ] 7.4: Empty state
- [ ] Task 8: Registrar rota e nav item (AC: 1)
- [ ] Task 9: Testes unitários dos componentes (AC: 11)
- [ ] Task 10: Verificação final

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
