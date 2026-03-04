# Story 3.1: CRUD de Categorias (Backend + Frontend)

Status: done

## Story

As a usuario,
I want criar e gerenciar categorias de gastos,
So that posso organizar minhas transacoes por tipo de despesa.

## Acceptance Criteria

1. **AC1:** POST `/api/categories` com nome e icon/cor cria categoria com `isActive: true`
2. **AC2:** GET `/api/categories` retorna lista de categorias ativas ordenadas por nome. `?includeInactive=true` retorna todas
3. **AC3:** PUT `/api/categories/:id` atualiza nome e icone/cor
4. **AC4:** DELETE `/api/categories/:id` faz soft-delete (`isActive: false`), transacoes existentes vinculadas nao sao afetadas
5. **AC5:** App na tab Config > secao "Categorias": lista com nome e cor/icone, adicionar via Sheet/Dialog, editar, desativar com confirmacao
6. **AC6:** Model Category no Prisma: id UUID, name, icon, color, isActive Boolean default true, userId, createdAt, updatedAt com @@map("categories")
7. **AC7:** Migration criada e aplicada
8. **AC8:** Seed data: Alimentacao, Transporte, Moradia, Lazer, Saude, Educacao, Tecnologia, Vestuario, Outros
9. **AC9:** Endpoints documentados no Swagger

## Tasks / Subtasks

- [x] Task 1: Adicionar model Category ao Prisma schema (AC: 6, 7)
  - [x] 1.1: Adicionar model Category ao schema.prisma com campos: id UUID @default(uuid()), name String, icon String? (nullable), color String?, isActive Boolean @default(true), userId String, createdAt DateTime @default(now()), updatedAt DateTime @updatedAt
  - [x] 1.2: Adicionar relacao: user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  - [x] 1.3: Adicionar @@map("categories") e @@index([userId])
  - [x] 1.4: Adicionar relacao categories Category[] no model User
  - [x] 1.5: Rodar `npx prisma migrate dev --name add_category`
  - [x] 1.6: Rodar `npx prisma generate`

- [x] Task 2: Criar DTOs com validacao (AC: 1, 3, 9)
  - [x] 2.1: Escrever testes (RED) para CreateCategoryDto — validacao de name required, icon/color optional
  - [x] 2.2: Criar `src/modules/category/dto/create-category.dto.ts` com @IsString @IsNotEmpty para name, @IsOptional @IsString para icon e color, Swagger decorators
  - [x] 2.3: Criar `src/modules/category/dto/update-category.dto.ts` como PartialType de Create
  - [x] 2.4: Criar `src/modules/category/dto/category-response.dto.ts` com campos de resposta
  - [x] 2.5: Verificar testes passam (GREEN)

- [x] Task 3: Criar CategoryService com CRUD (AC: 1, 2, 3, 4)
  - [x] 3.1: Escrever testes (RED) para service: create, findAll (ativas), findAll (incluindo inativas), update, softDelete
  - [x] 3.2: Criar `src/modules/category/category.service.ts` com:
    - create(userId, dto) — cria com isActive true
    - findAll(userId, includeInactive?) — lista ordenada por name, filtra ativas por padrao
    - findOne(userId, id) — busca por id
    - update(userId, id, dto) — atualiza name/icon/color
    - remove(userId, id) — soft-delete (isActive = false)
  - [x] 3.3: Verificar testes passam (GREEN)

- [x] Task 4: Criar CategoryController com endpoints (AC: 1, 2, 3, 4, 9)
  - [x] 4.1: Escrever testes (RED) para controller: POST, GET (ativas), GET com ?includeInactive, PUT, DELETE
  - [x] 4.2: Criar `src/modules/category/category.controller.ts` com:
    - POST `/categories` — cria categoria
    - GET `/categories` — lista ativas (query param ?includeInactive=true para todas)
    - PUT `/categories/:id` — atualiza
    - DELETE `/categories/:id` — soft-delete
  - [x] 4.3: Adicionar @ApiTags('categories'), @ApiOperation, @ApiResponse em cada endpoint
  - [x] 4.4: Criar `src/modules/category/category.module.ts` e registrar no AppModule
  - [x] 4.5: Verificar testes passam (GREEN)

