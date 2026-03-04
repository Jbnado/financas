import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import { createPaymentMethod } from './helpers/api'

test.describe('Config — Payment Methods CRUD', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('shows empty state for payment methods', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)
    await expect(page.getByText('Nenhum meio de pagamento cadastrado.')).toBeVisible()
  })

  test('creates a credit card payment method', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await page.getByRole('button', { name: 'Adicionar meio de pagamento' }).click()

    await expect(page.getByRole('heading', { name: 'Novo Meio de Pagamento' })).toBeVisible()
    await page.locator('#pm-name').fill('Nubank')
    // Type is "credit" by default
    await page.locator('#pm-dueDay').fill('10')
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByText('Nubank')).toBeVisible()
    await expect(page.getByText('Crédito')).toBeVisible()
    await expect(page.getByText('Dia 10')).toBeVisible()
  })

  test('creates a debit payment method', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await page.getByRole('button', { name: 'Adicionar meio de pagamento' }).click()

    await expect(page.getByRole('heading', { name: 'Novo Meio de Pagamento' })).toBeVisible()
    await page.locator('#pm-name').fill('Itaú Débito')
    await page.locator('#pm-type').selectOption('debit')
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.locator('li').getByText('Itaú Débito')).toBeVisible()
    // Verify the debit badge is shown within the item
    const item = page.locator('li', { hasText: 'Itaú Débito' })
    await expect(item.getByText('Débito', { exact: true })).toBeVisible()
  })

  test('edits a payment method', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await expect(page.getByText('Nubank')).toBeVisible()

    const item = page.locator('li', { hasText: 'Nubank' })
    await item.getByRole('button', { name: 'Editar' }).click()

    await expect(page.getByRole('heading', { name: 'Editar Meio de Pagamento' })).toBeVisible()
    await page.locator('#pm-name').clear()
    await page.locator('#pm-name').fill('Nubank Gold')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Nubank Gold')).toBeVisible()
  })

  test('deactivates a payment method', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    const item = page.locator('li', { hasText: 'Itaú Débito' })
    await item.getByRole('button', { name: 'Desativar' }).click()

    // Payment methods use single click deactivate
    await expect(page.getByText('Itaú Débito')).not.toBeVisible()
  })
})
