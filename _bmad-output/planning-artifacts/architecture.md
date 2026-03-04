---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['prd.md']
workflowType: 'architecture'
project_name: 'financas'
user_name: 'Bernardo'
date: '2026-02-24'
lastStep: 8
status: 'complete'
completedAt: '2026-02-24'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Análise de Contexto do Projeto

### Visão Geral dos Requisitos

**Requisitos Funcionais:**

59 requisitos funcionais organizados em 13 domínios:

| Domínio | FRs | Qtd |
|---------|-----|-----|
| Autenticação | FR1-FR2 | 2 |
| Ciclos de Fatura | FR3-FR7 | 5 |
| Categorias | FR8-FR9 | 2 |
| Meios de Pagamento | FR10-FR11 | 2 |
| Pessoas | FR12-FR13 | 2 |
| Transações | FR14-FR22 | 9 |
| Splits e À Receber | FR23-FR29 | 7 |
| Gastos Fixos | FR30-FR34 | 5 |
| Impostos PJ | FR35-FR37 | 3 |
| Dashboard e Relatórios | FR38-FR43 | 6 |
| Projeção Financeira | FR44-FR46 | 3 |
| Patrimônio | FR47-FR55 | 9 |
| Metas Financeiras | FR56-FR59 | 4 |

O ciclo de fatura é a abstração central do sistema — quase todo domínio orbita em torno dele. Transações, parcelas, fixos, impostos, snapshots de patrimônio e projeções se vinculam a um ciclo.

**Requisitos Não-Funcionais:**

- **Performance:** Dashboard < 2s, API < 500ms, bundle < 500KB gzipped, navegação < 300ms
- **Segurança:** JWT com refresh, bcrypt/argon2, HTTPS, zero rotas públicas exceto login
- **Deploy:** Docker Compose único, volumes persistentes, pg_dump para backup
- **Dados:** Decimal (nunca float) para valores monetários, soft-delete com `is_active`, integridade referencial via foreign keys

**Escala e Complexidade:**

- Domínio primário: Full-stack web (SPA + API REST)
- Nível de complexidade: Médio — regras de negócio ricas, sem real-time, sem multi-tenancy, sem compliance regulatório
- Single-user, greenfield, 1 dev + AI-assisted
- Mobile-first como interface principal

### Restrições Técnicas e Dependências

**Stack definida no PRD:**

- Frontend: React + TypeScript + TailwindCSS (framework SSR/SSG a definir)
- Backend: NestJS + TypeScript, API REST
- Banco: PostgreSQL com ORM (Prisma ou TypeORM)
- Auth: JWT single-user com expiração e refresh
- Deploy: Docker Compose (frontend + backend + PostgreSQL)
- Sem real-time (fetch on demand)

**Decisões de modelagem confirmadas com o usuário:**

- Ciclos são criados proativamente quando parcelas precisam ser alocadas — parcelas nunca ficam "órfãs". Ao cadastrar uma transação de 10x, os próximos 10 ciclos são criados/verificados e as parcelas alocadas imediatamente.
- Salário é variável por ciclo (realidade de PJ), não configuração global. Cada ciclo tem seu próprio valor de salário como input.

### Preocupações Transversais Identificadas

1. **Ciclo de fatura como chave estrangeira universal** — quase toda entidade se vincula a um ciclo; é a entidade raiz do sistema
2. **Criação proativa de ciclos** — lógica de "ensure cycle exists" necessária ao cadastrar parcelas futuras (ex: `CycleService.ensureExists(date)`)
3. **Cálculo de gasto real via splits** — splits reduzem o valor efetivo do usuário nas somas e dashboards; qualquer soma de transações precisa considerar splits
4. **Parcelas distribuídas** — uma transação gera N registros em ciclos diferentes, todos vinculados à transação original
5. **Soft-delete** — categorias, pessoas e meios de pagamento nunca são excluídos, apenas desativados via `is_active`
6. **Precisão decimal** — todo cálculo monetário em Decimal com 2 casas, nunca float
7. **Autenticação obrigatória** — middleware global, nenhuma rota pública exceto login
8. **Salário variável por ciclo** — o resultado líquido é calculado a partir do salário informado em cada ciclo individual

## Avaliação de Starter Templates

### Domínio Tecnológico Primário

Full-stack web com frontend e backend separados (SPA + API REST), baseado na análise de requisitos do projeto.

### Preferências Técnicas (do PRD)

- **Linguagem:** TypeScript (frontend e backend)
- **Frontend:** React + TailwindCSS
- **Backend:** NestJS, API REST
- **Banco:** PostgreSQL
- **Deploy:** Docker Compose
- **Nível do dev:** Intermediário, 1 dev + AI-assisted

### Opções de Framework Frontend Avaliadas

| Critério | Vite + React | Next.js | Remix |
|----------|-------------|---------|-------|
| SEO necessário? | ❌ Não (app autenticado) | ✅ Forte em SSR/SEO | ✅ SSR nativo |
| SPA pura? | ✅ Ideal | ⚠️ Overhead desnecessário | ⚠️ Overhead |
| Bundle size | ✅ Menor | ⚠️ Maior (runtime server) | ⚠️ Médio |
| Dev speed (HMR) | ✅ Mais rápido | ✅ Bom | ✅ Bom |
| Complexidade | ✅ Mínima | ⚠️ Rotas server, middleware | ⚠️ Loaders, actions |
| Deploy Docker | ✅ Build estático (nginx) | ⚠️ Precisa Node server | ⚠️ Precisa Node server |
| PWA/Offline ready | ✅ Fácil (vite-plugin-pwa) | ⚠️ Mais complexo | ⚠️ Mais complexo |

