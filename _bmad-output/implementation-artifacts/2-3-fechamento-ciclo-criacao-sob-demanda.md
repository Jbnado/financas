# Story 2.3: Fechamento de Ciclo e Criacao Sob Demanda (Backend + Frontend)

Status: pending

## Story

As a usuario,
I want fechar um ciclo e ter ciclos futuros criados automaticamente quando necessario,
So that meu historico fica registrado e parcelas futuras sempre tem um ciclo destino.

## Acceptance Criteria

1. **AC1:** POST `/api/billing-cycles/:id/close` muda status para "closed" e registra data de fechamento
2. **AC2:** Ciclo fechado nao pode ser editado (PUT retorna 400) — ja implementado na Story 2.1
3. **AC3:** Frontend: botao "Fechar Ciclo" no final do dashboard com Dialog de confirmacao ("Fechar ciclo [nome]? Esta acao nao pode ser desfeita.")
4. **AC4:** Ao confirmar fechamento, toast de sucesso "Ciclo fechado" e CycleSelector navega para o proximo ciclo (ou cria um se nao existir)
5. **AC5:** `BillingCycleService.ensureCycleExists(date)` cria ciclos automaticamente com datas sequenciais baseadas no padrao do ultimo ciclo
6. **AC6:** Ciclos criados sob demanda copiam o salario do ciclo anterior como default

## Tasks / Subtasks

- [ ] Task 1: Adicionar closedAt ao schema Prisma (AC: 1)
  - [ ] 1.1: Adicionar campo `closedAt DateTime?` ao model BillingCycle no schema.prisma
  - [ ] 1.2: Criar migration `npx prisma migrate dev --name add_closed_at_to_billing_cycle`
  - [ ] 1.3: Gerar Prisma client

- [ ] Task 2: Implementar endpoint de fechamento no backend (AC: 1, 2)
  - [ ] 2.1: Escrever testes (RED) para `close()` no service: fecha ciclo, seta closedAt, retorna 400 se ja fechado
  - [ ] 2.2: Adicionar metodo `close(userId, id)` ao BillingCycleService — altera status para 'closed', seta closedAt = now()
  - [ ] 2.3: Escrever testes (RED) para endpoint POST `/billing-cycles/:id/close` no controller
  - [ ] 2.4: Adicionar endpoint POST `/billing-cycles/:id/close` ao BillingCycleController com Swagger decorators
  - [ ] 2.5: Verificar testes passam (GREEN)

- [ ] Task 3: Implementar ensureCycleExists no backend (AC: 5, 6)
  - [ ] 3.1: Escrever testes (RED) para `ensureCycleExists(userId, date)`: cria ciclo se nao existe, retorna existente se ja tem, copia salario do anterior, calcula datas sequenciais
  - [ ] 3.2: Implementar `ensureCycleExists(userId, date)` no BillingCycleService:
    - Buscar ciclo que contem a data
    - Se existe, retornar
    - Se nao existe, buscar ultimo ciclo do usuario (por startDate desc)
    - Calcular datas do novo ciclo baseado no padrao (duracao do ultimo ciclo)
    - Criar ciclo com salario copiado do anterior (ou 0 se nao existir anterior)
  - [ ] 3.3: Verificar testes passam (GREEN)

- [ ] Task 4: Implementar fluxo de fechamento no frontend (AC: 3, 4)
  - [ ] 4.1: Criar hook `use-close-billing-cycle.ts` com useMutation para POST `/billing-cycles/:id/close`
  - [ ] 4.2: Escrever testes (RED) para botao "Fechar Ciclo" e Dialog de confirmacao
  - [ ] 4.3: Adicionar botao "Fechar Ciclo" no DashboardPage (abaixo do conteudo) — apenas para ciclo com status "open"
  - [ ] 4.4: Criar Dialog de confirmacao: "Fechar ciclo [nome]? Esta acao nao pode ser desfeita." com botoes Cancelar (ghost) e Fechar (destructive)
  - [ ] 4.5: Ao confirmar: chamar mutation, toast "Ciclo fechado", navegar para proximo ciclo (ou ciclo mais recente)
  - [ ] 4.6: Invalidar queries de billing-cycles apos fechamento
  - [ ] 4.7: Verificar testes passam (GREEN)

- [ ] Task 5: Verificacao final (AC: 1-6)
  - [ ] 5.1: Executar suite completa de testes backend — todos passando
  - [ ] 5.2: Executar suite completa de testes frontend — todos passando
  - [ ] 5.3: Verificar build TypeScript sem erros (backend + frontend)

## Dev Notes

### Contrato API (novo endpoint)
- POST `/api/billing-cycles/:id/close` → 200 + ciclo fechado com closedAt
- POST em ciclo ja fechado → 400 { statusCode: 400, message: "Ciclo ja esta fechado", error: "Bad Request" }

### ensureCycleExists — Logica de Criacao Sob Demanda
- Input: userId, targetDate
- Buscar ciclo que contem targetDate (startDate <= targetDate <= endDate)
- Se encontrar, retornar
- Se nao encontrar:
  - Buscar ultimo ciclo do usuario (ORDER BY startDate DESC LIMIT 1)
  - Calcular duracao do ultimo ciclo (endDate - startDate)
  - Criar novos ciclos sequenciais ate cobrir targetDate
  - Cada novo ciclo: startDate = dia seguinte ao endDate do anterior, endDate = startDate + duracao, salary = salary do anterior
  - Nome automatico: "Ciclo [Mes/Ano]" baseado na startDate

### Arquitetura Backend (de Story 2.1)
- Modulo existente: src/modules/billing-cycle/
- PrismaService injetado no BillingCycleService
- Global JwtAuthGuard — endpoints protegidos por padrao
- req.user = { id, email }
- Swagger decorators em controllers e DTOs
- Imports usam extensao .js

### Arquitetura Frontend (de Story 2.2)
- Feature: src/features/billing-cycle/
- TanStack Query para mutations
- Sonner para toasts
- Dialog (shadcn/ui) para confirmacao
- Invalidacao de queries apos mutation
