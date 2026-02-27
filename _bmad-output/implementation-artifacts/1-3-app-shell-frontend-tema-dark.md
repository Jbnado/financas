# Story 1.3: App Shell Frontend e Tema Dark

Status: done

## Story

As a usuario,
I want abrir o app e ver a estrutura de navegacao com tema dark,
So that posso navegar entre as secoes do app com interface moderna e mobile-first.

## Acceptance Criteria

1. **AC1:** BottomNav fixa com 4 tabs: Dashboard, Transacoes, A Receber, Config — cada tab com icone (20px) + label (10px), tab ativa em verde `#6ee7a0`, background `#1e293b`, height 56px com safe area padding (mobile < 768px)
2. **AC2:** Navegacao entre tabs carrega pagina placeholder ("Em breve"), navegacao instantanea, tab ativa atualiza visualmente
3. **AC3:** Desktop (>= 768px): BottomNav substituida por sidebar
4. **AC4:** FAB 56px circular, gradient green-blue, visivel no canto inferior direito acima da BottomNav (placeholder, sem acao)
5. **AC5:** Tema dark aplicado: background `#0f172a`, cards `#1e293b`, texto `#f1f5f9`
6. **AC6:** CSS variables de cores semaforicas definidas (positive `#6ee7a0`, negative `#fca5a5`, warning `#fcd34d`, neutral)
7. **AC7:** shadcn/ui configurado com componentes base: Button, Input, Card, Sheet, Toast/Sonner, Dialog, Skeleton, Badge
8. **AC8:** Fonte Inter configurada com `font-variant-numeric: tabular-nums`
9. **AC9:** React Router v7 configurado com rotas lazy-loaded para cada pagina
10. **AC10:** `lang="pt-BR"` no HTML
11. **AC11:** Zustand store de UI criado (`ui.store.ts`)

## Tasks / Subtasks

- [x] Task 1: Setup infraestrutura de testes frontend (AC: prerequisito)
  - [x] 1.1: Instalar Vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
  - [x] 1.2: Configurar vitest em vite.config.ts com environment jsdom e setup file
  - [x] 1.3: Criar setup file de testes (src/test/setup.ts) com @testing-library/jest-dom
  - [x] 1.4: Adicionar script "test" no package.json
  - [x] 1.5: Criar teste smoke basico para validar que Vitest funciona