### Opções de ORM Avaliadas

| Critério | Prisma 7 | TypeORM |
|----------|----------|---------|
| Type safety | ✅ Automática via schema | ⚠️ Manual, pode falhar |
| DX / Curva de aprendizado | ✅ Mais amigável | ⚠️ Mais íngreme |
| Migrations | ✅ Schema-first, simples | ⚠️ Mais verboso |
| Data browser | ✅ Prisma Studio incluso | ❌ Não tem |
| Projeto greenfield | ✅ Ideal | ✅ Funciona |
| Suporte a Decimal | ✅ Nativo | ✅ Nativo |

### Stack Selecionada

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Vite + React + TypeScript | Vite latest |
| Estilização | TailwindCSS | v4 |
| Backend | NestJS + TypeScript | v11 |
| ORM | Prisma | v7 |
| Banco | PostgreSQL | 16+ |
| Deploy | Docker Compose | — |

**Racional da seleção:**

- **Vite + React** ao invés de Next.js/Remix: App 100% autenticado, sem conteúdo público, sem necessidade de SSR/SEO. Vite entrega menor bundle, HMR mais rápido, e build estático que simplifica o Docker (nginx servindo arquivos). Mais fácil de transformar em PWA no futuro.
- **Prisma 7** ao invés de TypeORM: Projeto greenfield, single-dev, prioridade em DX e type safety. Schema-first facilita iteração rápida. Prisma Studio útil para debug de dados financeiros.
- **NestJS 11**: Arquitetura modular com DI nativo, padrão de mercado para APIs TypeScript, JSON logging melhorado na v11.

### Comandos de Inicialização

**Frontend:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss @tailwindcss/vite
```

**Backend:**
```bash
npx @nestjs/cli new backend --strict --package-manager npm
cd backend
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

### Decisões Arquiteturais Providas pelos Starters

**Frontend (Vite + React):**
- TypeScript strict mode
- ESM modules
- HMR com Fast Refresh
- Build otimizado com tree-shaking e code splitting automático
- Estrutura de projeto limpa e mínima

**Backend (NestJS 11):**
- Arquitetura modular (modules, controllers, services, providers)
- Dependency injection nativo
- TypeScript strict mode
- Jest pré-configurado para testes
- JSON logging melhorado

**ORM (Prisma 7):**
- Schema-first com `prisma/schema.prisma`
- Client gerado com type safety completa
- Migrations automáticas
- Prisma Studio para visualização de dados
- Suporte nativo a Decimal para valores monetários

### Preparação para Offline (Fase 3)

- **API idempotente:** Transações aceitam `id` gerado pelo client (UUID v4), permitindo retry sem duplicação
- **Camada de abstração no frontend:** Serviços de API isolados que futuramente podem ser substituídos por fila local + sync
- **Vite + PWA ready:** `vite-plugin-pwa` pode ser adicionado sem mudança de arquitetura
- **Sem impacto no MVP:** Apenas decisões de design que não bloqueiam a evolução futura

**Nota:** A inicialização do projeto usando estes comandos deve ser a primeira história de implementação.

## Decisões Arquiteturais Centrais

### Análise de Prioridade das Decisões

**Decisões Críticas (Bloqueiam Implementação):**

1. Validação de dados: class-validator + class-transformer
2. Autenticação JWT: Access token + Refresh token
3. Hashing de senha: Argon2
4. State management frontend: TanStack Query + Zustand
5. Componentes UI: shadcn/ui
6. Formulários: React Hook Form
7. Roteamento: React Router v7
8. HTTP client: fetch nativo em service layer

**Decisões Importantes (Moldam a Arquitetura):**

