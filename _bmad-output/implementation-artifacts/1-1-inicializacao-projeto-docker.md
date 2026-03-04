# Story 1.1: Inicializacao do Projeto e Docker Compose

Status: done

## Story

As a desenvolvedor,
I want inicializar o projeto com a stack definida e ambiente Docker funcionando,
so that tenho a base para desenvolver todas as funcionalidades.

## Acceptance Criteria

1. **AC1:** Frontend (Vite + React + TypeScript) criado em `/frontend` com TailwindCSS v4 configurado
2. **AC2:** Backend (NestJS + TypeScript) criado em `/backend` com Prisma 7 inicializado
3. **AC3:** Schema Prisma contem model User (id UUID, email, passwordHash, createdAt, updatedAt) com mapeamento snake_case via @@map
4. **AC4:** Migration inicial criada e aplicavel
5. **AC5:** `docker-compose.dev.yml` sobe frontend + backend + PostgreSQL com hot reload
6. **AC6:** `.env.example` existe na raiz, em `/backend` e em `/frontend` com valores placeholder
7. **AC7:** `.gitignore` exclui `.env`, `node_modules`, `dist`, `.prisma`
8. **AC8:** Estrutura de pastas segue o documento de arquitetura (modules/ no backend, features/ no frontend)
9. **AC9:** `npm run dev` funciona em ambos os projetos
10. **AC10:** Backend responde em `GET /api/health` com status 200

## Tasks / Subtasks

- [x] Task 1: Scaffold Backend NestJS Project (AC: 2, 8)
  - [x] 1.1: Inicializar projeto NestJS em `/backend` com `npx @nestjs/cli new backend --strict --package-manager npm`
  - [x] 1.2: Criar estrutura module-per-feature: `src/modules/`, `src/common/filters/`, `src/common/interceptors/`, `src/common/decorators/`, `src/common/guards/`, `src/common/pipes/`, `src/prisma/`
  - [x] 1.3: Instalar Prisma 7: `npm install prisma @prisma/client @prisma/adapter-pg pg --save` e `npm install tsx @types/pg --save-dev`
  - [x] 1.4: Criar `prisma.config.ts` na raiz do backend com defineConfig (schema path, migrations path, seed command, datasource URL via env)
  - [x] 1.5: Executar `npx prisma init` para criar schema.prisma e configurar datasource PostgreSQL
  - [x] 1.6: Criar `PrismaModule` e `PrismaService` em `src/prisma/` com configuracao de driver adapter pg
  - [x] 1.7: Criar `backend/.env.example` com placeholders: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN, PORT
  - [x] 1.8: Configurar global prefix `/api` em `main.ts`
  - [x] 1.9: Verificar build e compilacao TypeScript sem erros
- [x] Task 2: Configure Prisma Schema com User Model (AC: 3)
  - [x] 2.1: Definir model User no schema.prisma: id String @id @default(uuid()), email String @unique, passwordHash String, createdAt DateTime @default(now()), updatedAt DateTime @updatedAt
  - [x] 2.2: Configurar @@map("users") no model e @map snake_case em colunas: password_hash, created_at, updated_at
  - [x] 2.3: Configurar generator com provider "prisma-client", output explicito, moduleFormat "cjs"
  - [x] 2.4: Executar `npx prisma generate` e `npx prisma validate` — schema valido
- [x] Task 3: Implement Health Check Endpoint com Testes (AC: 10)
  - [x] 3.1: Escrever teste unitario (RED) para GET /api/health retornando { status: 'ok' } com 200
  - [x] 3.2: Criar `src/modules/health/health.module.ts` e `health.controller.ts` (GREEN)
  - [x] 3.3: Registrar HealthModule no AppModule
  - [x] 3.4: Executar testes — 1 passed, 0 failed
