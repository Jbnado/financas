# Story 4.4: Formulario de Transacao (Frontend)

Status: done

## Story

As a usuario,
I want registrar um gasto pelo celular de forma rapida,
So that posso registrar despesas em menos de 30 segundos logo apos o gasto.

## Acceptance Criteria

1. **AC1:** FAB (+) abre Sheet (bottom drawer, ~80% da tela) com TransactionForm. Campo descricao tem autofocus
2. **AC2:** Campos visiveis: Descricao (texto), Valor (numerico com R$), Cartao (select com default), Categoria (select). Toggles colapsados: "Dividir com alguem", "Parcelar", "Observacao". Botao "Registrar" primary (gradient, full-width)
3. **AC3:** Inputs seguem padrao dark filled: background `#1e293b`, border `#334155`, rounded-12px
4. **AC4:** Campo Valor com teclado numerico (inputMode="decimal") e formato R$ com mascara
5. **AC5:** Toggle "Parcelar" expande com animacao (150ms) mostrando campo numero de parcelas e valor da parcela auto-calculado
6. **AC6:** Ao registrar: botao mostra loading, Sheet fecha com animacao, toast "Registrado — [descricao] R$ [valor]" com opcao "Desfazer" por 5s, lista atualiza via invalidacao TanStack Query
7. **AC7:** Erro de validacao: campos invalidos com border red `#fca5a5` e mensagem de erro. Formulario nao perde dados
8. **AC8:** Desktop (>= 768px): formulario abre como Dialog centralizado (max-width 480px)
9. **AC9:** React Hook Form gerencia estado. Validacao: descricao obrigatoria, valor > 0, categoria obrigatoria, cartao obrigatorio
10. **AC10:** Toggle "Dividir com alguem" presente mas sem funcionalidade (placeholder para Epic 5)

## Tasks / Subtasks

- [x] Task 1: Tornar FAB funcional (AC: 1, 8)
  - [x] 1.1: FAB atualizado para aceitar onClick callback
  - [x] 1.2: App.tsx com state para controlar abertura do TransactionForm
  - [x] 1.3: FAB onClick abre Sheet (mobile) ou Dialog (desktop) via TransactionFormWrapper

- [x] Task 2: Criar TransactionForm (AC: 2, 3, 4, 5, 9, 10)
  - [x] 2.1: Testes escritos (6 testes: campos, toggles, validação, loading, split placeholder)
  - [x] 2.2: TransactionForm com React Hook Form, CurrencyInput, collapsibles
  - [x] 2.3: Todos os 6 testes passando

- [x] Task 3: Criar TransactionSheet e TransactionDialog (AC: 1, 8)
  - [x] 3.1: TransactionFormWrapper com Sheet (mobile, bottom drawer 85vh)
  - [x] 3.2: TransactionFormWrapper com Dialog (desktop, max-width 480px)
  - [x] 3.3: useIsDesktop hook com matchMedia para detecção de viewport

- [x] Task 4: Integrar submit com API (AC: 6, 7)
  - [x] 4.1: TransactionFormWrapper integrado com useTransactions.createTransaction
  - [x] 4.2: Loading state no botão durante submit
  - [x] 4.3: Toast de sucesso com ação "Desfazer" (5s, chama deleteTransaction)
  - [x] 4.4: Toast de erro via hook (onError do mutation)
  - [x] 4.5: Invalidação automática via TanStack Query
  - [x] 4.6: Sheet/Dialog fecha após submit com sucesso

- [x] Task 5: Máscara monetária e cálculo de parcelas (AC: 4, 5)
  - [x] 5.1: currency.ts com formatCurrencyInput, parseCurrencyToDecimal, formatCurrency
  - [x] 5.2: CurrencyInput integrado no TransactionForm com inputMode="decimal"
  - [x] 5.3: Cálculo de valor por parcela exibido no collapsible "Parcelar"
  - [x] 5.4: 9 testes de currency passando

- [x] Task 6: Verificação final (AC: 1-10)
  - [x] 6.1: Frontend: 36 suites, 195 testes — todos passando
  - [x] 6.2: TypeScript build sem erros
  - [x] 6.3: Backend: 21 suites, 164 testes — sem regressões

## Dev Notes

