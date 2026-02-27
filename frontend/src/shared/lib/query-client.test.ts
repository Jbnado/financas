import { describe, it, expect } from 'vitest'
import { queryClient } from './query-client'

describe('queryClient', () => {
  it('should have retry set to 1 for queries', () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(1)
  })

  it('should have staleTime of 30 seconds', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(30000)
  })

  it('should have refetchOnWindowFocus disabled', () => {
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false)
  })

  it('should have retry 0 for mutations', () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(0)
  })
})