- [x] Task 4: Scaffold Frontend Vite + React + TypeScript (AC: 1, 8)
  - [x] 4.1: Criar projeto com `npm create vite@latest frontend -- --template react-ts`
  - [x] 4.2: Instalar TailwindCSS v4: `npm install tailwindcss @tailwindcss/vite`
  - [x] 4.3: Configurar `@tailwindcss/vite` plugin em `vite.config.ts` (ANTES de react plugin)
  - [x] 4.4: Substituir conteudo de `src/index.css` por `@import "tailwindcss";`
  - [x] 4.5: Criar estrutura feature-based: `src/features/`, `src/shared/components/`, `src/shared/hooks/`, `src/shared/services/`, `src/shared/stores/`, `src/shared/types/`, `src/shared/utils/`, `src/routes/`
  - [x] 4.6: Criar `frontend/.env.example` com `VITE_API_URL=http://localhost:3000/api`
  - [x] 4.7: Limpar boilerplate do Vite (App.tsx, App.css) e criar App.tsx minimo com TailwindCSS
  - [x] 4.8: Verificar build — TypeScript OK, Vite build OK (4.68 kB CSS, 193 kB JS gzipped 60 kB)
- [x] Task 5: Create Docker Compose Development Environment (AC: 5)
  - [x] 5.1: Criar `docker-compose.dev.yml` na raiz com 3 servicos: postgres (PostgreSQL 16-alpine, porta 5432, volume nomeado, healthcheck), backend (Node 20 Alpine, porta 3000, volume mount, depends_on postgres healthy), frontend (Node 20 Alpine, porta 5173, volume mount)
  - [x] 5.2: Criar `backend/Dockerfile.dev` e `frontend/Dockerfile.dev`
  - [x] 5.3: Criar `.dockerignore` em ambos os projetos
  - [x] 5.4: Configurar rede interna entre servicos e environment variables
  - [x] 5.5: Testar `docker compose up` — todos os 3 servicos rodando e saudaveis
- [x] Task 6: Create Initial Prisma Migration (AC: 4)
  - [x] 6.1: Executar `npx prisma migrate dev --name init` — migration `20260225072216_init` criada
  - [x] 6.2: Verificar migration SQL: CREATE TABLE "users" com snake_case, UUID PK, unique email
- [x] Task 7: Project-Level Configuration e Verificacao Final (AC: 6, 7, 9)
  - [x] 7.1: Criar `.env.example` na raiz com variaveis Docker Compose
  - [x] 7.2: Criar `.gitignore` na raiz (node_modules, dist, .env, generated, coverage)
  - [x] 7.3: Verificar frontend servindo em localhost:5173 e backend em localhost:3000
  - [x] 7.4: Verificar GET http://localhost:3000/api/health retorna `{"status":"ok"}`
  - [x] 7.5: Inicializar git repository

## Dev Notes

### Stack Tecnologica (versoes confirmadas)

- **Frontend:** Vite 7.3.1 + React 19 + TypeScript 5.7 + TailwindCSS v4
- **Backend:** NestJS v11.0.1 + TypeScript 5.7 strict
- **ORM:** Prisma 7.4.1 (Rust-free, TypeScript-based, CJS module format)
- **Banco:** PostgreSQL 16-alpine
- **Runtime:** Node.js 20 LTS (Alpine para Docker)

### Prisma 7 — Mudancas Criticas Aplicadas

1. `prisma.config.ts` na raiz do backend com `defineConfig`, `dotenv/config` importado
2. Generator provider: `"prisma-client"` com `moduleFormat = "cjs"` (compatibilidade NestJS)
3. Output: `../generated/prisma` (fora de node_modules)
4. Driver adapter: `@prisma/adapter-pg` + `pg` Pool no PrismaService
5. Import path: `../../generated/prisma/client.js` (nodenext module resolution)

### TailwindCSS v4 — Aplicado

1. Plugin Vite: `@tailwindcss/vite` (antes de react plugin)
2. CSS: `@import "tailwindcss";`
3. Sem tailwind.config.js

### Decisao Tecnica: Prisma moduleFormat CJS

O Prisma 7 gera ESM por default, mas NestJS compila para CJS. Adicionado `moduleFormat = "cjs"` no generator para compatibilidade. Sem isso, o backend falha em runtime com `exports is not defined in ES module scope`.

### References

