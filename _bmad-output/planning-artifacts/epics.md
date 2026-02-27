---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories-mvp']
inputDocuments: ['prd.md', 'architecture.md', 'ux-design-specification.md']
---

# financas - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for financas, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Autenticacao (2)**
- FR1: Usuario pode fazer login com credenciais (email/senha)
- FR2: Usuario pode manter sessao ativa entre visitas (token persistente)

**Ciclos de Fatura (5)**
- FR3: Usuario pode criar um ciclo de fatura com nome, data inicio, data fim e salario do periodo
- FR4: Usuario pode fechar um ciclo de fatura, impedindo novas edicoes
- FR5: Usuario pode navegar entre ciclos (anterior, proximo, lista)
- FR6: Usuario pode ver o resumo calculado do ciclo (salario - cartoes - fixos - impostos - metas + a receber = liquido)
- FR7: Sistema cria ciclos futuros sob demanda quando parcelas precisam ser alocadas

**Categorias (2)**
- FR8: Usuario pode criar, editar, desativar e listar categorias de gastos
- FR9: Sistema fornece categorias iniciais pre-cadastradas (seed)

**Meios de Pagamento (2)**
- FR10: Usuario pode criar, editar, desativar e listar meios de pagamento (cartao credito, debito)
- FR11: Cada meio de pagamento pode ter dia de vencimento associado

**Pessoas (2)**
- FR12: Usuario pode criar, editar, desativar e listar pessoas (para splits e a receber)
- FR13: Sistema fornece pessoas iniciais pre-cadastradas (seed)

**Transacoes (9)**
- FR14: Usuario pode registrar uma transacao com descricao, categoria, data, valor, meio de pagamento e ciclo de fatura
- FR15: Usuario pode registrar uma transacao parcelada informando numero total de parcelas e o sistema gera automaticamente todas as parcelas nos ciclos correspondentes
- FR16: Usuario pode marcar uma transacao como paga ou nao paga
- FR17: Usuario pode editar e excluir transacoes
- FR18: Usuario pode ver a lista de transacoes de um ciclo com filtro por categoria, cartao e status de pagamento
- FR19: Usuario pode visualizar o indicador de parcela ("3 de 10") em transacoes parceladas
- FR20: Usuario pode adicionar notas/observacoes a uma transacao
- FR21: Usuario pode adicionar tags a uma transacao
- FR22: Sistema pode sugerir categoria automaticamente com base no nome da transacao

**Splits e A Receber (7)**
- FR23: Usuario pode dividir uma transacao entre multiplas pessoas (por valor fixo ou percentual)
- FR24: Sistema valida que a soma dos splits e igual ao valor total da transacao
- FR25: Sistema gera automaticamente um registro de "a receber" para cada split de outra pessoa
- FR26: Usuario pode ver o total que cada pessoa deve (visao consolidada por pessoa)
- FR27: Usuario pode marcar um a receber como pago (total ou parcialmente)
- FR28: Usuario pode ver o historico de pagamentos de uma pessoa
- FR29: O gasto real do usuario em relatorios considera apenas a sua parte do split, nao o valor total

**Gastos Fixos (5)**
- FR30: Usuario pode cadastrar gastos fixos com nome, valor estimado, dia de vencimento
- FR31: Usuario pode registrar o valor real de um gasto fixo em cada ciclo
- FR32: Usuario pode comparar valor real vs estimado de cada gasto fixo
- FR33: Usuario pode ver o historico de variacao de gastos fixos ao longo dos ciclos
- FR34: Usuario pode marcar gasto fixo do ciclo como pago

**Impostos PJ (3)**
- FR35: Usuario pode cadastrar impostos com nome, taxa e valor estimado
- FR36: Usuario pode registrar o valor real de um imposto em cada ciclo
- FR37: Usuario pode marcar imposto do ciclo como pago

**Dashboard e Relatorios (6)**
- FR38: Usuario pode ver o resumo do ciclo atual na tela principal (resultado liquido, totais por categoria)
- FR39: Usuario pode ver grafico de distribuicao de gastos por categoria (pizza/barras)
- FR40: Usuario pode ver grafico de evolucao do resultado liquido ao longo dos ciclos
- FR41: Usuario pode comparar gastos do ciclo atual vs ciclo anterior
- FR42: Usuario pode ver indicador visual de saude financeira (positivo/negativo)
- FR43: Usuario pode buscar transacoes por periodo, categoria, cartao e pessoa

**Projecao Financeira (3)**
- FR44: Sistema pode projetar o resultado liquido dos proximos 3-6 ciclos com base em fixos + parcelas futuras + salario
- FR45: Sistema alerta quando a projecao indicar ciclo com resultado negativo
- FR46: Usuario pode ver quanto esta comprometido em parcelas futuras por ciclo

**Patrimonio (9)**
- FR47: Usuario pode cadastrar contas bancarias (nome, instituicao, tipo, saldo)
- FR48: Usuario pode cadastrar investimentos individuais (nome, tipo, instituicao, valor aplicado, valor atual, liquidez, vencimento opcional)
- FR49: Usuario pode atualizar manualmente o saldo de contas e valor de investimentos
- FR50: Usuario pode ver o patrimonio total (soma de contas + investimentos)
- FR51: Usuario pode ver o patrimonio liquido real (ativos - parcelas futuras comprometidas)
- FR52: Sistema grava snapshot automatico do patrimonio ao fechar cada ciclo
- FR53: Usuario pode ver a evolucao do patrimonio ao longo dos ciclos
- FR54: Usuario pode ver a distribuicao do patrimonio por tipo (corrente, investido, etc.)
- FR55: Usuario pode vincular um investimento a uma meta financeira

**Metas Financeiras (4)**
- FR56: Usuario pode definir metas de economia por categoria (ex: maximo R$500 em Ifood)
- FR57: Usuario pode definir meta de reserva de emergencia com valor alvo e tracking de progresso
- FR58: Usuario pode definir meta de poupanca mensal
- FR59: Usuario pode ver o progresso de cada meta em relacao ao objetivo

### NonFunctional Requirements

**NFR1 (Performance):** Dashboard do ciclo carrega em < 2 segundos
**NFR2 (Performance):** Registro de transacao (salvar) em < 500ms
**NFR3 (Performance):** Listagem de transacoes com filtros em < 1 segundo
**NFR4 (Performance):** Navegacao entre telas sem lag perceptivel (< 300ms)
**NFR5 (Performance):** Bundle frontend < 500KB (gzipped) para carregamento rapido em mobile

**NFR6 (Seguranca):** Autenticacao obrigatoria — nenhuma rota da API acessivel sem token valido
**NFR7 (Seguranca):** Senhas armazenadas com hash (Argon2)
**NFR8 (Seguranca):** Comunicacao via HTTPS em producao
**NFR9 (Seguranca):** Tokens JWT com expiracao (access 15-30min, refresh 7 dias)
**NFR10 (Seguranca):** Dados financeiros acessiveis apenas pelo usuario autenticado

**NFR11 (Infra/Deploy):** Deploy via Docker Compose com um unico docker-compose up
**NFR12 (Infra/Deploy):** Volumes persistentes para dados do PostgreSQL
**NFR13 (Infra/Deploy):** Variaveis de ambiente para configuracao (sem secrets em codigo)
**NFR14 (Infra/Deploy):** Backup do banco de dados viavel via pg_dump

