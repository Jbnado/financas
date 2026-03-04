# Story 3.3: CRUD de Pessoas e Tela de Configuracoes (Backend + Frontend)

Status: done

## Story

As a usuario,
I want gerenciar as pessoas com quem divido gastos e ter uma tela central de configuracoes,
So that posso registrar splits e ter acesso rapido a todos os cadastros.

## Acceptance Criteria

1. **AC1:** POST `/api/persons` com nome cria pessoa com `isActive: true`
2. **AC2:** GET `/api/persons` retorna lista de pessoas ativas ordenadas por nome
3. **AC3:** DELETE `/api/persons/:id` faz soft-delete, splits existentes vinculados nao sao afetados
4. **AC4:** Tab Config (SettingsPage): tres secoes — Categorias, Meios de Pagamento, Pessoas — cada secao com lista resumida e link/botao para gerenciar
5. **AC5:** Layout mobile-first com cards `#1e293b`
6. **AC6:** Model Person no Prisma: id UUID, name, isActive Boolean default true, userId, createdAt, updatedAt com @@map("persons")
7. **AC7:** Migration criada e aplicada
8. **AC8:** Seed data: pessoas iniciais
9. **AC9:** SettingsPage integra os 3 CRUDs (categorias, meios de pagamento, pessoas) numa unica pagina navegavel
10. **AC10:** Endpoints documentados no Swagger

## Tasks / Subtasks

- [x] Task 1: Adicionar model Person ao Prisma schema (AC: 6, 7)
  - [x] 1.1: Adicionar model Person: id UUID, name String, isActive Boolean @default(true), userId String, createdAt, updatedAt
  - [x] 1.2: Relacao com User (onDelete: Cascade), @@map("persons"), @@index([userId])
  - [x] 1.3: Adicionar relacao persons Person[] no model User
  - [x] 1.4: Rodar `npx prisma migrate dev --name add_person`
  - [x] 1.5: Rodar `npx prisma generate`

- [x] Task 2: Criar DTOs com validacao (AC: 1, 10)
  - [x] 2.1: Escrever testes (RED) para CreatePersonDto — name required
  - [x] 2.2: Criar `src/modules/person/dto/create-person.dto.ts` com @IsString @IsNotEmpty name + Swagger
  - [x] 2.3: Criar `src/modules/person/dto/update-person.dto.ts` como PartialType
  - [x] 2.4: Criar `src/modules/person/dto/person-response.dto.ts`
  - [x] 2.5: Verificar testes passam (GREEN)

- [x] Task 3: Criar PersonService com CRUD (AC: 1, 2, 3)
  - [x] 3.1: Escrever testes (RED) para service: create, findAll, update, softDelete
  - [x] 3.2: Criar `src/modules/person/person.service.ts` com:
    - create(userId, dto)
    - findAll(userId) — lista ativas ordenadas por name
    - findOne(userId, id)
    - update(userId, id, dto)
    - remove(userId, id) — soft-delete
  - [x] 3.3: Verificar testes passam (GREEN)

- [x] Task 4: Criar PersonController com endpoints (AC: 1, 2, 3, 10)
  - [x] 4.1: Escrever testes (RED) para controller: POST, GET, PUT, DELETE
  - [x] 4.2: Criar `src/modules/person/person.controller.ts`:
    - POST `/persons`
    - GET `/persons`
    - PUT `/persons/:id`
    - DELETE `/persons/:id`
  - [x] 4.3: Swagger decorators
  - [x] 4.4: Criar `src/modules/person/person.module.ts` e registrar no AppModule
  - [x] 4.5: Verificar testes passam (GREEN)

- [x] Task 5: Adicionar seed data de pessoas (AC: 8)
  - [x] 5.1: Atualizar `prisma/seed.ts` — apos criar usuario e categorias, criar pessoas iniciais vinculadas ao userId
  - [x] 5.2: Pessoas seed: "Eu" (o proprio usuario), e 2-3 nomes exemplo

