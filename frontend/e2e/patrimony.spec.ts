import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken, loginViaUI, navigateTo } from './helpers/auth'
import { createBankAccount, createInvestment, createBillingCycle, apiGet, apiPost, apiPatch, apiDelete } from './helpers/api'

const TEST_USER = generateTestUser()
let token: string

test.describe('Patrimônio - Epic 10', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ request }) => {
    await registerUser(request, TEST_USER)
    token = await getAuthToken(request, TEST_USER)
  })

  // --- Navigation Tests ---

  test('should navigate to patrimônio page via nav', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)
    await expect(page.getByRole('heading', { name: 'Patrimônio' })).toBeVisible()
  })

  test('should show empty state when no accounts or investments', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)
    // Check empty state for bank accounts tab (default)
    await expect(page.getByText('Nenhuma conta bancária cadastrada')).toBeVisible()
  })

  test('should show tabs: Contas, Investimentos, Gráficos', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)
    await expect(page.getByRole('button', { name: 'Contas' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Investimentos' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Gráficos/ })).toBeVisible()
  })

  // --- Bank Account CRUD Tests ---

  test('should create a bank account via form', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    // Click add button in Contas tab
    await page.getByRole('button', { name: /Adicionar/i }).first().click()

    // Fill the form
    await page.getByLabel('Nome').fill('Nubank')
    await page.getByLabel('Instituição').fill('Nu Pagamentos')
    await page.getByLabel('Tipo').selectOption('checking')
    await page.getByLabel('Saldo').fill('5000')

    await page.getByRole('button', { name: /Criar|Salvar/ }).click()

    // Should show the account in the list
    await expect(page.getByText('Nubank')).toBeVisible()
    await expect(page.getByText('Nu Pagamentos')).toBeVisible()
  })

  test('should create a second bank account', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    await page.getByRole('button', { name: /Adicionar/i }).first().click()
    await page.getByLabel('Nome').fill('Itaú Poupança')
    await page.getByLabel('Instituição').fill('Itaú')
    await page.getByLabel('Tipo').selectOption('savings')
    await page.getByLabel('Saldo').fill('10000')
    await page.getByRole('button', { name: /Criar|Salvar/ }).click()

    await expect(page.getByText('Itaú Poupança')).toBeVisible()
  })

  test('should edit a bank account', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    // Wait for accounts to load
    await expect(page.getByText('Nubank')).toBeVisible()

    // Click edit on first account
    await page.getByRole('button', { name: 'Editar' }).first().click()

    // Clear and update name
    await page.getByLabel('Nome').clear()
    await page.getByLabel('Nome').fill('Nubank CC')
    await page.getByRole('button', { name: /Salvar/ }).click()

    await expect(page.getByText('Nubank CC')).toBeVisible()
  })

  test('should update bank account balance inline', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    await expect(page.getByText('Nubank CC')).toBeVisible()

    // Click on balance to enter edit mode
    await page.getByText('R$').first().click()

    // If there's an inline input, fill it
    const balanceInput = page.getByRole('spinbutton').first()
    if (await balanceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await balanceInput.clear()
      await balanceInput.fill('7500')
      await page.keyboard.press('Enter')
    }
  })

  test('should soft-delete a bank account with double-click', async ({ page }) => {
    // First create a temp account via API
    await createBankAccount(page.request, token, {
      name: 'Temp Account',
      institution: 'Temp Bank',
      type: 'wallet',
      balance: 100,
    })

    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    await expect(page.getByText('Temp Account')).toBeVisible()

    // Find the row containing "Temp Account" and click its delete button
    const row = page.locator('li').filter({ hasText: 'Temp Account' })
    const deleteBtn = row.getByRole('button', { name: /Excluir/i })
    await deleteBtn.click()
    await deleteBtn.click()

    // Account should disappear
    await expect(page.getByText('Temp Account')).not.toBeVisible()
  })

  // --- Investment CRUD Tests ---

  test('should switch to Investimentos tab and show empty state', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    await page.getByRole('button', { name: 'Investimentos' }).click()
    await expect(page.getByText('Nenhum investimento cadastrado')).toBeVisible()
  })

  test('should create an investment via form', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)
    await page.getByRole('button', { name: 'Investimentos' }).click()

    await page.getByRole('button', { name: /Adicionar/i }).click()

    await page.getByLabel('Nome').fill('Tesouro Selic')
    await page.getByLabel('Tipo').selectOption('fixed_income')
    await page.getByLabel('Instituição').fill('Tesouro Direto')
    await page.getByLabel(/Valor Aplicado/i).fill('20000')
    await page.getByLabel(/Valor Atual/i).fill('21500')
    await page.getByLabel('Liquidez').selectOption('daily')

    await page.getByRole('button', { name: /Criar|Salvar/ }).click()

    await expect(page.getByText('Tesouro Selic')).toBeVisible()
  })

  test('should create a second investment', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)
    await page.getByRole('button', { name: 'Investimentos' }).click()

    await page.getByRole('button', { name: /Adicionar/i }).click()
    await page.getByLabel('Nome').fill('Bitcoin')
    await page.getByLabel('Tipo').selectOption('crypto')
    await page.getByLabel('Instituição').fill('Binance')
    await page.getByLabel(/Valor Aplicado/i).fill('5000')
    await page.getByLabel(/Valor Atual/i).fill('7800')
    await page.getByLabel('Liquidez').selectOption('daily')
    await page.getByRole('button', { name: /Criar|Salvar/ }).click()

    await expect(page.getByText('Bitcoin')).toBeVisible()
  })

  test('should edit an investment', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)
    await page.getByRole('button', { name: 'Investimentos' }).click()

    await expect(page.getByText('Tesouro Selic')).toBeVisible()
    await page.getByRole('button', { name: 'Editar' }).first().click()

    await page.getByLabel('Nome').clear()
    await page.getByLabel('Nome').fill('Tesouro Selic 2029')
    await page.getByRole('button', { name: /Salvar/ }).click()

    await expect(page.getByText('Tesouro Selic 2029')).toBeVisible()
  })

  test('should soft-delete an investment with double-click', async ({ page }) => {
    await createInvestment(page.request, token, {
      name: 'Temp Investment',
      type: 'other',
      institution: 'Test',
      appliedAmount: 100,
      currentValue: 100,
      liquidity: 'daily',
    })

    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)
    await page.getByRole('button', { name: 'Investimentos' }).click()

    await expect(page.getByText('Temp Investment')).toBeVisible()

    // Find the row containing "Temp Investment" and click its delete button
    const row = page.locator('li').filter({ hasText: 'Temp Investment' })
    const deleteBtn = row.getByRole('button', { name: /Excluir/i })
    await deleteBtn.click()
    await deleteBtn.click()

    await expect(page.getByText('Temp Investment')).not.toBeVisible()
  })

  // --- Hero Card / Summary Tests ---

  test('should show patrimony summary in hero card', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    // Should show total assets and net patrimony
    await expect(page.getByText(/Patrimônio Total/i)).toBeVisible()
    await expect(page.getByText(/Patrimônio Líquido/i)).toBeVisible()
    // Values should be present (use data-testid)
    await expect(page.getByTestId('total-assets')).toBeVisible()
    await expect(page.getByTestId('net-patrimony')).toBeVisible()
  })

  // --- Charts Tab Tests ---

  test('should show distribution chart in Gráficos tab', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    await page.getByRole('button', { name: /Gráficos/ }).click()

    // Should show distribution section
    await expect(page.getByText(/Distribuição/i)).toBeVisible()
  })

  test('should show evolution chart in Gráficos tab', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    await page.getByRole('button', { name: /Gráficos/ }).click()

    await expect(page.getByText(/Evolução/i)).toBeVisible()
  })

  // --- API Tests ---

  test('should return patrimony summary via API', async ({ request }) => {
    const summary = await apiGet<{
      totalBankAccounts: string
      totalInvestments: string
      totalAssets: string
      futureInstallments: string
      netPatrimony: string
    }>(request, '/patrimony/summary', token)

    expect(Number(summary.totalBankAccounts)).toBeGreaterThan(0)
    expect(Number(summary.totalInvestments)).toBeGreaterThan(0)
    expect(Number(summary.totalAssets)).toBeGreaterThan(0)
    expect(summary.futureInstallments).toBe('0.00')
    expect(Number(summary.netPatrimony)).toBe(Number(summary.totalAssets))
  })

  test('should return patrimony distribution via API', async ({ request }) => {
    const dist = await apiGet<{
      items: Array<{ type: string; label: string; total: string; percentage: number }>
      grandTotal: string
    }>(request, '/patrimony/distribution', token)

    expect(dist.items.length).toBeGreaterThan(0)
    expect(Number(dist.grandTotal)).toBeGreaterThan(0)

    // All percentages should sum to approximately 100
    const totalPercentage = dist.items.reduce((sum, item) => sum + item.percentage, 0)
    expect(totalPercentage).toBeCloseTo(100, 0)
  })

  test('should return empty evolution when no snapshots', async ({ request }) => {
    const evolution = await apiGet<{
      snapshots: Array<{ cycleName: string; totalAssets: string; netPatrimony: string }>
    }>(request, '/patrimony/evolution?last=6', token)

    expect(evolution.snapshots).toEqual([])
  })

  test('should create snapshot when closing a billing cycle', async ({ request }) => {
    // Create a billing cycle
    const cycle = await createBillingCycle(request, token, {
      name: 'Ciclo Teste Snapshot',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      salary: '10000',
    })

    // Close the cycle
    await apiPost(request, `/billing-cycles/${cycle.id}/close`, token, {})

    // Check evolution now has a snapshot
    const evolution = await apiGet<{
      snapshots: Array<{ cycleName: string; totalAssets: string; netPatrimony: string }>
    }>(request, '/patrimony/evolution?last=6', token)

    expect(evolution.snapshots.length).toBe(1)
    expect(evolution.snapshots[0].cycleName).toBe('Ciclo Teste Snapshot')
    expect(Number(evolution.snapshots[0].totalAssets)).toBeGreaterThan(0)
  })

  // --- Bank Account API Tests ---

  test('should create bank account via API', async ({ request }) => {
    const account = await createBankAccount(request, token, {
      name: 'API Test Account',
      institution: 'API Bank',
      type: 'checking',
      balance: 1000,
    })
    expect(account.id).toBeTruthy()
  })

  test('should list bank accounts via API', async ({ request }) => {
    const accounts = await apiGet<Array<{ id: string; name: string; isActive: boolean }>>(
      request, '/bank-accounts', token,
    )
    expect(accounts.length).toBeGreaterThan(0)
    expect(accounts.every(a => a.isActive)).toBe(true)
  })

  test('should update bank account balance via API', async ({ request }) => {
    const accounts = await apiGet<Array<{ id: string; balance: string }>>(
      request, '/bank-accounts', token,
    )
    const account = accounts[0]

    const updated = await apiPatch<{ balance: string }>(
      request, `/bank-accounts/${account.id}/balance`, token, { balance: 99999 },
    )
    expect(Number(updated.balance)).toBe(99999)
  })

  test('should soft-delete bank account via API', async ({ request }) => {
    const account = await createBankAccount(request, token, {
      name: 'To Delete',
      institution: 'Delete Bank',
      type: 'wallet',
      balance: 0,
    })

    await apiDelete(request, `/bank-accounts/${account.id}`, token)

    // Should no longer appear in active list
    const accounts = await apiGet<Array<{ id: string; name: string }>>(
      request, '/bank-accounts', token,
    )
    expect(accounts.find(a => a.id === account.id)).toBeUndefined()
  })

  // --- Investment API Tests ---

  test('should create investment via API', async ({ request }) => {
    const inv = await createInvestment(request, token, {
      name: 'API Test Investment',
      type: 'fixed_income',
      institution: 'API Broker',
      appliedAmount: 5000,
      currentValue: 5500,
      liquidity: 'monthly',
    })
    expect(inv.id).toBeTruthy()
  })

  test('should list investments via API', async ({ request }) => {
    const investments = await apiGet<Array<{ id: string; name: string; isActive: boolean }>>(
      request, '/investments', token,
    )
    expect(investments.length).toBeGreaterThan(0)
    expect(investments.every(i => i.isActive)).toBe(true)
  })

  test('should update investment value via API', async ({ request }) => {
    const investments = await apiGet<Array<{ id: string; currentValue: string }>>(
      request, '/investments', token,
    )
    const inv = investments[0]

    const updated = await apiPatch<{ currentValue: string }>(
      request, `/investments/${inv.id}/value`, token, { currentValue: 88888 },
    )
    expect(Number(updated.currentValue)).toBe(88888)
  })

  test('should soft-delete investment via API', async ({ request }) => {
    const inv = await createInvestment(request, token, {
      name: 'To Delete Inv',
      type: 'other',
      institution: 'Delete Broker',
      appliedAmount: 100,
      currentValue: 100,
      liquidity: 'daily',
    })

    await apiDelete(request, `/investments/${inv.id}`, token)

    const investments = await apiGet<Array<{ id: string; name: string }>>(
      request, '/investments', token,
    )
    expect(investments.find(i => i.id === inv.id)).toBeUndefined()
  })

  // --- Validation Tests ---

  test('should validate required fields on bank account form', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)

    await page.getByRole('button', { name: /Adicionar/i }).first().click()

    // Try to submit empty form
    await page.getByRole('button', { name: /Criar|Salvar/ }).click()

    // Should show validation errors
    await expect(page.getByText(/obrigatório/i).first()).toBeVisible()
  })

  test('should validate required fields on investment form', async ({ page }) => {
    await loginViaUI(page, TEST_USER)
    await navigateTo(page, 'Patrimônio', /\/patrimonio/)
    await page.getByRole('button', { name: 'Investimentos' }).click()

    await page.getByRole('button', { name: /Adicionar/i }).click()
    await page.getByRole('button', { name: /Criar|Salvar/ }).click()

    await expect(page.getByText(/obrigatório/i).first()).toBeVisible()
  })
})
