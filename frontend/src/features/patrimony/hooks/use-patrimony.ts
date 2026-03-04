import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { PatrimonySummary, PatrimonyDistribution, PatrimonyEvolution } from '../types'

export function usePatrimony() {
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['patrimony', 'summary'],
    queryFn: () => apiService.get<PatrimonySummary>('/patrimony/summary'),
  })

  const { data: distribution, isLoading: isDistributionLoading } = useQuery({
    queryKey: ['patrimony', 'distribution'],
    queryFn: () => apiService.get<PatrimonyDistribution>('/patrimony/distribution'),
  })

  const { data: evolution, isLoading: isEvolutionLoading } = useQuery({
    queryKey: ['patrimony', 'evolution'],
    queryFn: () => apiService.get<PatrimonyEvolution>('/patrimony/evolution?last=6'),
  })

  return {
    summary,
    distribution,
    evolution,
    isSummaryLoading,
    isDistributionLoading,
    isEvolutionLoading,
  }
}
