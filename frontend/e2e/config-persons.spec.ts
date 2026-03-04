import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'

test.describe('Config — Persons CRUD', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('shows empty state for persons', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)
    await expect(page.getByText('Nenhuma pessoa encontrada')).toBeVisible()
  })

  test('creates a new person', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    // Scope to Pessoas card header
    await page.getByText('Pessoas', { exact: true }).locator('..').getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByRole('heading', { name: 'Nova Pessoa' })).toBeVisible()
    await page.locator('#person-name').fill('João')
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.getByText('Pessoa criada')).toBeVisible()
    await expect(page.locator('li').getByText('João')).toBeVisible()
  })

  test('edits a person', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await expect(page.locator('li').getByText('João')).toBeVisible()

    const item = page.locator('li', { hasText: 'João' })
    await item.getByRole('button', { name: 'Editar' }).click()

    await expect(page.getByRole('heading', { name: 'Editar Pessoa' })).toBeVisible()
    await page.locator('#person-name').clear()
    await page.locator('#person-name').fill('João Silva')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Pessoa atualizada')).toBeVisible()
    await expect(page.locator('li').getByText('João Silva')).toBeVisible()
  })

  test('deactivates a person (double-click confirm)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await expect(page.locator('li').getByText('João Silva')).toBeVisible()

    const item = page.locator('li', { hasText: 'João Silva' })
    const deleteBtn = item.getByRole('button', { name: 'Desativar' })

    await deleteBtn.click()
    await deleteBtn.click()

    await expect(page.getByText('Pessoa desativada')).toBeVisible()
    await expect(page.getByText('Nenhuma pessoa encontrada')).toBeVisible()
  })
})
