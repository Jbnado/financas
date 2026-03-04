import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { CategoryDistribution, CycleEvolution, CycleComparison } from '../types'

export function useCategoryDistribution(cycleId: string | undefined) {
  return useQuery({
    queryKey: ['reports', 'category-distribution', cycleId],
    queryFn: () => apiService.get<CategoryDistribution>(`/reports/category-distribution/${cycleId}`),
    enabled: !!cycleId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCycleEvolution(last = 6) {
  return useQuery({
    queryKey: ['reports', 'cycle-evolution', last],
    queryFn: () => apiService.get<CycleEvolution>(`/reports/cycle-evolution?last=${last}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCycleComparison(cycleId: string | undefined) {
  return useQuery({
    queryKey: ['reports', 'cycle-comparison', cycleId],
    queryFn: () => apiService.get<CycleComparison>(`/reports/cycle-comparison/${cycleId}`),
    enabled: !!cycleId,
    staleTime: 5 * 60 * 1000,
  })
}