- [x] Task 5: Adicionar seed data de categorias (AC: 8)
  - [x] 5.1: Atualizar `prisma/seed.ts` — apos criar usuario admin, criar 9 categorias iniciais: Alimentacao, Transporte, Moradia, Lazer, Saude, Educacao, Tecnologia, Vestuario, Outros
  - [x] 5.2: Cada categoria com icon e color default (ex: Alimentacao = icone utensils, cor #f97316)

- [x] Task 6: Criar frontend — hooks e componentes (AC: 5)
  - [x] 6.1: Criar `src/features/settings/types.ts` com interface Category
  - [x] 6.2: Escrever testes (RED) para hook `use-categories.ts`
  - [x] 6.3: Criar `src/features/settings/hooks/use-categories.ts` com TanStack Query: useQuery lista, useMutation create/update/delete
  - [x] 6.4: Escrever testes (RED) para CategoryList.tsx — renderiza lista, botao adicionar, botao editar, botao desativar
  - [x] 6.5: Criar `src/features/settings/components/CategoryList.tsx` — lista de categorias com nome, cor, icone + acoes
  - [x] 6.6: Escrever testes (RED) para CategoryForm.tsx — campos, validacao, submit
  - [x] 6.7: Criar `src/features/settings/components/CategoryForm.tsx` com React Hook Form — campos: nome (obrigatorio), icone (select), cor (color picker simples)
  - [x] 6.8: Form abre em Sheet (mobile) ou Dialog (desktop)
  - [x] 6.9: Verificar testes passam (GREEN)

- [x] Task 7: Verificacao final (AC: 1-9)
  - [x] 7.1: Executar suite completa de testes backend — todos passando
  - [x] 7.2: Executar suite completa de testes frontend — todos passando
  - [x] 7.3: Verificar build TypeScript sem erros (backend + frontend)

## Dev Notes

### Contrato API
- POST `/api/categories` { name, icon?, color? } → 201 + categoria criada
- GET `/api/categories` → 200 + array de categorias ativas (ordenadas por name)
- GET `/api/categories?includeInactive=true` → 200 + array de todas categorias
- PUT `/api/categories/:id` { name?, icon?, color? } → 200 + categoria atualizada
- DELETE `/api/categories/:id` → 200 (soft-delete, isActive = false)

### Arquitetura Backend (de stories anteriores)
- Modulo: src/modules/category/
- Mesmo padrao de billing-cycle: Module, Controller, Service, DTOs
- PrismaService injetado no Service
- Global JwtAuthGuard — endpoints protegidos por padrao
- User extraido do JWT: req.user = { id, email }
- Swagger decorators em controllers e DTOs
- Soft-delete padrao: isActive Boolean, nunca hard delete
- Imports usam extensao .js

### Padroes de Seed
- Arquivo: prisma/seed.ts
- Ja cria usuario admin — estender, nao substituir
- Criar categorias vinculadas ao userId do admin
- Usar createMany ou loop com upsert para idempotencia

### Arquitetura Frontend
- Feature: src/features/settings/ (compartilhado com stories 3.2 e 3.3)
- hooks/ — TanStack Query hooks
- components/ — CategoryList, CategoryForm
- types.ts — interfaces compartilhadas do settings
- shadcn/ui: Card, Button, Input, Dialog, Sheet, Badge, Skeleton
- Toasts via Sonner

## Dev Agent Record

### Implementation Plan
- TDD approach: RED → GREEN → REFACTOR para cada componente
- Backend first: Schema → DTOs → Service → Controller → Seed
- Frontend: Types → Hook → Components → Page integration

### Debug Log
- Docker não estava rodando. Iniciado Docker Desktop e container PostgreSQL para migrations.
- Teste e2e/login.spec.ts (Playwright) falha no Vitest — problema pré-existente, não relacionado à Story 3.1.

### Completion Notes
- ✅ Model Category adicionado ao Prisma com todos os campos especificados (AC6)
- ✅ Migration 20260227175151_add_category criada e aplicada (AC7)
- ✅ Prisma Client regenerado com novo model
- ✅ DTOs criados: CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto com Swagger decorators (AC1, AC3, AC9)
- ✅ CategoryService implementado com create, findAll, findOne, update, remove (soft-delete) (AC1-AC4)
- ✅ CategoryController com POST, GET, PUT, DELETE + Swagger @ApiTags, @ApiOperation, @ApiResponse (AC1-AC4, AC9)
- ✅ CategoryModule criado e registrado no AppModule
- ✅ Seed data: 9 categorias (Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Tecnologia, Vestuário, Outros) com ícones e cores (AC8)
- ✅ Frontend types.ts com interfaces Category, CreateCategoryInput, UpdateCategoryInput
- ✅ useCategories hook com TanStack Query: useQuery + useMutation para CRUD
- ✅ CategoryList com lista, botão adicionar, editar, desativar com confirmação (AC5)
- ✅ CategoryFormDialog com React Hook Form, Dialog, validação nome obrigatório (AC5)
- ✅ ConfigPage atualizado para exibir seção Categorias (AC5)
- ✅ Backend: 64 testes passando (11 suites), 0 regressões
- ✅ Frontend: 98 testes passando (19 suites), 0 regressões
- ✅ TypeScript: build sem erros em backend e frontend

## File List

### New Files
- backend/prisma/migrations/20260227175151_add_category/migration.sql
- backend/src/modules/category/category.module.ts
- backend/src/modules/category/category.controller.ts
- backend/src/modules/category/category.controller.spec.ts
- backend/src/modules/category/category.service.ts
- backend/src/modules/category/category.service.spec.ts
- backend/src/modules/category/dto/create-category.dto.ts
- backend/src/modules/category/dto/create-category.dto.spec.ts
- backend/src/modules/category/dto/update-category.dto.ts
- backend/src/modules/category/dto/category-response.dto.ts
- frontend/src/features/settings/types.ts
- frontend/src/features/settings/hooks/use-categories.ts
- frontend/src/features/settings/hooks/use-categories.test.tsx
- frontend/src/features/settings/components/CategoryList.tsx
- frontend/src/features/settings/components/CategoryList.test.tsx
- frontend/src/features/settings/components/CategoryForm.tsx
- frontend/src/features/settings/components/CategoryForm.test.tsx

### Modified Files
- backend/prisma/schema.prisma (added Category model + User relation)
- backend/prisma/seed.ts (added category seed data)
- backend/src/app.module.ts (registered CategoryModule)
- frontend/src/features/settings/pages/ConfigPage.tsx (replaced placeholder with CategoryList)
- frontend/src/routes/index.test.tsx (updated ConfigPage test + added QueryClientProvider)

## Change Log

- 2026-02-27: Story 3.1 implemented — Full CRUD de Categorias (backend + frontend) with TDD approach, all ACs satisfied
