import { renderHook, act } from '@testing-library/react'
import { useCycleNavigation } from './use-cycle-navigation'
import type { BillingCycle } from '../types'

// Cycles sorted desc (newest first) — same as backend returns
const mockCycles: BillingCycle[] = [
  {
    id: 'cycle-1',
    name: 'Marco 2026',
    startDate: '2026-02-25T00:00:00.000Z',
    endDate: '2026-03-24T00:00:00.000Z',
    salary: '7300.00',
    status: 'open',
    createdAt: '2026-02-20T00:00:00.000Z',
    updatedAt: '2026-02-20T00:00:00.000Z',
  },
  {
    id: 'cycle-2',
    name: 'Fevereiro 2026',
    startDate: '2026-01-25T00:00:00.000Z',
    endDate: '2026-02-24T00:00:00.000Z',
    salary: '7300.00',
    status: 'open',
    createdAt: '2026-01-20T00:00:00.000Z',
    updatedAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'cycle-3',
    name: 'Janeiro 2026',
    startDate: '2025-12-25T00:00:00.000Z',
    endDate: '2026-01-24T00:00:00.000Z',
    salary: '7300.00',
    status: 'closed',
    createdAt: '2025-12-20T00:00:00.000Z',
    updatedAt: '2025-12-20T00:00:00.000Z',
  },
]

describe('useCycleNavigation', () => {
  it('should start at the newest cycle (index 0)', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    expect(result.current.currentCycle).toEqual(mockCycles[0])
    expect(result.current.currentIndex).toBe(0)
  })

  it('goPrev navigates to the previous (older) cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    act(() => result.current.goPrev())

    expect(result.current.currentCycle).toEqual(mockCycles[1]) // Fevereiro (older)
    expect(result.current.currentIndex).toBe(1)
  })

  it('goNext navigates to the next (newer) cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    // First go to an older cycle
    act(() => result.current.goPrev())
    expect(result.current.currentCycle).toEqual(mockCycles[1]) // Fevereiro

    // Then go back to newer
    act(() => result.current.goNext())
    expect(result.current.currentCycle).toEqual(mockCycles[0]) // Março (newer)
  })

  it('isLast=true at newest cycle (right arrow disabled)', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    // Start at newest — can't go newer
    expect(result.current.isLast).toBe(true)
    expect(result.current.isFirst).toBe(false)
  })

  it('isFirst=true at oldest cycle (left arrow disabled)', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    // Navigate to oldest
    act(() => result.current.goPrev())
    act(() => result.current.goPrev())

    expect(result.current.isFirst).toBe(true) // At oldest, left arrow disabled
    expect(result.current.isLast).toBe(false) // Can still go newer
  })

  it('goNext does not go past the newest cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    // Already at newest, try to go newer
    act(() => result.current.goNext())

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.currentCycle).toEqual(mockCycles[0])
  })

  it('goPrev does not go past the oldest cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    act(() => result.current.goPrev())
    act(() => result.current.goPrev())
    act(() => result.current.goPrev()) // One extra — should clamp

    expect(result.current.currentIndex).toBe(2) // Clamped at oldest
  })

  it('returns null when cycles is empty', () => {
    const { result } = renderHook(() => useCycleNavigation([]))

    expect(result.current.currentCycle).toBeNull()
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(true)
  })

  it('selectCycle navigates to a specific cycle by id', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    act(() => result.current.selectCycle('cycle-3'))

    expect(result.current.currentCycle).toEqual(mockCycles[2])
    expect(result.current.currentIndex).toBe(2)
  })
})
