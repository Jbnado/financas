import { renderHook, act } from '@testing-library/react'
import { useCycleNavigation } from './use-cycle-navigation'
import type { BillingCycle } from '../types'

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
  it('should select the first cycle (most recent) by default', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    expect(result.current.currentCycle).toEqual(mockCycles[0])
    expect(result.current.currentIndex).toBe(0)
  })

  it('should navigate to the next (older) cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    act(() => result.current.goNext())

    expect(result.current.currentCycle).toEqual(mockCycles[1])
    expect(result.current.currentIndex).toBe(1)
  })

  it('should navigate to the previous (newer) cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    act(() => result.current.goNext())
    act(() => result.current.goPrev())

    expect(result.current.currentCycle).toEqual(mockCycles[0])
    expect(result.current.currentIndex).toBe(0)
  })

  it('should return isFirst=true when on first cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)
  })

  it('should return isLast=true when on last cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    act(() => result.current.goNext())
    act(() => result.current.goNext())

    expect(result.current.isLast).toBe(true)
    expect(result.current.isFirst).toBe(false)
  })

  it('should not go past first cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    act(() => result.current.goPrev())

    expect(result.current.currentIndex).toBe(0)
  })

  it('should not go past last cycle', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    act(() => result.current.goNext())
    act(() => result.current.goNext())
    act(() => result.current.goNext())

    expect(result.current.currentIndex).toBe(2)
  })

  it('should return null currentCycle when cycles is empty', () => {
    const { result } = renderHook(() => useCycleNavigation([]))

    expect(result.current.currentCycle).toBeNull()
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(true)
  })

  it('should allow selecting a cycle by id', () => {
    const { result } = renderHook(() => useCycleNavigation(mockCycles))

    act(() => result.current.selectCycle('cycle-3'))

    expect(result.current.currentCycle).toEqual(mockCycles[2])
    expect(result.current.currentIndex).toBe(2)
  })
})
