# Story 5.3: Tela A Receber e SplitSection no Formulario (Frontend)

Status: review

## Story

As a usuario,
I want ver quem me deve na tela A Receber e dividir gastos pelo formulario de transacao,
So that controlo splits e cobrancas de forma visual e rapida.

## Acceptance Criteria

1. **AC1:** Tab A Receber mostra lista de PersonBalanceCards: avatar (inicial + cor), nome, saldo pendente total em verde #6ee7a0
2. **AC2:** Pessoas com saldo zero aparecem abaixo ou ocultas
3. **AC3:** Ao tocar em uma pessoa, abre detalhe com lista de receivables pendentes: descricao da transacao, valor, data
4. **AC4:** Botao "Marcar como pago" em cada receivable abre Dialog para pagar total ou valor parcial
5. **AC5:** Ao confirmar pagamento, toast "Pagamento de R$ [valor] registrado", receivable atualiza
6. **AC6:** Empty state: "Nenhum valor a receber" + "Divida um gasto para ver aqui"
7. **AC7:** Toggle "Dividir com alguem" no TransactionForm expande SplitSection: select de pessoa, campo de valor, "+ Adicionar pessoa"
8. **AC8:** "Minha parte: R$ [calculado]" atualiza em tempo real conforme splits sao adicionados
9. **AC9:** Validacao: soma dos splits nao pode exceder valor total da transacao
10. **AC10:** Hook `use-receivables.ts` com TanStack Query para receivables e summary

## Tasks / Subtasks

- [x] Task 1: Criar hook use-receivables (AC: 10)
  - [x] 1.1: Criar types.ts com interfaces
  - [x] 1.2: Criar `features/split/hooks/use-receivables.ts` com TanStack Query
  - [x] 1.3: Hook com getSummary, usePersonReceivables, createPayment, createSplits

- [x] Task 2: Criar AReceberPage com PersonBalanceCards (AC: 1, 2, 6)
  - [x] 2.1: Testes para AReceberPage (2 testes) e PersonBalanceCard (5 testes)
  - [x] 2.2: PersonBalanceCard com avatar (iniciais + cor hash), nome, saldo verde
  - [x] 2.3: AReceberPage com lista separada (pendentes acima, zero abaixo), empty state com icone
  - [x] 2.4: Testes passam (GREEN)

- [x] Task 3: Criar detalhe de receivables por pessoa (AC: 3, 4, 5)
  - [x] 3.1: ReceivablesList com lista de receivables pendentes
  - [x] 3.2: Botao "Pagar" abre Dialog com input de valor
  - [x] 3.3: Toast de confirmacao via hook
  - [x] 3.4: Navegacao voltar com seta

- [x] Task 4: Criar SplitSection no TransactionForm (AC: 7, 8, 9)
  - [x] 4.1: Testes para SplitSection (5 testes)
  - [x] 4.2: SplitSection com select pessoa, input valor, botao adicionar/remover
  - [x] 4.3: "Minha parte: R$ [calculado]" em tempo real
  - [x] 4.4: Validacao: soma splits > total mostra erro em vermelho
  - [x] 4.5: Substituido placeholder no TransactionForm
  - [x] 4.6: TransactionFormWrapper integrado com createSplits apos criar transacao
  - [x] 4.7: Testes passam (GREEN)

- [x] Task 5: Atualizar route test (AC: 1)
  - [x] 5.1: Teste de rota /a-receber atualizado para "A Receber"

- [x] Task 6: Verificacao final (AC: 1-10)
  - [x] 6.1: Frontend: 39 suites, 208 testes — todos passando
  - [x] 6.2: TypeScript build sem erros
  - [x] 6.3: Backend: 27 suites, 195 testes — zero regressoes

## Dev Notes

### Layout AReceberPage (Mobile)
```
[Header: A Receber]

[PersonBalanceCard]
  [JD]  Joao da Silva
        R$ 150,00                    <- verde #6ee7a0

[PersonBalanceCard]
  [MA]  Maria Alves
        R$ 75,50                     <- verde #6ee7a0

--- pessoas com saldo zero ---
[PersonBalanceCard]
  [PL]  Pedro Lima
        R$ 0,00                      <- muted
```

### Layout Detalhe Pessoa
```
[< Voltar]  Joao da Silva — R$ 150,00

[ReceivableItem]
  Supermercado Extra     R$ 100,00
  02/03/2026
  [Marcar como pago]

[ReceivableItem]
  Restaurante           R$ 50,00
  01/03/2026
  [Marcar como pago]
```

### SplitSection no TransactionForm
```
v Dividir com alguem              <- Collapsible expandido

  Pessoa         Valor
  [v Joao    ] [R$ 100,00]  [X]
  [v Maria   ] [R$ 50,00]   [X]

  [+ Adicionar pessoa]

  Minha parte: R$ 150,00          <- calculado: total - soma splits
```

### Componentes
- PersonBalanceCard.tsx — card com avatar, nome, saldo
- ReceivablesList.tsx — lista de receivables com botao pagar
- SplitSection.tsx — secao expandivel no form com inputs de split
- PaymentDialog.tsx — dialog para registrar pagamento (total ou parcial)

### Hooks
- use-receivables.ts — TanStack Query para summary, byPerson, createPayment

### References
- [Source: epics.md#Epic 5 - Story 5.3]
- [Source: ux-design-specification.md#A Receber]
- [Source: architecture.md#Frontend Patterns]

## Dev Agent Record

### Agent Model Used
claude-opus-4-6

### Completion Notes List
- Todos os 10 ACs satisfeitos
- AReceberPage com summary, PersonBalanceCards, detalhe por pessoa
- PersonBalanceCard com avatar colorido (hash do nome), iniciais, saldo verde #6ee7a0
- ReceivablesList com lista pendentes, Dialog pagamento total/parcial
- SplitSection funcional no TransactionForm: select pessoa, input valor, calculo minha parte
- TransactionFormWrapper integrado: cria splits apos criar transacao
- Empty state com icone HandCoins e CTA
- 12 testes novos no frontend (5 PersonBalanceCard + 5 SplitSection + 2 AReceberPage)

### File List
- frontend/src/features/split/types.ts (novo)
- frontend/src/features/split/hooks/use-receivables.ts (novo)
- frontend/src/features/split/components/PersonBalanceCard.tsx (novo)
- frontend/src/features/split/components/PersonBalanceCard.test.tsx (novo — 5 testes)
- frontend/src/features/split/components/ReceivablesList.tsx (novo)
- frontend/src/features/split/components/SplitSection.tsx (novo)
- frontend/src/features/split/components/SplitSection.test.tsx (novo — 5 testes)
- frontend/src/features/receivable/pages/AReceberPage.tsx (modificado — implementacao completa)
- frontend/src/features/receivable/pages/AReceberPage.test.tsx (novo — 2 testes)
- frontend/src/features/transaction/components/TransactionForm.tsx (modificado — SplitSection integrado)
- frontend/src/features/transaction/components/TransactionForm.test.tsx (modificado — teste split atualizado)
- frontend/src/features/transaction/components/TransactionFormWrapper.tsx (modificado — createSplits)
- frontend/src/routes/index.test.tsx (modificado — texto atualizado)