- [Source: architecture.md#Comandos de Inicializacao]
- [Source: architecture.md#Padroes de Estrutura]
- [Source: architecture.md#Padroes de Naming]
- [Source: architecture.md#Seguranca — Repositorio Publico]
- [Source: architecture.md#Infraestrutura e Deploy]
- [Source: epics.md#Story 1.1]
- [Source: Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Prisma ESM/CJS issue: Generated Prisma client uses `import.meta.url` (ESM) which breaks when NestJS compiles to CJS. Fixed with `moduleFormat = "cjs"` in schema.prisma generator.
- Prisma init requires DATABASE_URL: `prisma init` fails if `prisma.config.ts` references env var that doesn't exist. Solution: create `.env` before running `prisma init`.
- Jest v30 flag change: `--testPathPattern` replaced by `--testPathPatterns` in Jest 30.

### Completion Notes List

- ✅ Task 1: Backend scaffolded — NestJS v11, Prisma 7, PrismaModule/Service with pg adapter
- ✅ Task 2: User model with UUID, @@map snake_case, migration-ready
- ✅ Task 3: Health endpoint TDD — 1 unit test passing, GET /api/health → 200
- ✅ Task 4: Frontend scaffolded — Vite + React + TS + TailwindCSS v4, feature-based structure
- ✅ Task 5: Docker Compose dev — 3 services (postgres, backend, frontend), all healthy
- ✅ Task 6: Migration `20260225072216_init` created and applied
- ✅ Task 7: .env.example (x3), .gitignore, git init, all verifications passed

### File List

- `backend/package.json` (new)
- `backend/package-lock.json` (new — auto-generated)
- `backend/tsconfig.json` (new)
- `backend/tsconfig.build.json` (new)
- `backend/nest-cli.json` (new)
- `backend/eslint.config.mjs` (new — NestJS scaffold)
- `backend/.prettierrc` (new — NestJS scaffold)
- `backend/.gitignore` (new — NestJS scaffold)
- `backend/README.md` (new — NestJS scaffold)
- `backend/prisma.config.ts` (new)
- `backend/.env` (new — local dev only, git-ignored)
- `backend/.env.example` (new)
- `backend/.dockerignore` (new)
- `backend/Dockerfile.dev` (new)
- `backend/prisma/schema.prisma` (new)
- `backend/prisma/migrations/20260225072216_init/migration.sql` (new)
- `backend/prisma/migrations/migration_lock.toml` (new — Prisma auto-generated)
- `backend/test/jest-e2e.json` (new — NestJS scaffold)
- `backend/test/app.e2e-spec.ts` (modified — updated to test /api/health)
- `backend/src/main.ts` (modified — added global prefix)
- `backend/src/app.module.ts` (modified — PrismaModule + HealthModule)
- `backend/src/prisma/prisma.module.ts` (new)
- `backend/src/prisma/prisma.service.ts` (new)
- `backend/src/modules/health/health.module.ts` (new)
- `backend/src/modules/health/health.controller.ts` (new)
- `backend/src/modules/health/health.controller.spec.ts` (new)
- `backend/src/common/{decorators,filters,guards,interceptors,pipes}/.gitkeep` (new)
- `frontend/package.json` (new)
- `frontend/package-lock.json` (new — auto-generated)
- `frontend/tsconfig.json` (new — Vite scaffold)
- `frontend/tsconfig.app.json` (new — Vite scaffold)
- `frontend/tsconfig.node.json` (new — Vite scaffold)
- `frontend/eslint.config.js` (new — Vite scaffold)
- `frontend/.gitignore` (new — Vite scaffold)
- `frontend/README.md` (new — Vite scaffold)
- `frontend/index.html` (new — Vite scaffold)
- `frontend/public/vite.svg` (new — Vite scaffold)
- `frontend/vite.config.ts` (modified — tailwindcss + react plugins)
- `frontend/.env.example` (new)
- `frontend/.dockerignore` (new)
- `frontend/Dockerfile.dev` (new)
- `frontend/src/index.css` (modified — @import "tailwindcss")
- `frontend/src/App.tsx` (modified — minimal TailwindCSS app)
- `frontend/src/main.tsx` (new — Vite boilerplate)
- `frontend/src/{features,routes}/.gitkeep` (new)
- `frontend/src/shared/{components,hooks,services,stores,types,utils}/.gitkeep` (new)
- `docker-compose.dev.yml` (new)
- `.env.example` (new)
- `.gitignore` (new)

### Change Log

- 2026-02-25: Story 1.1 implemented — full project initialization with NestJS v11, Prisma 7 (CJS), Vite + React + TailwindCSS v4, Docker Compose dev, health endpoint with test
- 2026-02-25: Code review fixes — e2e test updated, .gitkeep added, strict:true, DATABASE_URL validation, File List completed, tailwind moved to devDeps
