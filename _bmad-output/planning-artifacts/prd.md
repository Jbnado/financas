---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain-skipped', 'step-06-innovation-skipped', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
workflowComplete: true
completedAt: '2026-02-23'
inputDocuments: ['brainstorming-session-2026-02-23.md']
workflowType: 'prd'
briefCount: 0
researchCount: 0
brainstormingCount: 1
projectDocsCount: 0
classification:
  projectType: web_app
  domain: fintech_personal
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - financas

**Autor:** Bernardo
**Data:** 2026-02-23

## Executive Summary

App web de finanças pessoais que substitui uma planilha Excel existente, organizando a vida financeira em torno de **ciclos de fatura** — não meses calendário. O conceito central é que o dinheiro gasto hoje é débito no salário do mês seguinte, e o app reflete essa realidade. Destinado a um único usuário (dev PJ) que precisa controlar gastos de cartão, despesas fixas da casa, impostos PJ, divisão de gastos com terceiros, e agora também patrimônio e investimentos.

O app consolida numa interface mobile-first: registro de transações com parcelamento automático, categorização inteligente, controle de quem deve quanto (splits), gastos fixos vs variáveis, impostos, metas financeiras, reserva de emergência, e rastreamento de patrimônio/investimentos — com dashboards visuais de evolução, distribuição e projeção.

### O Que Torna Este Produto Especial

- **Ciclo de fatura como unidade de tempo** — reflete o fluxo real do dinheiro: compra hoje, paga no próximo salário. Diferente de apps que usam mês calendário, este organiza tudo pelo fechamento do cartão.
- **Split de gastos nativo** — resolve o problema real de "comprei no meu cartão, mas R$150 é da Vitória". Gera automaticamente o controle de "à receber" por pessoa.
- **Visão completa integrada** — gastos variáveis + fixos + impostos PJ + patrimônio + investimentos + projeções, tudo num lugar só. A planilha fazia parte disso; o app faz tudo com automação e visualização.
- **Patrimônio líquido real** — desconta parcelas futuras comprometidas dos ativos, mostrando quanto o usuário realmente tem disponível.

## Classificação do Projeto

- **Tipo:** Web App (SPA/PWA, mobile-first)
- **Domínio:** Finanças pessoais (single-user, sem compliance regulatório)
- **Complexidade:** Média (regras de negócio ricas, sem requisitos regulatórios)
- **Contexto:** Greenfield (projeto novo, substituindo planilha)

## Critérios de Sucesso

### Sucesso do Usuário

- Conseguir registrar uma transação (com ou sem parcelas, com ou sem split) em menos de 30 segundos pelo celular
- Abrir o app e ver imediatamente: quanto sobra no ciclo atual, quanto está comprometido nos próximos meses, e como está o patrimônio
- Nunca mais precisar abrir a planilha Excel — o app cobre 100% dos casos de uso atuais + melhorias
- Saber em segundos quanto cada pessoa te deve, e marcar pagamentos parciais com facilidade

### Sucesso Técnico

- Mobile-first responsivo — usável confortavelmente no celular como interface principal
- Carregamento rápido do dashboard (< 2s)
- Deploy simples via Docker Compose (backend + frontend + banco)
- Dados seguros com autenticação (single-user, JWT ou basic auth)

### Resultados Mensuráveis

- Planilha Excel completamente substituída após migração dos dados existentes
- Todas as regras de negócio atuais (ciclo de fatura, splits, parcelas, fixos, impostos) funcionando
- Dashboards com gráficos de categoria, evolução mensal e projeção

## Jornadas do Usuário

### Jornada 1: Registrar compra com split

**Cena:** Bernardo sai do restaurante com pai e mãe. Pagou R$300 no Santander. Conta dividida igualmente.

**Ação:** Abre o app, "Nova transação" → "Restaurante Madero", categoria "Restaurante" (sugerida), R$300, Santander, à vista. Split: 1/3 dele (R$100), 1/3 Pai (R$100), 1/3 Mãe (R$100).

**Valor:** O "À Receber" atualiza — Pai deve R$100, Mãe deve R$100. O gasto real do ciclo aumentou R$100, não R$300. Resultado líquido correto.

**Resolução:** Pai faz Pix dois dias depois. Bernardo abre "À Receber" → Pai → marca R$100 como pago.

### Jornada 2: Compra parcelada

**Cena:** Geladeira quebrou. Brastemp R$4.000 em 10x no Inter.

**Ação:** Registra "Brastemp Geladeira", categoria "Casa", R$4.000, 10 parcelas, Inter.

**Valor:** App gera 10 parcelas de R$400 nos próximos ciclos automaticamente. Em "Projeção", vê o impacto: onde sobrava R$1.500/mês, agora sobra R$1.100 por 10 ciclos.

