import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { BillingCycle } from '../types'

export function useCycleNavigation(cycles: BillingCycle[]) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const initialized = useRef(false)

  // On first load, start at the cycle containing today's date
  useEffect(() => {
    if (cycles.length > 0 && !initialized.current) {
      initialized.current = true
      const today = new Date()
      const idx = cycles.findIndex((c) => {
        const start = new Date(c.startDate)
        const end = new Date(c.endDate)
        return start <= today && end >= today
      })
      if (idx !== -1) {
        setCurrentIndex(idx)
      }
    }
  }, [cycles])

  const currentCycle = useMemo(
    () => (cycles.length > 0 ? cycles[currentIndex] ?? null : null),
    [cycles, currentIndex],
  )

  // Cycles are sorted desc (newest at index 0).
  // "First" = oldest (end of array), "Last" = newest (index 0).
  // isFirst disables left arrow (no older cycles), isLast disables right arrow (no newer cycles).
  const isFirst = cycles.length === 0 || currentIndex === cycles.length - 1
  const isLast = currentIndex === 0

  // goNext = next in time = newer cycle = lower index in desc array
  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  // goPrev = previous in time = older cycle = higher index in desc array
  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, cycles.length - 1))
  }, [cycles.length])

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