**NFR15 (Dados):** Valores monetarios armazenados como Decimal com precisao de 2 casas (nunca float)
**NFR16 (Dados):** Soft-delete para entidades principais (categorias, pessoas, meios de pagamento) usando campo is_active
**NFR17 (Dados):** Integridade referencial garantida pelo banco (foreign keys)

### Additional Requirements

**Da Arquitetura:**
- Starter template: Vite + React + TypeScript + TailwindCSS v4 (frontend), NestJS v11 + Prisma 7 + PostgreSQL 16 (backend)
- Docker Compose para desenvolvimento local (hot reload) e producao (nginx + NestJS + PostgreSQL)
- Prisma schema-first com migrations automaticas e seed data
- JWT dual token strategy: access token (15-30min) + refresh token (7 dias, httpOnly cookie)
- Argon2 para hashing de senha
- class-validator + class-transformer para validacao de DTOs
- ValidationPipe global no NestJS
- TanStack Query para cache de dados do servidor + Zustand para estado de UI
- shadcn/ui (Radix UI + TailwindCSS) para componentes de interface
- React Hook Form para formularios
- React Router v7 com lazy loading de rotas
- fetch nativo encapsulado em service layer com interceptors de auth
- Swagger/OpenAPI via @nestjs/swagger em /api/docs
- Exception filter global com formato padronizado de erros
- CORS configurado apenas para origem do frontend
- Deploy em Oracle Cloud Free Tier (ARM, 4 vCPU, 24GB RAM)
- Nginx como reverse proxy (frontend estatico + proxy /api/*)
- Let's Encrypt com auto-renewal para SSL
- GitHub Actions para CI/CD (build + deploy via SSH)
- NestJS v11 JSON logging nativo
- pg_dump via cron para backup
- GitHub Secrets + .env no .gitignore + GitHub Secret Scanning
- Pre-commit hook com gitleaks para deteccao de vazamentos
- Frontend: VITE_API_URL como unica env publica
- Module-per-feature no backend, feature-based no frontend
- Padroes de naming: snake_case no banco (via @@map), camelCase no codigo, kebab-case em arquivos e endpoints
- Respostas API: objeto direto para GET/:id, array para GET, paginacao { data, total, page, limit } para listas
- Datas ISO 8601, dinheiro como string Decimal "7300.00", IDs UUID v4
- Validacao em 3 camadas: frontend (React Hook Form), backend (class-validator), banco (Prisma + PostgreSQL constraints)
- Ciclos criados proativamente ao cadastrar parcelas (nunca orfas)
- Salario variavel por ciclo (realidade PJ)
- API idempotente com UUID v4 gerado pelo client (preparacao offline)

**Do UX Design:**
- Dark mode como modo primario (Direcao B — Bold & Dark): fundo #0f172a, cards #1e293b
- FAB (Floating Action Button) 56px com gradient green-blue, sempre visivel, abre Sheet de transacao
- Bottom navigation com 4 tabs: Dashboard | Transacoes | A Receber | Config
- CycleSelector no topo com setas < > e label de datas do ciclo
- FinancialHeroCard no dashboard: saldo do ciclo em 44px bold com cor semaforica
- StatsRow: 3 colunas (Receita green, Despesa red, A Receber amber)
- Progressive disclosure: split, parcelas e observacoes colapsados por padrao (Collapsible)
- Sheet (bottom drawer) para formulario de transacao no mobile, Dialog no desktop
- Cores semaforicas exclusivas para significado financeiro: green #6ee7a0, red #fca5a5, amber #fcd34d
- Blue como cor primaria de acao (FAB, CTAs)
- Toast (Sonner) para feedback: sucesso 2s auto-dismiss, erro persistente, reversivel com "Desfazer" 5s
- Skeleton loading states para carregamento de tela
- Touch targets minimo 44x44px em mobile
- Fonte Inter com numeros tabulares (tabular-nums) para alinhamento de valores
- Formato monetario: R$ 1.234,56 com inputMode="decimal"
- Empty states com acao/CTA (nunca so texto)
- Optimistic updates quando possivel
- Undo over confirm — desfazer e melhor que confirmar
- lang="pt-BR" no HTML
- Acessibilidade WCAG 2.1 AA: contraste 4.5:1, foco visivel, skip link, ARIA
- 2 breakpoints: mobile < 768px (primario), desktop >= 768px
- Mobile: BottomNav + FAB + Sheet. Desktop: Sidebar + Dialog
- TransactionForm: descricao (autofocus) → valor (teclado numerico) → cartao (default) → categoria (auto-sugerida)
- PersonBalanceCard na tela A Receber com avatar, nome, saldo pendente
- InstallmentBadge ("3/10") em transacoes parceladas
- Registro de gasto simples em < 15s (maximo 5 taps + digitacao de 2 campos)
- Hierarquia de botoes: primary (gradient), secondary (border), ghost, destructive
- Dark mode toggle em Config, dark como default

### FR Coverage Map

FR1: Epic 1 — Login com credenciais (email/senha)
FR2: Epic 1 — Sessao ativa entre visitas (token persistente)
FR3: Epic 2 — Criar ciclo de fatura (nome, datas, salario)
FR4: Epic 2 — Fechar ciclo de fatura
FR5: Epic 2 — Navegar entre ciclos (anterior, proximo, lista)
FR6: Epic 2 — Resumo calculado do ciclo (salario - despesas = liquido)
FR7: Epic 2 — Criacao de ciclos futuros sob demanda (parcelas)
FR8: Epic 3 — CRUD categorias de gastos
FR9: Epic 3 — Categorias iniciais pre-cadastradas (seed)
FR10: Epic 3 — CRUD meios de pagamento
FR11: Epic 3 — Dia de vencimento por meio de pagamento
FR12: Epic 3 — CRUD pessoas (para splits)
FR13: Epic 3 — Pessoas iniciais pre-cadastradas (seed)
FR14: Epic 4 — Registrar transacao (descricao, categoria, data, valor, cartao, ciclo)
FR15: Epic 4 — Transacao parcelada com geracao automatica de parcelas
FR16: Epic 4 — Marcar transacao como paga/nao paga
FR17: Epic 4 — Editar e excluir transacoes
FR18: Epic 4 — Listar transacoes do ciclo com filtros
FR19: Epic 4 — Indicador de parcela ("3 de 10")
FR20: Epic 12 — Notas/observacoes em transacoes (Fase 2)
FR21: Epic 12 — Tags em transacoes (Fase 2)
FR22: Epic 12 — Sugestao automatica de categoria (Fase 2)
FR23: Epic 5 — Dividir transacao entre pessoas (valor fixo ou percentual)
FR24: Epic 5 — Validacao: soma splits = valor total
FR25: Epic 5 — Gerar "a receber" automatico por split
FR26: Epic 5 — Visao consolidada por pessoa (total devido)
FR27: Epic 5 — Marcar a receber como pago (total ou parcial)
FR28: Epic 5 — Historico de pagamentos por pessoa
FR29: Epic 5 — Gasto real considera apenas parte do usuario
FR30: Epic 6 — Cadastrar gastos fixos (nome, valor estimado, vencimento)
FR31: Epic 6 — Registrar valor real de gasto fixo por ciclo
FR32: Epic 6 — Comparar real vs estimado
FR33: Epic 6 — Historico de variacao de gastos fixos
FR34: Epic 6 — Marcar gasto fixo como pago
FR35: Epic 6 — Cadastrar impostos PJ (nome, taxa, valor estimado)
FR36: Epic 6 — Registrar valor real de imposto por ciclo
FR37: Epic 6 — Marcar imposto como pago
FR38: Epic 7 — Resumo do ciclo atual (resultado liquido, totais por categoria)
FR39: Epic 8 — Grafico distribuicao gastos por categoria (Fase 2)
FR40: Epic 8 — Grafico evolucao resultado liquido entre ciclos (Fase 2)
FR41: Epic 8 — Comparar gastos ciclo atual vs anterior (Fase 2)
FR42: Epic 7 — Indicador visual de saude financeira (positivo/negativo)
FR43: Epic 8 — Busca de transacoes por periodo, categoria, cartao, pessoa (Fase 2)
FR44: Epic 9 — Projecao resultado liquido 3-6 ciclos (Fase 2)
FR45: Epic 9 — Alerta de ciclo com resultado negativo (Fase 2)
FR46: Epic 9 — Comprometimento em parcelas futuras por ciclo (Fase 2)
FR47: Epic 10 — Cadastrar contas bancarias (Fase 2)
FR48: Epic 10 — Cadastrar investimentos individuais (Fase 2)
FR49: Epic 10 — Atualizar saldo de contas e investimentos (Fase 2)
FR50: Epic 10 — Ver patrimonio total (Fase 2)
FR51: Epic 10 — Patrimonio liquido real (ativos - parcelas futuras) (Fase 2)
FR52: Epic 10 — Snapshot automatico ao fechar ciclo (Fase 2)
FR53: Epic 10 — Evolucao do patrimonio ao longo dos ciclos (Fase 2)
FR54: Epic 10 — Distribuicao do patrimonio por tipo (Fase 2)
FR55: Epic 10 — Vincular investimento a meta financeira (Fase 2)
FR56: Epic 11 — Metas de economia por categoria (Fase 2)
FR57: Epic 11 — Meta de reserva de emergencia (Fase 2)
FR58: Epic 11 — Meta de poupanca mensal (Fase 2)
FR59: Epic 11 — Progresso de cada meta (Fase 2)

## Epic List

### Epic 1: Fundacao do Projeto e Autenticacao
O usuario pode fazer login no app e navegar pela estrutura base. Projeto inicializado com toda a infraestrutura (Docker, Prisma, app shell com BottomNav, FAB placeholder, routing, tema dark).
**FRs cobertos:** FR1, FR2
**NFRs cobertos:** NFR6-NFR10 (seguranca), NFR11-NFR14 (infra), NFR15-NFR17 (dados)
**Fase:** MVP
**Dependencias:** Nenhuma (epic raiz)

### Epic 2: Gestao de Ciclos de Fatura
O usuario pode criar, navegar entre e fechar ciclos de fatura — a unidade de tempo central do app. Inclui CycleSelector e criacao sob demanda.
**FRs cobertos:** FR3, FR4, FR5, FR6, FR7
**Fase:** MVP
**Dependencias:** Epic 1
**Paralelo com:** Epic 3

### Epic 3: Cadastros Basicos (Categorias, Meios de Pagamento, Pessoas)
O usuario pode gerenciar categorias de gastos, cartoes/meios de pagamento e pessoas para splits. Inclui seed data inicial e tela de Configuracoes.
**FRs cobertos:** FR8, FR9, FR10, FR11, FR12, FR13
**Fase:** MVP
**Dependencias:** Epic 1
**Paralelo com:** Epic 2

### Epic 4: Registro de Transacoes e Parcelas
O usuario pode registrar gastos (a vista ou parcelados), ver transacoes do ciclo com filtros, e visualizar indicador de parcela. Inclui TransactionForm com progressive disclosure, FAB funcional e InstallmentBadge.
**FRs cobertos:** FR14, FR15, FR16, FR17, FR18, FR19
**NFRs cobertos:** NFR2 (registro < 500ms), NFR3 (listagem < 1s)
**Fase:** MVP
**Dependencias:** Epic 2, Epic 3
**Paralelo com:** Epic 6

### Epic 5: Splits e A Receber
O usuario pode dividir gastos com outras pessoas, ver quem deve quanto (consolidado por pessoa), marcar pagamentos totais ou parciais, e ver historico. O gasto real nos relatorios considera apenas a parte do usuario.
**FRs cobertos:** FR23, FR24, FR25, FR26, FR27, FR28, FR29
**Fase:** MVP
**Dependencias:** Epic 4

### Epic 6: Gastos Fixos e Impostos PJ
O usuario pode cadastrar despesas recorrentes (aluguel, energia, internet) e impostos PJ, registrar valores reais por ciclo, comparar real vs estimado, e marcar como pago.
**FRs cobertos:** FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37
**Fase:** MVP
**Dependencias:** Epic 2
**Paralelo com:** Epic 4, Epic 5

### Epic 7: Dashboard do Ciclo
O usuario pode ver o resumo financeiro do ciclo atual na tela principal — resultado liquido, totais por categoria, indicador de saude financeira (verde/vermelho). Inclui FinancialHeroCard e StatsRow.
**FRs cobertos:** FR38, FR42
**NFRs cobertos:** NFR1 (dashboard < 2s)
**Fase:** MVP
**Dependencias:** Epic 2, Epic 4, Epic 5, Epic 6

### Epic 8: Graficos e Relatorios Avancados
O usuario pode visualizar graficos de distribuicao de gastos por categoria, evolucao do resultado liquido entre ciclos, comparativos, e buscar transacoes com filtros avancados.
**FRs cobertos:** FR39, FR40, FR41, FR43
**Fase:** Fase 2
**Dependencias:** Epic 7

### Epic 9: Projecao Financeira
O usuario pode ver a projecao dos proximos 3-6 ciclos com base em fixos + parcelas + salario, receber alertas de ciclos negativos, e ver comprometimento futuro.
**FRs cobertos:** FR44, FR45, FR46
**Fase:** Fase 2
**Dependencias:** Epic 2, Epic 4, Epic 6

### Epic 10: Patrimonio e Investimentos
O usuario pode rastrear contas bancarias e investimentos, ver patrimonio total e liquido real (descontando parcelas futuras), com snapshots automaticos ao fechar ciclo e evolucao ao longo do tempo.
**FRs cobertos:** FR47, FR48, FR49, FR50, FR51, FR52, FR53, FR54, FR55
**Fase:** Fase 2
**Dependencias:** Epic 2

### Epic 11: Metas Financeiras
O usuario pode definir metas de economia por categoria, meta de reserva de emergencia, meta de poupanca mensal, e acompanhar progresso de cada uma.
**FRs cobertos:** FR56, FR57, FR58, FR59
**Fase:** Fase 2
**Dependencias:** Epic 10

### Epic 12: Recursos Avancados de Transacao
O usuario pode adicionar notas e tags as transacoes e receber sugestoes automaticas de categoria com base no nome.
**FRs cobertos:** FR20, FR21, FR22
**Fase:** Fase 2
**Dependencias:** Epic 4

---

## Epic 1: Fundacao do Projeto e Autenticacao

O usuario pode fazer login no app e navegar pela estrutura base. Projeto inicializado com toda a infraestrutura (Docker, Prisma, app shell com BottomNav, FAB placeholder, routing, tema dark).

### Story 1.1: Inicializacao do Projeto e Docker Compose

As a desenvolvedor,
I want inicializar o projeto com a stack definida e ambiente Docker funcionando,
So that tenho a base para desenvolver todas as funcionalidades.

**Acceptance Criteria:**

**Given** o repositorio vazio
**When** executo os comandos de inicializacao
**Then** o frontend (Vite + React + TypeScript) esta criado em `/frontend` com TailwindCSS v4 configurado
**And** o backend (NestJS + TypeScript) esta criado em `/backend` com Prisma 7 inicializado
**And** o schema Prisma contem o model User (id UUID, email, passwordHash, createdAt, updatedAt) com mapeamento snake_case via @@map
**And** a migration inicial esta criada e aplicavel
**And** `docker-compose.dev.yml` sobe frontend + backend + PostgreSQL com hot reload
**And** `.env.example` existe na raiz, em `/backend` e em `/frontend` com valores placeholder
**And** `.gitignore` exclui `.env`, `node_modules`, `dist`, `.prisma`
**And** a estrutura de pastas segue o documento de arquitetura (modules/ no backend, features/ no frontend)
**And** `npm run dev` funciona em ambos os projetos
**And** o backend responde em `GET /api/health` com status 200

### Story 1.2: Autenticacao Backend (JWT + Argon2)

As a usuario,
I want fazer login com email e senha e receber tokens de acesso,
So that minhas rotas estejam protegidas e minha sessao persista entre visitas.

**Acceptance Criteria:**

**Given** o backend inicializado com Prisma e model User
**When** faco POST `/api/auth/login` com email e senha validos
**Then** recebo um access token JWT (expiracao 15-30min) no body da resposta
**And** recebo um refresh token (expiracao 7 dias) em cookie httpOnly
**And** a senha e verificada contra hash Argon2 armazenado no banco

**Given** um access token expirado e um refresh token valido
**When** faco POST `/api/auth/refresh`
**Then** recebo um novo access token e novo refresh token

**Given** nenhum token ou token invalido
**When** faco qualquer request para rotas protegidas
**Then** recebo 401 Unauthorized

**Given** o backend configurado
**When** acesso `/api/docs`
**Then** vejo a documentacao Swagger/OpenAPI com os endpoints de auth documentados

**And** existe um seed script (`prisma/seed.ts`) que cria o usuario admin com senha hashada em Argon2
**And** o auth guard JWT esta configurado como guard global no NestJS
**And** o ValidationPipe global esta ativo com class-validator
**And** o exception filter global retorna erros no formato padrao `{ statusCode, message, error }`
**And** CORS esta configurado para aceitar apenas a origem do frontend via env

### Story 1.3: App Shell Frontend e Tema Dark

As a usuario,
I want abrir o app e ver a estrutura de navegacao com tema dark,
So that posso navegar entre as secoes do app com interface moderna e mobile-first.

**Acceptance Criteria:**

**Given** o frontend inicializado
**When** abro o app no celular (< 768px)
**Then** vejo a BottomNav fixa com 4 tabs: Dashboard, Transacoes, A Receber, Config
**And** cada tab tem icone (20px) + label (10px)
**And** a tab ativa tem icone e label em verde `#6ee7a0`
**And** a BottomNav tem background `#1e293b` e height 56px com safe area padding

**Given** o app aberto
**When** navego entre as tabs
**Then** cada tab carrega sua pagina placeholder (texto "Em breve" ou similar)
**And** a navegacao e instantanea (sem animacao de transicao)
**And** a tab ativa atualiza visualmente

**Given** o app aberto no desktop (>= 768px)
**When** vejo a interface
**Then** a BottomNav e substituida por sidebar ou top nav

**And** o FAB (botao + flutuante) esta visivel no canto inferior direito, 56px circular, gradient green-blue, acima da BottomNav
**And** o FAB ainda nao tem acao funcional (placeholder)
**And** o tema dark esta aplicado: background `#0f172a`, cards `#1e293b`, texto `#f1f5f9`
**And** as CSS variables de cores semaforicas estao definidas (positive, negative, warning, neutral)
**And** shadcn/ui esta configurado com componentes base instalados (Button, Input, Card, Sheet, Toast/Sonner, Dialog, Skeleton, Badge)
**And** a fonte Inter esta configurada com `font-variant-numeric: tabular-nums`
**And** React Router v7 esta configurado com rotas lazy-loaded para cada pagina
**And** `lang="pt-BR"` esta no HTML
**And** Zustand store de UI esta criado (`ui.store.ts`)

### Story 1.4: Fluxo de Login Frontend

As a usuario,
I want fazer login no app com email e senha,
So that posso acessar minhas financas de forma segura.

**Acceptance Criteria:**

**Given** nao estou autenticado
**When** abro qualquer rota do app
**Then** sou redirecionado para a pagina de login

**Given** a pagina de login
**When** vejo o formulario
**Then** tem campos de email e senha com labels, validacao client-side (React Hook Form), e botao "Entrar" (primary, gradient, full-width)
**And** os inputs seguem o padrao dark filled: background `#1e293b`, border `#334155`, rounded-12px
**And** o foco muda border para `#6ee7a0`

**Given** credenciais validas
**When** submeto o formulario
**Then** o botao mostra loading state (disabled + spinner)
**And** apos sucesso, sou redirecionado ao Dashboard
**And** o access token e armazenado em memoria (nao localStorage)
**And** o refresh token e gerenciado via cookie httpOnly

**Given** credenciais invalidas
**When** submeto o formulario
**Then** vejo toast de erro persistente: "Email ou senha incorretos"
**And** o formulario nao perde os dados preenchidos

**Given** estou autenticado e o access token expira
**When** faco qualquer acao no app
**Then** o service layer tenta refresh automaticamente
**And** se refresh sucede, a acao original e retentada transparentemente
**And** se refresh falha, sou redirecionado para login

**And** o TanStack Query (QueryClient) esta configurado com defaults adequados
**And** o `api.service.ts` (fetch wrapper) inclui interceptor de auth (Bearer token) e tratamento de 401
**And** existe hook `use-auth.ts` com funcoes login, logout, isAuthenticated

## Epic 2: Gestao de Ciclos de Fatura

O usuario pode criar, navegar entre e fechar ciclos de fatura — a unidade de tempo central do app. Inclui CycleSelector e criacao sob demanda.

### Story 2.1: CRUD de Ciclos de Fatura (Backend)

As a usuario,
I want criar e gerenciar ciclos de fatura via API,
So that tenho a unidade de tempo central para organizar minhas financas.

**Acceptance Criteria:**

**Given** estou autenticado
**When** faco POST `/api/billing-cycles` com nome, dataInicio, dataFim e salario
**Then** um novo ciclo e criado com status "aberto"
**And** os valores monetarios sao armazenados como Decimal

**Given** um ciclo existente
**When** faco PUT `/api/billing-cycles/:id`
**Then** posso atualizar nome, dataInicio, dataFim e salario do ciclo
**And** nao posso editar um ciclo com status "fechado" (retorna 400)

**Given** ciclos existentes
**When** faco GET `/api/billing-cycles`
**Then** recebo a lista de ciclos ordenados por dataInicio descendente
**And** o formato segue o padrao de resposta da API (array direto)

**Given** um ciclo especifico
**When** faco GET `/api/billing-cycles/:id`
**Then** recebo o ciclo com resumo calculado: salario, total cartoes, total fixos, total impostos, total a receber, resultado liquido (FR6)
**And** totais sao zero quando nao ha transacoes ainda (preparado para futuros epics)

**And** o model BillingCycle no Prisma contem: id UUID, name, startDate, endDate, salary Decimal, status enum (open/closed), createdAt, updatedAt
**And** mapeamento snake_case via @@map (`billing_cycles`)
**And** migration criada e aplicada
**And** endpoints documentados no Swagger

### Story 2.2: Pagina de Ciclos e CycleSelector (Frontend)

As a usuario,
I want navegar entre ciclos e ver o ciclo atual no app,
So that sei em qual periodo estou visualizando minhas financas.

**Acceptance Criteria:**

**Given** o app aberto
**When** vejo o topo da pagina Dashboard ou Transacoes
**Then** o CycleSelector esta visivel com as datas do ciclo atual ("25/Jan — 24/Fev")
**And** tem setas < > para navegar entre ciclos
**And** o chip tem background `#1e293b`, border `#334155`, rounded-20px

**Given** o CycleSelector visivel
**When** toco na seta >
**Then** o proximo ciclo e carregado
**And** o label atualiza com as novas datas
**And** skeleton loading aparece enquanto carrega

**Given** estou no primeiro/ultimo ciclo
**When** vejo as setas
**Then** a seta sem proximo/anterior esta desabilitada

**Given** nenhum ciclo existe
**When** abro o app
**Then** vejo empty state com CTA "Criar primeiro ciclo"

**And** existe hook `use-billing-cycles.ts` com TanStack Query para fetch/cache dos ciclos
**And** a pagina de ciclos permite criar novo ciclo via formulario (Dialog/Sheet)
**And** o formulario tem campos: nome, data inicio, data fim, salario com validacao
**And** campo de salario usa formato monetario R$ com inputMode="decimal"

### Story 2.3: Fechamento de Ciclo e Criacao Sob Demanda (Backend + Frontend)

As a usuario,
I want fechar um ciclo e ter ciclos futuros criados automaticamente quando necessario,
So that meu historico fica registrado e parcelas futuras sempre tem um ciclo destino.

**Acceptance Criteria:**

**Given** um ciclo aberto
**When** faco POST `/api/billing-cycles/:id/close`
**Then** o status muda para "fechado"
**And** nao e mais possivel editar o ciclo (PUT retorna 400)
**And** a data de fechamento e registrada

**Given** um ciclo aberto no frontend
**When** toco em "Fechar Ciclo" (botao no final do dashboard)
**Then** um Dialog de confirmacao aparece: "Fechar ciclo [nome]? Esta acao nao pode ser desfeita."
**And** ao confirmar, o ciclo e fechado
**And** toast de sucesso: "Ciclo fechado"
**And** o CycleSelector navega para o proximo ciclo (ou cria um se nao existir)

**Given** uma operacao que precisa alocar parcelas em ciclos futuros (FR7)
**When** o sistema verifica os ciclos necessarios
**Then** ciclos sao criados automaticamente com datas sequenciais baseadas no padrao do ultimo ciclo
**And** o servico `BillingCycleService.ensureCycleExists(date)` cria o ciclo se nao existir
**And** ciclos criados sob demanda tem salario copiado do ciclo anterior como default

## Epic 3: Cadastros Basicos (Categorias, Meios de Pagamento, Pessoas)

O usuario pode gerenciar categorias de gastos, cartoes/meios de pagamento e pessoas para splits. Inclui seed data inicial e tela de Configuracoes.

### Story 3.1: CRUD de Categorias (Backend + Frontend)

As a usuario,
I want criar e gerenciar categorias de gastos,
So that posso organizar minhas transacoes por tipo de despesa.

**Acceptance Criteria:**

**Given** estou autenticado
**When** faco POST `/api/categories` com nome e icone/cor
**Then** a categoria e criada com `isActive: true`

**Given** categorias existentes
**When** faco GET `/api/categories`
**Then** recebo a lista de categorias ativas ordenadas por nome
**And** categorias inativas nao aparecem na listagem padrao
**And** query param `?includeInactive=true` retorna todas

**Given** uma categoria existente
**When** faco PUT `/api/categories/:id`
**Then** posso atualizar nome e icone/cor

**Given** uma categoria existente
**When** faco DELETE `/api/categories/:id`
**Then** a categoria e desativada (soft-delete: `isActive: false`), nao excluida
**And** transacoes existentes vinculadas nao sao afetadas

**Given** o app aberto na tab Config
**When** acesso a secao "Categorias"
**Then** vejo a lista de categorias com nome e cor/icone
**And** posso adicionar nova categoria via formulario (Sheet/Dialog)
**And** posso editar uma categoria existente
**And** posso desativar uma categoria com confirmacao

**And** o model Category no Prisma contem: id UUID, name, icon, color, isActive Boolean default true, createdAt, updatedAt
**And** mapeamento snake_case via @@map (`categories`)
**And** migration criada e aplicada
**And** seed data inclui categorias iniciais: Alimentacao, Transporte, Moradia, Lazer, Saude, Educacao, Tecnologia, Vestuario, Outros
**And** endpoints documentados no Swagger

### Story 3.2: CRUD de Meios de Pagamento (Backend + Frontend)

As a usuario,
I want gerenciar meus cartoes e meios de pagamento,
So that posso associar cada gasto ao cartao correto e saber o dia de vencimento.

**Acceptance Criteria:**

**Given** estou autenticado
**When** faco POST `/api/payment-methods` com nome, tipo (credito/debito) e dia de vencimento opcional
**Then** o meio de pagamento e criado com `isActive: true`

**Given** meios de pagamento existentes
**When** faco GET `/api/payment-methods`
**Then** recebo a lista de meios ativos ordenados por nome
**And** cada item inclui nome, tipo e diaVencimento

**Given** um meio de pagamento existente
**When** faco PUT `/api/payment-methods/:id`
**Then** posso atualizar nome, tipo e dia de vencimento

**Given** um meio de pagamento existente
**When** faco DELETE `/api/payment-methods/:id`
**Then** o meio e desativado (soft-delete), nao excluido

**Given** o app aberto na tab Config
**When** acesso a secao "Meios de Pagamento"
**Then** vejo a lista com nome, tipo (badge) e dia de vencimento
**And** posso adicionar, editar e desativar meios de pagamento

**And** o model PaymentMethod no Prisma contem: id UUID, name, type enum (credit/debit), dueDay Int opcional, isActive Boolean default true, createdAt, updatedAt
**And** mapeamento snake_case via @@map (`payment_methods`)
**And** migration criada e aplicada
**And** endpoints documentados no Swagger

### Story 3.3: CRUD de Pessoas e Tela de Configuracoes (Backend + Frontend)

As a usuario,
I want gerenciar as pessoas com quem divido gastos e ter uma tela central de configuracoes,
So that posso registrar splits e ter acesso rapido a todos os cadastros.

**Acceptance Criteria:**

**Given** estou autenticado
**When** faco POST `/api/persons` com nome
**Then** a pessoa e criada com `isActive: true`

**Given** pessoas existentes
**When** faco GET `/api/persons`
**Then** recebo a lista de pessoas ativas ordenadas por nome

**Given** uma pessoa existente
**When** faco DELETE `/api/persons/:id`
**Then** a pessoa e desativada (soft-delete), nao excluida
**And** splits existentes vinculados nao sao afetados

**Given** o app aberto na tab Config (SettingsPage)
**When** vejo a tela
**Then** ha tres secoes: Categorias, Meios de Pagamento, Pessoas
**And** cada secao mostra a lista resumida e link/botao para gerenciar
**And** a tela segue o layout mobile-first com cards `#1e293b`

**And** o model Person no Prisma contem: id UUID, name, isActive Boolean default true, createdAt, updatedAt
**And** mapeamento snake_case via @@map (`persons`)
**And** migration criada e aplicada
**And** seed data inclui pessoas iniciais conforme contexto do usuario
**And** a SettingsPage integra os 3 CRUDs (categorias, meios de pagamento, pessoas) numa unica pagina navegavel
**And** endpoints documentados no Swagger

## Epic 4: Registro de Transacoes e Parcelas

O usuario pode registrar gastos (a vista ou parcelados), ver transacoes do ciclo com filtros, e visualizar indicador de parcela. Inclui TransactionForm com progressive disclosure, FAB funcional e InstallmentBadge.

### Story 4.1: Model de Transacao e CRUD Backend

As a usuario,
I want registrar transacoes via API com todos os campos necessarios,
So that meus gastos ficam registrados no ciclo correto.

**Acceptance Criteria:**

**Given** estou autenticado
**When** faco POST `/api/transactions` com descricao, valor, data, categoryId, paymentMethodId, billingCycleId
**Then** a transacao e criada com status `isPaid: false`
**And** o valor e armazenado como Decimal
**And** o id e UUID v4 (aceita id gerado pelo client para idempotencia)

**Given** uma transacao existente
**When** faco PUT `/api/transactions/:id`
**Then** posso atualizar descricao, valor, data, categoria, meio de pagamento
**And** nao posso editar transacao de ciclo fechado (retorna 400)

**Given** uma transacao existente
**When** faco DELETE `/api/transactions/:id`
**Then** a transacao e excluida (hard delete)
**And** se tem parcelas vinculadas, todas as parcelas futuras sao excluidas tambem

**Given** uma transacao existente
**When** faco PATCH `/api/transactions/:id/toggle-paid`
**Then** o status `isPaid` alterna entre true e false (FR16)

**And** o model Transaction no Prisma contem: id UUID, description, amount Decimal, date DateTime, isPaid Boolean, billingCycleId, categoryId, paymentMethodId, parentTransactionId (auto-referencia para parcelas), installmentNumber Int opcional, totalInstallments Int opcional, createdAt, updatedAt
**And** mapeamento snake_case via @@map (`transactions`)
**And** foreign keys para BillingCycle, Category, PaymentMethod
**And** migration criada e aplicada
**And** endpoints documentados no Swagger

### Story 4.2: Parcelas Automaticas (Backend)

As a usuario,
I want registrar uma compra parcelada e ter todas as parcelas geradas automaticamente,
So that cada ciclo futuro ja tem a parcela registrada sem esforco manual.

**Acceptance Criteria:**

**Given** estou autenticado
**When** faco POST `/api/transactions` com `totalInstallments: 10` e valor R$ 4.000
**Then** a transacao principal e criada no ciclo atual como parcela 1/10 com valor R$ 400
**And** mais 9 transacoes-filha sao criadas nos ciclos futuros consecutivos, cada uma com R$ 400
**And** cada parcela tem `installmentNumber` (1-10), `totalInstallments` (10) e `parentTransactionId` apontando para a transacao principal

**Given** ciclos futuros nao existem
**When** parcelas precisam ser alocadas
**Then** o sistema usa `BillingCycleService.ensureCycleExists(date)` para criar os ciclos necessarios (FR7)

**Given** uma transacao parcelada existente
**When** faco GET `/api/transactions/:id`
**Then** vejo `installmentNumber` e `totalInstallments` (ex: parcela 3 de 10)

**Given** a transacao principal de uma compra parcelada
**When** faco DELETE `/api/transactions/:id`
**Then** todas as parcelas futuras (nao pagas) sao excluidas em cascata
**And** parcelas ja pagas permanecem

**And** o `InstallmentService` encapsula a logica de geracao de parcelas
**And** o valor da parcela e calculado com precisao Decimal (valor total / numero de parcelas, ajustando centavos na ultima)

### Story 4.3: Listagem e Filtros de Transacoes (Backend + Frontend)

As a usuario,
I want ver a lista de transacoes do ciclo atual com filtros,
So that posso acompanhar meus gastos e encontrar transacoes especificas.

**Acceptance Criteria:**

**Given** estou autenticado e um ciclo selecionado
**When** faco GET `/api/billing-cycles/:id/transactions`
**Then** recebo a lista de transacoes do ciclo ordenadas por data descendente

**Given** a lista de transacoes
**When** adiciono query params `?categoryId=xxx&paymentMethodId=yyy&isPaid=true`
**Then** a lista e filtrada pelos criterios combinados (FR18)

**Given** o app aberto na tab Transacoes
**When** vejo a tela
**Then** a lista mostra TransactionItems com: icone da categoria (cor), descricao, metadata (cartao + categoria), valor alinhado a direita
**And** transacoes parceladas mostram InstallmentBadge ("3/10") (FR19)
**And** a lista e agrupada por data
**And** valores monetarios usam `tabular-nums` para alinhamento

**Given** a tela de transacoes
**When** uso os filtros
**Then** posso filtrar por categoria (select), meio de pagamento (select), status pago/nao pago (toggle)
**And** os filtros sao aplicados em tempo real via TanStack Query

**Given** nenhuma transacao no ciclo
**When** vejo a tela
**Then** empty state: "Nenhuma transacao neste ciclo" + botao "Registrar"

**And** o CycleSelector esta presente no topo da pagina de Transacoes
**And** existe hook `use-transactions.ts` com TanStack Query

### Story 4.4: Formulario de Transacao (Frontend)

As a usuario,
I want registrar um gasto pelo celular de forma rapida,
So that posso registrar despesas em menos de 30 segundos logo apos o gasto.

**Acceptance Criteria:**

**Given** qualquer tela do app
**When** toco no FAB (+)
**Then** um Sheet (bottom drawer, ~80% da tela) abre com o TransactionForm
**And** o campo descricao tem autofocus

**Given** o TransactionForm aberto
**When** vejo o formulario
**Then** campos visiveis: Descricao (texto), Valor (numerico com R$), Cartao (select com default), Categoria (select)
**And** toggles colapsados: "Dividir com alguem", "Parcelar", "Observacao"
**And** botao "Registrar" primary (gradient, full-width) no final
**And** inputs seguem padrao dark filled: background `#1e293b`, border `#334155`, rounded-12px

**Given** o campo Valor
**When** toco nele
**Then** o teclado numerico abre (inputMode="decimal")
**And** o formato exibe R$ com mascara

**Given** o toggle "Parcelar" colapsado
**When** toco nele
**Then** expande com animacao (150ms) mostrando campo de numero de parcelas e valor da parcela auto-calculado

**Given** o formulario preenchido com dados validos
**When** toco "Registrar"
**Then** o botao mostra loading state
**And** o Sheet fecha com animacao
**And** toast de sucesso: "Registrado — [descricao] R$ [valor]" com opcao "Desfazer" por 5s
**And** a lista de transacoes atualiza via invalidacao do TanStack Query

**Given** erro de validacao
**When** submeto o formulario incompleto
**Then** campos invalidos mostram border red `#fca5a5` com mensagem de erro abaixo
**And** o formulario nao perde os dados preenchidos

**Given** o formulario aberto no desktop (>= 768px)
**When** vejo a interface
**Then** o formulario abre como Dialog centralizado (max-width 480px) ao inves de Sheet

**And** React Hook Form gerencia o estado do formulario
**And** validacao client-side: descricao obrigatoria, valor > 0, categoria obrigatoria, cartao obrigatorio
**And** o toggle "Dividir com alguem" esta presente mas sem funcionalidade (placeholder para Epic 5)

## Epic 5: Splits e A Receber

O usuario pode dividir gastos com outras pessoas, ver quem deve quanto (consolidado por pessoa), marcar pagamentos totais ou parciais, e ver historico. O gasto real nos relatorios considera apenas a parte do usuario.

### Story 5.1: Model de Split e Logica de A Receber (Backend)

As a usuario,
I want dividir uma transacao entre pessoas via API e ter o "a receber" gerado automaticamente,
So that o sistema controla quem me deve quanto.

**Acceptance Criteria:**

**Given** estou autenticado e uma transacao existente de R$ 300
**When** faco POST `/api/transactions/:id/splits` com array de splits: [{personId, amount: 100}, {personId, amount: 100}]
**Then** dois registros de split sao criados vinculados a transacao
**And** um registro de Receivable e criado para cada split de outra pessoa (FR25)
**And** cada Receivable tem status `pending` e valor do split

**Given** splits sendo criados
**When** a soma dos splits + minha parte != valor total da transacao
**Then** a API retorna 400 com mensagem de validacao (FR24)

**Given** splits existentes em uma transacao
**When** faco GET `/api/transactions/:id`
**Then** a resposta inclui os splits com pessoa e valor
**And** o campo `userAmount` mostra apenas a parte do usuario (FR29)

**Given** splits existentes
**When** faco DELETE em uma transacao com splits
**Then** os splits e receivables vinculados sao excluidos em cascata

**And** o model Split no Prisma contem: id UUID, transactionId, personId, amount Decimal, createdAt
**And** o model Receivable no Prisma contem: id UUID, splitId, personId, amount Decimal, paidAmount Decimal default 0, status enum (pending/partial/paid), createdAt, updatedAt
**And** mapeamento snake_case via @@map (`splits`, `receivables`)
**And** migrations criadas e aplicadas
**And** endpoints documentados no Swagger

### Story 5.2: Pagamentos de A Receber (Backend + Frontend)

As a usuario,
I want marcar que alguem me pagou (total ou parcialmente) e ver o historico,
So that sei exatamente quem ainda me deve e quanto.

**Acceptance Criteria:**

**Given** um receivable pendente de R$ 100
**When** faco POST `/api/receivables/:id/payments` com amount: 100
**Then** o receivable muda status para `paid` e `paidAmount` = 100

**Given** um receivable pendente de R$ 100
**When** faco POST `/api/receivables/:id/payments` com amount: 50
**Then** o receivable muda status para `partial` e `paidAmount` = 50

**Given** um receivable com pagamentos parciais
**When** faco POST `/api/receivables/:id/payments` com o valor restante
**Then** o status muda para `paid`

**Given** estou autenticado
**When** faco GET `/api/persons/:id/receivables`
**Then** recebo a lista de receivables da pessoa com status e valores (FR28)

**Given** estou autenticado
**When** faco GET `/api/receivables/summary`
**Then** recebo a visao consolidada por pessoa: nome, total pendente, total pago (FR26)

**And** o model ReceivablePayment no Prisma contem: id UUID, receivableId, amount Decimal, paidAt DateTime, createdAt
**And** mapeamento snake_case via @@map (`receivable_payments`)
**And** migration criada e aplicada
**And** endpoints documentados no Swagger

### Story 5.3: Tela A Receber e SplitSection no Formulario (Frontend)

As a usuario,
I want ver quem me deve na tela A Receber e dividir gastos pelo formulario de transacao,
So that controlo splits e cobrancas de forma visual e rapida.

**Acceptance Criteria:**

**Given** o app aberto na tab A Receber
**When** vejo a tela
**Then** vejo lista de PersonBalanceCards: avatar (inicial + cor), nome, saldo pendente total
**And** pessoas com saldo zero aparecem abaixo ou ocultas
**And** valores pendentes em verde `#6ee7a0`

**Given** a lista de pessoas
**When** toco em uma pessoa
**Then** vejo o detalhe: lista de receivables pendentes com descricao da transacao, valor e data

**Given** o detalhe de receivables de uma pessoa
**When** toco "Marcar como pago" em um receivable
**Then** Dialog pergunta: pagar total ou valor parcial
**And** ao confirmar, o receivable atualiza com animacao (check)
**And** toast: "Pagamento de R$ [valor] registrado"
**And** saldo da pessoa atualiza

**Given** nenhum receivable pendente
**When** vejo a tela A Receber
**Then** empty state: "Nenhum valor a receber" + "Divida um gasto para ver aqui"

**Given** o TransactionForm aberto (Epic 4)
**When** toco no toggle "Dividir com alguem"
**Then** a SplitSection expande com: select de pessoa, campo de valor
**And** botao "+ Adicionar pessoa" para multiplos splits
**And** "Minha parte: R$ [calculado]" atualiza em tempo real
**And** validacao: soma dos splits nao pode exceder valor total

**And** existe hook `use-receivables.ts` com TanStack Query
**And** a tab A Receber na BottomNav mostra badge com numero de pessoas com saldo pendente

## Epic 6: Gastos Fixos e Impostos PJ

O usuario pode cadastrar despesas recorrentes (aluguel, energia, internet) e impostos PJ, registrar valores reais por ciclo, comparar real vs estimado, e marcar como pago.

### Story 6.1: CRUD de Gastos Fixos (Backend + Frontend)

As a usuario,
I want cadastrar minhas despesas fixas e registrar o valor real pago em cada ciclo,
So that controlo aluguel, energia, internet e outras contas recorrentes.

**Acceptance Criteria:**

**Given** estou autenticado
**When** faco POST `/api/fixed-expenses` com nome, estimatedAmount e dueDay
**Then** o gasto fixo e criado com `isActive: true`

**Given** gastos fixos existentes e um ciclo aberto
**When** faco POST `/api/fixed-expenses/:id/entries` com billingCycleId, actualAmount e isPaid
**Then** um registro de gasto fixo do ciclo e criado (FR31)

**Given** um registro de gasto fixo do ciclo
**When** faco GET `/api/billing-cycles/:id/fixed-expenses`
**Then** recebo a lista com: nome, valor estimado, valor real, diferenca, status pago (FR32)
**And** gastos fixos sem registro no ciclo aparecem com valor real null

**Given** registros de gasto fixo em multiplos ciclos
**When** faco GET `/api/fixed-expenses/:id/history`
**Then** recebo o historico de valores reais ao longo dos ciclos (FR33)

**Given** o app aberto na tela de gastos fixos (acessivel via Dashboard ou Config)
**When** vejo a tela
**Then** vejo a lista de gastos fixos do ciclo atual com: nome, estimado, real, diferenca (verde se menor, vermelho se maior)
**And** posso marcar como pago com um tap (toggle) (FR34)
**And** posso registrar o valor real com input monetario
**And** posso adicionar novo gasto fixo via formulario

**And** o model FixedExpense no Prisma contem: id UUID, name, estimatedAmount Decimal, dueDay Int, isActive Boolean default true, createdAt, updatedAt
**And** o model FixedExpenseEntry no Prisma contem: id UUID, fixedExpenseId, billingCycleId, actualAmount Decimal, isPaid Boolean default false, createdAt, updatedAt
**And** mapeamento snake_case via @@map (`fixed_expenses`, `fixed_expense_entries`)
**And** migrations criadas e aplicadas
**And** endpoints documentados no Swagger

### Story 6.2: CRUD de Impostos PJ (Backend + Frontend)

As a usuario,
I want cadastrar meus impostos PJ e registrar o valor real pago em cada ciclo,
So that controlo DAS, ISS e outros tributos da minha empresa.

**Acceptance Criteria:**

**Given** estou autenticado
**When** faco POST `/api/taxes` com nome, rate (percentual) e estimatedAmount
**Then** o imposto e criado

**Given** impostos existentes e um ciclo aberto
**When** faco POST `/api/taxes/:id/entries` com billingCycleId, actualAmount e isPaid
**Then** um registro de imposto do ciclo e criado (FR36)

**Given** registros de impostos de um ciclo
**When** faco GET `/api/billing-cycles/:id/taxes`
**Then** recebo a lista com: nome, taxa, valor estimado, valor real, status pago

**Given** o app aberto na tela de impostos (acessivel via Dashboard ou Config)
**When** vejo a tela
**Then** vejo a lista de impostos do ciclo com: nome, taxa %, estimado, real
**And** posso marcar como pago com um tap (FR37)
**And** posso registrar o valor real

**And** o model Tax no Prisma contem: id UUID, name, rate Decimal, estimatedAmount Decimal, createdAt, updatedAt
**And** o model TaxEntry no Prisma contem: id UUID, taxId, billingCycleId, actualAmount Decimal, isPaid Boolean default false, createdAt, updatedAt
**And** mapeamento snake_case via @@map (`taxes`, `tax_entries`)
**And** migrations criadas e aplicadas
**And** endpoints documentados no Swagger

### Story 6.3: Integracao de Fixos e Impostos no Resumo do Ciclo

As a usuario,
I want que gastos fixos e impostos aparecam no resumo do ciclo,
So that o calculo do resultado liquido do ciclo seja completo e preciso.

**Acceptance Criteria:**

**Given** um ciclo com gastos fixos e impostos registrados
**When** faco GET `/api/billing-cycles/:id`
**Then** o resumo do ciclo inclui: totalFixedExpenses (soma dos valores reais de gastos fixos) e totalTaxes (soma dos valores reais de impostos)
**And** o resultado liquido calcula: salario - totalTransactions - totalFixedExpenses - totalTaxes + totalReceivables (FR6)

**Given** gastos fixos sem valor real registrado no ciclo
**When** o resumo e calculado
**Then** usa o valor estimado como fallback para o calculo

**Given** o app mostrando o ciclo atual
**When** vejo o resumo (preparacao para Dashboard - Epic 7)
**Then** os totais de fixos e impostos estao disponiveis nos dados do ciclo
**And** o endpoint de resumo retorna breakdown: { salary, totalCards, totalFixed, totalTaxes, totalReceivables, netResult }

## Epic 7: Dashboard do Ciclo

O usuario pode ver o resumo financeiro do ciclo atual na tela principal — resultado liquido, totais por categoria, indicador de saude financeira (verde/vermelho). Inclui FinancialHeroCard e StatsRow.

### Story 7.1: API de Dashboard Agregado (Backend)

As a usuario,
I want acessar um endpoint que retorna todos os dados do dashboard em uma unica chamada,
So that o app carrega o resumo financeiro do ciclo em menos de 2 segundos.

**Acceptance Criteria:**

**Given** estou autenticado e um ciclo existe
**When** faco GET `/api/dashboard/:billingCycleId`
**Then** recebo um objeto com:
- `cycle`: { name, startDate, endDate, salary, status }
- `summary`: { salary, totalCards, totalFixed, totalTaxes, totalReceivables, netResult }
- `netResult`: valor com sinal (positivo/negativo)
- `categoryBreakdown`: array [{ categoryId, categoryName, categoryColor, total }] ordenado por total desc
- `recentTransactions`: ultimas 5 transacoes do ciclo com splits resolvidos (userAmount)

**Given** um ciclo sem dados
**When** faco GET `/api/dashboard/:billingCycleId`
**Then** todos os totais sao "0.00" e arrays sao vazios

**Given** transacoes com splits no ciclo
**When** o dashboard calcula totalCards
**Then** usa o `userAmount` (parte do usuario) de cada transacao, nao o valor total (FR29)

**And** o endpoint responde em < 500ms (queries otimizadas com aggregations no Prisma)
**And** o DashboardService e read-only — nao altera dados de nenhum outro modulo
**And** endpoint documentado no Swagger

### Story 7.2: Tela de Dashboard (Frontend)

As a usuario,
I want abrir o app e ver instantaneamente como estou financeiramente neste ciclo,
So that sei em 2 segundos se estou no verde ou no vermelho.

**Acceptance Criteria:**

**Given** o app aberto (Dashboard e a home/tab padrao)
**When** a tela carrega
**Then** o CycleSelector esta no topo com o ciclo mais recente selecionado
**And** o FinancialHeroCard mostra o resultado liquido em 44px bold
**And** se positivo: valor em verde `#6ee7a0` com sinal +
**And** se negativo: valor em vermelho `#fca5a5` com sinal -
**And** barra de progresso abaixo mostrando receita vs despesa

**Given** o dashboard carregado
**When** vejo a StatsRow
**Then** 3 colunas iguais: Receita (green), Despesa (red), A Receber (amber)
**And** cada coluna mostra valor em 18px bold e label em 11px
**And** cards com background `#1e293b` rounded-14px

**Given** o dashboard carregado
**When** vejo a secao de categorias
**Then** categoryBreakdown mostra lista de categorias com nome, cor, valor e percentual do total
**And** ordenado por valor descendente

**Given** o dashboard carregado
**When** vejo a secao de transacoes recentes
**Then** ultimas 5 transacoes aparecem como TransactionItems compactos
**And** link "Ver todas" leva para a tab Transacoes

**Given** o dashboard carregando
**When** os dados ainda nao chegaram
**Then** Skeleton loading aparece nos slots do HeroCard, StatsRow e listas

**Given** nenhum ciclo existe
**When** abro o dashboard
**Then** empty state: ilustracao sutil + "Crie seu primeiro ciclo para comecar" + CTA

**Given** ciclo existe mas sem transacoes
**When** vejo o dashboard
**Then** HeroCard mostra salario como resultado (tudo zero de despesa)
**And** empty state na secao de transacoes: "Registre seu primeiro gasto" + FAB pulsando

**And** existe hook `use-dashboard.ts` com TanStack Query (staleTime adequado para evitar refetches desnecessarios)
**And** o dashboard carrega em < 2s (NFR1)
**And** o indicador de saude financeira (FR42) e o proprio HeroCard com cor semaforica