**Resolução:** Cada mês a parcela aparece no ciclo correto ("2 de 10", "3 de 10") sem esforço.

### Jornada 3: Fechar ciclo e analisar saúde financeira

**Cena:** Dia do fechamento da fatura. Quer entender como foi o ciclo.

**Ação:** Dashboard mostra: Salário R$7.300, Cartões R$2.800, Fixos R$4.600, Impostos R$950, Metas R$500. Resultado: -R$1.550 (vermelho).

**Valor:** Detalha "Cartões" por categoria — R$900 em Ifood foi o vilão (+40% vs mês anterior). Gráfico de pizza mostra onde o dinheiro foi.

**Resolução:** Fecha ciclo. Snapshot do patrimônio gravado. Mesmo com mês negativo, patrimônio cresceu R$800 com rendimentos.

### Jornada 4: Consultar patrimônio e investimentos

**Cena:** Recebeu um extra e quer decidir onde colocar.

**Ação:** Tela de Patrimônio: Santander PJ R$3.200, Inter PF R$1.500, CDB Inter R$15.000 (reserva), Tesouro R$8.000, CDB Nubank R$5.000.

**Valor:** Total R$32.700. Líquido (menos R$3.600 em parcelas futuras): R$29.100. Reserva de emergência em 65% da meta. "Faltam R$8.000."

**Resolução:** Coloca o extra no CDB Inter vinculado à reserva. Barra de progresso sobe.

### Resumo de Requisitos das Jornadas

| Jornada | Capacidades Reveladas |
|---------|----------------------|
| Compra com split | Registro rápido, split flexível, à receber automático, pagamento parcial |
| Compra parcelada | Geração automática de parcelas futuras, projeção de compromissos |
| Fechamento de ciclo | Dashboard resumo, detalhamento por categoria, comparativo, snapshot patrimônio |
| Patrimônio | Listagem contas/investimentos, patrimônio líquido, vínculo com metas, progresso |

## Requisitos Específicos de Web App

### Visão Geral

SPA/SSR com framework moderno (Astro, Next.js, Remix ou similar) servindo interface React + TypeScript + TailwindCSS. Backend NestJS como API REST. Aplicação autenticada, sem conteúdo público.

### Design Responsivo

- **Mobile-first** — interface principal é celular, layout desktop é bônus
- **Breakpoints:** Mobile (< 768px) como primário, tablet/desktop como secundário
- **Touch-friendly:** Botões e áreas de toque dimensionados para uso com polegar
- **Navegação:** Bottom navigation ou similar para acesso rápido às seções principais (Dashboard, Transações, À Receber, Patrimônio)

### Browsers Suportados

- Safari (iOS/macOS) — sempre atualizado
- Microsoft Edge — sempre atualizado
- Sem necessidade de suporte a browsers legados

### Performance

- Dashboard carrega em < 2s
- Registro de transação fluido sem lag perceptível
- Bundle otimizado (code splitting, lazy loading de rotas)
- API responses < 500ms para operações comuns

### SEO

- Não aplicável — app 100% autenticado, sem conteúdo público indexável

### Acessibilidade

- Nível básico — HTML semântico, contraste adequado, navegação por teclado funcional
- Sem requisito formal de WCAG (uso pessoal)

### Considerações de Implementação

- **Frontend:** React + TypeScript + TailwindCSS, com framework SSR/SSG a definir na arquitetura (Astro, Next.js, Remix)
- **Backend:** NestJS + TypeScript, API REST
- **Banco:** PostgreSQL com ORM (Prisma ou TypeORM)
- **Auth:** JWT ou session-based, single-user
- **Deploy:** Docker Compose (frontend + backend + PostgreSQL)
- **Sem real-time:** Todas as atualizações são manuais (fetch on demand)

## Escopo do Projeto & Desenvolvimento Faseado

### Estratégia do MVP

**Abordagem:** MVP de resolução de problema — o mínimo que substitui a planilha Excel com vantagem.

**Recurso:** 1 desenvolvedor (Bernardo) + AI-assisted coding. Sem equipe, sem deadline externo.

**Filosofia:** Só entra no MVP se, sem isso, o app não substitui a planilha. Todo o resto é pós-MVP.

### MVP (Fase 1) — Substituir a Planilha

**Jornadas suportadas:** Jornadas 1, 2 e 3 (registro de transação, parcelas, fechamento de ciclo)

