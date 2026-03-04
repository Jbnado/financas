import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import { createBillingCycle } from './helpers/api'

test.describe('Config — Billing Cycles CRUD', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('shows empty state for billing cycles', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)
    await expect(page.getByText('Nenhum ciclo cadastrado')).toBeVisible()
  })

  test('creates a new billing cycle from config', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    // Scope to Ciclos card header
    await page
      .getByText('Ciclos de Cobrança', { exact: true })
      .locator('..')
      .getByRole('button', { name: 'Adicionar' })
      .click()

    await expect(page.getByRole('heading', { name: 'Novo Ciclo' })).toBeVisible()

    await page.locator('#name').fill('Março 2026')
    await page.locator('#startDate').fill('2026-02-25')
    await page.locator('#endDate').fill('2026-03-24')
    await page.locator('#salary').fill('7300')
    await page.getByRole('button', { name: 'Criar' }).click()

    await expect(page.getByText('Ciclo criado')).toBeVisible()
    await expect(page.locator('li').getByText('Março 2026')).toBeVisible()
    await expect(page.locator('li').getByText('Aberto')).toBeVisible()
  })

  test('edits a billing cycle', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    const item = page.locator('li', { hasText: 'Março 2026' })
    await item.getByRole('button', { name: 'Editar' }).click()

    await expect(page.getByRole('heading', { name: 'Editar Ciclo' })).toBeVisible()
    await page.locator('#name').clear()
    await page.locator('#name').fill('Março 2026 - Atualizado')
    await page.getByRole('button', { name: 'Salvar' }).click()

    await expect(page.getByText('Ciclo atualizado')).toBeVisible()
    await expect(page.locator('li').getByText('Março 2026 - Atualizado')).toBeVisible()
  })

  test('closes and reopens a billing cycle', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Config', /\/config/)

    const item = page.locator('li', { hasText: 'Março 2026 - Atualizado' })

    // Close the cycle
    await item.getByRole('button', { name: 'Fechar ciclo' }).click()
    await expect(page.getByRole('heading', { name: /fechar ciclo/i })).toBeVisible()
    await page.getByRole('button', { name: /^fechar$/i }).click()

    await expect(page.getByText('Ciclo fechado')).toBeVisible()
    await expect(item.getByText('Fechado')).toBeVisible()

    // Reopen the cycle
    await item.getByRole('button', { name: 'Reabrir ciclo' }).click()
    await expect(page.getByText('Ciclo reaberto')).toBeVisible()
    await expect(item.getByText('Aberto')).toBeVisible()
  })
})
