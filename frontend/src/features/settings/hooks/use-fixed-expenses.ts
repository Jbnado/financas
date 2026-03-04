import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/shared/services/api.service'
import type { FixedExpense, CreateFixedExpenseInput, UpdateFixedExpenseInput } from '../types'

const QUERY_KEY = ['fixed-expenses']

export function useFixedExpenses() {
  const queryClient = useQueryClient()

  const { data: fixedExpenses, isLoading } = useQuery<FixedExpense[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiService.get<FixedExpense[]>('/fixed-expenses'),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateFixedExpenseInput) =>
      apiService.post<FixedExpense>('/fixed-expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFixedExpenseInput }) =>
      apiService.put<FixedExpense>(`/fixed-expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      apiService.delete<FixedExpense>(`/fixed-expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return {
    fixedExpenses: fixedExpenses ?? [],
    isLoading,
    createFixedExpense: createMutation.mutateAsync,
    updateFixedExpense: updateMutation.mutateAsync,
    removeFixedExpense: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}
