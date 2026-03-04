import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import {
  apiPatch,
  createCategory,
  createPaymentMethod,
  createBillingCycle,
  createPerson,
  createTransaction,
  createSplits,
  toggleTransactionPaid,
} from './helpers/api'

/**
 * E2E tests for UX scenarios and edge cases:
 * - Transaction form validation
 * - Delete confirmation flow
 * - Dashboard cycle close/reopen
 * - Receivable partial payment
 * - Split mode switching
 */

test.describe('UX Scenarios', () => {
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

    const cat = await createCategory(request, token, { name: 'Geral' })
    categoryId = cat.id

    const pm = await createPaymentMethod(request, token, { name: 'Nubank', type: 'credit', dueDay: 10 })
    paymentMethodId = pm.id

    const person = await createPerson(request, token, { name: 'João' })
    personId = person.id
  })

  // ─── Transaction form validation ──────────────────────────────────

  test('shows validation errors for empty form submission', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByRole('button', { name: 'Nova transacao' }).click()
    await expect(page.getByRole('heading', { name: 'Nova Transação' })).toBeVisible()

    // Clear the auto-selected category by selecting "Selecione..."
    await page.locator('#tx-category').selectOption({ value: '' })

    // Submit without filling anything
    await page.getByRole('button', { name: 'Registrar' }).click()

    // Should show validation errors
    await expect(page.getByText('Descrição é obrigatória')).toBeVisible()
    await expect(page.getByText('Valor deve ser maior que zero')).toBeVisible()
    await expect(page.getByText('Categoria é obrigatória')).toBeVisible()
  })

  test('shows validation for amount zero', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByRole('button', { name: 'Nova transacao' }).click()

    await page.locator('#tx-description').fill('Teste zero')
    // Don't fill amount (stays at 0)
    await page.locator('#tx-category').selectOption({ label: 'Geral' })

    await page.getByRole('button', { name: 'Registrar' }).click()

    await expect(page.getByText('Valor deve ser maior que zero')).toBeVisible()
  })

  // ─── Transaction creation and list ─────────────────────────────────

  test('creates a simple transaction and shows in list', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByRole('button', { name: 'Nova transacao' }).click()
    await expect(page.getByRole('heading', { name: 'Nova Transação' })).toBeVisible()

    await page.locator('#tx-description').fill('Supermercado')
    await page.locator('#tx-amount').fill('25050') // R$ 250,50
    await page.locator('#tx-category').selectOption({ label: 'Geral' })

    await page.getByRole('button', { name: 'Registrar' }).click()

    // Toast and list verification
    const toast = page.locator('[data-sonner-toast]')
    await expect(toast.first()).toBeVisible()
    await expect(toast.first()).toContainText('R$\u00a0250,50')

    const main = page.locator('main')
    await expect(main.getByText('Supermercado')).toBeVisible()
    await expect(main.locator('li', { hasText: 'Supermercado' }).getByText('R$\u00a0250,50')).toBeVisible()
  })

  // ─── Delete transaction double-click confirmation ──────────────────

  test('delete requires double-click confirmation', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    const main = page.locator('main')
    const item = main.locator('li', { hasText: 'Supermercado' })
    await expect(item).toBeVisible()

    const deleteBtn = item.getByRole('button', { name: 'Excluir' })

    // First click — arms the delete (button turns red)
    await deleteBtn.click()

    // Transaction should still exist
    await expect(item).toBeVisible()

    // Second click — confirms deletion
    await deleteBtn.click()

    // Transaction should be removed
    await expect(item).toBeHidden()
  })

  // ─── Toggle paid status ────────────────────────────────────────────

  test('toggles transaction paid status', async ({ page, request }) => {
    const tx = await createTransaction(request, token, {
      description: 'Conta de luz',
      amount: '120.00',
      date: '2026-03-10T00:00:00.000Z',
      billingCycleId: cycleId,
      categoryId,
      paymentMethodId,
    })

    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    const main = page.locator('main')
    const item = main.locator('li', { hasText: 'Conta de luz' })
    await expect(item).toBeVisible()

    // Click check button to mark as paid
    const checkBtn = item.getByRole('button', { name: /pago/ })
    await checkBtn.click()

    // The check icon should turn green (text-green-400)
    await expect(item.locator('.text-green-400')).toBeVisible()

    // Click again to unmark
    await checkBtn.click()

    // Should go back to muted
    await expect(item.locator('.text-green-400')).toBeHidden()
  })

  // ─── Dashboard cycle close/reopen ──────────────────────────────────

  test('closes a cycle from dashboard and shows closed badge', async ({ page }) => {
    await loginViaUI(page, user)
    // Navigate to Dashboard
    await navigateTo(page, 'Dashboard', /\/dashboard/)

    // Verify we see the cycle
    await expect(page.getByText('1/Mar — 31/Mar')).toBeVisible()

    // Click "Fechar Ciclo" button
    await page.getByRole('button', { name: 'Fechar Ciclo' }).click()

    // Confirmation dialog should appear
    await expect(page.getByText('Março 2026')).toBeVisible()
    await page.getByRole('button', { name: 'Fechar' }).click()

    // Success toast
    await expect(page.getByText('Ciclo fechado')).toBeVisible()

    // "Fechar Ciclo" button should be gone (cycle is now closed)
    await expect(page.getByRole('button', { name: 'Fechar Ciclo' })).toBeHidden()
  })

  // ─── Split section: mode switching ────────────────────────────────

  test('split section toggles between split and lend modes', async ({ page }) => {
    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    await page.getByRole('button', { name: 'Nova transacao' }).click()
    await page.locator('#tx-amount').fill('30000') // R$ 300,00

    // Open split section
    await page.getByRole('button', { name: /Dividir \/ Emprestar/ }).click()

    // Default mode: "Dividir valor" should be active
    await expect(page.getByRole('button', { name: 'Dividir valor' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Conta de outra pessoa' })).toBeVisible()

    // "Adicionar pessoa" button should be visible (split mode)
    await expect(page.getByRole('button', { name: 'Adicionar pessoa' })).toBeVisible()

    // Switch to lend mode
    await page.getByRole('button', { name: 'Conta de outra pessoa' }).click()

    // Should show person dropdown, not "Adicionar pessoa"
    await expect(page.getByRole('button', { name: 'Adicionar pessoa' })).toBeHidden()
    await expect(page.getByText('Responsável')).toBeVisible()

    // "Minha parte" should show R$ 0,00 when person is selected via combobox
    await page.getByRole('combobox', { name: /Selecione pessoa/ }).click()
    await page.getByPlaceholder('Buscar pessoa...').fill('João')
    await page.locator('[cmdk-item]', { hasText: 'João' }).click()
    await expect(page.getByText('Minha parte:')).toBeVisible()
    await expect(page.getByText('R$\u00a00,00')).toBeVisible()

    // Switch back to split mode
    await page.getByRole('button', { name: 'Dividir valor' }).click()

    // "Adicionar pessoa" should be back
    await expect(page.getByRole('button', { name: 'Adicionar pessoa' })).toBeVisible()
  })

  // ─── Receivable: partial payment ──────────────────────────────────

  test('partial payment leaves remaining balance', async ({ page, request }) => {
    // Create a new open cycle (the original was closed in a previous test)
    const openCycle = await createBillingCycle(request, token, {
      name: 'Abril 2026',
      startDate: '2026-04-01T00:00:00.000Z',
      endDate: '2026-04-30T00:00:00.000Z',
      salary: '5000.00',
    })

    // Create a transaction with a split
    const tx = await createTransaction(request, token, {
      description: 'Viagem compartilhada',
      amount: '500.00',
      date: '2026-04-10T00:00:00.000Z',
      billingCycleId: openCycle.id,
      categoryId,
      paymentMethodId,
    })

    await createSplits(request, token, tx.id, [
      { personId, amount: '300.00' },
    ])

    await loginViaUI(page, user)
    await navigateTo(page, 'A Receber', /\/a-receber/)

    // Navigate to April cycle if not already there
    if (!(await page.getByText('1/Abr — 30/Abr').isVisible().catch(() => false))) {
      const nextBtn = page.getByRole('button', { name: 'Próximo ciclo' })
      while (await nextBtn.isEnabled()) {
        await nextBtn.click()
        if (await page.getByText('1/Abr — 30/Abr').isVisible().catch(() => false)) break
      }
    }

    // Should show João with pending amount
    const main = page.locator('main')
    await expect(main.getByText('João')).toBeVisible()

    // Click on João's card
    await main.getByText('João').click()

    // Should show the receivable detail
    await expect(page.getByText('Viagem compartilhada')).toBeVisible()

    // Click Pay button
    await page.getByRole('button', { name: 'Pagar' }).click()
    await expect(page.getByRole('heading', { name: 'Registrar pagamento' })).toBeVisible()

    // Change to partial amount: R$ 100,00
    const amountInput = page.locator('#pay-amount')
    await amountInput.clear()
    await amountInput.fill('100')

    await page.getByRole('button', { name: 'Confirmar pagamento' }).click()

    // Verify remaining balance is R$ 200,00 (300 - 100)
    await expect(page.getByText('R$\u00a0200,00')).toBeVisible()

    // The item should still be visible (not fully paid)
    await expect(page.getByText('Viagem compartilhada')).toBeVisible()
  })

  // ─── Transaction filters ──────────────────────────────────────────

  test('paid filter shows only paid transactions', async ({ page, request }) => {
    // Create a fresh cycle for this test
    const filterCycle = await createBillingCycle(request, token, {
      name: 'Maio 2026',
      startDate: '2026-05-01T00:00:00.000Z',
      endDate: '2026-05-31T00:00:00.000Z',
      salary: '5000.00',
    })

    // Create two transactions: one paid, one not
    const txPaid = await createTransaction(request, token, {
      description: 'Internet paga',
      amount: '100.00',
      date: '2026-05-05T00:00:00.000Z',
      billingCycleId: filterCycle.id,
      categoryId,
      paymentMethodId,
    })
    await createTransaction(request, token, {
      description: 'Conta de água',
      amount: '80.00',
      date: '2026-05-10T00:00:00.000Z',
      billingCycleId: filterCycle.id,
      categoryId,
      paymentMethodId,
    })

    // Mark first as paid
    await toggleTransactionPaid(request, token, txPaid.id)

    await loginViaUI(page, user)
    await navigateTo(page, 'Transações', /\/transacoes/)

    const main = page.locator('main')

    // Navigate to May cycle (cycle selector starts at current date's cycle, not newest)
    const nextBtn = page.getByRole('button', { name: 'Próximo ciclo' })
    for (let i = 0; i < 10; i++) {
      if (await page.getByText('1/Mai — 31/Mai').isVisible({ timeout: 500 }).catch(() => false)) break
      if (await nextBtn.isEnabled()) {
        await nextBtn.click()
        await page.waitForTimeout(300)
      } else break
    }
    await expect(page.getByText('1/Mai — 31/Mai')).toBeVisible()

    // Both transactions should be visible by default
    await expect(main.getByText('Internet paga')).toBeVisible()
    await expect(main.getByText('Conta de água')).toBeVisible()

    // Filter by "Pagos" (paid only) — option value is "true"
    const statusFilter = page.getByLabel('Filtrar por status de pagamento')
    await statusFilter.selectOption('true')

    await expect(main.getByText('Internet paga')).toBeVisible()
    await expect(main.getByText('Conta de água')).toBeHidden()

    // Filter by "Não pagos" (unpaid) — option value is "false"
    await statusFilter.selectOption('false')

    await expect(main.getByText('Internet paga')).toBeHidden()
    await expect(main.getByText('Conta de água')).toBeVisible()
  })
})
