---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Controle de Patrimônio e Investimentos'
session_goals: 'Mapear funcionalidades para rastrear quanto o usuário tem guardado, onde está investido, rendimentos e evolução'
selected_approach: 'ai-recommended'
techniques_used: ['Mind Mapping']
ideas_generated: 8
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitador:** Bernardo
**Data:** 2026-02-23

## Visão Geral da Sessão

**Tópico:** Controle de Patrimônio e Investimentos
**Objetivo:** Expandir o escopo do app de finanças pessoais para além de gastos — rastrear patrimônio, investimentos, saldos e evolução
**Técnica:** Mind Mapping (AI-Recommended)

### Contexto

O app já cobre gastos, ciclos de fatura, splits, parcelas e reserva de emergência. A sessão explorou uma camada complementar: **"quanto eu tenho"** além de "quanto eu gasto".

## Ideias Organizadas por Tema

### Tema 1: Contas e Saldos (Onde está o dinheiro)

- **Account (Conta)** — Entidade para rastrear contas bancárias: nome, banco/instituição, tipo (corrente PJ, corrente PF, poupança, carteira física), saldo atual
- **Histórico de saldo por ciclo** — Snapshot automático do saldo de cada conta ao fechar um ciclo, criando histórico de evolução

### Tema 2: Investimentos (Onde o dinheiro rende)

- **Investment (Investimento)** — Cada investimento rastreado individualmente: nome, tipo (CDB, Tesouro, Ações, Fundos, Cripto, Poupança), instituição, valor aplicado, valor atual
- **Liquidez e vencimento** — Campos opcionais para classificar liquidez (imediata, D+1, D+30, no vencimento) e data de vencimento para renda fixa
- **Rendimento por período** — Calcular rendimento mensal e acumulado (valor atual - valor aplicado)

### Tema 3: Vínculo Patrimônio ↔ Metas

- **Investment vinculado a FinancialGoal** — Associar um investimento a uma meta específica (ex: "CDB Inter = Reserva de emergência"), distinguindo dinheiro destinado vs dinheiro livre
- **Patrimônio disponível** — Ativos sem vínculo a metas = dinheiro realmente disponível

### Tema 4: Dashboard e Visão Geral

- **"Quanto eu valho hoje?"** — Patrimônio total = soma de todas as contas + todos os investimentos
- **Patrimônio líquido real** — Ativos totais menos parcelas futuras comprometidas nos cartões (mostra a realidade)
- **Distribuição por tipo** — Gráfico de pizza: % em conta corrente, % investido, % por tipo de investimento
- **Evolução mês a mês** — Gráfico de linha do patrimônio total ao longo dos ciclos
- **Rendimento total do mês** — Comparativo vs mês anterior

### Tema 5: Projeções

- **Projeção de crescimento** — "Se continuar guardando X/mês, em Y meses tenho Z"
- **Previsão de meta** — "Quando atinjo a reserva de emergência no ritmo atual?"
- **Alertas de variação** — Notificar quando patrimônio subiu ou caiu vs ciclo anterior

## Decisões de Design

- **Atualização manual** — Sem integração bancária, o usuário atualiza saldos e valores manualmente
- **Rastreamento individual** — Cada investimento é uma entrada separada, não apenas saldo por instituição
- **Simplicidade** — Campos mínimos necessários, sem complexidade de carteira de investimentos profissional
- **PatrimonySnapshot** — Registro automático a cada ciclo fechado para manter histórico sem esforço do usuário

## Modelo de Dados Sugerido (Novas Entidades)

```
Account (conta bancária/carteira)
  - id, name, institution, type (checking_pj/checking_pf/savings/wallet),
    balance, is_active

Investment (investimento individual)
  - id, name, type (cdb/treasury/stocks/funds/crypto/savings),
    institution, applied_value, current_value,
    liquidity (immediate/d1/d30/on_maturity),
    maturity_date (opcional), financial_goal_id (opcional),
    is_active

PatrimonySnapshot (foto mensal do patrimônio)
  - id, billing_cycle_id, total_accounts, total_investments,
    total_patrimony, total_committed (parcelas futuras),
    net_patrimony
```

## Próximos Passos

1. Incorporar estas entidades no modelo de dados do projeto durante a fase de PRD/Arquitetura
2. Integrar o Dashboard de Patrimônio com o Dashboard de Gastos já planejado
3. Conectar PatrimonySnapshot ao fechamento de BillingCycle
4. Vincular Investment ↔ FinancialGoal (campo opcional financial_goal_id)
