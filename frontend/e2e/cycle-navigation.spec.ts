import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import { apiGet, createBillingCycle, createCategory, createPaymentMethod, createTransaction } from './helpers/api'

/**
 * E2E tests for billing cycle navigation arrows.
 * Verifies that left arrow = older, right arrow = newer, boundaries are respected.
 */

test.describe('Cycle Navigation', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)

    // Create 3 cycles: Jan, Feb, Mar (in order)
    await createBillingCycle(request, token, {
      name: 'Janeiro 2026',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-31T00:00:00.000Z',
      salary: '5000.00',
    })
    await createBillingCycle(request, token, {
      name: 'Fevereiro 2026',
      startDate: '2026-02-01T00:00:00.000Z',
      endDate: '2026-02-28T00:00:00.000Z',
      salary: '5000.00',
    })
    await createBillingCycle(request, token, {
      name: 'Março 2026',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T00:00:00.000Z',
      salary: '5000.00',
    })
  })

  test('starts at the newest cycle (Março)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    // Should show March dates (newest cycle)
    await expect(page.getByText('1/Mar — 31/Mar')).toBeVisible()
  })

  test('right arrow is disabled at newest cycle', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    // Right arrow (next/newer) should be disabled — already at newest
    const nextBtn = page.getByRole('button', { name: 'Próximo ciclo' })
    await expect(nextBtn).toBeDisabled()

    // Left arrow (prev/older) should be enabled
    const prevBtn = page.getByRole('button', { name: 'Ciclo anterior' })
    await expect(prevBtn).toBeEnabled()
  })

  test('left arrow navigates to older cycle (Março → Fevereiro)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    // Click left arrow (older)
    await page.getByRole('button', { name: 'Ciclo anterior' }).click()

    // Should now show February
    await expect(page.getByText('1/Fev — 28/Fev')).toBeVisible()
  })

  test('right arrow navigates back to newer cycle (Fevereiro → Março)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    // Ensure we start at March
    await expect(page.getByText('1/Mar — 31/Mar')).toBeVisible()

    // Go to February first
    const prevBtn = page.getByRole('button', { name: 'Ciclo anterior' })
    await prevBtn.click()
    await expect(page.getByText('1/Fev — 28/Fev')).toBeVisible({ timeout: 10000 })

    // Wait for state to stabilize (queries refetch after cycle change)
    await page.waitForTimeout(1000)

    // Verify we're still at February and right arrow is enabled
    await expect(page.getByText('1/Fev — 28/Fev')).toBeVisible()
    const nextBtn = page.getByRole('button', { name: 'Próximo ciclo' })
    await expect(nextBtn).toBeEnabled()

    // Click right arrow (newer) — should go back to March
    await nextBtn.click()
    await expect(page.getByText('1/Mar — 31/Mar')).toBeVisible()
  })

  test('left arrow is disabled at oldest cycle (Janeiro)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    // Navigate all the way to January (oldest)
    await page.getByRole('button', { name: 'Ciclo anterior' }).click() // → Feb
    await page.getByRole('button', { name: 'Ciclo anterior' }).click() // → Jan

    await expect(page.getByText('1/Jan — 31/Jan')).toBeVisible()

    // Left arrow should be disabled (no older cycles)
    await expect(page.getByRole('button', { name: 'Ciclo anterior' })).toBeDisabled()

    // Right arrow should be enabled (can go newer)
    await expect(page.getByRole('button', { name: 'Próximo ciclo' })).toBeEnabled()
  })

  test('transactions are scoped to the selected cycle', async ({ page, request }) => {
    // Create transactions in different cycles
    const cat = await createCategory(request, token, { name: 'Teste Nav' })
    const pm = await createPaymentMethod(request, token, { name: 'Nav Card', type: 'debit' })

    // Get cycles to reference by ID
    const cycles = await apiGet<Array<{ id: string; name: string }>>(request, '/billing-cycles', token)

    const marchCycle = cycles.find((c) => c.name === 'Março 2026')!
    const janCycle = cycles.find((c) => c.name === 'Janeiro 2026')!

    await createTransaction(request, token, {
      description: 'Compra em Março',
      amount: '100.00',
      date: '2026-03-15T00:00:00.000Z',
      billingCycleId: marchCycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
    })

    await createTransaction(request, token, {
      description: 'Compra em Janeiro',
      amount: '50.00',
      date: '2026-01-15T00:00:00.000Z',
      billingCycleId: janCycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
    })

    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    // At March — should see March transaction
    const main = page.locator('main')
    await expect(main.getByText('Compra em Março')).toBeVisible()
    await expect(main.getByText('Compra em Janeiro')).toBeHidden()

    // Navigate to January
    await page.getByRole('button', { name: 'Ciclo anterior' }).click() // → Feb
    await page.getByRole('button', { name: 'Ciclo anterior' }).click() // → Jan

    // Should see January transaction, not March
    await expect(main.getByText('Compra em Janeiro')).toBeVisible()
    await expect(main.getByText('Compra em Março')).toBeHidden()
  })
})
