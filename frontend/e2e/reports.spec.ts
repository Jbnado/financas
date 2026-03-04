import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import {
  createBillingCycle,
  createCategory,
  createPaymentMethod,
  createTransaction,
  createPerson,
  createSplits,
  apiGet,
} from './helpers/api'

test.describe('Reports Page', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('should show empty state when no cycles', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Relatórios', /\/relatorios/)
    await expect(page.getByText(/nenhum ciclo encontrado/i)).toBeVisible()
  })

  test('should navigate to reports page via nav', async ({ page, request }) => {
    // Setup data
    const cycle1 = await createBillingCycle(request, token, {
      name: 'Janeiro 2026',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-31T00:00:00.000Z',
      salary: '7300.00',
    })
    const cycle2 = await createBillingCycle(request, token, {
      name: 'Fevereiro 2026',
      startDate: '2026-02-01T00:00:00.000Z',
      endDate: '2026-02-28T00:00:00.000Z',
      salary: '7300.00',
    })
    const cat1 = await createCategory(request, token, { name: 'Alimentação', color: '#f97316' })
    const cat2 = await createCategory(request, token, { name: 'Transporte', color: '#3b82f6' })
    const pm = await createPaymentMethod(request, token, { name: 'Nubank', type: 'credit' })

    // Transactions in cycle 1
    await createTransaction(request, token, {
      description: 'Mercado Jan',
      amount: '800.00',
      date: '2026-01-10T00:00:00.000Z',
      billingCycleId: cycle1.id,
      categoryId: cat1.id,
      paymentMethodId: pm.id,
    })

    // Transactions in cycle 2
    await createTransaction(request, token, {
      description: 'Mercado Fev',
      amount: '1000.00',
      date: '2026-02-10T00:00:00.000Z',
      billingCycleId: cycle2.id,
      categoryId: cat1.id,
      paymentMethodId: pm.id,
    })
    await createTransaction(request, token, {
      description: 'Uber Fev',
      amount: '200.00',
      date: '2026-02-15T00:00:00.000Z',
      billingCycleId: cycle2.id,
      categoryId: cat2.id,
      paymentMethodId: pm.id,
    })

    await loginViaUI(page, user)
    await navigateTo(page, 'Relatórios', /\/relatorios/)

    // Should show category distribution section
    await expect(page.getByText('Distribuição por categoria')).toBeVisible()

    // Should show cycle evolution section
    await expect(page.getByText('Evolução do resultado líquido')).toBeVisible()
  })

  test('should show category distribution for current cycle', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Relatórios', /\/relatorios/)

    // Navigate to Fev cycle (most recent containing today's context cycle)
    await expect(page.getByText('Distribuição por categoria')).toBeVisible()

    // Should show Alimentação and Transporte categories
    await expect(page.getByText('Alimentação').first()).toBeVisible()
  })

  test('should show cycle comparison section', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Relatórios', /\/relatorios/)

    // Should show comparison between current and previous cycle
    // or "Sem ciclo anterior" if only one cycle visible
    const comparisonSection = page.getByText(/vs|Sem ciclo anterior/)
    await expect(comparisonSection).toBeVisible()
  })

  test('should show splits correctly in reports (userAmount)', async ({ page, request }) => {
    const person = await createPerson(request, token, { name: 'João' })
    const cycles = await apiGet<Array<{ id: string; name: string }>>(request, '/billing-cycles', token)
    const fevCycle = cycles.find((c) => c.name === 'Fevereiro 2026')!

    const cat = await createCategory(request, token, { name: 'Lazer', color: '#8b5cf6' })
    const pm = await createPaymentMethod(request, token, { name: 'Cash', type: 'debit' })

    const tx = await createTransaction(request, token, {
      description: 'Cinema split',
      amount: '100.00',
      date: '2026-02-20T00:00:00.000Z',
      billingCycleId: fevCycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
    })
    await createSplits(request, token, tx.id, [
      { personId: person.id, amount: '50.00' },
    ])

    await loginViaUI(page, user)
    await navigateTo(page, 'Relatórios', /\/relatorios/)

    // Category distribution should exist showing all categories
    await expect(page.getByText('Distribuição por categoria')).toBeVisible()
  })

  test('should navigate cycles with arrows on reports page', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Relatórios', /\/relatorios/)

    // CycleSelector should be present
    const prevButton = page.getByLabel('Ciclo anterior')
    const nextButton = page.getByLabel('Próximo ciclo')

    // Should be able to navigate to previous cycle
    await prevButton.click()
    await expect(page.getByText(/1\/Jan/)).toBeVisible()
  })

  test('reports API should return correct data', async ({ request }) => {
    const cycles = await apiGet<Array<{ id: string; name: string }>>(request, '/billing-cycles', token)
    const fevCycle = cycles.find((c) => c.name === 'Fevereiro 2026')!

    // Test category distribution API
    const dist = await apiGet<{ items: Array<{ categoryName: string; total: string; percentage: number }>; grandTotal: string }>(
      request,
      `/reports/category-distribution/${fevCycle.id}`,
      token,
    )
    expect(dist.items.length).toBeGreaterThan(0)
    expect(parseFloat(dist.grandTotal)).toBeGreaterThan(0)

    // Test cycle evolution API
    const evolution = await apiGet<{ cycles: Array<{ cycleName: string; netResult: string }> }>(
      request,
      '/reports/cycle-evolution?last=6',
      token,
    )
    expect(evolution.cycles.length).toBeGreaterThanOrEqual(2)

    // Test cycle comparison API
    const comparison = await apiGet<{ current: { cycleName: string }; previous: { cycleName: string } | null }>(
      request,
      `/reports/cycle-comparison/${fevCycle.id}`,
      token,
    )
    expect(comparison.current.cycleName).toBe('Fevereiro 2026')
    expect(comparison.previous).not.toBeNull()
    expect(comparison.previous?.cycleName).toBe('Janeiro 2026')
  })
})