### Layout do TransactionForm (Mobile)
```
[Sheet — ~80% altura]

  [X] Nova Transacao                     <- header com close

  Descricao *                            <- autofocus
  [___________________________]

  Valor *                                <- inputMode="decimal"
  [R$ 0,00___________________]

  Cartao *                               <- Select, default primeiro
  [v Nubank                  ]

  Categoria *                            <- Select
  [v Alimentacao             ]

  > Parcelar                             <- Collapsible toggle
  > Dividir com alguem                   <- Collapsible placeholder
  > Observacao                           <- Collapsible textarea

  [========= Registrar =========]        <- primary gradient button
```

### Mascara Monetaria
- inputMode="decimal" para teclado numerico no mobile
- Formato de exibicao: R$ 1.234,56 (Intl.NumberFormat pt-BR BRL)
- Armazenar internamente como string decimal: "1234.56"
- Enviar para API como string: "1234.56"

### Collapsible/Progressive Disclosure
- Usar Collapsible do shadcn/ui (Radix UI)
- Animacao de abertura: 150ms ease
- "Parcelar": ao expandir, mostra input "Numero de parcelas" (2-48) + texto "Valor por parcela: R$ X" (calculado)
- "Dividir com alguem": ao expandir, mostra texto placeholder "(funcionalidade disponivel em breve)"
- "Observacao": ao expandir, mostra textarea

### FAB Existente
- Componente em `src/shared/components/Fab.tsx`
- Ja renderizado no layout com icone + circular
- Precisa apenas adicionar onClick para abrir o formulario

### Toast com Desfazer
- Usar toast.success do Sonner (ja instalado)
- Formato: "Registrado — Supermercado Extra R$ 234,50"
- Acao "Desfazer" com timeout 5s — ao clicar, chama DELETE na transacao recem-criada
- Se usuario nao desfaz em 5s, toast some automaticamente

### Responsive: Sheet vs Dialog
- Mobile (< 768px): Sheet (bottom drawer) — padrao UX mobile
- Desktop (>= 768px): Dialog centralizado com max-width 480px
- Detectar via CSS media query ou hook useMediaQuery
- Ambos contem o mesmo TransactionForm internamente

### Selects de Categoria e Cartao
- Reusar hooks existentes: useCategories() e usePaymentMethods()
- Select de cartao: default para primeiro item da lista (mais usado)
- Select de categoria: sem default (usuario escolhe)
- Usar Select do shadcn/ui ou combobox nativo

### Depende de Stories 4.1 e 4.2
- Endpoint POST /api/transactions ja deve existir
- Hook useCreateTransaction ja deve existir (de Story 4.3)
- Esta story foca no FORMULARIO e UX de registro

### References
- [Source: epics.md#Epic 4 - Story 4.4]
- [Source: ux-design.md#TransactionForm]
- [Source: ux-design.md#FAB]
- [Source: ux-design.md#Progressive Disclosure]
- [Source: architecture.md#Frontend Patterns]

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Debug Log References
- Collapsible implementado com CSS grid-rows trick ao invés de @radix-ui/react-collapsible (não instalado)
- CurrencyInput usa digits internos (cents) para máscara, converte para decimal string no submit
- useIsDesktop hook usa window.matchMedia ao invés de dependência externa
- Toast de sucesso usa sonner com action.onClick para "Desfazer"

### Completion Notes List
- Todos os ACs atendidos (1-10)
- FAB wired to open Sheet/Dialog via App.tsx state
- TransactionForm com React Hook Form, validação, máscara monetária
- Collapsibles: Parcelar (com cálculo), Dividir (placeholder), Observação
- Responsive: Sheet no mobile (<768px), Dialog no desktop (>=768px)
- Toast "Registrado — {desc} {valor}" com ação Desfazer por 5s
- 15 testes novos (6 form + 9 currency utility)

### File List
- frontend/src/shared/components/Fab.tsx (modified — onClick prop)
- frontend/src/App.tsx (modified — formOpen state, TransactionFormWrapper)
- frontend/src/shared/utils/currency.ts (new)
- frontend/src/shared/utils/currency.test.ts (new — 9 tests)
- frontend/src/features/transaction/components/CurrencyInput.tsx (new)
- frontend/src/features/transaction/components/TransactionForm.tsx (new)
- frontend/src/features/transaction/components/TransactionForm.test.tsx (new — 6 tests)
- frontend/src/features/transaction/components/TransactionFormWrapper.tsx (new)
