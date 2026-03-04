import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { usePersons } from './use-persons'

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

const mockPersons = [
  {
    id: 'person-1',
    name: 'Fulano',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'person-2',
    name: 'Ciclano',
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

describe('usePersons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch persons list', async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce(mockPersons)

    const { result } = renderHook(() => usePersons(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.persons).toEqual(mockPersons)
    })

    expect(apiService.get).toHaveBeenCalledWith('/persons')
  })

  it('should return loading state initially', () => {
    vi.mocked(apiService.get).mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => usePersons(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('should create a person', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockPersons)
    vi.mocked(apiService.post).mockResolvedValueOnce({
      id: 'person-3',
      name: 'Beltrano',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    const { result } = renderHook(() => usePersons(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.persons).toBeDefined()
    })

    await act(async () => {
      await result.current.createPerson({ name: 'Beltrano' })
    })

    expect(apiService.post).toHaveBeenCalledWith('/persons', { name: 'Beltrano' })
  })

  it('should update a person', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockPersons)
    vi.mocked(apiService.put).mockResolvedValueOnce({
      ...mockPersons[0],
      name: 'Fulano Atualizado',
    })

    const { result } = renderHook(() => usePersons(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.persons).toBeDefined()
    })

    await act(async () => {
      await result.current.updatePerson({ id: 'person-1', data: { name: 'Fulano Atualizado' } })
    })

    expect(apiService.put).toHaveBeenCalledWith('/persons/person-1', {
      name: 'Fulano Atualizado',
    })
  })

  it('should remove (soft-delete) a person', async () => {
    vi.mocked(apiService.get).mockResolvedValue(mockPersons)
    vi.mocked(apiService.delete).mockResolvedValueOnce({ ...mockPersons[0], isActive: false })

    const { result } = renderHook(() => usePersons(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.persons).toBeDefined()
    })

    await act(async () => {
      await result.current.removePerson('person-1')
    })

    expect(apiService.delete).toHaveBeenCalledWith('/persons/person-1')
  })
})
