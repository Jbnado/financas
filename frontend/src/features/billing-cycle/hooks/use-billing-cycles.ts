import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { BillingCycle, BillingCycleDetail, CreateBillingCycleDto } from '../types'

const BILLING_CYCLES_KEY = ['billing-cycles'] as const

export function useBillingCycles() {
  return useQuery<BillingCycle[]>({
    queryKey: BILLING_CYCLES_KEY,
    queryFn: () => apiService.get<BillingCycle[]>('/billing-cycles'),
  })
}

export function useBillingCycle(id: string | undefined) {
  return useQuery<BillingCycleDetail>({
    queryKey: [...BILLING_CYCLES_KEY, id],
    queryFn: () => apiService.get<BillingCycleDetail>(`/billing-cycles/${id}`),
    enabled: !!id,
  })
}

export function useCreateBillingCycle() {
  const queryClient = useQueryClient()

  return useMutation<BillingCycle, Error, CreateBillingCycleDto>({
    mutationFn: (dto) => apiService.post<BillingCycle>('/billing-cycles', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_CYCLES_KEY })
    },
  })
}