**Capacidades essenciais:**
- Auth single-user (JWT)
- CRUD: Categorias, Meios de Pagamento, Pessoas
- Ciclos de fatura: criar, fechar, navegar entre ciclos
- Transações: registro com data, valor, categoria, cartão, status pago
- Parcelas automáticas: cadastra 1x, gera N parcelas nos ciclos futuros
- Splits: dividir transação entre pessoas, gerar "à receber" automático
- À Receber: ver por pessoa, marcar como pago (total ou parcial)
- Gastos fixos: cadastro + registro real por ciclo
- Impostos PJ: cadastro + registro real por ciclo
- Dashboard ciclo: resumo (salário - cartões - fixos - impostos = líquido), lista de transações, gasto por categoria
- Mobile-first responsivo

### Fase 2 (Growth) — Visualização e Patrimônio

**Jornada suportada:** Jornada 4 (patrimônio) + dashboards avançados

- Gráficos: pizza por categoria, evolução mensal, comparativo ciclo anterior
- Projeção financeira: 3-6 meses com base em fixos + parcelas + salário
- Patrimônio: contas bancárias, investimentos individuais, snapshot por ciclo
- Patrimônio líquido real (ativos - parcelas futuras)
- Metas financeiras com tracking de progresso
- Reserva de emergência com meta e evolução
- Categorização inteligente (sugestão por nome)
- Tags e notas nas transações
- Busca e filtros (período, categoria, cartão, pessoa)

### Fase 3 (Visão) — Automação e Conveniência

- PWA com suporte offline + sync
- Relatório anual
- Notificações de cobranças pendentes
- Import de dados da planilha Excel existente
- Regras de auto-categorização customizáveis

### Mitigação de Riscos

**Risco técnico:** Geração automática de parcelas em ciclos futuros (ciclos podem não existir ainda). **Mitigação:** Criar ciclos sob demanda quando parcelas precisam ser alocadas, ou manter parcelas "órfãs" até o ciclo ser criado.

**Risco de escopo:** Feature creep no MVP, especialmente dashboards e gráficos. **Mitigação:** MVP usa tabelas simples e números, sem gráficos. Gráficos são Fase 2.

**Risco de motivação:** Projeto solo pode perder momentum. **Mitigação:** MVP enxuto que pode ser funcional em poucas semanas via vibe coding. Usar o app no dia a dia ASAP cria motivação orgânica.

## Requisitos Funcionais

### Autenticação

- **FR1:** Usuário pode fazer login com credenciais (email/senha)
- **FR2:** Usuário pode manter sessão ativa entre visitas (token persistente)

### Ciclos de Fatura

- **FR3:** Usuário pode criar um ciclo de fatura com nome, data início, data fim e salário do período
- **FR4:** Usuário pode fechar um ciclo de fatura, impedindo novas edições
- **FR5:** Usuário pode navegar entre ciclos (anterior, próximo, lista)
- **FR6:** Usuário pode ver o resumo calculado do ciclo (salário - cartões - fixos - impostos - metas + à receber = líquido)
- **FR7:** Sistema cria ciclos futuros sob demanda quando parcelas precisam ser alocadas

### Categorias

- **FR8:** Usuário pode criar, editar, desativar e listar categorias de gastos
- **FR9:** Sistema fornece categorias iniciais pré-cadastradas (seed)

### Meios de Pagamento

- **FR10:** Usuário pode criar, editar, desativar e listar meios de pagamento (cartão crédito, débito)
- **FR11:** Cada meio de pagamento pode ter dia de vencimento associado

### Pessoas

- **FR12:** Usuário pode criar, editar, desativar e listar pessoas (para splits e à receber)
- **FR13:** Sistema fornece pessoas iniciais pré-cadastradas (seed)

### Transações

- **FR14:** Usuário pode registrar uma transação com descrição, categoria, data, valor, meio de pagamento e ciclo de fatura
- **FR15:** Usuário pode registrar uma transação parcelada informando número total de parcelas e o sistema gera automaticamente todas as parcelas nos ciclos correspondentes
- **FR16:** Usuário pode marcar uma transação como paga ou não paga
- **FR17:** Usuário pode editar e excluir transações
- **FR18:** Usuário pode ver a lista de transações de um ciclo com filtro por categoria, cartão e status de pagamento
- **FR19:** Usuário pode visualizar o indicador de parcela ("3 de 10") em transações parceladas
- **FR20:** Usuário pode adicionar notas/observações a uma transação
- **FR21:** Usuário pode adicionar tags a uma transação
- **FR22:** Sistema pode sugerir categoria automaticamente com base no nome da transação

### Splits e À Receber

