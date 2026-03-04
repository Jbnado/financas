import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import {
  createCategory,
  createPaymentMethod,
  createBillingCycle,
  createPerson,
  createTransaction,
  createSplits,
  getTransaction,
  apiGet,
} from './helpers/api'

/**
 * E2E tests for:
 * - Issue 1: Toast shows correct installment amount (not total)
 * - Issue 2: Transaction editing via UI
 * - Issue 3: "Conta de outra pessoa" (lend mode)
 * - Installment cycle creation (backend ensureCycleExists)
 */

/** Navigate through cycles (newest→oldest) until a transaction with the given text is found */
async function navigateToCycleWith(page: import('@playwright/test').Page, text: string) {
  const main = page.locator('main')
  // "Ciclo anterior" (left arrow) goes to older cycles
  const prevBtn = page.getByRole('button', { name: 'Ciclo anterior' })
  for (let i = 0; i < 15; i++) {
    const item = main.locator('li', { hasText: text })
    if (await item.isVisible({ timeout: 600 }).catch(() => false)) return
    if (await prevBtn.isEnabled()) {
      await prevBtn.click()
      await page.waitForTimeout(300)
    } else {
      break
    }
  }
}

test.describe('Transaction Features', () => {
  test.describe.configure({ mode: 'serial' })

  const user = generateTestUser()
  let token: string
  let cycleId: string
  let categoryId: string
  let paymentMethodId: string
  let personId: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)

    const cycle = await createBillingCycle(request, token, {
      name: 'Março 2026',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T00:00:00.000Z',
      salary: '5000.00',
    })
    cycleId = cycle.id

    const cat = await createCategory(request, token, { name: 'Eletrônicos' })
    categoryId = cat.id

    const pm = await createPaymentMethod(request, token, { name: 'Nubank', type: 'credit', dueDay: 10 })
    paymentMethodId = pm.id

    const person = await createPerson(request, token, { name: 'Tio Junior' })
    personId = person.id
  })

  // ─── Issue 1: Toast with correct installment amount ─────────────────

  test('installment toast shows per-installment amount, not total', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByRole('button', { name: 'Nova transacao' }).click()
    await expect(page.getByRole('heading', { name: 'Nova Transação' })).toBeVisible()

    await page.locator('#tx-description').fill('Celular')
    await page.locator('#tx-amount').fill('160000') // R$ 1.600,00
    await page.locator('#tx-category').selectOption({ label: 'Eletrônicos' })

    // Expand installments and set to 10
    await page.getByRole('button', { name: 'Parcelar' }).click()
    await page.locator('#tx-installments').clear()
    await page.locator('#tx-installments').fill('10')

    await expect(page.getByText('Valor por parcela:')).toBeVisible()

    await page.getByRole('button', { name: 'Registrar' }).click()

    // Toast should show R$ 160,00 (per installment), NOT R$ 1.600,00 (total)
    // And should include installment info
    const toast = page.locator('[data-sonner-toast]')
    await expect(toast.first()).toBeVisible()
    await expect(toast.first()).toContainText('R$\u00a0160,00')
    await expect(toast.first()).toContainText('1 de 10 parcelas')
    await expect(toast.first()).toContainText('total')

    // Verify only ONE toast (no duplicate)
    await expect(toast).toHaveCount(1)
  })

  test('installment appears in list with correct amount and badge', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    // Navigate to any cycle that has a "Celular" installment
    // The cycle selector starts at the newest — use left arrow (older) to find one
    const main = page.locator('main')
    const prevBtn = page.getByRole('button', { name: 'Ciclo anterior' })

    // Wait for cycle to load
    await page.waitForTimeout(500)

    // Try to find a cycle with "Celular" — may need to navigate to older cycles
    let found = false
    for (let i = 0; i < 15; i++) {
      const item = main.locator('li', { hasText: 'Celular' })
      if (await item.isVisible({ timeout: 500 }).catch(() => false)) {
        found = true
        break
      }
      if (await prevBtn.isEnabled()) {
        await prevBtn.click()
        await page.waitForTimeout(300)
      } else {
        break
      }
    }
    expect(found, 'Should find a cycle with Celular transaction').toBe(true)

    const item = main.locator('li', { hasText: 'Celular' })
    // The installment badge should show N/10 (e.g., 1/10 or 10/10)
    await expect(item.getByText(/\d+\/10/)).toBeVisible()
    // The amount shown should be R$ 160,00 (per installment), not R$ 1.600,00 (total)
    await expect(item.getByText('R$\u00a0160,00')).toBeVisible()
  })

  // ─── Issue 1 (backend): installments create cycles correctly ────────

  test('installments create future billing cycles via API', async ({ request }) => {
    // The installment creation from the UI test above should have created future cycles
    const cycles = await apiGet<Array<{ id: string; name: string; startDate: string; endDate: string }>>(
      request,
      '/billing-cycles',
      token,
    )

    // Should have multiple cycles (original + future for installments)
    // With calendar-month cycles, 10 installments create ~10 cycles
    expect(cycles.length).toBeGreaterThanOrEqual(5)

    // All cycles should be in a reasonable range (2026-2027, not 2039+)
    for (const cycle of cycles) {
      const year = new Date(cycle.startDate).getFullYear()
      expect(year).toBeGreaterThanOrEqual(2026)
      expect(year).toBeLessThanOrEqual(2027)
    }
  })

  // ─── Issue 3: Lend mode ("Conta de outra pessoa") ──────────────────

  test('creates transaction with lend mode (100% for another person)', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByRole('button', { name: 'Nova transacao' }).click()
    await expect(page.getByRole('heading', { name: 'Nova Transação' })).toBeVisible()

    await page.locator('#tx-description').fill('Jantar do Tio')
    await page.locator('#tx-amount').fill('20000') // R$ 200,00
    await page.locator('#tx-category').selectOption({ label: 'Eletrônicos' })

    // Expand split section
    await page.getByRole('button', { name: /Dividir \/ Emprestar/ }).click()

    // Switch to lend mode
    await page.getByRole('button', { name: 'Conta de outra pessoa' }).click()

    // Select person via combobox
    await page.getByRole('combobox', { name: /Selecione pessoa/ }).click()
    await page.getByPlaceholder('Buscar pessoa...').fill('Tio Junior')
    await page.locator('[cmdk-item]', { hasText: 'Tio Junior' }).click()

    // "Minha parte" should show R$ 0,00
    await expect(page.getByText('Minha parte:')).toBeVisible()
    await expect(page.getByText('R$\u00a00,00')).toBeVisible()

    await page.getByRole('button', { name: 'Registrar' }).click()
    await expect(page.getByText(/Registrado/)).toBeVisible()

    // Navigate to A Receber to verify the split was created
    await navigateTo(page, 'A Receber', /\/a-receber/)
    const receber = page.locator('main')
    await expect(receber.getByText('Tio Junior')).toBeVisible()
    await expect(receber.getByText('R$\u00a0200,00')).toBeVisible()
  })

  // ─── Issue 2: Transaction editing ──────────────────────────────────

  test('edit button opens form with pre-filled data', async ({ page, request }) => {
    // Create a transaction via API to have clean data for edit test
    const tx = await createTransaction(request, token, {
      description: 'Mercado',
      amount: '350.00',
      date: '2026-03-10T00:00:00.000Z',
      billingCycleId: cycleId,
      categoryId,
      paymentMethodId,
    })

    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)
    await navigateToCycleWith(page, 'Mercado')

    const main = page.locator('main')
    const item = main.locator('li', { hasText: 'Mercado' })
    await expect(item).toBeVisible()

    // Click edit button (pencil icon)
    await item.getByRole('button', { name: 'Editar' }).click()

    // Should open form in edit mode
    await expect(page.getByRole('heading', { name: 'Editar Transação' })).toBeVisible()

    // Fields should be pre-filled
    await expect(page.locator('#tx-description')).toHaveValue('Mercado')

    // The "Parcelar" section should be hidden in edit mode
    await expect(page.getByRole('button', { name: 'Parcelar' })).toBeHidden()

    // Button should say "Salvar" not "Registrar"
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible()
  })

  test('edits transaction description and verifies update', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)
    await navigateToCycleWith(page, 'Mercado')

    const main = page.locator('main')
    const item = main.locator('li', { hasText: 'Mercado' })
    await item.getByRole('button', { name: 'Editar' }).click()

    await expect(page.getByRole('heading', { name: 'Editar Transação' })).toBeVisible()

    // Change description
    await page.locator('#tx-description').clear()
    await page.locator('#tx-description').fill('Supermercado Extra')

    await page.getByRole('button', { name: 'Salvar' }).click()

    // Verify toast
    await expect(page.getByText(/Atualizado/)).toBeVisible()

    // Verify the new description appears in the list
    await expect(main.getByText('Supermercado Extra', { exact: true })).toBeVisible()
    // Old name should be gone
    await expect(main.getByText('Mercado', { exact: true })).toBeHidden()
  })

  test('edits transaction and adds split (lend mode)', async ({ page, request }) => {
    // Create a simple transaction
    const tx = await createTransaction(request, token, {
      description: 'Conta do restaurante',
      amount: '150.00',
      date: '2026-03-15T00:00:00.000Z',
      billingCycleId: cycleId,
      categoryId,
      paymentMethodId,
    })

    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)
    await navigateToCycleWith(page, 'Conta do restaurante')

    const main = page.locator('main')
    const item = main.locator('li', { hasText: 'Conta do restaurante' })
    await item.getByRole('button', { name: 'Editar' }).click()

    await expect(page.getByRole('heading', { name: 'Editar Transação' })).toBeVisible()

    // Expand split section and use lend mode
    await page.getByRole('button', { name: /Dividir \/ Emprestar/ }).click()
    await page.getByRole('button', { name: 'Conta de outra pessoa' }).click()

    // Select Tio Junior via combobox
    await page.getByRole('combobox', { name: /Selecione pessoa/ }).click()
    await page.getByPlaceholder('Buscar pessoa...').fill('Tio Junior')
    await page.locator('[cmdk-item]', { hasText: 'Tio Junior' }).click()

    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText(/Atualizado/)).toBeVisible()

    // Check in A Receber page that the split appears
    await navigateTo(page, 'A Receber', /\/a-receber/)
    const receberMain = page.locator('main')
    await expect(receberMain.getByText('Tio Junior').first()).toBeVisible()
  })
})
