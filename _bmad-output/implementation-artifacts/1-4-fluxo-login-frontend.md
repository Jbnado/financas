# Story 1.4: Fluxo de Login Frontend

Status: done

## Story

As a usuario,
I want fazer login no app com email e senha,
So that posso acessar minhas financas de forma segura.

## Acceptance Criteria

1. **AC1:** Rota nao autenticada redireciona para /login
2. **AC2:** Pagina de login com formulario: campos email e senha com labels, validacao client-side (React Hook Form), botao "Entrar" (primary, gradient, full-width)
3. **AC3:** Inputs dark filled: background `#1e293b`, border `#334155`, rounded-12px. Foco muda border para `#6ee7a0`
4. **AC4:** Credenciais validas: botao mostra loading state (disabled + spinner), apos sucesso redireciona ao Dashboard
5. **AC5:** Access token armazenado em memoria (nao localStorage), refresh token gerenciado via cookie httpOnly
6. **AC6:** Credenciais invalidas: toast de erro persistente "Email ou senha incorretos", formulario mantem dados
7. **AC7:** Access token expira: service layer tenta refresh automaticamente. Se sucede, retenta acao original. Se falha, redireciona para login
8. **AC8:** TanStack Query (QueryClient) configurado com defaults adequados
9. **AC9:** `api.service.ts` (fetch wrapper) com interceptor de auth (Bearer token) e tratamento de 401
10. **AC10:** Hook `use-auth.ts` com funcoes login, logout, isAuthenticated

## Tasks / Subtasks

- [x] Task 1: Instalar dependencias (AC: prerequisito)
  - [x] 1.1: Instalar react-hook-form (v7.71.2)
  - [x] 1.2: Instalar @tanstack/react-query (v5.90.21)
  - [x] 1.3: Verificar instalacao e compatibilidade

- [x] Task 2: Criar api.service.ts — fetch wrapper com auth (AC: 5, 7, 9)
  - [x] 2.1: Escrever testes (RED) para api.service: get/post com auth header, 401 trigger refresh, refresh falha redireciona
  - [x] 2.2: Criar api.service.ts em shared/services/ com: baseUrl de VITE_API_URL, metodos get/post/put/delete, injeta Bearer token, credentials: include (cookies), intercepta 401 e tenta refresh, se refresh falha limpa token e redireciona /login
  - [x] 2.3: Verificar testes passam (GREEN) — 9 testes

- [x] Task 3: Criar auth store e hook use-auth.ts (AC: 5, 10)
  - [x] 3.1: Escrever testes (RED) para auth store: token em memoria, isAuthenticated, login seta token, logout limpa token
  - [x] 3.2: Criar auth.store.ts em shared/stores/ com accessToken em memoria e isAuthenticated derivado
  - [x] 3.3: Criar use-auth.ts em features/auth/hooks/ com funcoes login(email, password), logout(), isAuthenticated
  - [x] 3.4: Verificar testes passam (GREEN) — 4 + 3 testes

- [x] Task 4: Configurar TanStack Query — QueryClient (AC: 8)
  - [x] 4.1: Criar QueryClient com defaults: retry 1, staleTime 30s, refetchOnWindowFocus false
  - [x] 4.2: Integrar QueryClientProvider no App.tsx
  - [x] 4.3: Escrever teste verificando QueryClientProvider disponivel — 4 testes

- [x] Task 5: Criar LoginPage com formulario (AC: 2, 3, 4, 6)
  - [x] 5.1: Escrever testes (RED) para LoginForm: renderiza campos email/senha, validacao required/email/minlength, submit chama login, loading state, erro mostra toast
  - [x] 5.2: Criar LoginForm em features/auth/components/ com React Hook Form, inputs dark, validacao, botao gradient "Entrar", loading spinner
  - [x] 5.3: Criar LoginPage em features/auth/pages/ centralizando o form
  - [x] 5.4: Verificar testes passam (GREEN) — 8 testes

- [x] Task 6: Protecao de rotas e integracao no router (AC: 1)
  - [x] 6.1: Escrever testes (RED) para ProtectedRoute: redireciona /login se nao autenticado, renderiza children se autenticado
  - [x] 6.2: Criar ProtectedRoute em shared/components/
  - [x] 6.3: Adicionar rota /login no router, wrappear rotas protegidas com ProtectedRoute
  - [x] 6.4: Verificar testes passam (GREEN) — 2 + 7 testes

- [x] Task 7: Verificacao final — testes, build, Docker (AC: 1-10)
  - [x] 7.1: Executar suite completa de testes frontend — 80/80 passando (16 suites)
  - [x] 7.2: Verificar build TypeScript sem erros
  - [x] 7.3: Verificar Vite build producao sem erros (2.81s)
  - [x] 7.4: Docker compose up — frontend acessivel, login funcional, redirect para dashboard confirmado

