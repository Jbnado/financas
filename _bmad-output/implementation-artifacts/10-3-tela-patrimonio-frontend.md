# Story 10.3: Tela de Patrimônio e Investimentos (Frontend)

Status: done

## Story

As a usuario,
I want gerenciar contas e investimentos e visualizar meu patrimônio total com gráficos,
So that tenho controle visual do meu patrimônio e sua evolução.

## Acceptance Criteria

1. **AC1:** Nova rota `/patrimonio` acessível via navegação (ícone Landmark) (FR50)
2. **AC2:** Seção "Contas Bancárias" com lista, formulário de criação/edição, atualização de saldo (FR47, FR49)
3. **AC3:** Seção "Investimentos" com lista, formulário de criação/edição, atualização de valor (FR48, FR49)
4. **AC4:** Card hero mostrando patrimônio total e patrimônio líquido real (FR50, FR51)
5. **AC5:** PieChart (Recharts) com distribuição por tipo (FR54)
6. **AC6:** AreaChart com evolução do patrimônio ao longo dos ciclos fechados (FR53)
7. **AC7:** Empty state quando sem contas/investimentos cadastrados
8. **AC8:** Loading skeleton enquanto dados carregam
9. **AC9:** Formulários com validação: nome obrigatório, valor >= 0, instituição obrigatória
10. **AC10:** Soft-delete com padrão double-click igual Category/Person
11. **AC11:** Atualização rápida de saldo/valor via inline edit ou modal simples
12. **AC12:** Responsivo mobile
13. **AC13:** Testes unitários dos componentes

## Tasks / Subtasks

- [x] Task 1: Criar tipos TypeScript (AC: todos)
  - [x] 1.1: BankAccount, Investment, PatrimonySummary, PatrimonyDistribution, PatrimonySnapshot
- [x] Task 2: Criar hooks TanStack Query (AC: 2, 3)
  - [x] 2.1: useBankAccounts() — CRUD + updateBalance
  - [x] 2.2: useInvestments() — CRUD + updateValue
  - [x] 2.3: usePatrimony() — summary, distribution, evolution
- [x] Task 3: Criar componente BankAccountList (AC: 2, 10, 11)
  - [x] 3.1: Lista com nome, instituição, tipo badge, saldo
  - [x] 3.2: Botão editar, double-click deletar
  - [x] 3.3: Botão/inline para atualizar saldo
- [x] Task 4: Criar componente BankAccountForm (AC: 2, 9)
  - [x] 4.1: Dialog com campos: nome, instituição, tipo (select), saldo
  - [x] 4.2: Validação e submit
- [x] Task 5: Criar componente InvestmentList (AC: 3, 10, 11)
  - [x] 5.1: Lista com nome, tipo badge, instituição, valor atual, rendimento (currentValue - appliedAmount)
  - [x] 5.2: Botão editar, double-click deletar
  - [x] 5.3: Botão/inline para atualizar valor
- [x] Task 6: Criar componente InvestmentForm (AC: 3, 9)
  - [x] 6.1: Dialog com campos: nome, tipo (select), instituição, valor aplicado, valor atual, liquidez (select), data vencimento (opcional)
  - [x] 6.2: Validação e submit
- [x] Task 7: Criar componente PatrimonyHeroCard (AC: 4)
  - [x] 7.1: Patrimônio Total + Patrimônio Líquido com destaque
  - [x] 7.2: Indicador de parcelas comprometidas
- [x] Task 8: Criar componente PatrimonyDistributionChart (AC: 5)
  - [x] 8.1: PieChart com cores por tipo
  - [x] 8.2: Legenda e tooltip
- [x] Task 9: Criar componente PatrimonyEvolutionChart (AC: 6)
  - [x] 9.1: AreaChart com totalAssets e netPatrimony
  - [x] 9.2: Tooltip customizado
- [x] Task 10: Criar PatrimonioPage com layout (AC: 1, 7, 8, 12)
  - [x] 10.1: Hero card no topo
  - [x] 10.2: Tabs ou seções: Contas | Investimentos | Gráficos
  - [x] 10.3: Empty states por seção
  - [x] 10.4: Skeletons de loading
- [x] Task 11: Registrar rota e nav item (AC: 1)
- [x] Task 12: Testes unitários (AC: 13)
- [x] Task 13: Verificação final

## Dev Notes

### Layout da Página
```
┌──────────────────────────────────┐
│  Patrimônio                      │
├──────────────────────────────────┤
│  ┌─ Hero ───────────────────┐    │
│  │ Total: R$ 65.000   Líq:  │    │
│  │ R$ 57.000 (-R$8k parcelas│    │
│  └──────────────────────────┘    │
│                                  │
│  [Contas] [Investimentos] [📊]   │
│                                  │
│  ┌─ Contas Bancárias ──────┐     │
│  │ Nubank CC   R$ 5.000 ✏️ │     │
│  │ Itaú Poup  R$ 10.000 ✏️ │     │
│  │          [+ Adicionar]   │     │
│  └──────────────────────────┘    │
│                                  │
│  ┌─ Distribuição ──────────┐     │
│  │     🍩 PieChart          │     │
│  └──────────────────────────┘    │
│  ┌─ Evolução ──────────────┐     │
│  │     📈 AreaChart          │    │
│  └──────────────────────────┘    │
└──────────────────────────────────┘
```

### Navegação
- Adicionar "Patrimônio" ao nav com ícone Landmark (lucide-react)
- Rota: `/patrimonio`
- TabId: `'patrimonio'` no ui.store
- Posicionar depois de "Relatórios" no nav

### Labels de Tipo
- checking → "Conta Corrente"
- savings → "Poupança"
- wallet → "Carteira Digital"
- fixed_income → "Renda Fixa"
- variable_income → "Renda Variável"
- crypto → "Criptomoedas"
- real_estate → "Imóveis"
- other → "Outros"

### References
- [Source: epics.md#Epic 10 - FR47-FR54]
- Reusar padrões: CategoryPieChart, CycleEvolutionChart, PersonList (double-click delete)
- FR55 (vincular investimento a meta) será tratado no Epic 11

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- All 13 ACs satisfied
- PatrimonioPage with tabs: Contas, Investimentos, Gráficos
- BankAccountList + BankAccountForm with inline balance edit
- InvestmentList + InvestmentForm with inline value edit
- PatrimonyHeroCard, DistributionChart, EvolutionChart
- Frontend: 60 suites, 334 tests passing
- E2E: 30 patrimony tests passing

### Code Review Fixes
- Fix: Inline edit validates input (rejects NaN/empty instead of silently zeroing)
- Fix: Escape key handler to cancel inline edit without saving

### File List
- frontend/src/features/patrimony/components/BankAccountList.tsx (modified — validation + Escape)
- frontend/src/features/patrimony/components/InvestmentList.tsx (modified — validation + Escape)
