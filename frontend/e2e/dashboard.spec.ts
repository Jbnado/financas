import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI } from './helpers/auth'
import {
  createBillingCycle,
  createCategory,
  createPaymentMethod,
  createTransaction,
  createPerson,
  createSplits,
} from './helpers/api'

test.describe('Dashboard', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('should show empty state when no cycles exist', async ({ page }) => {
    await loginViaUI(page, user)
    await expect(page.getByText(/nenhum ciclo encontrado/i)).toBeVisible()
    await expect(page.getByText(/crie seu primeiro ciclo/i)).toBeVisible()
  })

  test('should show dashboard summary after creating cycle with transactions', async ({ page, request }) => {
    // Setup: cycle + category + payment method + transactions
    const cycle = await createBillingCycle(request, token, {
      name: 'Março 2026',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T00:00:00.000Z',
      salary: '7000.00',
    })
    const cat = await createCategory(request, token, {
      name: 'Alimentação',
      color: '#f97316',
    })
    const pm = await createPaymentMethod(request, token, {
      name: 'Nubank',
      type: 'credit',
    })
    await createTransaction(request, token, {
      description: 'Supermercado',
      amount: '500.00',
      date: '2026-03-05T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
    })
    await createTransaction(request, token, {
      description: 'Restaurante',
      amount: '200.00',
      date: '2026-03-10T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
    })

    await loginViaUI(page, user)

    // Should show "Resultado líquido" label
    await expect(page.getByText('Resultado líquido')).toBeVisible()

    // Stats row should be visible (scope to main to avoid nav sidebar duplicates)
    const main = page.locator('main, [class*="flex-1"]').first()
    await expect(main.getByText('Receita', { exact: true })).toBeVisible()
    await expect(main.getByText('Despesa', { exact: true })).toBeVisible()

    // Category breakdown should show "Alimentação"
    await expect(page.getByText('Por categoria')).toBeVisible()
    await expect(page.getByText('Alimentação').first()).toBeVisible()

    // Recent transactions should show descriptions
    await expect(page.getByText('Supermercado')).toBeVisible()
    await expect(page.getByText('Restaurante')).toBeVisible()
    await expect(page.getByText('Ver todas')).toBeVisible()
  })

  test('should show positive net result in green', async ({ page }) => {
    await loginViaUI(page, user)

    // Net result = 7000 - 700 = 6300 (positive, green)
    const heroValue = page.locator('text=/\\+R\\$/')
    await expect(heroValue).toBeVisible()
  })

  test('should navigate "Ver todas" to transactions page', async ({ page }) => {
    await loginViaUI(page, user)

    await page.getByText('Ver todas').click()
    await expect(page).toHaveURL(/\/transacoes/)
  })

  test('should show splits in dashboard with userAmount', async ({ page, request }) => {
    // Create a transaction with a split in the existing Março cycle
    const cat = await createCategory(request, token, {
      name: 'Lazer',
      color: '#8b5cf6',
    })
    const pm = await createPaymentMethod(request, token, {
      name: 'Cartão',
      type: 'debit',
    })
    const person = await createPerson(request, token, { name: 'João' })

    // Get the Março cycle ID via API
    const cycles = await (await request.get('http://localhost:3000/api/billing-cycles', {
      headers: { Authorization: `Bearer ${token}` },
    })).json() as Array<{ id: string; name: string }>
    const marcoCycle = cycles.find((c) => c.name === 'Março 2026')!

    const tx = await createTransaction(request, token, {
      description: 'Cinema com amigos',
      amount: '100.00',
      date: '2026-03-15T00:00:00.000Z',
      billingCycleId: marcoCycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
    })
    await createSplits(request, token, tx.id, [
      { personId: person.id, amount: '50.00' },
    ])

    await loginViaUI(page, user)

    // Dashboard starts on the most recent cycle (Março)
    await expect(page.getByText('Resultado líquido')).toBeVisible()

    // The recent transaction should show userAmount (R$ 50,00) not full amount (R$ 100,00)
    const cinemaRow = page.locator('text=Cinema com amigos').locator('..')
    await expect(cinemaRow).toBeVisible()
    // Full amount R$ 100 should NOT appear, userAmount R$ 50 should
    await expect(page.getByText('R$ 100,00')).not.toBeVisible()
    await expect(page.getByText('R$ 50,00').first()).toBeVisible()
  })

  test('should show empty transactions message for cycle without transactions', async ({ page, request }) => {
    await createBillingCycle(request, token, {
      name: 'Maio 2026',
      startDate: '2026-05-01T00:00:00.000Z',
      endDate: '2026-05-31T00:00:00.000Z',
      salary: '8000.00',
    })

    await loginViaUI(page, user)

    // Dashboard defaults to cycle containing today (Março).
    // Navigate right (newer) to reach Maio.
    await expect(page.getByText('Resultado líquido')).toBeVisible()
    await page.getByLabel('Próximo ciclo').click()
    await expect(page.getByText(/1\/Mai/)).toBeVisible()
    await expect(page.getByText('Registre seu primeiro gasto')).toBeVisible()
  })
})
