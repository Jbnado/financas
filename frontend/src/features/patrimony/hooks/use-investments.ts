import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { Investment, CreateInvestmentInput, UpdateInvestmentInput } from '../types'

const INVESTMENTS_KEY = ['investments']

export function useInvestments() {
  const queryClient = useQueryClient()

  const { data: investments, isLoading } = useQuery({
    queryKey: INVESTMENTS_KEY,
    queryFn: () => apiService.get<Investment[]>('/investments'),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateInvestmentInput) =>
      apiService.post<Investment>('/investments', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVESTMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['patrimony'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvestmentInput }) =>
      apiService.put<Investment>(`/investments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVESTMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['patrimony'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiService.delete<Investment>(`/investments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVESTMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['patrimony'] })
    },
  })

  const updateValueMutation = useMutation({
    mutationFn: ({ id, currentValue }: { id: string; currentValue: number }) =>
      apiService.patch<Investment>(`/investments/${id}/value`, { currentValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVESTMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: ['patrimony'] })
    },
  })

  return {
    investments,
    isLoading,
    createInvestment: createMutation.mutateAsync,
    updateInvestment: updateMutation.mutateAsync,
    deleteInvestment: deleteMutation.mutateAsync,
    updateValue: updateValueMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
