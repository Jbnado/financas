import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { ProjectionResponse, InstallmentCommitmentsResponse } from '../types'

export function useProjection(months = 6) {
  return useQuery({
    queryKey: ['projections', months],
    queryFn: () => apiService.get<ProjectionResponse>(`/projections?months=${months}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useInstallmentCommitments() {
  return useQuery({
    queryKey: ['projections', 'installment-commitments'],
    queryFn: () => apiService.get<InstallmentCommitmentsResponse>('/projections/installment-commitments'),
    staleTime: 5 * 60 * 1000,
  })
}