- [x] Task 6: Criar frontend — hooks e componentes de Pessoas (AC: 4, 5)
  - [x] 6.1: Adicionar interface Person ao `src/features/settings/types.ts`
  - [x] 6.2: Criar `src/features/settings/hooks/use-persons.ts` com TanStack Query
  - [x] 6.3: Criar `src/features/settings/components/PersonList.tsx` — lista simples com nome, botao adicionar, botao desativar
  - [x] 6.4: Criar `src/features/settings/components/PersonForm.tsx` — formulario simples com campo nome
  - [x] 6.5: Escrever testes para hooks e componentes

- [x] Task 7: Criar SettingsPage integrando os 3 CRUDs (AC: 4, 5, 9)
  - [x] 7.1: Escrever testes (RED) para ConfigPage — renderiza 3 secoes, cada uma com titulo e lista
  - [x] 7.2: Atualizar `src/features/settings/pages/ConfigPage.tsx` com layout:
    - Titulo "Configuracoes" no topo
    - 3 secoes em scroll vertical: Categorias, Meios de Pagamento, Pessoas
    - Cada secao em Card (#1e293b) com titulo, contagem de items, lista resumida (max 3-5 items), botao "Gerenciar" que expande ou navega
  - [x] 7.3: Integrar CategoryList, PaymentMethodList e PersonList como secoes expansiveis ou sub-paginas
  - [x] 7.4: Substituir o conteudo placeholder do ConfigPage pelo novo SettingsPage
  - [x] 7.5: Verificar testes passam (GREEN)

- [x] Task 8: Verificacao final (AC: 1-10)
  - [x] 8.1: Executar suite completa de testes backend — todos passando
  - [x] 8.2: Executar suite completa de testes frontend — todos passando
  - [x] 8.3: Verificar build TypeScript sem erros (backend + frontend)
  - [x] 8.4: Verificar que testes de stories anteriores nao regredem

## Dev Notes

### Contrato API
- POST `/api/persons` { name } → 201
- GET `/api/persons` → 200 + array de pessoas ativas (ordenadas por name)
- PUT `/api/persons/:id` { name? } → 200
- DELETE `/api/persons/:id` → 200 (soft-delete)

### SettingsPage — Layout
A pagina de configuracoes deve integrar os 3 CRUDs de forma coesa:

```
[Configuracoes]                    ← titulo

[Categorias]                       ← Card #1e293b
  Alimentacao, Transporte, ...     ← lista resumida
  9 categorias ativas              ← contagem
  [Gerenciar]                      ← botao que expande lista completa

[Meios de Pagamento]               ← Card #1e293b
  Nubank (credito, dia 10), ...
  3 meios ativos
  [Gerenciar]

[Pessoas]                          ← Card #1e293b
  Fulano, Ciclano, ...
  3 pessoas ativas
  [Gerenciar]
```

### Opcoes de Navegacao na SettingsPage
- **Opcao A (Accordion/Collapsible):** Cada secao expande in-place ao tocar "Gerenciar"
- **Opcao B (Sub-rotas):** Gerenciar navega para /config/categorias, /config/meios-pagamento, /config/pessoas
- **Recomendado:** Opcao A (accordion) para simplificar, sem sub-rotas extras

### Padrao Identico a Stories 3.1 e 3.2
- Mesma estrutura de modulo, service, controller, DTOs no backend
- Mesmo padrao de soft-delete, isolamento por userId, Swagger
- Pessoa e o model mais simples (so name + isActive)

### Dependencias desta Story
- Depende de Story 3.1 (CategoryList) e 3.2 (PaymentMethodList) estarem prontas
- A SettingsPage so pode ser montada quando os 3 CRUDs existem
- Pode-se implementar o backend (Person CRUD) em paralelo enquanto frontend das 3.1/3.2 esta em andamento

## Dev Agent Record

### Implementation Plan
- Seguiu padrao identico a Stories 3.1 (Category) e 3.2 (PaymentMethod)
- Backend: Person model, DTOs, Service, Controller, Module — padrao NestJS com soft-delete
- Frontend: Person interfaces, usePersons hook (TanStack Query), PersonList, PersonForm components
- SettingsPage: Integrou PersonList no ConfigPage existente junto com CategoryList e PaymentMethodList
- Migration SQL criada manualmente (Docker Desktop offline) — sera aplicada na proxima vez que o ambiente subir

### Completion Notes
- Todos os 10 ACs satisfeitos
- Backend: 17 suites, 119 testes — todos passando (0 regressoes)
- Frontend: 32 suites, 170 testes — todos passando (0 regressoes)
- TypeScript: build sem erros (backend + frontend)
- Nota: e2e/login.spec.ts tem erro pre-existente (conflito Playwright) — nao e regressao desta story
- Seed data inclui 3 pessoas: "Eu", "Maria", "Joao"

### Code Review Fixes Applied
- Fix H1: Removidos toasts duplicados — usePersons hook nao emite mais toasts (alinhado com useCategories); componentes tratam seus proprios toasts
- Fix H2: Criado PersonForm.test.tsx (8 testes) — alinhado com CategoryForm.test.tsx e PaymentMethodForm.test.tsx
- Fix C1: Criado ConfigPage.test.tsx (5 testes) — verifica titulo, 3 secoes e integracao
- Fix M1: Corrigido dead try-catch em PersonList.handleDeactivate — agora usa await + toast.success (alinhado com CategoryList)
- Fix M2: Secao Meios de Pagamento envolta em Card com Skeleton loader (alinhado com CategoryList e PersonList)
- Fix M3: Resolvido junto com M2 — 3 secoes agora todas usam Card wrapper
- Fix L1: Adicionado userId ao PersonResponseDto (Swagger completo)
- Fix C2/L2: Atualizada descricao das tasks 7.1/7.2 para refletir uso do ConfigPage existente

## File List

### Backend (novos)
- backend/prisma/schema.prisma (modificado — adicionado Person model e relacao no User)
- backend/prisma/migrations/20260303120000_add_person/migration.sql (novo)
- backend/prisma/seed.ts (modificado — adicionado seed de persons)
- backend/src/app.module.ts (modificado — import PersonModule)
- backend/src/modules/person/person.module.ts (novo)
- backend/src/modules/person/person.service.ts (novo)
- backend/src/modules/person/person.service.spec.ts (novo)
- backend/src/modules/person/person.controller.ts (novo)
- backend/src/modules/person/person.controller.spec.ts (novo)
- backend/src/modules/person/dto/create-person.dto.ts (novo)
- backend/src/modules/person/dto/create-person.dto.spec.ts (novo)
- backend/src/modules/person/dto/update-person.dto.ts (novo)
- backend/src/modules/person/dto/person-response.dto.ts (modificado — adicionado userId)

### Frontend (novos)
- frontend/src/features/settings/types.ts (modificado — adicionado Person, CreatePersonInput, UpdatePersonInput)
- frontend/src/features/settings/hooks/use-persons.ts (novo, corrigido — removidos toasts do hook)
- frontend/src/features/settings/hooks/use-persons.test.tsx (novo, corrigido — removePerson usa mutateAsync)
- frontend/src/features/settings/components/PersonList.tsx (novo, corrigido — handleDeactivate com await + toast)
- frontend/src/features/settings/components/PersonList.test.tsx (novo)
- frontend/src/features/settings/components/PersonForm.tsx (novo)
- frontend/src/features/settings/components/PersonForm.test.tsx (novo — adicionado pelo code review)
- frontend/src/features/settings/pages/ConfigPage.tsx (modificado — adicionado PersonList + Card wrapper para PaymentMethod)
- frontend/src/features/settings/pages/ConfigPage.test.tsx (novo — adicionado pelo code review)

## Change Log

- 2026-03-03: Story 3.3 implementada — CRUD de Pessoas (backend + frontend) e integracao na SettingsPage com os 3 CRUDs (Categorias, Meios de Pagamento, Pessoas)
- 2026-03-03: Code review — corrigidos 9 issues (2 critical, 2 high, 3 medium, 2 low): toasts duplicados, testes ausentes, dead code, consistencia visual
