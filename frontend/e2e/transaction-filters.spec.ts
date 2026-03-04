import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import {
  createCategory,
  createPaymentMethod,
  createBillingCycle,
  createTransaction,
  toggleTransactionPaid,
} from './helpers/api'

test.describe('Transaction Filters', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)

    // Seed data
    const cycle = await createBillingCycle(request, token, {
      name: 'Março 2026',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T00:00:00.000Z',
      salary: '5000.00',
    })

    const cat1 = await createCategory(request, token, { name: 'Alimentação' })
    const cat2 = await createCategory(request, token, { name: 'Transporte' })
    const pm1 = await createPaymentMethod(request, token, { name: 'Nubank', type: 'credit', dueDay: 10 })
    const pm2 = await createPaymentMethod(request, token, { name: 'Itaú', type: 'debit' })

    // Create 3 transactions
    const tx1 = await createTransaction(request, token, {
      description: 'Supermercado',
      amount: '100.00',
      date: '2026-03-05T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat1.id,
      paymentMethodId: pm1.id,
    })

    await createTransaction(request, token, {
      description: 'Uber',
      amount: '30.00',
      date: '2026-03-05T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat2.id,
      paymentMethodId: pm2.id,
    })

    await createTransaction(request, token, {
      description: 'Restaurante',
      amount: '50.00',
      date: '2026-03-05T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat1.id,
      paymentMethodId: pm2.id,
    })

    // Mark Supermercado as paid
    await toggleTransactionPaid(request, token, tx1.id)
  })

  test('shows all transactions without filters', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await expect(page.getByText('Supermercado')).toBeVisible()
    await expect(page.getByText('Uber')).toBeVisible()
    await expect(page.getByText('Restaurante')).toBeVisible()
  })

  test('filters by category', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.locator('[aria-label="Filtrar por categoria"]').selectOption({ label: 'Alimentação' })

    await expect(page.getByText('Supermercado')).toBeVisible()
    await expect(page.getByText('Restaurante')).toBeVisible()
    await expect(page.getByText('Uber')).not.toBeVisible()
  })

  test('filters by payment method', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.locator('[aria-label="Filtrar por meio de pagamento"]').selectOption({ label: 'Itaú' })

    await expect(page.getByText('Uber')).toBeVisible()
    await expect(page.getByText('Restaurante')).toBeVisible()
    await expect(page.getByText('Supermercado')).not.toBeVisible()
  })

  test('filters by paid status', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.locator('[aria-label="Filtrar por status de pagamento"]').selectOption('Pagos')

    await expect(page.getByText('Supermercado')).toBeVisible()
    await expect(page.getByText('Uber')).not.toBeVisible()
    await expect(page.getByText('Restaurante')).not.toBeVisible()
  })
})
