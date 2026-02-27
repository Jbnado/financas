import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiService, setAccessToken, getAccessToken, clearAccessToken } from './api.service'

const BASE_URL = 'http://localhost:3000/api'

describe('api.service', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.stubGlobal('fetch', vi.fn())
    import.meta.env.VITE_API_URL = BASE_URL
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('token management', () => {
    it('should store and retrieve access token in memory', () => {
      expect(getAccessToken()).toBeNull()
      setAccessToken('test-token')
      expect(getAccessToken()).toBe('test-token')
    })

    it('should clear access token', () => {
      setAccessToken('test-token')
      clearAccessToken()
      expect(getAccessToken()).toBeNull()
    })
  })

  describe('request with auth header', () => {
    it('should include Bearer token in Authorization header when token exists', async () => {
      setAccessToken('my-token')
      const mockResponse = new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

      await apiService.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/test`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        }),
      )
    })

    it('should not include Authorization header when no token', async () => {
      const mockResponse = new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

      await apiService.get('/test')

      const callHeaders = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>
      expect(callHeaders.Authorization).toBeUndefined()
    })

    it('should include credentials: include for cookies', async () => {
      const mockResponse = new Response(JSON.stringify({ data: 'ok' }), { status: 200 })
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

      await apiService.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ credentials: 'include' }),
      )
    })
  })

  describe('POST with body', () => {
    it('should send JSON body and Content-Type header', async () => {
      const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 })
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

      await apiService.post('/auth/login', { email: 'a@b.com', password: '12345678' })

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'a@b.com', password: '12345678' }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      )
    })
  })

  describe('401 handling with auto refresh', () => {
    it('should attempt refresh on 401 and retry original request', async () => {
      setAccessToken('expired-token')

      // First call: 401
      const unauthorizedResponse = new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      // Refresh call: success with new token
      const refreshResponse = new Response(JSON.stringify({ accessToken: 'new-token' }), { status: 200 })
      // Retry call: success
      const successResponse = new Response(JSON.stringify({ data: 'ok' }), { status: 200 })

      vi.mocked(fetch)
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(refreshResponse)
        .mockResolvedValueOnce(successResponse)

      const result = await apiService.get('/protected')

      expect(result).toEqual({ data: 'ok' })
      expect(getAccessToken()).toBe('new-token')
      expect(fetch).toHaveBeenCalledTimes(3)
    })

    it('should throw and clear token when refresh also fails', async () => {
      setAccessToken('expired-token')

      const unauthorizedResponse = new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })
      const refreshFailResponse = new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 })

      vi.mocked(fetch)
        .mockResolvedValueOnce(unauthorizedResponse)
        .mockResolvedValueOnce(refreshFailResponse)

      await expect(apiService.get('/protected')).rejects.toThrow()
      expect(getAccessToken()).toBeNull()
    })
  })

  describe('error handling', () => {
    it('should throw ApiError with status and message on non-ok response', async () => {
      const errorResponse = new Response(
        JSON.stringify({ statusCode: 400, message: ['email must be valid'], error: 'Bad Request' }),
        { status: 400 },
      )
      vi.mocked(fetch).mockResolvedValueOnce(errorResponse)

      try {
        await apiService.post('/test', {})
        expect.unreachable('Should have thrown')
      } catch (error: unknown) {
        const e = error as { status: number; message: string }
        expect(e.status).toBe(400)
      }
    })
  })
})