- [x] Task 2: Configurar shadcn/ui e tema dark (AC: 5, 6, 7)
  - [x] 2.1: Instalar dependencias shadcn/ui: class-variance-authority, clsx, tailwind-merge, lucide-react
  - [x] 2.2: Criar funcao utilitaria cn() em shared/utils/cn.ts
  - [x] 2.3: Configurar CSS theme variables no index.css: cores dark mode (#0f172a, #1e293b, #f1f5f9) e cores semaforicas (#6ee7a0, #fca5a5, #fcd34d)
  - [x] 2.4: Instalar componentes shadcn/ui base: Button, Input, Card, Sheet, Dialog, Skeleton, Badge
  - [x] 2.5: Instalar e configurar Sonner (toast)
  - [x] 2.6: Escrever testes para funcao cn() e verificar que componentes renderizam

- [x] Task 3: Configurar fonte Inter e HTML lang (AC: 8, 10)
  - [x] 3.1: Instalar fonte Inter via @fontsource-variable/inter
  - [x] 3.2: Configurar Inter como fonte padrao no CSS com font-variant-numeric: tabular-nums
  - [x] 3.3: Alterar index.html para lang="pt-BR" e title "financas"
  - [x] 3.4: Escrever teste verificando que Inter e aplicada e lang="pt-BR" esta no HTML

- [x] Task 4: Configurar React Router v7 com rotas lazy-loaded (AC: 9)
  - [x] 4.1: Instalar react-router (v7)
  - [x] 4.2: Criar paginas placeholder em features/: DashboardPage, TransacoesPage, AReceberPage, ConfigPage
  - [x] 4.3: Configurar rotas lazy-loaded em routes/index.tsx com BrowserRouter
  - [x] 4.4: Integrar router no App.tsx
  - [x] 4.5: Escrever testes verificando que cada rota renderiza a pagina placeholder correta

- [x] Task 5: Configurar Zustand store de UI (AC: 11)
  - [x] 5.1: Instalar zustand
  - [x] 5.2: Criar ui.store.ts em shared/stores/ com estado inicial (activeTab, sidebarOpen)
  - [x] 5.3: Escrever testes para ui.store.ts

- [x] Task 6: Implementar BottomNav mobile (AC: 1, 2)
  - [x] 6.1: Escrever testes (RED) para BottomNav: renderiza 4 tabs, tab ativa tem estilo correto, clique navega
  - [x] 6.2: Criar componente BottomNav em shared/components/ com icones Lucide, labels, active state verde #6ee7a0, background #1e293b, height 56px, safe-area-inset-bottom
  - [x] 6.3: Integrar BottomNav no layout principal (visivel apenas < 768px)
  - [x] 6.4: Verificar testes passam (GREEN)

- [x] Task 7: Implementar Sidebar desktop (AC: 3)
  - [x] 7.1: Escrever testes (RED) para Sidebar: renderiza apenas em >= 768px, mesmos items de navegacao
  - [x] 7.2: Criar componente Sidebar em shared/components/ com navegacao desktop
  - [x] 7.3: Integrar Sidebar no layout principal (visivel apenas >= 768px)
  - [x] 7.4: Verificar testes passam (GREEN)

- [x] Task 8: Implementar FAB (AC: 4)
  - [x] 8.1: Escrever testes (RED) para FAB: renderiza botao circular 56px, tem gradient, esta posicionado corretamente
  - [x] 8.2: Criar componente FAB em shared/components/ com 56px circular, gradient green-blue, icone +
  - [x] 8.3: Integrar FAB no layout (acima da BottomNav no mobile)
  - [x] 8.4: Verificar testes passam (GREEN)

- [x] Task 9: Integrar App Shell completo e verificacao final (AC: 1-11)
  - [x] 9.1: Montar layout responsivo no App.tsx: BottomNav (mobile) + Sidebar (desktop) + FAB + outlet de rotas
  - [x] 9.2: Verificar tema dark aplicado globalmente
  - [x] 9.3: Executar suite completa de testes — todos passando (44/44)
  - [x] 9.4: Verificar build TypeScript sem erros
  - [x] 9.5: Verificar Vite build producao sem erros

## Dev Notes

### Arquitetura Frontend (de architecture.md)
- Feature-based: `src/features/`, `src/shared/`, `src/routes/`
- shadcn/ui componentes copiados em `shared/components/ui/`
- Zustand stores em `shared/stores/` com sufixo `.store.ts`
- React Router v7 com lazy loading em `routes/index.tsx`
- Testes co-localizados: `Component.test.tsx` ao lado de `Component.tsx`
- Naming: PascalCase componentes, kebab-case hooks/utils/stores

### UX Specs (de epics.md)
- Dark mode primario: fundo #0f172a, cards #1e293b, texto #f1f5f9
- BottomNav: 4 tabs (Dashboard, Transacoes, A Receber, Config), 56px height, safe-area
- FAB: 56px circular, gradient green-blue, canto inferior direito
- Cores semaforicas: green #6ee7a0, red #fca5a5, amber #fcd34d
- Fonte Inter com tabular-nums
- Mobile < 768px (primario), Desktop >= 768px
- Touch targets minimo 44x44px
- lang="pt-BR"

### Stack de Testes Frontend
- Vitest (nativo Vite) + @testing-library/react + jsdom
- Testes co-localizados com sufixo `.test.tsx`

### Learnings de Story 1.1
- TailwindCSS v4: sem tailwind.config.js, usa @import "tailwindcss"
- Vite 7.3.1 + React 19 + TypeScript 5.7
- Plugin ordem: tailwindcss() antes de react()

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References
- TypeScript build exigia excluir arquivos de teste do tsconfig.app.json (usam Node APIs: fs, path, __dirname)
- @fontsource-variable/inter precisa de declaracao de tipo em vite-env.d.ts
- Vitest 4.0.18 com @testing-library/jest-dom requer import `@testing-library/jest-dom/vitest` no setup file

### Completion Notes List

- Task 1: Vitest 4.0.18 + @testing-library/react 16.3.2 + jsdom 28.1.0 configurados. Setup file, smoke test passando
- Task 2: shadcn/ui configurado manualmente (componentes copiados): Button (com variant gradient), Input, Card, Sheet, Dialog, Skeleton, Badge, Toaster (Sonner). cn() utilitario criado. CSS theme com @theme do TailwindCSS v4: cores dark mode + semaforicas
- Task 3: @fontsource-variable/inter instalado, Inter configurada como font-sans com tabular-nums. HTML: lang="pt-BR", title "financas"
- Task 4: react-router v7 instalado. 4 paginas placeholder criadas (Dashboard, Transacoes, A Receber, Config). Rotas lazy-loaded com React.lazy(). BrowserRouter + useRoutes no App.tsx. Redirect / -> /dashboard
- Task 5: Zustand instalado. ui.store.ts com activeTab (TabId) e sidebarOpen. 5 testes passando
- Task 6: BottomNav TDD: 5 testes RED -> GREEN. 4 tabs com icones Lucide, active state verde #6ee7a0, bg #1e293b, h-14 (56px), safe-area-inset-bottom, hidden em md+
- Task 7: Sidebar TDD: 6 testes RED -> GREEN. Navegacao desktop com hidden/md:flex, mesmos 4 items, active state, branding "financas"
- Task 8: FAB TDD: 4 testes RED -> GREEN. Botao circular 56px, gradient green-blue (from-green-400 to-blue-500), icone Plus, aria-label, bottom-18 mobile / bottom-6 desktop
- Task 9: App Shell integrado: Sidebar (desktop) + main content + BottomNav (mobile) + FAB + Toaster. 44 testes passando, TypeScript OK, Vite build OK (93.49 kB gzip). Backend sem regressoes (15/15)

### File List

- `frontend/vite.config.ts` (modified — vitest config, path alias)
- `frontend/tsconfig.app.json` (modified — paths alias @/*, exclude tests)
- `frontend/package.json` (modified — test scripts, new dependencies)
- `frontend/index.html` (modified — lang="pt-BR", title "financas")
- `frontend/src/vite-env.d.ts` (new — type declarations for fontsource)
- `frontend/src/main.tsx` (modified — import @fontsource-variable/inter)
- `frontend/src/index.css` (modified — @theme dark mode, semantic colors, Inter font, tabular-nums)
- `frontend/src/App.tsx` (modified — BrowserRouter, layout with Sidebar + BottomNav + FAB + Toaster)
- `frontend/src/test/setup.ts` (new — @testing-library/jest-dom/vitest)
- `frontend/src/test/smoke.test.ts` (new — Vitest smoke test)
- `frontend/src/test/html-config.test.ts` (new — lang, title validation)
- `frontend/src/test/css-theme.test.ts` (new — CSS theme vars validation)
- `frontend/src/shared/utils/cn.ts` (new — clsx + tailwind-merge utility)
- `frontend/src/shared/utils/cn.test.ts` (new — cn() tests)
- `frontend/src/shared/stores/ui.store.ts` (new — Zustand UI store)
- `frontend/src/shared/stores/ui.store.test.ts` (new — store tests)
- `frontend/src/shared/components/ui/button.tsx` (new — shadcn Button with gradient variant)
- `frontend/src/shared/components/ui/button.test.tsx` (new — Button tests)
- `frontend/src/shared/components/ui/input.tsx` (new — shadcn Input)
- `frontend/src/shared/components/ui/card.tsx` (new — shadcn Card)
- `frontend/src/shared/components/ui/dialog.tsx` (new — shadcn Dialog)
- `frontend/src/shared/components/ui/sheet.tsx` (new — shadcn Sheet)
- `frontend/src/shared/components/ui/skeleton.tsx` (new — shadcn Skeleton)
- `frontend/src/shared/components/ui/badge.tsx` (new — shadcn Badge)
- `frontend/src/shared/components/ui/toaster.tsx` (new — Sonner wrapper)
- `frontend/src/shared/components/BottomNav.tsx` (new — mobile bottom navigation)
- `frontend/src/shared/components/BottomNav.test.tsx` (new — BottomNav tests)
- `frontend/src/shared/components/Sidebar.tsx` (new — desktop sidebar navigation)
- `frontend/src/shared/components/Sidebar.test.tsx` (new — Sidebar tests)
- `frontend/src/shared/components/Fab.tsx` (new — floating action button)
- `frontend/src/shared/components/Fab.test.tsx` (new — FAB tests)
- `frontend/src/shared/constants/navigation.ts` (new — shared navItems constant)
- `frontend/src/routes/index.tsx` (new — lazy-loaded route definitions)
- `frontend/src/routes/index.test.tsx` (new — route tests)
- `frontend/src/features/dashboard/pages/DashboardPage.tsx` (new — placeholder)
- `frontend/src/features/transaction/pages/TransacoesPage.tsx` (new — placeholder)
- `frontend/src/features/receivable/pages/AReceberPage.tsx` (new — placeholder)
- `frontend/src/features/settings/pages/ConfigPage.tsx` (new — placeholder)

### Change Log
- 2026-02-25: Story 1.3 implemented — App Shell com BottomNav (mobile), Sidebar (desktop), FAB, tema dark, shadcn/ui, React Router v7 lazy routes, Zustand UI store, Inter font, 44 testes passando
- 2026-02-25: Code Review — 4 MEDIUM + 4 LOW issues corrigidos: (M1) BottomNav safe area com min-h-14, (M2) navItems extraidos para shared/constants/navigation.ts, (M3) LocationSync no App.tsx para sync Zustand com browser back/forward, (M4) font-family Inter no body para portals. (L1) Acentos pt-BR nos labels: Transações, Configurações. (L2) Removida dep @radix-ui/react-visually-hidden nao usada. (L3) Suspense fallback com Skeleton ao inves de null. (L4) Testes infra melhorados: HTML parsing via JSDOM, CSS validation por bloco @theme/@layer. 48/48 testes, TypeScript OK, Vite build OK
