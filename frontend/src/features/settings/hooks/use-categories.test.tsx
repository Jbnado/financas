import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCategories } from './use-categories'

vi.mock('@/shared/services/api.service', async () => {
  const actual = await vi.importActual<typeof import('@/shared/services/api.service')>('@/shared/services/api.service')
  return {
    ...actual,
    apiService: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { apiService } from '@/shared/services/api.service'

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Alimentação',
    icon: 'utensils',
    color: '#f97316',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Transporte',
    icon: 'car',
    color: '#3b82f6',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch categories list', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce(mockCategories)

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.categories).toEqual(mockCategories)
    })

    expect(apiService.get).toHaveBeenCalledWith('/categories')
  })

  it('should return loading state initially', () => {
    vi.mocked(apiService.get).mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('should create a category', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockCategories)
    vi.mocked(apiService.post).mockResolvedValueOnce({
      id: 'cat-3',
      name: 'Saúde',
      icon: 'heart-pulse',
      color: '#ef4444',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.categories).toBeDefined()
    })

    await act(async () => {
      await result.current.createCategory({ name: 'Saúde', icon: 'heart-pulse', color: '#ef4444' })
    })

    expect(apiService.post).toHaveBeenCalledWith('/categories', {
      name: 'Saúde',
      icon: 'heart-pulse',
      color: '#ef4444',
    })
  })

  it('should update a category', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockCategories)
    vi.mocked(apiService.put).mockResolvedValueOnce({
      ...mockCategories[0],
      name: 'Alimentação Atualizada',
    })

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.categories).toBeDefined()
    })

    await act(async () => {
      await result.current.updateCategory({ id: 'cat-1', data: { name: 'Alimentação Atualizada' } })
    })

    expect(apiService.put).toHaveBeenCalledWith('/categories/cat-1', {
      name: 'Alimentação Atualizada',
    })
  })

  it('should delete (soft-delete) a category', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockCategories)
    vi.mocked(apiService.delete).mockResolvedValueOnce({ ...mockCategories[0], isActive: false })

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.categories).toBeDefined()
    })

    await act(async () => {
      await result.current.deleteCategory('cat-1')
    })

    expect(apiService.delete).toHaveBeenCalledWith('/categories/cat-1')
  })
})
