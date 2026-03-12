# Story 4.2: Parcelas Automaticas (Backend)

Status: done

## Story

As a usuario,
I want registrar uma compra parcelada e ter todas as parcelas geradas automaticamente,
So that cada ciclo futuro ja tem a parcela registrada sem esforco manual.

## Acceptance Criteria

1. **AC1:** POST `/api/transactions` com `totalInstallments: 10` e valor R$ 4.000 cria transacao principal no ciclo atual como parcela 1/10 com valor R$ 400, mais 9 transacoes-filha nos ciclos futuros consecutivos
2. **AC2:** Cada parcela tem `installmentNumber` (1-10), `totalInstallments` (10) e `parentTransactionId` apontando para a transacao principal
3. **AC3:** Ciclos futuros nao existentes sao criados automaticamente via `BillingCycleService.ensureCycleExists(date)` (FR7)
4. **AC4:** GET `/api/transactions/:id` de parcela mostra installmentNumber e totalInstallments
5. **AC5:** DELETE da transacao principal exclui todas as parcelas futuras nao pagas. Parcelas ja pagas permanecem
6. **AC6:** InstallmentService encapsula a logica de geracao de parcelas
7. **AC7:** Valor da parcela calculado com precisao Decimal (valor total / numero de parcelas, ajustando centavos na ultima parcela)

## Tasks / Subtasks

- [x] Task 1: Criar InstallmentService (AC: 1, 2, 3, 6, 7)
  - [x] 1.1: Escrever testes (RED) para InstallmentService:
    - createInstallments(transaction, totalInstallments) — gera N parcelas distribuidas em ciclos futuros
    - calcular valor de cada parcela com Decimal (ajuste de centavos na ultima)
    - chamar ensureCycleExists para cada ciclo futuro
  - [x] 1.2: Criar `src/modules/transaction/installment.service.ts` com:
    - createInstallments(userId, parentTransaction, totalInstallments, billingCycleId) — calcula valor por parcela, identifica ciclos futuros, cria parcelas
    - Logica de distribuicao: valor total / N parcelas, primeira parcela fica com o resto dos centavos
    - Para cada parcela i (2..N): calcular data do proximo ciclo, chamar BillingCycleService.ensureCycleExists(date)
  - [x] 1.3: Verificar testes passam (GREEN)

- [x] Task 2: Integrar InstallmentService no TransactionService (AC: 1, 2, 5)
  - [x] 2.1: Escrever testes (RED) para TransactionService.create com totalInstallments
  - [x] 2.2: Modificar TransactionService.create:
    - Se dto.totalInstallments > 1: chamar InstallmentService.createInstallments
    - Transacao principal (parcela 1) fica no ciclo atual com installmentNumber=1
    - Parcelas 2..N sao criadas como transacoes-filha com parentTransactionId
  - [x] 2.3: Modificar TransactionService.remove:
    - Se transacao tem parentTransactionId null e totalInstallments > 1: deletar todas parcelas-filha onde isPaid=false
    - Parcelas ja pagas permanecem
  - [x] 2.4: Verificar testes passam (GREEN)

- [x] Task 3: Adicionar BillingCycleService.ensureCycleExists (AC: 3)
  - [x] 3.1: Escrever testes (RED) para ensureCycleExists(userId, date):
    - Se ciclo existe para a data → retorna o ciclo existente
    - Se ciclo nao existe → cria ciclo com datas baseadas no padrao do ultimo ciclo, salario copiado do anterior
  - [x] 3.2: Implementar ensureCycleExists no BillingCycleService existente
  - [x] 3.3: Exportar BillingCycleService do BillingCycleModule para uso no TransactionModule
  - [x] 3.4: Verificar testes passam (GREEN)

- [x] Task 4: Atualizar DTOs e Controller para parcelas (AC: 1, 2, 4)
  - [x] 4.1: Adicionar totalInstallments (opcional, Int, min 2, max 48) ao CreateTransactionDto
  - [x] 4.2: Garantir que GET /transactions/:id retorna installmentNumber e totalInstallments
  - [x] 4.3: Garantir que GET /billing-cycles/:cycleId/transactions inclui info de parcelas
  - [x] 4.4: Testes de controller atualizados

