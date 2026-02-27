# Story 3.3: CRUD de Pessoas e Tela de Configuracoes (Backend + Frontend)

Status: pending

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

- [ ] Task 1: Adicionar model Person ao Prisma schema (AC: 6, 7)
  - [ ] 1.1: Adicionar model Person: id UUID, name String, isActive Boolean @default(true), userId String, createdAt, updatedAt
  - [ ] 1.2: Relacao com User (onDelete: Cascade), @@map("persons"), @@index([userId])
  - [ ] 1.3: Adicionar relacao persons Person[] no model User
  - [ ] 1.4: Rodar `npx prisma migrate dev --name add_person`
  - [ ] 1.5: Rodar `npx prisma generate`

- [ ] Task 2: Criar DTOs com validacao (AC: 1, 10)
  - [ ] 2.1: Escrever testes (RED) para CreatePersonDto — name required
  - [ ] 2.2: Criar `src/modules/person/dto/create-person.dto.ts` com @IsString @IsNotEmpty name + Swagger
  - [ ] 2.3: Criar `src/modules/person/dto/update-person.dto.ts` como PartialType
  - [ ] 2.4: Criar `src/modules/person/dto/person-response.dto.ts`
  - [ ] 2.5: Verificar testes passam (GREEN)

- [ ] Task 3: Criar PersonService com CRUD (AC: 1, 2, 3)
  - [ ] 3.1: Escrever testes (RED) para service: create, findAll, update, softDelete
  - [ ] 3.2: Criar `src/modules/person/person.service.ts` com:
    - create(userId, dto)
    - findAll(userId) — lista ativas ordenadas por name
    - findOne(userId, id)
    - update(userId, id, dto)
    - remove(userId, id) — soft-delete
  - [ ] 3.3: Verificar testes passam (GREEN)

- [ ] Task 4: Criar PersonController com endpoints (AC: 1, 2, 3, 10)
  - [ ] 4.1: Escrever testes (RED) para controller: POST, GET, PUT, DELETE
  - [ ] 4.2: Criar `src/modules/person/person.controller.ts`:
    - POST `/persons`
    - GET `/persons`
    - PUT `/persons/:id`
    - DELETE `/persons/:id`
  - [ ] 4.3: Swagger decorators
  - [ ] 4.4: Criar `src/modules/person/person.module.ts` e registrar no AppModule
  - [ ] 4.5: Verificar testes passam (GREEN)

- [ ] Task 5: Adicionar seed data de pessoas (AC: 8)
  - [ ] 5.1: Atualizar `prisma/seed.ts` — apos criar usuario e categorias, criar pessoas iniciais vinculadas ao userId
  - [ ] 5.2: Pessoas seed: "Eu" (o proprio usuario), e 2-3 nomes exemplo

- [ ] Task 6: Criar frontend — hooks e componentes de Pessoas (AC: 4, 5)
  - [ ] 6.1: Adicionar interface Person ao `src/features/settings/types.ts`
  - [ ] 6.2: Criar `src/features/settings/hooks/use-persons.ts` com TanStack Query
  - [ ] 6.3: Criar `src/features/settings/components/PersonList.tsx` — lista simples com nome, botao adicionar, botao desativar
  - [ ] 6.4: Criar `src/features/settings/components/PersonForm.tsx` — formulario simples com campo nome
  - [ ] 6.5: Escrever testes para hooks e componentes

- [ ] Task 7: Criar SettingsPage integrando os 3 CRUDs (AC: 4, 5, 9)
  - [ ] 7.1: Escrever testes (RED) para SettingsPage — renderiza 3 secoes, cada uma com titulo e lista
  - [ ] 7.2: Criar `src/features/settings/pages/SettingsPage.tsx` com layout:
    - Titulo "Configuracoes" no topo
    - 3 secoes em scroll vertical: Categorias, Meios de Pagamento, Pessoas
    - Cada secao em Card (#1e293b) com titulo, contagem de items, lista resumida (max 3-5 items), botao "Gerenciar" que expande ou navega
  - [ ] 7.3: Integrar CategoryList, PaymentMethodList e PersonList como secoes expansiveis ou sub-paginas
  - [ ] 7.4: Substituir o conteudo placeholder do ConfigPage pelo novo SettingsPage
  - [ ] 7.5: Verificar testes passam (GREEN)

- [ ] Task 8: Verificacao final (AC: 1-10)
  - [ ] 8.1: Executar suite completa de testes backend — todos passando
  - [ ] 8.2: Executar suite completa de testes frontend — todos passando
  - [ ] 8.3: Verificar build TypeScript sem erros (backend + frontend)
  - [ ] 8.4: Verificar que testes de stories anteriores nao regredem

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
