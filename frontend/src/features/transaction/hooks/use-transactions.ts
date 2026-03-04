import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiService } from '@/shared/services/api.service'
import type { Transaction, TransactionDetail, CreateTransactionInput, UpdateTransactionInput, TransactionFilters } from '../types'
import type { SplitInput } from '@/features/split/types'

export const TRANSACTIONS_KEY = ['transactions'] as const

export function useTransactions(cycleId: string | undefined, filters?: TransactionFilters) {
  const queryClient = useQueryClient()

  const queryParams = new URLSearchParams()
  if (filters?.categoryId) queryParams.set('categoryId', filters.categoryId)
  if (filters?.paymentMethodId) queryParams.set('paymentMethodId', filters.paymentMethodId)
  if (filters?.isPaid !== undefined) queryParams.set('isPaid', String(filters.isPaid))
  if (filters?.personId) queryParams.set('personId', filters.personId)
  if (filters?.search) queryParams.set('search', filters.search)
  const qs = queryParams.toString()

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: [...TRANSACTIONS_KEY, cycleId, filters],
    queryFn: () =>
      apiService.get<Transaction[]>(
        `/billing-cycles/${cycleId}/transactions${qs ? `?${qs}` : ''}`,
      ),
    enabled: !!cycleId,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionInput) =>
      apiService.post<Transaction>('/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
    },
    onError: () => toast.error('Erro ao criar transação'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      apiService.put<Transaction>(`/transactions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      toast.success('Transação atualizada')
    },
    onError: () => toast.error('Erro ao atualizar transação'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiService.delete<Transaction>(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      toast.success('Transação removida')
    },
    onError: () => toast.error('Erro ao remover transação'),
  })

  const togglePaidMutation = useMutation({
    mutationFn: (id: string) =>
      apiService.patch<Transaction>(`/transactions/${id}/toggle-paid`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
    },
    onError: () => toast.error('Erro ao alterar status'),
  })

  const replaceSplitsMutation = useMutation({
    mutationFn: ({ id, splits }: { id: string; splits: SplitInput[] }) =>
      apiService.put(`/transactions/${id}/splits`, { splits }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
    },
    onError: () => toast.error('Erro ao atualizar splits'),
  })

  return {
    transactions: transactions ?? [],
    isLoading,
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutate,
    togglePaid: togglePaidMutation.mutate,
    replaceSplits: replaceSplitsMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useTransaction(id: string | undefined) {
  return useQuery<TransactionDetail>({
    queryKey: [...TRANSACTIONS_KEY, 'detail', id],
    queryFn: () => apiService.get<TransactionDetail>(`/transactions/${id}`),
    enabled: !!id,
  })
}
