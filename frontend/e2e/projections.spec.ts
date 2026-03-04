import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import {
  createBillingCycle,
  createCategory,
  createPaymentMethod,
  createTransaction,
  createFixedExpense,
  createTax,
  apiGet,
} from './helpers/api'

test.describe('Projections Page', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  // --- Navigation & Empty State ---

  test('should navigate to projections page via nav', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)
    await expect(page.getByText('Projeção Financeira')).toBeVisible()
  })

  test('should show empty state when no data for projection', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)
    await expect(page.getByText('Projeção Financeira')).toBeVisible()
    await expect(page.getByText('Sem dados para projeção')).toBeVisible()
  })

  // --- With Data ---

  test('should show projection sections after setup data', async ({ page, request }) => {
    // Create cycle with salary
    await createBillingCycle(request, token, {
      name: 'Março 2026',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T00:00:00.000Z',
      salary: '8000.00',
    })

    // Create fixed expenses
    await createFixedExpense(request, token, {
      name: 'Aluguel',
      estimatedAmount: '2500.00',
      dueDay: 10,
    })
    await createFixedExpense(request, token, {
      name: 'Internet',
      estimatedAmount: '150.00',
      dueDay: 15,
    })

    // Create taxes
    await createTax(request, token, {
      name: 'ISS',
      rate: '5.00',
      estimatedAmount: '400.00',
    })

    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)

    // Should show all sections
    await expect(page.getByText('Resumo da Projeção')).toBeVisible()
    await expect(page.getByText('Projeção de Receita vs Despesas')).toBeVisible()
    await expect(page.getByText('Alertas')).toBeVisible()
    await expect(page.getByText('Comprometimento Futuro')).toBeVisible()
  })

  test('should display positive projection when salary exceeds expenses', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)

    // salary (8000) > fixedExpenses (2650) + taxes (400) = 3050, net = 4950
    await expect(page.getByText('Nenhum alerta — projeção positiva')).toBeVisible()
    await expect(page.getByText('Média Resultado')).toBeVisible()
    await expect(page.getByText('Melhor Mês')).toBeVisible()
    await expect(page.getByText('Pior Mês')).toBeVisible()
  })

  // --- Horizon Selector ---

  test('should have horizon dropdown with default 6 meses', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)

    const select = page.getByLabel('Horizonte')
    await expect(select).toBeVisible()
    await expect(select).toHaveValue('6')
  })

  test('should change horizon to 3 months', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)

    const select = page.getByLabel('Horizonte')
    await select.selectOption('3')
    await expect(select).toHaveValue('3')
  })

  test('should change horizon to 12 months', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)

    const select = page.getByLabel('Horizonte')
    await select.selectOption('12')
    await expect(select).toHaveValue('12')
  })

  // --- API Tests ---

  test('projection API should return correct structure', async ({ request }) => {
    const result = await apiGet<{
      projections: Array<{
        cycleName: string
        projectedSalary: string
        projectedFixedExpenses: string
        projectedTaxes: string
        projectedInstallments: string
        projectedNetResult: string
      }>
      alerts: Array<{ month: string; deficit: string }>
    }>(request, '/projections?months=6', token)

    expect(result.projections).toHaveLength(6)
    expect(result.projections[0]).toHaveProperty('cycleName')
    expect(result.projections[0]).toHaveProperty('projectedSalary')
    expect(result.projections[0]).toHaveProperty('projectedFixedExpenses')
    expect(result.projections[0]).toHaveProperty('projectedTaxes')
    expect(result.projections[0]).toHaveProperty('projectedInstallments')
    expect(result.projections[0]).toHaveProperty('projectedNetResult')

    // Salary should be 8000.00 from our setup
    expect(result.projections[0].projectedSalary).toBe('8000.00')
    // Fixed expenses: 2500 + 150 = 2650
    expect(result.projections[0].projectedFixedExpenses).toBe('2650.00')
    // Taxes: 400
    expect(result.projections[0].projectedTaxes).toBe('400.00')
  })

  test('projection API should handle months parameter', async ({ request }) => {
    const result3 = await apiGet<{
      projections: Array<{ cycleName: string }>
    }>(request, '/projections?months=3', token)
    expect(result3.projections).toHaveLength(3)

    const result12 = await apiGet<{
      projections: Array<{ cycleName: string }>
    }>(request, '/projections?months=12', token)
    expect(result12.projections).toHaveLength(12)
  })

  test('projection API should clamp months to max 12', async ({ request }) => {
    const result = await apiGet<{
      projections: Array<{ cycleName: string }>
    }>(request, '/projections?months=50', token)
    expect(result.projections).toHaveLength(12)
  })

  test('projection API should default to 6 months', async ({ request }) => {
    const result = await apiGet<{
      projections: Array<{ cycleName: string }>
    }>(request, '/projections', token)
    expect(result.projections).toHaveLength(6)
  })

  // --- Installment Commitments ---

  test('installment commitments API should return empty when no installments', async ({ request }) => {
    const result = await apiGet<{
      commitments: Array<{ cycleName: string; totalCommitted: string; installmentCount: number }>
    }>(request, '/projections/installment-commitments', token)
    expect(result.commitments).toHaveLength(0)
  })

  test('should show installment commitments after creating installment transaction', async ({ page, request }) => {
    const cat = await createCategory(request, token, { name: 'Eletrodoméstico', color: '#22c55e' })
    const pm = await createPaymentMethod(request, token, { name: 'Cartão Parcelado', type: 'credit' })
    const cycles = await apiGet<Array<{ id: string; name: string }>>(request, '/billing-cycles', token)
    const currentCycle = cycles[0]

    // Create installment transaction (6 parcelas)
    await createTransaction(request, token, {
      description: 'Geladeira Nova',
      amount: '500.00',
      date: '2026-03-05T00:00:00.000Z',
      billingCycleId: currentCycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
      totalInstallments: 6,
    })

    // Check API
    const commitments = await apiGet<{
      commitments: Array<{ cycleName: string; totalCommitted: string; installmentCount: number }>
    }>(request, '/projections/installment-commitments', token)
    expect(commitments.commitments.length).toBeGreaterThan(0)

    // Check UI
    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)
    await expect(page.getByText('Comprometimento Futuro')).toBeVisible()

    // Should NOT show "Nenhuma parcela futura" anymore
    await expect(page.getByText('Nenhuma parcela futura')).not.toBeVisible()
  })

  // --- Deficit Alerts ---

  test('should show deficit alerts when expenses exceed salary', async ({ page, request }) => {
    // Create extra large fixed expense to trigger deficit
    await createFixedExpense(request, token, {
      name: 'Financiamento Caro',
      estimatedAmount: '6000.00',
      dueDay: 5,
    })

    // Now fixed expenses = 2500 + 150 + 6000 = 8650, taxes = 400
    // Total expenses = 9050 > salary 8000, so deficit = -1050

    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)

    // Should NOT show "Nenhum alerta" anymore
    await expect(page.getByText('Nenhum alerta — projeção positiva')).not.toBeVisible()
    // Should show alert entries instead
    await expect(page.getByText('Alertas')).toBeVisible()
  })

  test('deficit alerts should appear in API response', async ({ request }) => {
    const result = await apiGet<{
      projections: Array<{ projectedNetResult: string }>
      alerts: Array<{ month: string; deficit: string }>
    }>(request, '/projections?months=3', token)

    // All months should have deficit since fixed expenses > salary
    expect(result.alerts.length).toBeGreaterThan(0)
    for (const alert of result.alerts) {
      expect(parseFloat(alert.deficit)).toBeLessThan(0)
    }
  })

  // --- Net Result Calculation ---

  test('projection net result should equal salary minus all expenses', async ({ request }) => {
    const result = await apiGet<{
      projections: Array<{
        projectedSalary: string
        projectedFixedExpenses: string
        projectedTaxes: string
        projectedInstallments: string
        projectedNetResult: string
      }>
    }>(request, '/projections?months=1', token)

    const p = result.projections[0]
    const expected =
      parseFloat(p.projectedSalary) -
      parseFloat(p.projectedFixedExpenses) -
      parseFloat(p.projectedTaxes) -
      parseFloat(p.projectedInstallments)

    expect(parseFloat(p.projectedNetResult)).toBeCloseTo(expected, 2)
  })

  // --- Responsive & Navigation ---

  test('projections page should show Projeções nav item as active', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Projeções', /\/projecoes/)

    const navLink = page.getByRole('navigation').getByText('Projeções')
    await expect(navLink).toBeVisible()
  })
})
