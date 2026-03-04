# Story 10.3: Tela de Patrimônio e Investimentos (Frontend)

Status: pending

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

- [ ] Task 1: Criar tipos TypeScript (AC: todos)
  - [ ] 1.1: BankAccount, Investment, PatrimonySummary, PatrimonyDistribution, PatrimonySnapshot
- [ ] Task 2: Criar hooks TanStack Query (AC: 2, 3)
  - [ ] 2.1: useBankAccounts() — CRUD + updateBalance
  - [ ] 2.2: useInvestments() — CRUD + updateValue
  - [ ] 2.3: usePatrimony() — summary, distribution, evolution
- [ ] Task 3: Criar componente BankAccountList (AC: 2, 10, 11)
  - [ ] 3.1: Lista com nome, instituição, tipo badge, saldo
  - [ ] 3.2: Botão editar, double-click deletar
  - [ ] 3.3: Botão/inline para atualizar saldo
- [ ] Task 4: Criar componente BankAccountForm (AC: 2, 9)
  - [ ] 4.1: Dialog com campos: nome, instituição, tipo (select), saldo
  - [ ] 4.2: Validação e submit
- [ ] Task 5: Criar componente InvestmentList (AC: 3, 10, 11)
  - [ ] 5.1: Lista com nome, tipo badge, instituição, valor atual, rendimento (currentValue - appliedAmount)
  - [ ] 5.2: Botão editar, double-click deletar
  - [ ] 5.3: Botão/inline para atualizar valor
- [ ] Task 6: Criar componente InvestmentForm (AC: 3, 9)
  - [ ] 6.1: Dialog com campos: nome, tipo (select), instituição, valor aplicado, valor atual, liquidez (select), data vencimento (opcional)
  - [ ] 6.2: Validação e submit
- [ ] Task 7: Criar componente PatrimonyHeroCard (AC: 4)
  - [ ] 7.1: Patrimônio Total + Patrimônio Líquido com destaque
  - [ ] 7.2: Indicador de parcelas comprometidas
- [ ] Task 8: Criar componente PatrimonyDistributionChart (AC: 5)
  - [ ] 8.1: PieChart com cores por tipo
  - [ ] 8.2: Legenda e tooltip
- [ ] Task 9: Criar componente PatrimonyEvolutionChart (AC: 6)
  - [ ] 9.1: AreaChart com totalAssets e netPatrimony
  - [ ] 9.2: Tooltip customizado
- [ ] Task 10: Criar PatrimonioPage com layout (AC: 1, 7, 8, 12)
  - [ ] 10.1: Hero card no topo
  - [ ] 10.2: Tabs ou seções: Contas | Investimentos | Gráficos
  - [ ] 10.3: Empty states por seção
  - [ ] 10.4: Skeletons de loading
- [ ] Task 11: Registrar rota e nav item (AC: 1)
- [ ] Task 12: Testes unitários (AC: 13)
- [ ] Task 13: Verificação final

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
