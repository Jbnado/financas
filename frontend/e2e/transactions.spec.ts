import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import { createCategory, createPaymentMethod, createBillingCycle, createTransaction } from './helpers/api'

test.describe('Transactions CRUD', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string
  let cycleId: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)

    // Seed prerequisite data
    const cycle = await createBillingCycle(request, token, {
      name: 'Março 2026',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T00:00:00.000Z',
      salary: '5000.00',
    })
    cycleId = cycle.id
    await createCategory(request, token, { name: 'Alimentação' })
    await createPaymentMethod(request, token, { name: 'Nubank', type: 'credit', dueDay: 10 })
  })

  test('shows empty transactions state', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)
    await expect(page.getByText('Nenhuma transação neste ciclo')).toBeVisible()
  })

  test('creates a simple transaction via FAB', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByRole('button', { name: 'Nova transacao' }).click()
    await expect(page.getByRole('heading', { name: 'Nova Transação' })).toBeVisible()

    await page.locator('#tx-description').fill('Supermercado')

    // CurrencyInput: fill digit string (component strips non-digits)
    await page.locator('#tx-amount').fill('15000')

    // Payment method is auto-selected (Nubank)
    await page.locator('#tx-category').selectOption({ label: 'Alimentação' })

    await page.getByRole('button', { name: 'Registrar' }).click()

    // Verify toast
    await expect(page.getByText(/Registrado/)).toBeVisible()
    // Verify list item (scope to main to exclude toast area)
    const main = page.locator('main')
    await expect(main.getByText('Supermercado', { exact: true })).toBeVisible()
    await expect(main.getByText('Nubank · Alimentação')).toBeVisible()
  })

  test('creates a transaction with installments', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByRole('button', { name: 'Nova transacao' }).click()
    await expect(page.getByRole('heading', { name: 'Nova Transação' })).toBeVisible()

    await page.locator('#tx-description').fill('Notebook')
    await page.locator('#tx-amount').fill('300000')

    await page.locator('#tx-category').selectOption({ label: 'Alimentação' })

    // Expand installments
    await page.getByRole('button', { name: 'Parcelar' }).click()
    await page.locator('#tx-installments').clear()
    await page.locator('#tx-installments').fill('3')

    await expect(page.getByText('Valor por parcela:')).toBeVisible()

    await page.getByRole('button', { name: 'Registrar' }).click()
    await expect(page.getByText(/Registrado/)).toBeVisible()

    // Check installment badge exists in main
    await expect(page.locator('main').getByText('1/3')).toBeVisible()
  })

  test('deletes a transaction (double-click confirm)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    // Page defaults to latest cycle which has Notebook installment(s)
    const main = page.locator('main')
    const item = main.locator('li', { hasText: 'Notebook' }).first()
    await expect(item).toBeVisible()

    const deleteBtn = item.getByRole('button', { name: 'Excluir' })

    await deleteBtn.click()
    await deleteBtn.click()

    await expect(page.getByText('Transação removida')).toBeVisible()
  })

  test('validates required fields on transaction form', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByRole('button', { name: 'Nova transacao' }).click()
    await expect(page.getByRole('heading', { name: 'Nova Transação' })).toBeVisible()

    await page.getByRole('button', { name: 'Registrar' }).click()

    await expect(page.getByText('Descrição é obrigatória')).toBeVisible()
    await expect(page.getByText('Valor deve ser maior que zero')).toBeVisible()
    await expect(page.getByText('Categoria é obrigatória')).toBeVisible()
  })
})
