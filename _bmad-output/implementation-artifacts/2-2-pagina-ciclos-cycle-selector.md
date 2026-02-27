# Story 2.2: Pagina de Ciclos e CycleSelector (Frontend)

Status: review

## Story

As a usuario,
I want navegar entre ciclos e ver o ciclo atual no app,
So that sei em qual periodo estou visualizando minhas financas.

## Acceptance Criteria

1. **AC1:** CycleSelector visivel no topo das paginas Dashboard e Transacoes com datas do ciclo atual ("25/Jan — 24/Fev"), setas < > para navegar, chip com background `#1e293b`, border `#334155`, rounded-20px
2. **AC2:** Toque na seta > carrega proximo ciclo, label atualiza com novas datas, skeleton loading enquanto carrega
3. **AC3:** Seta desabilitada quando no primeiro/ultimo ciclo
4. **AC4:** Empty state se nenhum ciclo existe: CTA "Criar primeiro ciclo"
5. **AC5:** Hook `use-billing-cycles.ts` com TanStack Query para fetch/cache dos ciclos
6. **AC6:** Pagina permite criar novo ciclo via formulario (Dialog no desktop, Sheet no mobile)
7. **AC7:** Formulario: nome, data inicio, data fim, salario com validacao + formato monetario R$ com inputMode="decimal"

## Tasks / Subtasks

- [x] Task 1: Criar tipos e hook de billing cycles (AC: 5)
  - [x] 1.1: Criar `src/features/billing-cycle/types.ts` com interfaces BillingCycle, BillingCycleSummary, CreateBillingCycleDto
  - [x] 1.2: Escrever testes (RED) para `use-billing-cycles.ts` — fetchAll, fetchById, create, navigation (next/prev)
  - [x] 1.3: Criar `src/features/billing-cycle/hooks/use-billing-cycles.ts` com TanStack Query: useQuery para lista, useQuery para ciclo individual, useMutation para criar
  - [x] 1.4: Criar `src/features/billing-cycle/hooks/use-cycle-navigation.ts` — estado do ciclo selecionado, funcoes goNext/goPrev, isFirst/isLast
  - [x] 1.5: Verificar testes passam (GREEN) — 13 testes passando

