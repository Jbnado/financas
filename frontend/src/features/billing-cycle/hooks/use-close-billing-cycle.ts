import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { BillingCycle } from '../types'

export function useCloseBillingCycle() {
  const queryClient = useQueryClient()

  return useMutation<BillingCycle, Error, string>({
    mutationFn: (id) => apiService.post<BillingCycle>(`/billing-cycles/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-cycles'] })
    },
  })
}
