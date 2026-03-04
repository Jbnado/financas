import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import { createCategory } from './helpers/api'

test.describe('Config — Categories CRUD', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('shows empty state for categories', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)
    await expect(page.getByText('Nenhuma categoria encontrada')).toBeVisible()
  })

  test('creates a new category', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    // Scope to Categorias card header (title and button are siblings in CardHeader)
    await page.getByText('Categorias', { exact: true }).locator('..').getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByRole('heading', { name: 'Nova Categoria' })).toBeVisible()
    await page.locator('#category-name').fill('Alimentação')
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.getByText('Categoria criada')).toBeVisible()
    await expect(page.locator('li').getByText('Alimentação')).toBeVisible()
  })

  test('edits an existing category', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await expect(page.locator('li').getByText('Alimentação')).toBeVisible()

    const item = page.locator('li', { hasText: 'Alimentação' })
    await item.getByRole('button', { name: 'Editar' }).click()

    await expect(page.getByRole('heading', { name: 'Editar Categoria' })).toBeVisible()
    await page.locator('#category-name').clear()
    await page.locator('#category-name').fill('Transporte')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Categoria atualizada')).toBeVisible()
    await expect(page.locator('li').getByText('Transporte')).toBeVisible()
  })

  test('deactivates a category (double-click confirm)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await expect(page.locator('li').getByText('Transporte')).toBeVisible()

    const item = page.locator('li', { hasText: 'Transporte' })
    const deleteBtn = item.getByRole('button', { name: 'Desativar' })

    await deleteBtn.click()
    await deleteBtn.click()

    await expect(page.getByText('Categoria desativada')).toBeVisible()
    await expect(page.getByText('Nenhuma categoria encontrada')).toBeVisible()
  })

  test('validates required name field', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    await page.getByText('Categorias', { exact: true }).locator('..').getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByRole('heading', { name: 'Nova Categoria' })).toBeVisible()
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.getByText('Nome é obrigatório')).toBeVisible()
  })
})
