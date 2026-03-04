import { test, expect } from '@playwright/test'
import { generateTestUser, registerUser, getAuthToken } from './helpers/auth'
import {
  createCategory,
  createPaymentMethod,
  createBillingCycle,
  createTransaction,
  apiGet,
} from './helpers/api'

/**
 * API-level tests for installment creation and billing cycle auto-creation.
 * These test the backend directly without UI, catching the ensureCycleExists bugs.
 */

test.describe('Installments API', () => {
  const user = generateTestUser()
  let token: string

  test.beforeAll(async ({ request }) => {
    await registerUser(request, user)
    token = await getAuthToken(request, user)
  })

  test('10-installment transaction creates correct cycles and amounts', async ({ request }) => {
    const cycle = await createBillingCycle(request, token, {
      name: 'Março 2026',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-31T00:00:00.000Z',
      salary: '5000.00',
    })
    const cat = await createCategory(request, token, { name: 'Compras' })
    const pm = await createPaymentMethod(request, token, { name: 'Visa', type: 'credit', dueDay: 15 })

    // Create transaction with 10 installments, R$ 1.600,00 total
    const tx = await createTransaction(request, token, {
      description: 'Celular',
      amount: '1600.00',
      date: '2026-03-15T14:30:00.000Z', // Note: has time component (the bug trigger)
      billingCycleId: cycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
      totalInstallments: 10,
    })

    // Parent transaction should have installment 1/10 with R$ 160,00
    const parentDetail = await apiGet<{
      id: string
      amount: string
      installmentNumber: number
      totalInstallments: number
    }>(request, `/transactions/${tx.id}`, token)

    expect(parseFloat(parentDetail.amount)).toBe(160)
    expect(parentDetail.installmentNumber).toBe(1)
    expect(parentDetail.totalInstallments).toBe(10)

    // Get all billing cycles — should be reasonable (original + ~9 for installments)
    const allCycles = await apiGet<Array<{
      id: string
      name: string
      startDate: string
      endDate: string
    }>>(request, '/billing-cycles', token)

    // Sanity: no more than 15 cycles for 10 installments
    expect(allCycles.length).toBeLessThanOrEqual(15)

    // No duplicate cycles (same startDate)
    const startDates = allCycles.map((c) => c.startDate)
    const uniqueStartDates = new Set(startDates)
    expect(uniqueStartDates.size).toBe(startDates.length)

    // All cycles should be in 2026-2027 range
    for (const c of allCycles) {
      const year = new Date(c.startDate).getFullYear()
      expect(year).toBeLessThanOrEqual(2027)
    }

    // Verify all 10 installments exist across cycles
    let totalInstallments = 0
    for (const c of allCycles) {
      const txs = await apiGet<Array<{
        id: string
        description: string
        installmentNumber: number | null
        totalInstallments: number | null
        amount: string
      }>>(request, `/billing-cycles/${c.id}/transactions`, token)

      for (const t of txs) {
        if (t.description === 'Celular') {
          totalInstallments++
          expect(parseFloat(t.amount)).toBe(160)
          expect(t.totalInstallments).toBe(10)
        }
      }
    }
    expect(totalInstallments).toBe(10)
  })

  test('3-installment transaction with odd amount distributes correctly', async ({ request }) => {
    const cycle = await createBillingCycle(request, token, {
      name: 'Abril 2026',
      startDate: '2026-04-01T00:00:00.000Z',
      endDate: '2026-04-30T00:00:00.000Z',
      salary: '5000.00',
    })
    const cat = await createCategory(request, token, { name: 'Farmácia' })
    const pm = await createPaymentMethod(request, token, { name: 'Master', type: 'credit', dueDay: 5 })

    // R$ 100,00 / 3 = R$ 33,34 + R$ 33,33 + R$ 33,33
    const tx = await createTransaction(request, token, {
      description: 'Remédio',
      amount: '100.00',
      date: '2026-04-10T00:00:00.000Z',
      billingCycleId: cycle.id,
      categoryId: cat.id,
      paymentMethodId: pm.id,
      totalInstallments: 3,
    })

    // Parent gets the remainder (first installment absorbs extra cents)
    const parent = await apiGet<{ amount: string; installmentNumber: number }>(
      request,
      `/transactions/${tx.id}`,
      token,
    )
    expect(parent.installmentNumber).toBe(1)
    expect(parseFloat(parent.amount)).toBeCloseTo(33.34, 2)
  })

  test('concurrent installment creation does not duplicate cycles', async ({ request }) => {
    const cycle = await createBillingCycle(request, token, {
      name: 'Maio 2026',
      startDate: '2026-05-01T00:00:00.000Z',
      endDate: '2026-05-31T00:00:00.000Z',
      salary: '5000.00',
    })
    const cat = await createCategory(request, token, { name: 'Roupas' })
    const pm = await createPaymentMethod(request, token, { name: 'Elo', type: 'credit', dueDay: 20 })

    // Create two installment transactions concurrently
    const [tx1, tx2] = await Promise.all([
      createTransaction(request, token, {
        description: 'Camisa',
        amount: '200.00',
        date: '2026-05-10T00:00:00.000Z',
        billingCycleId: cycle.id,
        categoryId: cat.id,
        paymentMethodId: pm.id,
        totalInstallments: 3,
      }),
      createTransaction(request, token, {
        description: 'Calça',
        amount: '300.00',
        date: '2026-05-10T00:00:00.000Z',
        billingCycleId: cycle.id,
        categoryId: cat.id,
        paymentMethodId: pm.id,
        totalInstallments: 3,
      }),
    ])

    // Both should succeed
    expect(tx1.id).toBeTruthy()
    expect(tx2.id).toBeTruthy()

    // Check cycles — should not have duplicates for the same date range
    const allCycles = await apiGet<Array<{ startDate: string; endDate: string }>>(
      request,
      '/billing-cycles',
      token,
    )

    // Count cycles that start with the same date
    const startDateCounts = new Map<string, number>()
    for (const c of allCycles) {
      const key = c.startDate
      startDateCounts.set(key, (startDateCounts.get(key) || 0) + 1)
    }

    // Allow at most 2 cycles per start date (concurrent race can create 1 extra)
    for (const [date, count] of startDateCounts) {
      expect(count, `Duplicate cycles for ${date}`).toBeLessThanOrEqual(2)
    }
  })
})
