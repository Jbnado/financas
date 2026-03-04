import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import {
  createBillingCycle,
  createCategory,
  createPaymentMethod,
  createTransaction,
  createPerson,
  createSplits,
} from './helpers/api'

test.describe('Advanced Transaction Search (FR43)', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)

    const cycle = await createBillingCycle(request, token, {
      name: 'Março 2026',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T00:00:00.000Z',
      salary: '7000.00',
    })
    const cat1 = await createCategory(request, token, { name: 'Alimentação', color: '#f97316' })
    const cat2 = await createCategory(request, token, { name: 'Transporte', color: '#3b82f6' })
    const pm1 = await createPaymentMethod(request, token, { name: 'Nubank', type: 'credit' })
    const pm2 = await createPaymentMethod(request, token, { name: 'Cash', type: 'debit' })
    const person = await createPerson(request, token, { name: 'Pedro' })

    // Create various transactions
    await createTransaction(request, token, {
      description: 'Supermercado Extra',
      amount: '500.00',
      date: '2026-03-05T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat1.id,
      paymentMethodId: pm1.id,
    })
    await createTransaction(request, token, {
      description: 'Restaurante Italiano',
      amount: '200.00',
      date: '2026-03-10T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat1.id,
      paymentMethodId: pm2.id,
    })
    await createTransaction(request, token, {
      description: 'Uber para o trabalho',
      amount: '30.00',
      date: '2026-03-15T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat2.id,
      paymentMethodId: pm1.id,
    })

    // Transaction with split
    const txSplit = await createTransaction(request, token, {
      description: 'Cinema com Pedro',
      amount: '100.00',
      date: '2026-03-20T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat2.id,
      paymentMethodId: pm1.id,
    })
    await createSplits(request, token, txSplit.id, [
      { personId: person.id, amount: '50.00' },
    ])
  })

  test('should show text search input', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)
    await expect(page.getByLabel('Buscar por descrição')).toBeVisible()
  })

  test('should filter by text search', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    const search = page.getByLabel('Buscar por descrição')
    await search.fill('Uber')

    // Wait for debounce + API
    await expect(page.getByText('Uber para o trabalho')).toBeVisible()
    await expect(page.getByText('Supermercado Extra')).not.toBeVisible()
    await expect(page.getByText('Restaurante Italiano')).not.toBeVisible()
  })

  test('should show person filter dropdown', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)
    await expect(page.getByLabel('Filtrar por pessoa')).toBeVisible()
  })

  test('should filter by person (via splits)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByLabel('Filtrar por pessoa').selectOption({ label: 'Pedro' })

    // Should only show the transaction with a split to Pedro
    await expect(page.getByText('Cinema com Pedro')).toBeVisible()
    await expect(page.getByText('Supermercado Extra')).not.toBeVisible()
  })

  test('should combine text search with category filter', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    // Search for anything, then filter by Transporte
    await page.getByLabel('Filtrar por categoria').selectOption({ label: 'Transporte' })

    // Should show only Transporte transactions
    await expect(page.getByText('Uber para o trabalho')).toBeVisible()
    await expect(page.getByText('Cinema com Pedro')).toBeVisible()
    await expect(page.getByText('Supermercado Extra')).not.toBeVisible()

    // Now add text search
    await page.getByLabel('Buscar por descrição').fill('Uber')
    await expect(page.getByText('Uber para o trabalho')).toBeVisible()
    await expect(page.getByText('Cinema com Pedro')).not.toBeVisible()
  })
})
