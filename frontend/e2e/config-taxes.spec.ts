import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'

test.describe('Config — Taxes CRUD', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('shows empty state for taxes', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)
    await expect(page.getByText('Nenhum imposto cadastrado')).toBeVisible()
  })

  test('creates a new tax', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await page.getByRole('button', { name: 'Adicionar imposto' }).click()

    await expect(page.getByRole('heading', { name: 'Novo Imposto' })).toBeVisible()
    await page.locator('#tax-name').fill('DAS')
    await page.locator('#tax-rate').fill('6.00')
    await page.locator('#tax-amount').fill('500.00')
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.getByText('Imposto criado')).toBeVisible()
    await expect(page.locator('li').getByText('DAS', { exact: true })).toBeVisible()
  })

  test('edits a tax', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await expect(page.locator('li').getByText('DAS', { exact: true })).toBeVisible()

    const item = page.locator('li', { hasText: /^DAS/ })
    await item.getByRole('button', { name: 'Editar' }).click()

    await expect(page.getByRole('heading', { name: 'Editar Imposto' })).toBeVisible()
    await page.locator('#tax-name').clear()
    await page.locator('#tax-name').fill('DAS MEI')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Imposto atualizado')).toBeVisible()
    await expect(page.getByText('DAS MEI')).toBeVisible()
  })

  test('deactivates a tax (double-click confirm)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await expect(page.getByText('DAS MEI')).toBeVisible()

    const item = page.locator('li', { hasText: 'DAS MEI' })
    const deleteBtn = item.getByRole('button', { name: 'Desativar' })

    await deleteBtn.click()
    await deleteBtn.click()

    await expect(page.getByText('Imposto desativado')).toBeVisible()
    await expect(page.getByText('Nenhum imposto cadastrado')).toBeVisible()
  })
})
