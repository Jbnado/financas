import { useState, useCallback, useMemo } from 'react'
import type { BillingCycle } from '../types'

export function useCycleNavigation(cycles: BillingCycle[]) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentCycle = useMemo(
    () => (cycles.length > 0 ? cycles[currentIndex] ?? null : null),
    [cycles, currentIndex],
  )

  const isFirst = currentIndex === 0
  const isLast = cycles.length === 0 || currentIndex === cycles.length - 1

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, cycles.length - 1))
  }, [cycles.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const selectCycle = useCallback(
    (id: string) => {
      const index = cycles.findIndex((c) => c.id === id)
      if (index !== -1) setCurrentIndex(index)
    },
    [cycles],
  )

  return {
    currentCycle,
    currentIndex,
    isFirst,
    isLast,
    goNext,
    goPrev,
    selectCycle,
  }
}
