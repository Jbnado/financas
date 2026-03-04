# Story 8.3: Comparativo de Ciclos e Busca Avançada

## Implementado

### CycleComparisonCard (Frontend)
- Componente que compara ciclo atual vs anterior
- Mostra diff de despesas e resultado líquido com indicadores visuais (setas + cores)
- Compara top 3 categorias com variação

### Busca Avançada de Transações (FR43)
- **Backend:** Novos filtros `personId` e `search` no `TransactionService.findAllByCycle()`
  - `personId`: filtra transações que contêm splits com essa pessoa
  - `search`: busca case-insensitive na descrição (Prisma `contains` + `mode: insensitive`)
- **Frontend:** `TransactionFilters` atualizado com:
  - Campo de busca por texto com debounce de 300ms
  - Dropdown de pessoa (usePersons hook)
  - Filtros existentes mantidos (categoria, meio de pagamento, status)

## Acceptance Criteria
- [x] AC1: Comparativo mostra despesas e resultado entre ciclos
- [x] AC2: Indicadores visuais de variação (verde para melhora, vermelho para piora)
- [x] AC3: Busca por texto na descrição da transação
- [x] AC4: Filtro por pessoa (via splits)
- [x] AC5: Filtros combináveis entre si
