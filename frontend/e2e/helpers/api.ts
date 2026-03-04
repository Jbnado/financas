import { expect, type APIRequestContext } from '@playwright/test'

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api'

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

export function createBillingCycle(
  request: APIRequestContext,
  token: string,
  data: { name: string; startDate: string; endDate: string; salary: string },
) {
  return apiPost<{ id: string }>(request, '/billing-cycles', token, data)
}
