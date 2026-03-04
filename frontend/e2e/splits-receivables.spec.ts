import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import {
  createCategory,
  createPaymentMethod,
  createBillingCycle,
  createPerson,
  createTransaction,
  createSplits,
} from './helpers/api'

test.describe('Splits & Receivables', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('A Receber page shows empty state', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'A Receber', /\/a-receber/)

    await expect(page.getByText('Nenhum valor a receber')).toBeVisible()
    await expect(page.getByText('Divida um gasto para ver aqui')).toBeVisible()
  })

  test('shows receivables after creating split via API', async ({ page, request }) => {
    // Seed data
    const cycle = await createBillingCycle(request, token, {
      name: 'Março 2026',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T00:00:00.000Z',
      salary: '5000.00',
    })
    const cat = await createCategory(request, token, { name: 'Alimentação' })
    const pm = await createPaymentMethod(request, token, { name: 'Nubank', type: 'credit', dueDay: 10 })
    const person = await createPerson(request, token, { name: 'Maria' })

    const tx = await createTransaction(request, token, {
      description: 'Jantar',
      amount: '200.00',
      date: '2026-03-05T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
    })

    await createSplits(request, token, tx.id, [
      { personId: person.id, amount: '100.00' },
    ])

    // Navigate to A Receber
    await loginViaUI(page, user)
    await navigateTo(page, 'A Receber', /\/a-receber/)

    // Should show Maria's card with pending amount
    await expect(page.getByText('Maria')).toBeVisible()
    await expect(page.getByText('R$\u00a0100,00')).toBeVisible()
  })

  test('registers a payment on a receivable', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'A Receber', /\/a-receber/)

    // Click on Maria's card to see details
    await page.getByText('Maria').click()

    // Should show the receivable detail
    await expect(page.getByText('Jantar')).toBeVisible()

    // Click Pay button
    await page.getByRole('button', { name: 'Pagar' }).click()

    // Payment dialog
    await expect(page.getByRole('heading', { name: 'Registrar pagamento' })).toBeVisible()

    // Amount should be pre-filled; just confirm
    await page.getByRole('button', { name: 'Confirmar pagamento' }).click()

    await expect(page.getByText('Pagamento registrado')).toBeVisible()
    await expect(page.getByText('Nenhum valor pendente')).toBeVisible()
  })
})