## Dev Notes

### Contrato API Backend (de Story 1.2)
- POST `/api/auth/login` { email, password } → { accessToken } + cookie refreshToken (httpOnly, 7d)
- POST `/api/auth/refresh` (cookie) → { accessToken } + novo cookie
- POST `/api/auth/logout` (Bearer) → { message } + limpa cookie
- Cookie config: httpOnly, secure (prod), sameSite: lax, path: /api/auth, maxAge: 7d
- Erros: { statusCode, message, error }

### Arquitetura Frontend (de architecture.md)
- Feature-based: features/auth/components/, features/auth/hooks/, features/auth/pages/
- Shared: shared/services/api.service.ts, shared/stores/auth.store.ts
- TanStack Query para dados servidor, Zustand para UI state
- React Hook Form para formularios
- fetch nativo em service layer (nao axios)
- Testes co-localizados

### UX Specs (de epics.md)
- Inputs dark filled: bg #1e293b, border #334155, rounded-12px, focus border #6ee7a0
- Botao "Entrar": gradient green-blue, full-width
- Loading state: disabled + spinner
- Toast erro: persistente, "Email ou senha incorretos"
- Access token em memoria (nao localStorage)

### Docker
- docker-compose.dev.yml ja tem frontend (5173), backend (3000), postgres (5432)
- VITE_API_URL=http://localhost:3000/api
- CORS_ORIGIN=http://localhost:5173

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
- `API_URL` const evaluated at module load — tests couldn't set VITE_API_URL dynamically. Fixed by changing to `getApiUrl()` function.
- `type="email"` native validation conflicted with RHF pattern validation in jsdom. Fixed by adding `noValidate` to form element.
- React act() warnings in LoginForm loading state test — common React 19 + testing-library issue, warnings only, tests pass.

### Completion Notes List
- All 10 ACs verified and passing
- 80/80 frontend tests passing across 16 test suites
- TypeScript strict mode — no errors
- Vite production build — clean (2.81s)
- Docker compose — all 3 containers running, login flow verified end-to-end via Playwright
- Token stored in memory (module-level variable), not localStorage — XSS safe
- Refresh token handled via httpOnly cookie (credentials: 'include')
- App Shell (Sidebar, BottomNav, Fab) conditionally rendered based on auth state

### File List
**New files:**
- `frontend/src/shared/services/api.service.ts` — fetch wrapper with auth, 401 refresh
- `frontend/src/shared/services/api.service.test.ts` — 9 tests
- `frontend/src/shared/stores/auth.store.ts` — Zustand auth state (isAuthenticated, setAuthenticated, clearAuth)
- `frontend/src/shared/stores/auth.store.test.ts` — 4 tests
- `frontend/src/shared/lib/query-client.ts` — TanStack QueryClient with defaults
- `frontend/src/shared/lib/query-client.test.ts` — 4 tests
- `frontend/src/shared/components/ProtectedRoute.tsx` — route guard, redirects to /login
- `frontend/src/shared/components/ProtectedRoute.test.tsx` — 2 tests
- `frontend/src/features/auth/hooks/use-auth.ts` — login, logout, isAuthenticated hook
- `frontend/src/features/auth/hooks/use-auth.test.tsx` — 3 tests
- `frontend/src/features/auth/components/LoginForm.tsx` — RHF form with dark inputs, gradient button
- `frontend/src/features/auth/components/LoginForm.test.tsx` — 8 tests
- `frontend/src/features/auth/pages/LoginPage.tsx` — centered login page

**Modified files:**
- `frontend/package.json` — added react-hook-form, @tanstack/react-query
- `frontend/src/App.tsx` — added QueryClientProvider, conditional App Shell based on auth
- `frontend/src/routes/index.tsx` — added /login route, wrapped routes with ProtectedRoute
- `frontend/src/routes/index.test.tsx` — 7 tests (auth/unauth scenarios)

### Change Log
| Date | Change | Reason |
|------|--------|--------|
| 2026-02-25 | Created api.service.ts with fetch wrapper | AC 5, 7, 9 — auth service layer |
| 2026-02-25 | Created auth.store.ts with Zustand | AC 5, 10 — token in memory |
| 2026-02-25 | Created use-auth.ts hook | AC 10 — login/logout/isAuthenticated |
| 2026-02-25 | Configured TanStack QueryClient | AC 8 — server state management |
| 2026-02-25 | Created LoginForm + LoginPage | AC 2, 3, 4, 6 — form, dark inputs, loading, error toast |
| 2026-02-25 | Created ProtectedRoute + updated router | AC 1 — route protection |
| 2026-02-25 | Docker compose verified end-to-end | All ACs — login flow working in containers |
