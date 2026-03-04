import { expect, type APIRequestContext } from '@playwright/test'

const API_BASE = process.env.E2E_API_BASE || 'http://localhost:3000/api'

export async function apiPost<T = unknown>(
  request: APIRequestContext,
  path: string,
  token: string,
  data: unknown,
): Promise<T> {
  const res = await request.post(`${API_BASE}${path}`, {
    data,
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(res.ok()).toBeTruthy()
  return res.json() as Promise<T>
}

export async function apiPatch<T = unknown>(
  request: APIRequestContext,
  path: string,
  token: string,
  data: unknown,
): Promise<T> {
  const res = await request.patch(`${API_BASE}${path}`, {
    data,
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(res.ok()).toBeTruthy()
  return res.json() as Promise<T>
}

export async function apiGet<T = unknown>(
  request: APIRequestContext,
  path: string,
  token: string,
): Promise<T> {
  const res = await request.get(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(res.ok()).toBeTruthy()
  return res.json() as Promise<T>
}

export async function apiPut<T = unknown>(
  request: APIRequestContext,
  path: string,
  token: string,
  data: unknown,
): Promise<T> {
  const res = await request.put(`${API_BASE}${path}`, {
    data,
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(res.ok()).toBeTruthy()
  return res.json() as Promise<T>
}

export async function apiDelete<T = unknown>(
  request: APIRequestContext,
  path: string,
  token: string,
): Promise<T> {
  const res = await request.delete(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(res.ok()).toBeTruthy()
  return res.json() as Promise<T>
}

export function createCategory(
  request: APIRequestContext,
  token: string,
  data: { name: string; icon?: string; color?: string },
) {
  return apiPost<{ id: string }>(request, '/categories', token, data)
}

export function createPaymentMethod(
  request: APIRequestContext,
  token: string,
  data: { name: string; type: string; dueDay?: number },
) {
  return apiPost<{ id: string }>(request, '/payment-methods', token, data)
}

export function createPerson(
  request: APIRequestContext,
  token: string,
  data: { name: string },
) {
  return apiPost<{ id: string }>(request, '/persons', token, data)
}

export function createBillingCycle(
  request: APIRequestContext,
  token: string,
  data: { name: string; startDate: string; endDate: string; salary: string },
) {
  return apiPost<{ id: string }>(request, '/billing-cycles', token, data)
}

export function createTransaction(
  request: APIRequestContext,
  token: string,
  data: {
    description: string
    amount: string
    date: string
    billingCycleId: string
    categoryId: string
    paymentMethodId: string
    totalInstallments?: number
  },
) {
  return apiPost<{ id: string }>(request, '/transactions', token, data)
}

export function getTransaction(
  request: APIRequestContext,
  token: string,
  id: string,
) {
  return apiGet<{
    id: string
    description: string
    amount: string
    installmentNumber: number | null
    totalInstallments: number | null
    splits: Array<{ id: string; personId: string; amount: string }>
    userAmount: string
  }>(request, `/transactions/${id}`, token)
}

export function createFixedExpense(
  request: APIRequestContext,
  token: string,
  data: { name: string; estimatedAmount: string; dueDay: number },
) {
  return apiPost<{ id: string }>(request, '/fixed-expenses', token, data)
}

export function createTax(
  request: APIRequestContext,
  token: string,
  data: { name: string; rate: string; estimatedAmount: string },
) {
  return apiPost<{ id: string }>(request, '/taxes', token, data)
}

export function createSplits(
  request: APIRequestContext,
  token: string,
  transactionId: string,
  splits: Array<{ personId: string; amount: string }>,
) {
  return apiPost(request, `/transactions/${transactionId}/splits`, token, { splits })
}

export function toggleTransactionPaid(
  request: APIRequestContext,
  token: string,
  transactionId: string,
) {
  return apiPatch(request, `/transactions/${transactionId}/toggle-paid`, token, {})
}

export function createBankAccount(
  request: APIRequestContext,
  token: string,
  data: { name: string; institution: string; type: string; balance?: number },
) {
  return apiPost<{ id: string }>(request, '/bank-accounts', token, data)
}

export function createInvestment(
  request: APIRequestContext,
  token: string,
  data: {
    name: string
    type: string
    institution: string
    appliedAmount: number
    currentValue: number
    liquidity: string
    maturityDate?: string
  },
) {
  return apiPost<{ id: string }>(request, '/investments', token, data)
}
