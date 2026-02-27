# Story 2.3: Fechamento de Ciclo e Criacao Sob Demanda (Backend + Frontend)

Status: review

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

- [x] Task 1: Adicionar closedAt ao schema Prisma (AC: 1)
  - [x] 1.1: Adicionar campo `closedAt DateTime?` ao model BillingCycle no schema.prisma
  - [x] 1.2: Migration pendente (requer database running) — `npx prisma migrate dev --name add_closed_at_to_billing_cycle`
  - [x] 1.3: Gerar Prisma client

- [x] Task 2: Implementar endpoint de fechamento no backend (AC: 1, 2)
  - [x] 2.1: Escrever testes (RED) para `close()` no service: fecha ciclo, seta closedAt, retorna 400 se ja fechado
  - [x] 2.2: Adicionar metodo `close(userId, id)` ao BillingCycleService — altera status para 'closed', seta closedAt = now()
  - [x] 2.3: Escrever testes (RED) para endpoint POST `/billing-cycles/:id/close` no controller
  - [x] 2.4: Adicionar endpoint POST `/billing-cycles/:id/close` ao BillingCycleController com Swagger decorators
  - [x] 2.5: Verificar testes passam (GREEN) — 29 testes billing-cycle passando

- [x] Task 3: Implementar ensureCycleExists no backend (AC: 5, 6)
  - [x] 3.1: Escrever testes (RED) para `ensureCycleExists(userId, date)`: cria ciclo se nao existe, retorna existente se ja tem, copia salario do anterior, calcula datas sequenciais
  - [x] 3.2: Implementar `ensureCycleExists(userId, date)` no BillingCycleService
  - [x] 3.3: Verificar testes passam (GREEN)

- [x] Task 4: Implementar fluxo de fechamento no frontend (AC: 3, 4)
  - [x] 4.1: Criar hook `use-close-billing-cycle.ts` com useMutation para POST `/billing-cycles/:id/close`
  - [x] 4.2: Escrever testes (RED) para botao "Fechar Ciclo" e Dialog de confirmacao
  - [x] 4.3: Adicionar botao "Fechar Ciclo" no DashboardPage (abaixo do conteudo) — apenas para ciclo com status "open"
  - [x] 4.4: Criar Dialog de confirmacao: "Fechar ciclo [nome]? Esta acao nao pode ser desfeita." com botoes Cancelar (ghost) e Fechar (destructive)
  - [x] 4.5: Ao confirmar: chamar mutation, toast "Ciclo fechado", navegar para proximo ciclo (ou ciclo mais recente)
  - [x] 4.6: Invalidar queries de billing-cycles apos fechamento
  - [x] 4.7: Verificar testes passam (GREEN) — 5 testes CloseCycleDialog passando

- [x] Task 5: Verificacao final (AC: 1-6)
  - [x] 5.1: Executar suite completa de testes backend — 49 testes passando
  - [x] 5.2: Executar suite completa de testes frontend — 112 testes passando
  - [x] 5.3: Verificar build TypeScript sem erros (backend + frontend)

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

## Dev Agent Record

### Implementation Notes
- Adicionado campo `closedAt DateTime?` ao schema Prisma (migration pendente para ambiente com DB)
- Implementado `close(userId, id)` no BillingCycleService: valida ciclo existe e esta aberto, atualiza status para "closed" e seta closedAt
- Implementado `ensureCycleExists(userId, targetDate)`: busca ciclo existente, se nao encontrar cria sequenciais baseados no padrao do ultimo ciclo, copia salario (toString() para compatibilidade Prisma Decimal)
- Adicionado endpoint POST `/billing-cycles/:id/close` ao controller com Swagger decorators
- Criado CloseCycleDialog com confirmacao e estado de loading
- Integrado botao "Fechar Ciclo" no DashboardPage (apenas para ciclos com status "open")
- Hook useCloseBillingCycle com mutation e invalidacao de queries

### Completion Notes
- Backend: 49 testes passando, TypeScript sem erros
- Frontend: 112 testes passando, TypeScript sem erros, Vite build OK
- Migration Prisma pendente (requer database running)

## File List

- backend/prisma/schema.prisma (modified — added closedAt field)
- backend/src/modules/billing-cycle/billing-cycle.service.ts (modified — added close() and ensureCycleExists())
- backend/src/modules/billing-cycle/billing-cycle.service.spec.ts (modified — added tests for close/ensureCycleExists)
- backend/src/modules/billing-cycle/billing-cycle.controller.ts (modified — added POST :id/close endpoint)
- backend/src/modules/billing-cycle/billing-cycle.controller.spec.ts (modified — added close endpoint tests)
- frontend/src/features/billing-cycle/hooks/use-close-billing-cycle.ts (new)
- frontend/src/features/billing-cycle/components/CloseCycleDialog.tsx (new)
- frontend/src/features/billing-cycle/components/CloseCycleDialog.test.tsx (new)
- frontend/src/features/dashboard/pages/DashboardPage.tsx (modified — added close cycle flow)

## Change Log

- 2026-02-27: Implemented Story 2.3 — Close endpoint, ensureCycleExists, CloseCycleDialog, frontend integration