- **FR23:** Usuário pode dividir uma transação entre múltiplas pessoas (por valor fixo ou percentual)
- **FR24:** Sistema valida que a soma dos splits é igual ao valor total da transação
- **FR25:** Sistema gera automaticamente um registro de "à receber" para cada split de outra pessoa
- **FR26:** Usuário pode ver o total que cada pessoa deve (visão consolidada por pessoa)
- **FR27:** Usuário pode marcar um à receber como pago (total ou parcialmente)
- **FR28:** Usuário pode ver o histórico de pagamentos de uma pessoa
- **FR29:** O gasto real do usuário em relatórios considera apenas a sua parte do split, não o valor total

### Gastos Fixos

- **FR30:** Usuário pode cadastrar gastos fixos com nome, valor estimado, dia de vencimento
- **FR31:** Usuário pode registrar o valor real de um gasto fixo em cada ciclo
- **FR32:** Usuário pode comparar valor real vs estimado de cada gasto fixo
- **FR33:** Usuário pode ver o histórico de variação de gastos fixos ao longo dos ciclos
- **FR34:** Usuário pode marcar gasto fixo do ciclo como pago

### Impostos PJ

- **FR35:** Usuário pode cadastrar impostos com nome, taxa e valor estimado
- **FR36:** Usuário pode registrar o valor real de um imposto em cada ciclo
- **FR37:** Usuário pode marcar imposto do ciclo como pago

### Dashboard e Relatórios

- **FR38:** Usuário pode ver o resumo do ciclo atual na tela principal (resultado líquido, totais por categoria)
- **FR39:** Usuário pode ver gráfico de distribuição de gastos por categoria (pizza/barras)
- **FR40:** Usuário pode ver gráfico de evolução do resultado líquido ao longo dos ciclos
- **FR41:** Usuário pode comparar gastos do ciclo atual vs ciclo anterior
- **FR42:** Usuário pode ver indicador visual de saúde financeira (positivo/negativo)
- **FR43:** Usuário pode buscar transações por período, categoria, cartão e pessoa

### Projeção Financeira

- **FR44:** Sistema pode projetar o resultado líquido dos próximos 3-6 ciclos com base em fixos + parcelas futuras + salário
- **FR45:** Sistema alerta quando a projeção indicar ciclo com resultado negativo
- **FR46:** Usuário pode ver quanto está comprometido em parcelas futuras por ciclo

### Patrimônio

- **FR47:** Usuário pode cadastrar contas bancárias (nome, instituição, tipo, saldo)
- **FR48:** Usuário pode cadastrar investimentos individuais (nome, tipo, instituição, valor aplicado, valor atual, liquidez, vencimento opcional)
- **FR49:** Usuário pode atualizar manualmente o saldo de contas e valor de investimentos
- **FR50:** Usuário pode ver o patrimônio total (soma de contas + investimentos)
- **FR51:** Usuário pode ver o patrimônio líquido real (ativos - parcelas futuras comprometidas)
- **FR52:** Sistema grava snapshot automático do patrimônio ao fechar cada ciclo
- **FR53:** Usuário pode ver a evolução do patrimônio ao longo dos ciclos
- **FR54:** Usuário pode ver a distribuição do patrimônio por tipo (corrente, investido, etc.)
- **FR55:** Usuário pode vincular um investimento a uma meta financeira

### Metas Financeiras

- **FR56:** Usuário pode definir metas de economia por categoria (ex: máximo R$500 em Ifood)
- **FR57:** Usuário pode definir meta de reserva de emergência com valor alvo e tracking de progresso
- **FR58:** Usuário pode definir meta de poupança mensal
- **FR59:** Usuário pode ver o progresso de cada meta em relação ao objetivo

## Requisitos Não-Funcionais

### Performance

- Dashboard do ciclo carrega em < 2 segundos
- Registro de transação (salvar) em < 500ms
- Listagem de transações com filtros em < 1 segundo
- Navegação entre telas sem lag perceptível (< 300ms)
- Bundle frontend < 500KB (gzipped) para carregamento rápido em mobile

### Segurança

- Autenticação obrigatória — nenhuma rota da API acessível sem token válido
- Senhas armazenadas com hash (bcrypt ou argon2)
- Comunicação via HTTPS em produção
- Tokens JWT com expiração (ex: 7 dias) e refresh
- Dados financeiros acessíveis apenas pelo usuário autenticado

### Infraestrutura e Deploy

- Deploy via Docker Compose com um único `docker-compose up`
- Volumes persistentes para dados do PostgreSQL
- Variáveis de ambiente para configuração (sem secrets em código)
- Backup do banco de dados viável via pg_dump

### Dados

- Valores monetários armazenados como Decimal com precisão de 2 casas (nunca float)
- Soft-delete para entidades principais (categorias, pessoas, meios de pagamento) usando campo `is_active`
- Integridade referencial garantida pelo banco (foreign keys)