9. API docs: Swagger/OpenAPI via @nestjs/swagger
10. Erros: Exception filter global com formato padronizado
11. CORS: Origem do frontend apenas
12. Integração AI futura: MCP Server próprio, auth via API Key
13. Deploy: Oracle Cloud Free Tier, instância ARM única (4 vCPU, 24GB)
14. Proxy reverso: Nginx servindo frontend estático + proxy /api/*
15. SSL: Let's Encrypt com auto-renewal
16. CI/CD: GitHub Actions — build + deploy via SSH para Oracle Cloud
17. Logging: NestJS v11 JSON logging nativo
18. Backup: pg_dump agendável via cron
19. Gestão de secrets: GitHub Secrets + .env no .gitignore + secret scanning

**Decisões Adiadas (Pós-MVP):**

- Cache no backend (desnecessário para single-user)
- Versionamento de API (sem clientes externos)
- PWA/Offline (Fase 3, arquitetura preparada)
- MCP Server (Fase 3, API Key prevista)

### Arquitetura de Dados

**Validação:**
- class-validator + class-transformer como padrão NestJS
- ValidationPipe global nos controllers
- Decorators nos DTOs (@IsString(), @IsDecimal(), @Min(0))
- Validação automática e consistente em todos os endpoints

**Cache:**
- Adiado — PostgreSQL responde rápido o suficiente para single-user no MVP
- NestJS CacheModule disponível se necessário no futuro

### Autenticação e Segurança

**JWT — Dual Token Strategy:**
- Access token: Curta duração (15-30 min), enviado no header Authorization: Bearer
- Refresh token: Longa duração (7 dias), armazenado em httpOnly cookie
- Renovação transparente sem re-login

**Hashing:**
- Argon2 — mais moderno, vencedor da Password Hashing Competition, resistente a ataques GPU

**CORS:**
- Backend aceita requests apenas da origem do frontend configurada via env
- NestJS app.enableCors() com whitelist

**Auth para Integrações (Fase 3):**
- API Key como estratégia secundária (Guard separado no NestJS)
- Usado pelo futuro MCP Server para acessar a API
- Convive com JWT sem conflito (múltiplas strategies no Passport)

### API e Comunicação

**Documentação:**
- Swagger/OpenAPI via @nestjs/swagger
- Geração automática a partir dos DTOs e decorators
- Endpoint /api/docs interativo para desenvolvimento e debug

**Padrão de Erros:**
- Exception filter global com formato consistente: { statusCode, message, error }
- Erros de validação retornam detalhamento automático dos campos
- HTTP status codes semânticos (400 validação, 401 auth, 404 não encontrado, 500 interno)

**Versionamento:**
- Adiado — sem clientes externos, NestJS suporta nativamente (@Version) se necessário

**Integração AI Futura — MCP Server:**
- MCP Server próprio como camada sobre a API REST (substitui abordagem N8N + Telegram)
- Tools tipados e enxutos (add_transaction, get_cycle_summary, check_receivables, mark_as_paid)
- Consumo mínimo de tokens — schemas estruturados ao invés de docs extensos
- Auth via API Key dedicada
- Implementação na Fase 3

### Arquitetura Frontend

**State Management:**
- TanStack Query (React Query): Cache de dados do servidor, refetch, loading/error states
- Zustand: Estado local de UI (menus, filtros, preferências)
- Sem Redux — over-engineering para single-user

**Componentes UI:**
- shadcn/ui: Componentes acessíveis baseados em Radix UI + TailwindCSS
- Customizáveis (copiados para o projeto, não lib externa)
- Mobile-friendly por padrão

**Formulários:**
- React Hook Form: Performance, validação integrada
- Crítico para registro rápido de transações (meta < 30s no celular)

**Roteamento:**
- React Router v7: Lazy loading de rotas, padrão do ecossistema Vite + React

**HTTP Client:**
- fetch nativo encapsulado em service layer
- Interceptors de auth (adiciona JWT, trata 401)
- Error handling centralizado
- Camada de abstração preparada para futuro offline (substituível por fila local + sync)

### Infraestrutura e Deploy

**Produção — Oracle Cloud Free Tier:**
- Instância ARM única: Ampere A1 (4 vCPU, 24GB RAM)
- Always Free — sem custo
- Subdomínio: financas.seudominio.com.br → A record → IP da instância

**Desenvolvimento — Local:**
- docker-compose.dev.yml com hot reload (volumes montando código local)
- Testes executados localmente, sem ambiente HML remoto

**Docker Compose (Produção):**
```
docker-compose.yml
├── frontend  → Vite build → nginx (porta 80/443)
│              └── Reverse proxy /api/* → backend:3000
├── backend   → NestJS (porta 3000, rede interna)
└── postgres  → PostgreSQL 16 (porta 5432, rede interna, volume persistente)
```

**SSL:**
- Let's Encrypt com auto-renewal (certbot ou nginx-proxy companion)

**CI/CD:**
- GitHub Actions: Push na main → build imagens Docker → deploy via SSH no Oracle Cloud
- Secrets via GitHub Secrets (SSH key, host, credenciais banco, JWT secret)

**Logging:**
- NestJS v11 JSON logging nativo
- Logs acessíveis via docker-compose logs
- Sem stack de observabilidade (single-user, desnecessário)

**Backup:**
- pg_dump agendável via cron no host Oracle
- Volume nomeado para persistência do PostgreSQL

### Segurança — Repositório Público

**Regras invioláveis (repo público no GitHub):**

- `.env` no `.gitignore` — nunca commitado
- `.env.example` commitado com valores placeholder e comentário: `# ATENÇÃO: Nunca commitar valores reais`
- Zero secrets hardcoded no código
- Docker Compose referencia `.env` via env_file, nunca valores inline

**GitHub Actions:**
- Secrets configurados via GitHub Secrets (Settings → Secrets and Variables → Actions)
- SSH key, host, credenciais banco, JWT secret — tudo em GitHub Secrets
- Nunca expostos nos logs (GitHub mascara automaticamente)

**Frontend — Cuidado especial com envs:**
- Vite expõe apenas variáveis com prefixo `VITE_` ao client — tudo com esse prefixo é PÚBLICO no bundle
- Única env permitida no frontend: `VITE_API_URL` (URL pública da API)
- Nenhuma chave, token ou secret em variáveis `VITE_*`
- `.env.example` do frontend documenta: `# ATENÇÃO: Todas as VITE_* vars são PÚBLICAS no bundle final`

**Secrets a proteger:**
- Credenciais PostgreSQL (user/password)
- JWT secret + refresh secret
- API Key para futuro MCP Server
- SSH key do Oracle Cloud

**Detecção de vazamentos:**
- GitHub Secret Scanning ativo (gratuito para repos públicos)
- Pre-commit hook com gitleaks como camada extra local

### Análise de Impacto das Decisões

**Sequência de Implementação:**

1. Inicialização do projeto (starters frontend + backend)
2. Configuração Docker Compose (dev)
3. Schema Prisma + migrations iniciais
4. Auth (JWT + Argon2)
5. CRUD de entidades base (ciclos, categorias, meios de pagamento, pessoas)
6. Transações + parcelas + splits
7. Dashboard + relatórios
8. Swagger/OpenAPI
9. Docker Compose produção + nginx
10. CI/CD GitHub Actions + deploy Oracle Cloud

**Dependências entre Decisões:**

- Prisma schema → influencia todos os services do NestJS
- JWT auth → middleware global, precisa existir antes de qualquer endpoint protegido
- TanStack Query → define como o frontend consome toda a API
- Docker Compose → unifica o ambiente de dev desde o início
- Nginx reverse proxy → elimina problemas de CORS em produção

## Padrões de Implementação e Regras de Consistência

### Pontos de Conflito Identificados

18 áreas onde AI agents poderiam tomar decisões diferentes foram padronizadas para garantir código consistente e compatível.

### Padrões de Naming

**Banco de Dados (Prisma → PostgreSQL):**

- Models Prisma: PascalCase singular (`BillingCycle`, `Transaction`, `PaymentMethod`)
- Tabelas no banco: snake_case plural via `@@map` (`billing_cycles`, `transactions`, `payment_methods`)
- Colunas no banco: snake_case via `@map` (`billing_cycle_id`, `created_at`)
- Colunas no código: camelCase (`billingCycleId`, `createdAt`)
- Foreign keys: `billingCycleId` no código → `billing_cycle_id` no banco

**API REST:**

- Endpoints: kebab-case plural (`/api/billing-cycles`, `/api/payment-methods`)
- Parâmetros de rota: `/api/billing-cycles/:id` (`:id` como UUID)
- Query params: camelCase (`?categoryId=xxx&status=paid`)

**Código TypeScript (Backend):**

- Arquivos: kebab-case (`billing-cycle.service.ts`, `billing-cycle.controller.ts`)
- Classes: PascalCase (`BillingCycleService`, `BillingCycleController`)
- Funções/métodos: camelCase (`findByCycleId()`, `createTransaction()`)
- Variáveis: camelCase (`billingCycleId`, `totalAmount`)
- Constantes: UPPER_SNAKE_CASE (`MAX_INSTALLMENTS`, `JWT_EXPIRATION`)
- Interfaces/Types: PascalCase (`CreateTransactionDto`, `BillingCycleResponse`)

**Código TypeScript (Frontend):**

- Componentes React: PascalCase (`TransactionForm.tsx`, `BillingCycleCard.tsx`)
- Hooks: kebab-case com prefixo use- (`use-billing-cycles.ts`, `use-auth.ts`)
- Services/utils: kebab-case (`api.service.ts`, `format-currency.ts`)
- Stores Zustand: kebab-case com sufixo .store (`ui.store.ts`)

### Padrões de Estrutura

**Backend (NestJS) — Module per Feature:**

```
backend/src/
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   ├── dto/
│   │   │   └── login.dto.ts
│   │   └── auth.controller.spec.ts
│   ├── billing-cycle/
│   │   ├── billing-cycle.module.ts
│   │   ├── billing-cycle.controller.ts
│   │   ├── billing-cycle.service.ts
│   │   ├── dto/
│   │   │   ├── create-billing-cycle.dto.ts
│   │   │   └── update-billing-cycle.dto.ts
│   │   └── billing-cycle.service.spec.ts
│   ├── transaction/
│   ├── split/
│   ├── fixed-expense/
│   ├── tax/
│   ├── category/
│   ├── payment-method/
│   ├── person/
│   └── dashboard/
├── common/
│   ├── filters/          (exception filters globais)
│   ├── interceptors/     (logging, transform)
│   ├── decorators/       (custom decorators)
│   ├── guards/           (auth guard, api-key guard)
│   └── pipes/            (custom pipes)
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts
└── main.ts
```

- Testes co-localizados: `*.spec.ts` ao lado do arquivo testado
- DTOs em subpasta `dto/` dentro de cada module
- Código compartilhado em `common/`, nunca duplicado entre modules

**Frontend (React) — Feature-based:**

```
frontend/src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── hooks/
│   │   │   └── use-auth.ts
│   │   └── pages/
│   │       └── LoginPage.tsx
│   ├── billing-cycle/
│   ├── transaction/
│   ├── split/
│   ├── dashboard/
│   └── patrimony/        (Fase 2)
├── shared/
│   ├── components/       (Button, Modal, Layout — shadcn/ui)
│   ├── hooks/            (use-media-query, use-debounce)
│   ├── services/         (api.service.ts — fetch wrapper)
│   ├── stores/           (ui.store.ts — Zustand)
│   ├── types/            (tipos compartilhados)
│   └── utils/            (format-currency.ts, format-date.ts)
├── routes/
│   └── index.tsx         (definição de rotas React Router)
├── App.tsx
└── main.tsx
```

- Testes co-localizados: `*.test.tsx` ao lado do arquivo testado
- Cada feature é auto-contida: components, hooks, pages
- Compartilhado vai em `shared/`, nunca importar de uma feature para outra diretamente
- Pages são os componentes de rota (lazy loaded)

### Padrões de Formato

**Respostas da API:**

```
GET /recurso/:id     → objeto direto { id, name, ... }
GET /recurso         → array direto [{ id, name, ... }, ...]
GET /recurso?page=1  → { data: [...], total: 45, page: 1, limit: 20 }
POST /recurso        → objeto criado (201 Created)
PUT /recurso/:id     → objeto atualizado (200 OK)
DELETE /recurso/:id  → sem body (204 No Content)
```

**Formato de Erros (exception filter global):**

```json
{
  "statusCode": 400,
  "message": ["description must be a string", "amount must be a positive number"],
  "error": "Bad Request"
}
```

**Formatos de Dados:**

- Datas: ISO 8601 strings (`"2026-02-24T10:30:00Z"`)
- Dinheiro: String Decimal com 2 casas (`"7300.00"`, nunca `7300` ou float)
- IDs: UUID v4 (`"550e8400-e29b-41d4-a716-446655440000"`)
- Booleanos: `true`/`false` (nunca 0/1)
- Campos null: Incluídos na resposta (`"notes": null`), não omitidos
- JSON: camelCase em toda comunicação frontend ↔ backend

### Padrões de Processo

**Error Handling — Frontend:**

- Mutations (criar, editar, deletar): toast de confirmação (sucesso) ou toast de erro (falha) + invalidate query
- Queries (listar, buscar): skeleton/spinner (loading), componente inline com retry (erro), mensagem amigável (vazio)

**Error Handling — Backend:**

- Exceções de negócio via HttpException do NestJS (NotFoundException, BadRequestException, ConflictException)
- Exception filter global trata erros não capturados — nunca retornar stack trace em produção
- HTTP status codes semânticos: 400 validação, 401 auth, 404 não encontrado, 409 conflito, 500 interno

**Loading States:**

- TanStack Query provê: isLoading, isError, data — usar sempre
- Zustand para UI state: isSubmitting, isSidebarOpen
- Nunca estado de loading manual com useState para dados do servidor

**Validação — Três Camadas:**

- Frontend (React Hook Form): UX imediata, feedback visual
- Backend (class-validator): Fonte de verdade, nunca confiar no client
- Banco (Prisma + PostgreSQL): Integridade referencial, constraints
- Regra: validar em todas as camadas, backend é a que importa

**Autenticação — Fluxo Padrão:**

1. Login → backend retorna access token + refresh token (httpOnly cookie)
2. Cada request → header `Authorization: Bearer <access_token>`
3. Token expirou (401) → frontend automaticamente tenta refresh
4. Refresh falhou → redireciona para login
5. Service layer do frontend trata isso transparente para os componentes

### Diretrizes de Enforcement

**Todo AI Agent DEVE:**

- Seguir naming conventions exatamente como documentado (snake_case banco, camelCase código, kebab-case arquivos)
- Colocar código no módulo/feature correto, nunca criar pastas fora da estrutura definida
- Usar os padrões de resposta da API sem inventar wrappers alternativos
- Usar TanStack Query para dados do servidor, nunca useState + useEffect para fetch
- Validar em todas as três camadas (frontend, backend, banco)
- Nunca commitar secrets ou valores reais em .env

**Anti-Patterns (proibidos):**

- ❌ `useState` + `useEffect` para fetch de dados (usar TanStack Query)
- ❌ `axios` para HTTP (usar fetch nativo no service layer)
- ❌ Redux ou Context API para dados do servidor (usar TanStack Query)
- ❌ Tabelas no banco em camelCase (usar snake_case via @@map)
- ❌ Endpoints em camelCase ou singular (`/billingCycle` → usar `/billing-cycles`)
- ❌ Secrets em variáveis `VITE_*` (tudo com VITE_ é público)
- ❌ Testes em pasta separada `__tests__/` (co-localizar com o arquivo testado)
- ❌ Importar de uma feature para outra (usar `shared/`)

## Estrutura do Projeto e Limites Arquiteturais

### Estrutura Completa do Projeto

```
financas/
├── .github/
│   └── workflows/
│       └── deploy.yml                    # CI/CD GitHub Actions
├── .gitignore
├── .env.example                          # Referência de vars do Docker Compose
├── docker-compose.yml                    # Produção
├── docker-compose.dev.yml                # Desenvolvimento local
├── nginx/
│   ├── nginx.conf                        # Config produção (proxy + SSL)
│   └── nginx.dev.conf                    # Config dev (proxy sem SSL)
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example                      # DB_URL, JWT_SECRET, etc.
│   ├── Dockerfile                        # Multi-stage build
│   ├── prisma/
│   │   ├── schema.prisma                 # Schema único, todas as entidades
│   │   ├── migrations/                   # Histórico de migrations
│   │   └── seed.ts                       # Seed: categorias, pessoas iniciais
│   ├── src/
│   │   ├── main.ts                       # Bootstrap, Swagger, ValidationPipe global
│   │   ├── app.module.ts                 # Root module
│   │   ├── common/
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   └── logging.interceptor.ts
│   │   │   ├── decorators/
│   │   │   │   └── current-user.decorator.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── api-key.guard.ts      # Fase 3 (MCP)
│   │   │   └── pipes/
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   └── modules/
│   │       ├── auth/                     # FR1-FR2
│   │       │   ├── auth.module.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── strategies/
│   │       │   │   ├── jwt.strategy.ts
│   │       │   │   └── jwt-refresh.strategy.ts
│   │       │   ├── dto/
│   │       │   │   ├── login.dto.ts
│   │       │   │   └── token-response.dto.ts
│   │       │   └── auth.service.spec.ts
│   │       ├── billing-cycle/            # FR3-FR7
│   │       │   ├── billing-cycle.module.ts
│   │       │   ├── billing-cycle.controller.ts
│   │       │   ├── billing-cycle.service.ts
│   │       │   ├── dto/
│   │       │   │   ├── create-billing-cycle.dto.ts
│   │       │   │   └── update-billing-cycle.dto.ts
│   │       │   └── billing-cycle.service.spec.ts
│   │       ├── category/                 # FR8-FR9
│   │       │   ├── category.module.ts
│   │       │   ├── category.controller.ts
│   │       │   ├── category.service.ts
│   │       │   ├── dto/
│   │       │   └── category.service.spec.ts
│   │       ├── payment-method/           # FR10-FR11
│   │       │   ├── payment-method.module.ts
│   │       │   ├── payment-method.controller.ts
│   │       │   ├── payment-method.service.ts
│   │       │   ├── dto/
│   │       │   └── payment-method.service.spec.ts
│   │       ├── person/                   # FR12-FR13
│   │       │   ├── person.module.ts
│   │       │   ├── person.controller.ts
│   │       │   ├── person.service.ts
│   │       │   ├── dto/
│   │       │   └── person.service.spec.ts
│   │       ├── transaction/              # FR14-FR22
│   │       │   ├── transaction.module.ts
│   │       │   ├── transaction.controller.ts
│   │       │   ├── transaction.service.ts
│   │       │   ├── installment.service.ts  # Lógica de parcelas + ensure cycle
│   │       │   ├── dto/
│   │       │   │   ├── create-transaction.dto.ts
│   │       │   │   └── update-transaction.dto.ts
│   │       │   └── transaction.service.spec.ts
│   │       ├── split/                    # FR23-FR29
│   │       │   ├── split.module.ts
│   │       │   ├── split.controller.ts
│   │       │   ├── split.service.ts
│   │       │   ├── receivable.service.ts   # Lógica de "à receber"
│   │       │   ├── dto/
│   │       │   └── split.service.spec.ts
│   │       ├── fixed-expense/            # FR30-FR34
│   │       │   ├── fixed-expense.module.ts
│   │       │   ├── fixed-expense.controller.ts
│   │       │   ├── fixed-expense.service.ts
│   │       │   ├── dto/
│   │       │   └── fixed-expense.service.spec.ts
│   │       ├── tax/                      # FR35-FR37
│   │       │   ├── tax.module.ts
│   │       │   ├── tax.controller.ts
│   │       │   ├── tax.service.ts
│   │       │   ├── dto/
│   │       │   └── tax.service.spec.ts
│   │       └── dashboard/               # FR38-FR43
│   │           ├── dashboard.module.ts
│   │           ├── dashboard.controller.ts
│   │           ├── dashboard.service.ts
│   │           └── dashboard.service.spec.ts
│   └── test/
│       └── app.e2e-spec.ts              # E2E tests
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── .env.example                      # VITE_API_URL apenas
    ├── Dockerfile                        # Multi-stage: build → nginx
    ├── public/
    │   └── favicon.ico
    └── src/
        ├── main.tsx                      # Entry point
        ├── App.tsx                        # Router + providers (QueryClient, etc.)
        ├── index.css                     # TailwindCSS imports
        ├── routes/
        │   └── index.tsx                 # Definição de rotas (lazy loaded)
        ├── shared/
        │   ├── components/
        │   │   └── ui/                   # shadcn/ui components
        │   ├── hooks/
        │   │   ├── use-media-query.ts
        │   │   └── use-debounce.ts
        │   ├── services/
        │   │   └── api.service.ts        # fetch wrapper + auth interceptor
        │   ├── stores/
        │   │   └── ui.store.ts           # Zustand UI state
        │   ├── types/
        │   │   └── index.ts              # Tipos compartilhados
        │   └── utils/
        │       ├── format-currency.ts
        │       └── format-date.ts
        └── features/
            ├── auth/                     # FR1-FR2
            │   ├── components/
            │   │   └── LoginForm.tsx
            │   ├── hooks/
            │   │   └── use-auth.ts
            │   └── pages/
            │       └── LoginPage.tsx
            ├── billing-cycle/            # FR3-FR7
            │   ├── components/
            │   │   ├── BillingCycleCard.tsx
            │   │   ├── BillingCycleNav.tsx
            │   │   └── BillingCycleSummary.tsx
            │   ├── hooks/
            │   │   └── use-billing-cycles.ts
            │   └── pages/
            │       └── BillingCyclePage.tsx
            ├── transaction/              # FR14-FR22
            │   ├── components/
            │   │   ├── TransactionForm.tsx
            │   │   ├── TransactionList.tsx
            │   │   └── InstallmentBadge.tsx
            │   ├── hooks/
            │   │   └── use-transactions.ts
            │   └── pages/
            │       └── TransactionsPage.tsx
            ├── split/                    # FR23-FR29
            │   ├── components/
            │   │   ├── SplitForm.tsx
            │   │   ├── ReceivableList.tsx
            │   │   └── PersonDebtCard.tsx
            │   ├── hooks/
            │   │   └── use-receivables.ts
            │   └── pages/
            │       └── ReceivablesPage.tsx
            ├── fixed-expense/            # FR30-FR34
            │   ├── components/
            │   │   └── FixedExpenseList.tsx
            │   ├── hooks/
            │   │   └── use-fixed-expenses.ts
            │   └── pages/
            │       └── FixedExpensesPage.tsx
            ├── tax/                      # FR35-FR37
            │   ├── components/
            │   │   └── TaxList.tsx
            │   ├── hooks/
            │   │   └── use-taxes.ts
            │   └── pages/
            │       └── TaxesPage.tsx
            ├── dashboard/                # FR38-FR43
            │   ├── components/
            │   │   ├── DashboardSummary.tsx
            │   │   ├── CategoryBreakdown.tsx
            │   │   └── HealthIndicator.tsx
            │   ├── hooks/
            │   │   └── use-dashboard.ts
            │   └── pages/
            │       └── DashboardPage.tsx
            └── settings/                 # CRUD categorias, meios pgto, pessoas
                ├── components/
                │   ├── CategoryManager.tsx
                │   ├── PaymentMethodManager.tsx
                │   └── PersonManager.tsx
                ├── hooks/
                │   ├── use-categories.ts
                │   ├── use-payment-methods.ts
                │   └── use-persons.ts
                └── pages/
                    └── SettingsPage.tsx
```

### Mapeamento de Requisitos → Estrutura

| Domínio | FRs | Backend Module | Frontend Feature |
|---------|-----|---------------|-----------------|
| Autenticação | FR1-FR2 | `modules/auth/` | `features/auth/` |
| Ciclos de Fatura | FR3-FR7 | `modules/billing-cycle/` | `features/billing-cycle/` |
| Categorias | FR8-FR9 | `modules/category/` | `features/settings/` |
| Meios de Pagamento | FR10-FR11 | `modules/payment-method/` | `features/settings/` |
| Pessoas | FR12-FR13 | `modules/person/` | `features/settings/` |
| Transações | FR14-FR22 | `modules/transaction/` | `features/transaction/` |
| Splits e À Receber | FR23-FR29 | `modules/split/` | `features/split/` |
| Gastos Fixos | FR30-FR34 | `modules/fixed-expense/` | `features/fixed-expense/` |
| Impostos PJ | FR35-FR37 | `modules/tax/` | `features/tax/` |
| Dashboard | FR38-FR43 | `modules/dashboard/` | `features/dashboard/` |

### Limites Arquiteturais

**Fronteira de Rede (nginx como gateway):**

```
Client (Browser)
  → nginx (:80/:443)
    → /api/*  → backend:3000 (NestJS, rede Docker interna)
    → /*      → frontend estático (Vite build servido pelo nginx)
```

**Fronteira de Dados (fluxo request → banco):**

```
Frontend (TanStack Query)
  → fetch (api.service.ts)
    → NestJS Controller (valida DTO via class-validator)
      → NestJS Service (regras de negócio)
        → Prisma Client (queries tipadas)
          → PostgreSQL (rede Docker interna)
```

**Dependências entre Modules (Backend):**

- `auth` → independente, usado por todos via guard global
- `billing-cycle` → independente, entidade raiz do sistema
- `category`, `payment-method`, `person` → independentes, entidades de referência
- `transaction` → depende de `billing-cycle` (ensure cycle exists), `category`, `payment-method`
- `split` → depende de `transaction`, `person`
- `fixed-expense` → depende de `billing-cycle`
- `tax` → depende de `billing-cycle`
- `dashboard` → depende de `billing-cycle`, `transaction`, `split`, `fixed-expense`, `tax` (somente leitura)

**Regra de dependência:** Modules podem depender de Services de outros modules via DI do NestJS (imports no module). Dashboard é read-only — nunca altera dados de outros modules.

## Validação da Arquitetura

### Validação de Coerência ✅

**Compatibilidade de Decisões:**

Todas as combinações tecnológicas foram verificadas — zero conflitos identificados:

- Vite + React + TypeScript + TailwindCSS v4 — stack padrão
- shadcn/ui + TailwindCSS v4 + React Hook Form — integração nativa
- TanStack Query + Zustand — complementares, sem sobreposição
- React Router v7 + Vite — combinação padrão
- NestJS v11 + Prisma 7 + PostgreSQL 16 — integração oficial
- class-validator + NestJS ValidationPipe — integração nativa
- JWT (Passport) + NestJS Guards — padrão NestJS
- Docker Compose: nginx + NestJS + PostgreSQL — deploy bem estabelecido

**Consistência de Padrões:** Naming, estrutura e comunicação seguem convenções de cada ecossistema sem conflitos.

**Alinhamento Estrutural:** Estrutura de pastas suporta todas as decisões. Module-per-feature no backend espelha feature-based no frontend.

### Validação de Cobertura de Requisitos ✅

**Requisitos Funcionais MVP (Fase 1):**

| FRs | Domínio | Backend | Frontend | Status |
|-----|---------|---------|----------|--------|
| FR1-FR2 | Autenticação | modules/auth/ | features/auth/ | ✅ |
| FR3-FR7 | Ciclos de Fatura | modules/billing-cycle/ | features/billing-cycle/ | ✅ |
| FR8-FR9 | Categorias | modules/category/ | features/settings/ | ✅ |
| FR10-FR11 | Meios de Pagamento | modules/payment-method/ | features/settings/ | ✅ |
| FR12-FR13 | Pessoas | modules/person/ | features/settings/ | ✅ |
| FR14-FR22 | Transações + Parcelas | modules/transaction/ | features/transaction/ | ✅ |
| FR23-FR29 | Splits e À Receber | modules/split/ | features/split/ | ✅ |
| FR30-FR34 | Gastos Fixos | modules/fixed-expense/ | features/fixed-expense/ | ✅ |
| FR35-FR37 | Impostos PJ | modules/tax/ | features/tax/ | ✅ |
| FR38-FR43 | Dashboard | modules/dashboard/ | features/dashboard/ | ✅ |

**Requisitos Fase 2 (arquitetura não bloqueia):** FR39-FR41 gráficos, FR44-FR46 projeção, FR47-FR55 patrimônio, FR56-FR59 metas — todos extensíveis com novos modules/features.

**Requisitos Não-Funcionais:**

- Performance (dashboard < 2s, API < 500ms, bundle < 500KB): ✅ TanStack Query cache + Vite tree-shaking + PostgreSQL single-user
- Segurança (JWT + Argon2 + HTTPS + httpOnly cookies + CORS): ✅
- Deploy (Docker Compose + volumes + pg_dump): ✅
- Dados (Decimal + soft-delete + foreign keys): ✅

### Validação de Prontidão para Implementação ✅

- Todas as decisões críticas documentadas com versões e racional
- Padrões de implementação com exemplos concretos e anti-patterns
- Estrutura completa com mapeamento FR → arquivo
- Fluxo de autenticação documentado passo a passo
- Formatos de API com exemplos de request/response
- Limites arquiteturais e dependências entre modules claros

### Análise de Gaps

**Gaps Críticos:** Nenhum identificado.

**Gaps Menores (não bloqueiam MVP):**

1. Seed data — conteúdo específico (quais categorias, quais pessoas) a definir na implementação
2. Navegação mobile — tabs sugeridas: Dashboard, Transações, À Receber, Configurações
3. Modules Fase 2 — projection/ e goal/ adicionados quando necessário, estrutura extensível

### Checklist de Completude da Arquitetura

**✅ Análise de Requisitos**

- [x] Contexto do projeto analisado (59 FRs, 13 domínios)
- [x] Escala e complexidade avaliadas (média, single-user, greenfield)
- [x] Restrições técnicas identificadas (stack, deploy, auth)
- [x] Preocupações transversais mapeadas (8 concerns)

**✅ Decisões Arquiteturais**

- [x] Stack completa definida com versões verificadas
- [x] 19 decisões importantes documentadas com racional
- [x] Decisões adiadas explicitamente listadas com justificativa
- [x] Segurança para repo público detalhada (secrets, envs, scanning)

**✅ Padrões de Implementação**

- [x] Naming conventions (banco, API, código frontend/backend)
- [x] Padrões de estrutura (module-per-feature, feature-based)
- [x] Formatos de API (responses, erros, dados)
- [x] Padrões de processo (error handling, loading, validação, auth flow)
- [x] Anti-patterns proibidos documentados

**✅ Estrutura do Projeto**

- [x] Árvore completa com todos os arquivos e comentários FR
- [x] Mapeamento FR → módulo/feature em tabela
- [x] Limites arquiteturais documentados (rede, dados, modules)
- [x] Dependências entre modules mapeadas

### Avaliação Final de Prontidão

**Status:** PRONTA PARA IMPLEMENTAÇÃO

**Nível de Confiança:** Alto

**Pontos Fortes:**

- Stack coesa e moderna sem over-engineering
- Padrões claros que previnem conflitos entre AI agents
- Segurança bem pensada para repositório público
- Arquitetura extensível para Fases 2 e 3 sem refatoração
- Preparação para offline e MCP Server sem impacto no MVP

**Melhorias Futuras (pós-MVP):**

- Definir conteúdo do seed data durante implementação
- Adicionar modules de projeção e metas (Fase 2)
- Implementar MCP Server e PWA (Fase 3)

### Handoff para Implementação

**Diretrizes para AI Agents:**

- Seguir todas as decisões arquiteturais exatamente como documentado
- Usar padrões de implementação consistentemente em todos os componentes
- Respeitar estrutura do projeto e limites entre modules/features
- Consultar este documento para qualquer dúvida arquitetural

**Primeira Prioridade de Implementação:**

1. Inicializar projetos com os comandos de starter template
2. Configurar Docker Compose (dev)
3. Criar schema Prisma com models base
4. Implementar autenticação JWT
