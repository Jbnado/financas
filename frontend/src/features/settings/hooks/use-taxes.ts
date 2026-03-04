import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { Tax, CreateTaxInput, UpdateTaxInput } from '../types'

const QUERY_KEY = ['taxes']

export function useTaxes() {
  const queryClient = useQueryClient()

  const { data: taxes, isLoading } = useQuery<Tax[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiService.get<Tax[]>('/taxes'),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTaxInput) =>
      apiService.post<Tax>('/taxes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaxInput }) =>
      apiService.put<Tax>(`/taxes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      apiService.delete<Tax>(`/taxes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return {
    taxes: taxes ?? [],
    isLoading,
    createTax: createMutation.mutateAsync,
    updateTax: updateMutation.mutateAsync,
    removeTax: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}