- [x] Task 5: Verificacao final (AC: 1-7)
  - [x] 5.1: Executar suite completa de testes backend — todos passando
  - [x] 5.2: Verificar build TypeScript sem erros
  - [x] 5.3: Verificar que testes de stories anteriores nao regredem

## Dev Notes

### Logica de Distribuicao de Parcelas
```
Exemplo: R$ 1.000,00 em 3 parcelas
- Base: 1000 / 3 = 333.33 (truncado 2 casas)
- Resto: 1000 - (333.33 * 3) = 1000 - 999.99 = 0.01
- Parcela 1: 333.34 (base + resto)
- Parcela 2: 333.33
- Parcela 3: 333.33
- Total: 1000.00 ✓
```

### Logica de Ciclos Futuros
- O ciclo atual tem startDate e endDate
- Proximo ciclo: startDate = ciclo anterior endDate + 1 dia, endDate = startDate + duracao do ciclo
- Usar a duracao do ciclo atual como base (tipicamente ~30 dias)
- ensureCycleExists verifica se ja existe ciclo cobrindo aquela data, se nao, cria

### Cascata de Delete
- DELETE da transacao principal (parentTransactionId == null):
  - Buscar todas parcelas-filha (parentTransactionId == transacao.id)
  - Filtrar apenas as nao pagas (isPaid == false)
  - Deletar em batch
  - Parcelas ja pagas permanecem orfas (referencia historica)

### Dependencias entre Modules
- TransactionModule precisa importar BillingCycleModule (para ensureCycleExists)
- BillingCycleModule precisa exportar BillingCycleService
- Usar forwardRef se houver dependencia circular

### Decimal Precision
- NUNCA usar JavaScript number para dividir valores monetarios
- Usar Prisma Decimal ou biblioteca decimal.js
- Truncar com 2 casas, nao arredondar

### Depende de Story 4.1
- Model Transaction ja deve existir no schema
- TransactionService ja deve ter CRUD basico
- Esta story ADICIONA logica de parcelas ao service existente

### References
- [Source: epics.md#Epic 4 - Story 4.2]
- [Source: architecture.md#Installment Logic]
- [Source: epics.md#FR7 - Criacao ciclos sob demanda]
- [Source: epics.md#FR15 - Transacao parcelada]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- ensureCycleExists ja existia no BillingCycleService (implementado em story anterior)
- BillingCycleModule ja exportava BillingCycleService
- Distribuicao de valores usa aritmetica em centavos (inteiros) para evitar erros de float

### Completion Notes List
- Todos os 7 ACs satisfeitos
- Backend: 21 suites, 161 testes — todos passando (0 regressoes)
- TypeScript: build sem erros
- InstallmentService: distributeAmount com aritmetica de centavos, createInstallments com ensureCycleExists
- TransactionService.create: detecta totalInstallments > 1, calcula valor da parcela 1, cria filhas em ciclos futuros
- TransactionService.remove: cascata ja implementada na Story 4.1 (deleteMany com isPaid: false)
- Task 3 ja estava implementada (ensureCycleExists + export)

### File List

#### Backend (novos/modificados)
- backend/src/modules/transaction/installment.service.ts (novo)
- backend/src/modules/transaction/installment.service.spec.ts (novo)
- backend/src/modules/transaction/transaction.service.ts (modificado — injecao de InstallmentService, logica de parcelas no create)
- backend/src/modules/transaction/transaction.service.spec.ts (modificado — adicionado mock de InstallmentService, testes de parcelas)
- backend/src/modules/transaction/transaction.module.ts (modificado — import BillingCycleModule, provide InstallmentService)

## Change Log

- 2026-03-03: Story 4.2 implementada — InstallmentService com distribuicao de centavos, integracao com TransactionService.create para geracao automatica de parcelas em ciclos futuros
- 2026-03-12: Code Review fix — (M1) Changed totalInstallments validation from @Min(1) to @Min(2) @Max(48) per spec. Added 3 boundary tests.
