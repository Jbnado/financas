import { expect, type APIRequestContext, type Page } from '@playwright/test'

const API_BASE = process.env.E2E_API_BASE || 'http://localhost:3000/api'

export function generateTestUser() {
  return {
    email: `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`,
    password: 'Test1234!',
  }
}

export async function registerUser(
  request: APIRequestContext,
  user: { email: string; password: string },
) {
  const res = await request.post(`${API_BASE}/auth/register`, {
    data: { email: user.email, password: user.password },
  })
  expect([200, 201, 409]).toContain(res.status())
}

export async function getAuthToken(
  request: APIRequestContext,
  user: { email: string; password: string },
): Promise<string> {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email: user.email, password: user.password },
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  return body.accessToken
}

export async function loginViaUI(
  page: Page,
  user: { email: string; password: string },
) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(user.email)
  await page.getByLabel('Senha').fill(user.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

export async function navigateTo(page: Page, label: string, urlPattern: RegExp) {
  await page.getByRole('navigation').getByText(label).click()
  await expect(page).toHaveURL(urlPattern)
}
