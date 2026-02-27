let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string): void {
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = null
}

function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || ''
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    const msg = typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: unknown }).message)
      : `Request failed with status ${status}`
    super(msg)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) return false
      const data = await res.json() as { accessToken: string }
      setAccessToken(data.accessToken)
      return true
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && accessToken) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      const retryHeaders: Record<string, string> = {
        ...(options.headers as Record<string, string> | undefined),
      }
      if (accessToken) {
        retryHeaders.Authorization = `Bearer ${accessToken}`
      }
      if (options.body) {
        retryHeaders['Content-Type'] = 'application/json'
      }

      const retryRes = await fetch(`${getApiUrl()}${path}`, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      })

      if (!retryRes.ok) {
        const body = await retryRes.json().catch(() => ({}))
        throw new ApiError(retryRes.status, body)
      }

      return retryRes.json() as Promise<T>
    }

    clearAccessToken()
    throw new ApiError(401, { message: 'Session expired' })
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body)
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export const apiService = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