- [x] Task 2: Criar componente CycleSelector (AC: 1, 2, 3)
  - [x] 2.1: Escrever testes (RED) para CycleSelector: renderiza datas formatadas, setas funcionam, seta desabilitada no limite, skeleton no loading
  - [x] 2.2: Criar `src/features/billing-cycle/components/CycleSelector.tsx` — chip com setas < >, label de datas, skeleton loading, estilo dark (bg #1e293b, border #334155, rounded-20px)
  - [x] 2.3: Formatar datas como "25/Jan — 24/Fev" usando Intl.DateTimeFormat pt-BR
  - [x] 2.4: Verificar testes passam (GREEN) — 6 testes passando

- [x] Task 3: Criar formulario de criacao de ciclo (AC: 6, 7)
  - [x] 3.1: Escrever testes (RED) para BillingCycleForm: campos presentes, validacao, submit
  - [x] 3.2: Criar `src/features/billing-cycle/components/BillingCycleForm.tsx` com React Hook Form — campos: nome (texto), data inicio (date), data fim (date), salario (numerico R$)
  - [x] 3.3: Usar Sheet no mobile (< 768px), Dialog no desktop (>= 768px) — criado ResponsiveFormContainer.tsx com useMediaQuery hook
  - [x] 3.4: Campo salario com inputMode="decimal" e mascara R$ (ex: "R$ 7.300,00")
  - [x] 3.5: Validacao: nome obrigatorio, datas obrigatorias (fim > inicio), salario > 0
  - [x] 3.6: Submit chama mutation de criar ciclo, fecha o form, toast de sucesso, invalida query
  - [x] 3.7: Verificar testes passam (GREEN) — 6 testes passando

- [x] Task 4: Integrar CycleSelector nas paginas (AC: 1, 4)
  - [x] 4.1: Atualizar DashboardPage.tsx — adicionar CycleSelector no topo + empty state ("Crie seu primeiro ciclo" + CTA que abre form)
  - [x] 4.2: Atualizar TransacoesPage.tsx — adicionar CycleSelector no topo
  - [x] 4.3: Criar Zustand store para ciclo selecionado (compartilhado entre paginas)
  - [x] 4.4: Escrever testes para empty state no Dashboard — 2 testes passando

- [x] Task 5: Verificacao final (AC: 1-7)
  - [x] 5.1: Executar suite completa de testes frontend — 112 testes passando
  - [x] 5.2: Verificar build TypeScript sem erros
  - [x] 5.3: Verificar build Vite de producao sem erros

## Dev Notes

### Contrato API (ja implementado na Story 2.1)
- GET `/api/billing-cycles` → array de ciclos ordenados por startDate desc
- GET `/api/billing-cycles/:id` → ciclo com summary { salary, totalCards, totalFixed, totalTaxes, totalReceivables, netResult }
- POST `/api/billing-cycles` { name, startDate, endDate, salary } → 201 + ciclo criado
- PUT `/api/billing-cycles/:id` { name?, startDate?, endDate?, salary? } → 200 + ciclo atualizado

### Arquitetura Frontend (de architecture.md + stories anteriores)
- Feature-based: `src/features/billing-cycle/`
  - `hooks/` — TanStack Query hooks
  - `components/` — CycleSelector, BillingCycleForm
  - `types.ts` — interfaces e DTOs
- TanStack Query para server state (staleTime 30s, 1 retry)
- Zustand para UI state (ciclo selecionado)
- React Hook Form para formularios
- shadcn/ui: Button, Card, Input, Dialog, Sheet, Skeleton, Badge
- Toasts via Sonner (dark theme)
- Path alias: @/ → ./src/

### Padroes de Componentes (de stories anteriores)
- Dark theme: bg #0f172a, cards #1e293b, text #f1f5f9, border #334155
- Cores semaforicas: green #6ee7a0, red #fca5a5, amber #fcd34d
- Inputs: background #1e293b, border #334155, rounded-12px, foco muda border para #6ee7a0
- Touch targets minimo 44x44px
- Skeleton loading states
- Mobile-first: < 768px primario, >= 768px desktop

### Formatacao de Datas e Valores
- Datas no CycleSelector: "25/Jan — 24/Fev" (dia/Mes abreviado)
- Valores monetarios: R$ 7.300,00 (pt-BR locale)
- inputMode="decimal" para campos monetarios

### API Service (shared/services/api.service.ts)
- apiService.get<T>(url), .post<T>(url, data), .put<T>(url, data), .delete<T>(url)
- Auto-attaches Bearer token, handles 401 refresh

## Dev Agent Record

### Implementation Notes
- Criados types, hooks (useBillingCycles, useBillingCycle, useCreateBillingCycle, useCycleNavigation), componentes (CycleSelector, BillingCycleForm, ResponsiveFormContainer), Zustand store para ciclo selecionado
- CycleSelector com chip dark style (#1e293b bg, #334155 border, rounded-20px), setas de navegacao, skeleton loading
- BillingCycleForm usa React Hook Form com validacao, inputMode="decimal" para salario
- ResponsiveFormContainer: Dialog no desktop (>=768px), Sheet no mobile (<768px) via useMediaQuery hook
- Integrado CycleSelector em DashboardPage e TransacoesPage
- Empty state no Dashboard com CTA "Crie seu primeiro ciclo"
- Adicionado matchMedia mock no test setup para suporte a useMediaQuery em jsdom
- Atualizado routes test para incluir QueryClientProvider e apiService mock

### Completion Notes
- 112 testes unitarios frontend passando (0 regressoes)
- TypeScript build sem erros
- Vite production build sem erros

## File List

- frontend/src/features/billing-cycle/types.ts (new)
- frontend/src/features/billing-cycle/hooks/use-billing-cycles.ts (new)
- frontend/src/features/billing-cycle/hooks/use-billing-cycles.test.tsx (new)
- frontend/src/features/billing-cycle/hooks/use-cycle-navigation.ts (new)
- frontend/src/features/billing-cycle/hooks/use-cycle-navigation.test.tsx (new)
- frontend/src/features/billing-cycle/components/CycleSelector.tsx (new)
- frontend/src/features/billing-cycle/components/CycleSelector.test.tsx (new)
- frontend/src/features/billing-cycle/components/BillingCycleForm.tsx (new)
- frontend/src/features/billing-cycle/components/BillingCycleForm.test.tsx (new)
- frontend/src/features/billing-cycle/components/ResponsiveFormContainer.tsx (new)
- frontend/src/features/billing-cycle/stores/cycle.store.ts (new)
- frontend/src/features/dashboard/pages/DashboardPage.tsx (modified)
- frontend/src/features/dashboard/pages/DashboardPage.test.tsx (new)
- frontend/src/features/transaction/pages/TransacoesPage.tsx (modified)
- frontend/src/shared/hooks/use-media-query.ts (new)
- frontend/src/test/setup.ts (modified)
- frontend/src/routes/index.test.tsx (modified)

## Change Log

- 2026-02-27: Implemented Story 2.2 — CycleSelector component, BillingCycleForm, page integration, Zustand store for selected cycle
