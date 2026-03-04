import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'

test.describe('Config — Fixed Expenses CRUD', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('shows empty state for fixed expenses', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)
    await expect(page.getByText('Nenhum gasto fixo cadastrado')).toBeVisible()
  })

  test('creates a new fixed expense', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await page.getByRole('button', { name: 'Adicionar gasto fixo' }).click()

    await expect(page.getByRole('heading', { name: 'Novo Gasto Fixo' })).toBeVisible()
    await page.locator('#fe-name').fill('Aluguel')
    await page.locator('#fe-amount').fill('1500.00')
    await page.locator('#fe-dueday').fill('10')
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.getByText('Gasto fixo criado')).toBeVisible()
    await expect(page.getByText('Aluguel')).toBeVisible()
    await expect(page.getByText('Dia 10')).toBeVisible()
  })

  test('edits a fixed expense', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await expect(page.getByText('Aluguel')).toBeVisible()

    const item = page.locator('li', { hasText: 'Aluguel' })
    await item.getByRole('button', { name: 'Editar' }).click()

    await expect(page.getByRole('heading', { name: 'Editar Gasto Fixo' })).toBeVisible()
    await page.locator('#fe-name').clear()
    await page.locator('#fe-name').fill('Aluguel Novo')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Gasto fixo atualizado')).toBeVisible()
    await expect(page.getByText('Aluguel Novo')).toBeVisible()
  })

  test('deactivates a fixed expense (double-click confirm)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await expect(page.getByText('Aluguel Novo')).toBeVisible()

    const item = page.locator('li', { hasText: 'Aluguel Novo' })
    const deleteBtn = item.getByRole('button', { name: 'Desativar' })

    await deleteBtn.click()
    await deleteBtn.click()

    await expect(page.getByText('Gasto fixo desativado')).toBeVisible()
    await expect(page.getByText('Nenhum gasto fixo cadastrado')).toBeVisible()
  })
})
